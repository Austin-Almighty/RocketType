/* eslint-disable @typescript-eslint/no-require-imports */
const { randomInt, randomUUID, createHash } = require('node:crypto');
const { HttpsError } = require('firebase-functions/v2/https');
const { verifyReplay } = require('./scoring');
const wordLists = require('./lib/words.json');
const idPattern = /^[a-zA-Z0-9-]{1,100}$/;
const RECOVERY_MS = 7 * 24 * 60 * 60 * 1000;

function createService({ db, auth, Timestamp, now = Date.now }) {
  const stateRef = (uid) => db.collection('accountState').doc(uid);
  async function account(request) {
    if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Sign in to continue.');
    try {
      const user = await auth.getUser(request.auth.uid);
      if (user.disabled) throw new HttpsError('permission-denied', 'This account is disabled.');
      return user;
    } catch (error) {
      if (error.code === 'auth/user-not-found') throw new HttpsError('unauthenticated', 'This account no longer exists.');
      throw error;
    }
  }
  function checkState(snapshot, session) {
    const state = snapshot.data();
    if (state?.deleting || state?.resetting) throw new HttpsError('failed-precondition', 'Account data is being removed.');
    if (session && (state?.generation ?? 'initial') !== session.generation) throw new HttpsError('failed-precondition', 'This test was canceled by an account reset.');
  }
  function sessionRef(id) {
    if (typeof id !== 'string' || !idPattern.test(id)) throw new HttpsError('invalid-argument', 'Invalid test ID.');
    return db.collection('testSessions').doc(id);
  }
  function checkSession(snapshot, uid) {
    const session = snapshot.data();
    if (!session || session.userUID !== uid) throw new HttpsError('permission-denied', 'This test belongs to another account or no longer exists.');
    if (session.expiresAt.toMillis() < now()) throw new HttpsError('deadline-exceeded', 'This test’s seven-day recovery period has ended.');
    return session;
  }
  async function createTest(request) {
    const user = await account(request);
    const data = request.data;
    const settings = data?.settings;
    if (!settings || !['Rocket Run', 'Star Count'].includes(settings.mode) ||
      ![15, 30, 60].includes(settings.time) || ![20, 50, 100].includes(settings.count) || !['1k', '5k'].includes(settings.words)) {
      throw new HttpsError('invalid-argument', 'Choose a supported test configuration.');
    }
    const ref = sessionRef(data.id);
    const pool = [...wordLists[settings.words]];
    let targets;
    if (data.practiceWords !== null && data.practiceWords !== undefined) {
      const allowed = new Set(pool);
      if (!Array.isArray(data.practiceWords) || !data.practiceWords.length || data.practiceWords.length > 1000 ||
        data.practiceWords.some((word) => typeof word !== 'string' || !allowed.has(word))) throw new HttpsError('invalid-argument', 'Invalid practice word list.');
      targets = data.practiceWords;
    } else {
      for (let i = pool.length - 1; i > 0; i--) { const j = randomInt(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      targets = pool.slice(0, settings.mode === 'Rocket Run' ? 1000 : settings.count);
    }
    return db.runTransaction(async (transaction) => {
      const [state, existing] = await transaction.getAll(stateRef(user.uid), ref);
      checkState(state);
      if (existing.exists) {
        const session = checkSession(existing, user.uid);
        checkState(state, session);
        if (session.startedAt) throw new HttpsError('already-exists', 'This test has already started.');
        return { id: ref.id, targets: session.targets };
      }
      const time = now();
      if (state.data()?.lastSessionAt?.toMillis() > time - 500) throw new HttpsError('resource-exhausted', 'Wait a moment before starting another test.');
      const session = { userUID: user.uid, generation: state.data()?.generation ?? 'initial',
        gameMode: settings.mode, time: settings.time, count: settings.count, words: settings.words,
        testKind: data.practiceWords ? 'practice' : 'standard', targets, startedAt: null,
        createdAt: Timestamp.fromMillis(time), expiresAt: Timestamp.fromMillis(time + RECOVERY_MS) };
      transaction.create(ref, session);
      transaction.set(stateRef(user.uid), { lastSessionAt: Timestamp.fromMillis(time) }, { merge: true });
      return { id: ref.id, targets };
    });
  }
  async function beginTest(request) {
    const user = await account(request);
    const ref = sessionRef(request.data?.id);
    return db.runTransaction(async (transaction) => {
      const [state, snapshot] = await transaction.getAll(stateRef(user.uid), ref);
      const session = checkSession(snapshot, user.uid);
      checkState(state, session);
      if (!session.startedAt) transaction.update(ref, { startedAt: Timestamp.fromMillis(now()) });
      return { id: ref.id };
    });
  }
  async function submitResult(request) {
    const user = await account(request);
    const proof = request.data?.proof;
    const ref = sessionRef(proof?.sessionID);
    if (request.data?.id !== ref.id) throw new HttpsError('invalid-argument', 'The result ID must match the test ID.');
    const digest = createHash('sha256').update(JSON.stringify(proof)).digest('hex');
    const resultRef = db.collection('results').doc(ref.id);
    return db.runTransaction(async (transaction) => {
      const [state, snapshot, existing] = await transaction.getAll(stateRef(user.uid), ref, resultRef);
      const session = checkSession(snapshot, user.uid);
      checkState(state, session);
      if (existing.exists) {
        const result = existing.data();
        if (result.userUID !== user.uid || result.submissionHash !== digest) throw new HttpsError('already-exists', 'This test already has a different result.');
        const saved = { ...result, id: ref.id, completedAt: result.createdAt.toMillis() };
        delete saved.submissionHash;
        delete saved.createdAt;
        return saved;
      }
      const result = verifyReplay(session, proof.events, now());
      const completedAt = session.testKind === 'standard' && session.gameMode === 'Rocket Run'
        ? session.startedAt.toMillis() + session.time * 1000 : now();
      transaction.create(resultRef, { ...result, userUID: user.uid, userDisplayName: user.displayName ?? null,
        createdAt: Timestamp.fromMillis(completedAt), submissionHash: digest });
      return { ...result, id: ref.id, userUID: user.uid, userDisplayName: user.displayName ?? null, completedAt };
    });
  }
  async function importLegacyResult(request) {
    const user = await account(request);
    const data = request.data;
    const fail = () => { throw new HttpsError('invalid-argument', 'Invalid unverified recovery result.'); };
    if (!data || typeof data.id !== 'string' || !idPattern.test(data.id) || data.proof ||
      !['Rocket Run', 'Star Count'].includes(data.gameMode) || !['standard', 'practice'].includes(data.testKind) ||
      ![15, 30, 60, null].includes(data.time) || ![20, 50, 100, null].includes(data.count) || !['1k', '5k'].includes(data.words) ||
      data.scoringVersion !== 2 || !['wpm', 'raw', 'accuracy', 'keyCount', 'errors', 'elapsedSeconds', 'completedAt'].every((key) => Number.isFinite(data[key]) && data[key] >= 0) ||
      data.wpm > 500 || data.raw < data.wpm || data.raw > 1500 || data.accuracy > 100 || data.errors > data.keyCount ||
      !Number.isInteger(data.keyCount) || data.keyCount > 20000 || !Number.isInteger(data.errors) || data.elapsedSeconds <= 0 ||
      !data.characters || !['correct', 'incorrect', 'extra', 'missed'].every((key) => Number.isSafeInteger(data.characters[key]) && data.characters[key] >= 0)) fail();
    const ref = db.collection('results').doc(data.id);
    return db.runTransaction(async (transaction) => {
      const [state, existing] = await transaction.getAll(stateRef(user.uid), ref);
      checkState(state);
      if (state.data()?.resetAt?.toMillis() >= data.completedAt) throw new HttpsError('failed-precondition', 'This result was canceled by an account reset.');
      if (existing.exists) {
        const saved = existing.data();
        if (saved.userUID !== user.uid) throw new HttpsError('permission-denied', 'This result belongs to another account.');
        const result = { ...saved, id: ref.id, completedAt: saved.createdAt.toMillis() };
        delete result.submissionHash;
        delete result.createdAt;
        return result;
      }
      const completedAt = Math.min(now(), data.completedAt);
      const result = { userUID: user.uid, userDisplayName: user.displayName ?? null, verified: false,
        gameMode: data.gameMode, time: data.time, count: data.count, words: data.words, testKind: data.testKind,
        scoringVersion: 2, elapsedSeconds: data.elapsedSeconds, wpm: data.wpm, raw: data.raw,
        accuracy: data.accuracy, keyCount: data.keyCount, errors: data.errors,
        characters: Object.fromEntries(['correct', 'incorrect', 'extra', 'missed'].map((key) => [key, data.characters[key]])) };
      transaction.create(ref, { ...result, createdAt: Timestamp.fromMillis(completedAt) });
      return { ...result, id: ref.id, completedAt };
    });
  }
  async function removeOwned(collection, uid) {
    // Bounded batches also make cleanup safe to retry after a function interruption.
    const query = db.collection(collection).where('userUID', '==', uid).limit(400);
    for (;;) {
      const snapshot = await query.get();
      if (snapshot.empty) return;
      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
  }
  async function clearAccount(uid, deleting) {
    const ref = stateRef(uid);
    const generation = randomUUID();
    await db.runTransaction(async (transaction) => {
      const state = await transaction.get(ref);
      if (state.data()?.resetting && state.data().resetUntil?.toMillis() > now()) throw new HttpsError('aborted', 'An account reset is already in progress. Try again shortly.');
      transaction.set(ref, { generation, resetAt: Timestamp.fromMillis(now()), resetUntil: Timestamp.fromMillis(now() + 9 * 60 * 1000), resetting: true, deleting: deleting || Boolean(state.data()?.deleting) }, { merge: true });
    });
    try {
      await removeOwned('results', uid);
      await removeOwned('testSessions', uid);
    } finally {
      await db.runTransaction(async (transaction) => {
        const state = await transaction.get(ref);
        if (state.data()?.generation === generation) transaction.set(ref, { resetting: false }, { merge: true });
      });
    }
    // Keep a tombstone to reject old tokens and old sessions after deletion.
  }
  async function resetResults(request) {
    const user = await account(request);
    await clearAccount(user.uid, false);
    return { cleared: true };
  }
  return { createTest, beginTest, submitResult, importLegacyResult, resetResults, deleteAccountData: (uid) => clearAccount(uid, true) };
}
module.exports = { createService };
