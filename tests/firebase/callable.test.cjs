/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { initializeApp, deleteApp } = require('firebase/app');
const { getAuth, connectAuthEmulator, signInAnonymously, deleteUser } = require('firebase/auth');
const { getFunctions, connectFunctionsEmulator, httpsCallable } = require('firebase/functions');
const fnRequire = require('node:module').createRequire(require('node:path').resolve(__dirname, '../../functions/package.json'));
const admin = fnRequire('firebase-admin/app');
const { getFirestore } = fnRequire('firebase-admin/firestore');
if (!process.env.FIREBASE_AUTH_EMULATOR_HOST || !process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Firebase emulators are required.');

test('callables enforce real Auth tokens and Auth deletion triggers server cleanup', { timeout: 30000 }, async (t) => {
  const app = initializeApp({ projectId: 'demo-rockettype', apiKey: 'emulator-key', appId: 'emulator-app' });
  const auth = getAuth(app);
  connectAuthEmulator(auth, 'http://' + process.env.FIREBASE_AUTH_EMULATOR_HOST, { disableWarnings: true });
  const functions = getFunctions(app, 'us-central1');
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  const adminApp = admin.initializeApp({ projectId: 'demo-rockettype' });
  const db = getFirestore(adminApp);
  t.after(async () => { await deleteApp(app); await db.terminate(); await admin.deleteApp(adminApp); });
  const create = httpsCallable(functions, 'createTest');
  const settings = { mode: 'Rocket Run', time: 15, count: 20, words: '1k' };
  await assert.rejects(create({ id: 'anonymous-request', settings }), { code: 'functions/unauthenticated' });
  const signedIn = await signInAnonymously(auth);
  const uid = signedIn.user.uid;
  const prepared = (await create({ id: 'http-session', settings })).data;
  assert.equal(prepared.id, 'http-session');
  assert.equal(prepared.targets.length, 1000);
  await httpsCallable(functions, 'beginTest')({ id: prepared.id });
  await assert.rejects(httpsCallable(functions, 'submitResult')({ id: prepared.id, proof: { sessionID: prepared.id, events: [{ type: 'char', char: prepared.targets[0][0], ms: 0 }] } }), /deadline/);
  await db.doc('results/http-cleanup').set({ userUID: uid });
  await db.doc('results/http-other').set({ userUID: 'other-player' });
  await deleteUser(signedIn.user);
  const deadline = Date.now() + 15000;
  for (;;) {
    const [result, session] = await Promise.all([db.doc('results/http-cleanup').get(), db.doc('testSessions/http-session').get()]);
    if (!result.exists && !session.exists) break;
    assert.ok(Date.now() < deadline, 'Auth deletion must trigger cleanup without the browser');
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.equal((await db.doc('results/http-other').get()).exists, true);
  assert.equal((await db.doc('accountState/' + uid).get()).data().deleting, true);
});
