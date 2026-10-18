/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fnRequire = require('node:module').createRequire(require('node:path').resolve(__dirname, '../../functions/package.json'));
const { initializeApp } = fnRequire('firebase-admin/app');
const { getFirestore, Timestamp } = fnRequire('firebase-admin/firestore');
const { getAuth } = fnRequire('firebase-admin/auth');
const { createService } = require('../../functions/service');
if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) throw new Error('Firebase emulators are required.');
const projectId = 'demo-rockettype';
const app = initializeApp({ projectId });
const db = getFirestore(app);
const auth = getAuth(app);
const settings = { mode: 'Rocket Run', time: 15, count: 20, words: '1k' };
const request = (uid, data) => ({ auth: uid ? { uid } : null, data });

function eventsFor(text) {
  return [...text].map((char, i) => char === ' ' ? { type: 'space', ms: i * 100 } : { type: 'char', char, ms: i * 100 });
}

test('backend verifies replay, ownership, retries, reset and account deletion', async (t) => {
  let clock = Date.now();
  const service = createService({ db, auth, Timestamp, now: () => clock });
  await auth.createUser({ uid: 'backend-alice', displayName: 'Alice' });
  await auth.createUser({ uid: 'backend-bob' });
  const uid = 'backend-alice';
  t.after(async () => { await db.terminate(); });
  await assert.rejects(service.createTest(request(null, { id: 'unauth', settings })), { code: 'unauthenticated' });
  await assert.rejects(service.createTest(request(uid, { id: 'invalid', settings: { ...settings, time: 1 } })), { code: 'invalid-argument' });
  const session = await service.createTest(request(uid, { id: 'verified-one', settings }));
  const retry = await service.createTest(request(uid, { id: 'verified-one', settings }));
  assert.deepEqual(retry.targets, session.targets);
  assert.equal(session.targets.length, 1000);
  await assert.rejects(service.beginTest(request('backend-bob', { id: session.id })), { code: 'permission-denied' });
  await service.beginTest(request(uid, { id: session.id }));
  const originalStart = (await db.doc('testSessions/' + session.id).get()).data().startedAt.toMillis();
  clock += 1000;
  await service.beginTest(request(uid, { id: session.id }));
  assert.equal((await db.doc('testSessions/' + session.id).get()).data().startedAt.toMillis(), originalStart);
  const proof = { sessionID: session.id, events: eventsFor(session.targets[0] + ' ') };
  const payload = { id: session.id, proof, wpm: 99999, userUID: 'backend-bob', verified: true };
  await assert.rejects(service.submitResult(request(uid, payload)), /deadline/);
  clock = originalStart + 15000;
  const result = await service.submitResult(request(uid, payload));
  assert.equal(result.userUID, uid);
  assert.equal(result.verified, true);
  assert.equal(result.elapsedSeconds, 15);
  assert.equal(result.wpm, Math.floor((session.targets[0].length + 1) / 5 * 4));
  clock += 60000;
  const retried = await service.submitResult(request(uid, payload));
  assert.deepEqual(retried, result);
  assert.equal((await db.collection('results').where('userUID', '==', uid).get()).size, 1);
  await assert.rejects(service.submitResult(request(uid, { ...payload, proof: { ...proof, events: [...proof.events, { type: 'char', char: 'x', ms: 16000 }] } })), { code: 'already-exists' });
  const old = { id: 'legacy', completedAt: clock - 100, gameMode: 'Rocket Run', time: 15, count: 20,
    words: '1k', scoringVersion: 2, testKind: 'standard', keyCount: 100, errors: 5, wpm: 38, raw: 40,
    accuracy: 95, elapsedSeconds: 30, characters: { correct: 95, incorrect: 5, extra: 0, missed: 0 }, verified: true, userUID: 'backend-bob' };
  const recovered = await service.importLegacyResult(request(uid, old));
  assert.equal(recovered.verified, false);
  assert.equal(recovered.userUID, uid);
  await assert.rejects(service.importLegacyResult(request(uid, { ...old, id: 'invalid-legacy', accuracy: 101 })), { code: 'invalid-argument' });
  await service.resetResults(request(uid, {}));
  await assert.rejects(service.importLegacyResult(request(uid, old)), /canceled/);
  assert.equal((await db.collection('results').where('userUID', '==', uid).get()).size, 0);
  await assert.rejects(service.submitResult(request(uid, payload)));
  clock += 1000;
  const next = await service.createTest(request(uid, { id: 'after-reset', settings }));
  assert.equal(next.id, 'after-reset');
  // Cleanup covers more than one Firestore batch and preserves other players.
  for (let start = 0; start < 805; start += 400) {
    const batch = db.batch();
    for (let i = start; i < Math.min(start + 400, 805); i++) batch.set(db.doc('results/cleanup-' + i), { userUID: uid });
    await batch.commit();
  }
  await db.doc('results/bob').set({ userUID: 'backend-bob' });
  await service.deleteAccountData(uid);
  await service.deleteAccountData(uid);
  assert.equal((await db.collection('results').where('userUID', '==', uid).get()).size, 0);
  assert.equal((await db.collection('testSessions').where('userUID', '==', uid).get()).size, 0);
  assert.equal((await db.doc('results/bob').get()).exists, true);
  await assert.rejects(service.createTest(request(uid, { id: 'deleted-account', settings })), /removed/);
});

test('replay rejects invalid actions, impossible input rates, incomplete words and late events', () => {
  const { verifyReplay } = require('../../functions/scoring');
  const now = Date.now();
  const base = { ...settings, gameMode: 'Rocket Run', testKind: 'standard', targets: ['hello', 'world'], startedAt: Timestamp.fromMillis(now - 15000) };
  for (const events of [[], [{ type: 'appendWords', words: ['x'], ms: 0 }], [{ type: 'char', char: 'ab', ms: 0 }],
    [{ type: 'char', char: 'h', ms: 1 }], [{ type: 'char', char: 'h', ms: 0 }, { type: 'char', char: 'e', ms: 15000 }],
    [{ type: 'char', char: 'h', ms: 0 }, { type: 'char', char: 'e', ms: -1 }]]) {
    assert.throws(() => verifyReplay(base, events, now));
  }
  assert.throws(() => verifyReplay({ ...base, gameMode: 'Star Count' }, eventsFor('hello'), now), /not complete/);
  assert.throws(() => verifyReplay({ ...base, gameMode: 'Star Count', targets: ['hello'], startedAt: Timestamp.fromMillis(now - 1) }, eventsFor('hello'), now), /speed limit/);
  const counted = verifyReplay({ ...base, gameMode: 'Star Count', targets: ['hello'], startedAt: Timestamp.fromMillis(now - 1000) }, eventsFor('hello'), now);
  assert.equal(counted.elapsedSeconds, 1);
  assert.equal(counted.wpm, 60);
});
