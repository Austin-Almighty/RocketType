/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

// Exercise the real pure TypeScript modules without adding a test dependency.
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => {
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
    });
    module._compile(compiled.outputText, filename);
  };
}
const engine = require('../app/_lib/typing/engine.ts');
const stats = require('../app/_lib/typing/stats.ts');
const results = require('../app/_lib/results.ts');
const { createTypingState, typingReducer, correctCharacters, characterStats } = engine;
function type(state, text) {
  for (const char of text) state = typingReducer(state, char === ' ' ? { type: 'space' } : { type: 'char', char });
  return state;
}
function fixture(overrides = {}) {
  const ms = Date.UTC(2026, 9, 17, 12);
  return { id: 'one', wpm: 60, raw: 70, accuracy: 95, time: 30, count: 50, words: '1k',
    keyCount: 100, errors: 5, elapsedSeconds: 30, gameMode: 'Rocket Run', scoringVersion: 2, testKind: 'standard',
    userUID: 'alice', createdAt: { toMillis: () => ms, toDate: () => new Date(ms) }, ...overrides };
}
const settings = { start: false, mode: 'Rocket Run', time: 30, count: 50, words: '1k' };

test('deleting and retyping correct letters earns no extra WPM', () => {
  let state = type(createTypingState(['hello', 'world']), 'hell');
  const before = stats.buildRecord(state, 10);
  for (let i = 0; i < 10; i++) {
    state = typingReducer(state, { type: 'backspace' });
    state = type(state, 'l');
  }
  const after = stats.buildRecord(state, 10);
  assert.equal(after.wpm, before.wpm);
  assert.equal(after.keyCount, 14);
  assert.equal(correctCharacters(state), 4);
});

test('correction retains mistake history and supplies a unique practice word', () => {
  let state = type(createTypingState(['hello', 'world']), 'hx');
  state = typingReducer(state, { type: 'backspace' });
  state = type(state, 'ello ');
  assert.deepEqual(state.missedWords, ['hello']);
  assert.equal(state.mistakes, 1);
  assert.equal(correctCharacters(state), 6);
  assert.deepEqual(characterStats(state), { correct: 5, incorrect: 0, extra: 0, missed: 0 });
});

test('skipped letters, extra letters, and partial current words are distinguished', () => {
  const state = type(createTypingState(['hello', 'world', 'next']), 'he worldx n');
  assert.deepEqual(characterStats(state), { correct: 8, incorrect: 0, extra: 1, missed: 3 });
  assert.equal(correctCharacters(state), 8); // incorrect submitted words earn no separator
  assert.deepEqual(state.missedWords, ['hello', 'world']);
});

test('word deletion removes retained credit and cannot revisit a correct submitted word', () => {
  let state = type(createTypingState(['hello', 'world']), 'hx ');
  state = typingReducer(state, { type: 'deleteWord' });
  assert.equal(state.wordIndex, 0);
  assert.equal(correctCharacters(state), 0);
  state = type(state, 'hello ');
  assert.strictEqual(typingReducer(state, { type: 'backspace' }), state);
});

test('the final correct word finishes once; empty spaces do not start a test', () => {
  const empty = createTypingState(['hi']);
  assert.strictEqual(typingReducer(empty, { type: 'space' }), empty);
  const done = type(empty, 'hi');
  assert.equal(done.finished, true);
  assert.equal(engine.completedWords(done), 1);
  assert.strictEqual(type(done, 'x'), done);
  assert.equal(correctCharacters(done), 2);
});

test('overall raw speed uses total elapsed time, including a partial second', () => {
  const first = stats.buildRecord(type(createTypingState(['hello', 'world']), 'hello '), 1);
  const state = type(createTypingState(['hello', 'world']), 'hello world');
  const last = stats.buildRecord(state, 1.5, first);
  assert.equal(last.raw, 120);
  assert.equal(stats.computeRaw(last.keyCount, last.elapsedSeconds), 88);
  assert.equal(stats.computeWpm(10, 0), 0);
  assert.equal(stats.computeRaw(10, 0), 0);
});

test('a delayed clock caps the deadline and preserves actual word-count duration', () => {
  assert.equal(stats.elapsedTestSeconds(1000, 46000, 30), 30);
  assert.equal(stats.elapsedTestSeconds(1000, 46000, null), 45);
  assert.equal(stats.elapsedTestSeconds(1000, 1250, null), 0.25);
  assert.equal(stats.elapsedTestSeconds(1000, 999, null), 0);
});

test('progress excludes practice, legacy, and different settings', () => {
  const history = [fixture(), fixture({ id: 'legacy', scoringVersion: undefined }), fixture({ id: 'practice', testKind: 'practice' }),
    fixture({ id: 'long', time: 60 }), fixture({ id: 'hard', words: '5k' }), fixture({ id: 'count', gameMode: 'Star Count' })];
  assert.deepEqual(results.matchingResults(history, settings).map((r) => r.id), ['one']);
  const words = { ...settings, mode: 'Star Count' };
  assert.equal(results.matchingResults([fixture({ gameMode: 'Star Count', time: 60 })], words).length, 1);
  assert.equal(results.matchingResults([fixture({ gameMode: 'Star Count', count: 20 })], words).length, 0);
  assert.equal(results.summarizeResults([]), null);
  assert.equal(results.summarizeResults([fixture({ wpm: 75 })]).best, 75);
});

test('recent averages use the latest ten matching results', () => {
  const rows = Array.from({ length: 11 }, (_, i) => fixture({ id: String(i), wpm: i === 10 ? 500 : 60 }));
  assert.equal(results.summarizeResults(rows).recentAverage, 60);
});

test('invalid current scores cannot enter comparisons or rankings', () => {
  for (const invalid of [{ wpm: NaN }, { wpm: -1 }, { raw: Infinity }, { accuracy: 101 }, { elapsedSeconds: undefined }]) {
    assert.equal(results.isCurrentStandard(fixture(invalid)), false);
  }
});

test('ranking deduplicates before pagination and orders ties deterministically', () => {
  const history = [fixture({ id: 'alice-slow', wpm: 50 }), fixture({ id: 'alice-fast', wpm: 80 }),
    fixture({ id: 'bob', userUID: 'bob', wpm: 80, accuracy: 99 }),
    fixture({ id: 'carol', userUID: 'carol', wpm: 80, accuracy: 99,
      createdAt: { toMillis: () => Date.UTC(2026, 9, 17, 11) } }),
    fixture({ id: 'practice', userUID: 'dave', wpm: 999, testKind: 'practice' })];
  assert.deepEqual(results.rankResults(history, settings, 'All-time', new Date()).map((r) => r.id), ['carol', 'bob', 'alice-fast']);
  const repeated = Array.from({ length: 20 }, (_, i) => fixture({ id: String(i), wpm: 100 + i }));
  assert.equal(results.rankResults(repeated, settings, 'All-time', new Date()).length, 1);
});

test('UTC periods include their start and exclude the next period', () => {
  const now = new Date('2026-10-17T23:30:00-07:00');
  const [start, end] = results.rankingPeriod('Daily', now);
  assert.equal(start, Date.UTC(2026, 9, 18));
  assert.equal(end, Date.UTC(2026, 9, 19));
  const rows = [fixture({ id: 'start', createdAt: { toMillis: () => start } }),
    fixture({ id: 'end', userUID: 'bob', createdAt: { toMillis: () => end } })];
  assert.deepEqual(results.rankResults(rows, settings, 'Daily', now).map((r) => r.id), ['start']);
  assert.deepEqual(results.rankingPeriod('Monthly', new Date('2026-12-31T23:59:00Z')), [Date.UTC(2026, 11, 1), Date.UTC(2027, 0, 1)]);
});

test('saving retries overwrite the same document and preserve completion time', async () => {
  const Module = require('node:module');
  const originalLoad = Module._load;
  const writes = new Map();
  const auth = { currentUser: { uid: 'alice' } };
  let fail = true;
  Module._load = function (name, ...args) {
    if (name === './Firebase') return { auth, db: {} };
    if (name === 'firebase/firestore') return {
      doc: (_, collection, id) => collection + '/' + id,
      Timestamp: { fromMillis: (ms) => ms },
      setDoc: async (path, data) => { writes.set(path, data); if (fail) throw new Error('Lost acknowledgement'); },
    };
    return originalLoad.call(this, name, ...args);
  };
  let save;
  try { save = require('../app/_lib/resultToFirebase.tsx').default; }
  finally { Module._load = originalLoad; }
  const data = fixture({ elapsedSeconds: 30 });
  delete data.createdAt;
  const payload = { ...data, completedAt: 123456 };
  await assert.rejects(save(payload), /Lost acknowledgement/);
  fail = false;
  await save(payload);
  await save(payload);
  assert.equal(writes.size, 1);
  assert.equal(writes.get('results/one').createdAt, 123456);
  auth.currentUser = { uid: 'bob' };
  await assert.rejects(save(payload), /original account/);
  auth.currentUser = { uid: 'alice' };
  await assert.rejects(save({ ...payload, elapsedSeconds: 0 }), /valid duration/);
});
