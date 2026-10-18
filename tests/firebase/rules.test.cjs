/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const fs = require('node:fs');
const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { doc, setDoc, getDoc, getDocs, query, collection, where, orderBy, deleteDoc, updateDoc, Timestamp, setLogLevel } = require('firebase/firestore');
setLogLevel('silent');
if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('These tests require the Firestore emulator.');
const score = (uid = 'alice', overrides = {}) => ({ userUID: uid, userDisplayName: 'Alice',
  gameMode: 'Rocket Run', time: 30, count: 50, words: '1k', scoringVersion: 2, testKind: 'standard',
  keyCount: 100, errors: 5, wpm: 38, raw: 40, accuracy: 95, elapsedSeconds: 30,
  characters: { correct: 95, incorrect: 5, extra: 0, missed: 0 }, createdAt: Timestamp.now(), ...overrides });

for (const [mode, file] of [['strict', 'firestore.rules'], ['compat', 'firestore.compat.rules']]) {
  test(`${mode} rules protect results, sessions and account state`, async (t) => {
    const env = await initializeTestEnvironment({ projectId: 'demo-rockettype-' + mode, firestore: { rules: fs.readFileSync(file, 'utf8') } });
    t.after(() => env.cleanup());
    const alice = env.authenticatedContext('alice').firestore();
    const bob = env.authenticatedContext('bob').firestore();
    const guest = env.unauthenticatedContext().firestore();
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, 'results', 'verified'), score('alice', { verified: true }));
      await setDoc(doc(db, 'results', 'old'), score());
      await setDoc(doc(db, 'results', 'practice'), score('alice', { verified: true, testKind: 'practice' }));
      await setDoc(doc(db, 'results', 'word-count'), score('alice', { verified: true, gameMode: 'Star Count' }));
      await setDoc(doc(db, 'testSessions', 'private'), { userUID: 'alice', targets: ['hello'] });
      await setDoc(doc(db, 'accountState', 'alice'), { generation: 'private' });
    });
    await assertSucceeds(getDoc(doc(alice, 'results', 'old')));
    await assertSucceeds(getDoc(doc(guest, 'results', 'verified')));
    await assertFails(updateDoc(doc(bob, 'results', 'verified'), { wpm: 500 }));
    await assertFails(deleteDoc(doc(bob, 'results', 'old')));
    await assertFails(setDoc(doc(bob, 'results', 'forged-owner'), score('alice')));
    await assertFails(setDoc(doc(alice, 'results', 'forged-verified'), score('alice', { verified: true })));
    await assertFails(getDoc(doc(alice, 'testSessions', 'private')));
    await assertFails(setDoc(doc(alice, 'testSessions', 'private'), { startedAt: Timestamp.now() }));
    await assertFails(getDoc(doc(alice, 'accountState', 'alice')));
    await assertFails(setDoc(doc(alice, 'accountState', 'alice'), { generation: 'forged' }));
    await assertFails(updateDoc(doc(alice, 'results', 'old'), { wpm: 40 }));
    if (mode === 'strict') {
      await assertFails(getDoc(doc(guest, 'results', 'old')));
      await assertFails(getDoc(doc(bob, 'results', 'practice')));
      await assertFails(getDoc(doc(guest, 'results', 'word-count')));
      await assertFails(setDoc(doc(alice, 'results', 'new'), score()));
      await assertFails(deleteDoc(doc(alice, 'results', 'old')));
      await assertSucceeds(getDocs(query(collection(guest, 'results'), where('verified', '==', true), where('gameMode', '==', 'Rocket Run'), where('testKind', '==', 'standard'), where('scoringVersion', '==', 2), orderBy('createdAt'))));
      await assertFails(getDocs(collection(guest, 'results')));
    } else {
      await assertSucceeds(setDoc(doc(alice, 'results', 'new'), score()));
      const exact = (await getDoc(doc(alice, 'results', 'new'))).data();
      await assertSucceeds(setDoc(doc(alice, 'results', 'new'), exact));
      await assertSucceeds(deleteDoc(doc(alice, 'results', 'new')));
      for (const overrides of [{ wpm: -1 }, { wpm: 10000 }, { raw: 0 }, { accuracy: 101 }, { errors: 101 }, { extraField: true }, { createdAt: Timestamp.fromMillis(Date.now() + 86400000) }]) {
        await assertFails(setDoc(doc(alice, 'results', 'invalid'), score('alice', overrides)));
      }
    }
  });
}
