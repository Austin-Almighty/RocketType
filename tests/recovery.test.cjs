/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadWithMocks, hooks, memoryStorage, find, deferred } = require('./helpers.cjs');

const player = { uid: 'alice' };
function fixture() {
  return { id: 'score-1', userUID: 'alice', userDisplayName: 'Alice', completedAt: 123456,
    gameMode: 'Rocket Run', time: 30, count: 50, words: '1k', testKind: 'standard',
    scoringVersion: 2, elapsedSeconds: 30, keyCount: 100, errors: 5, wpm: 38, raw: 40, accuracy: 95,
    characters: { correct: 95, incorrect: 5, extra: 0, missed: 0 } };
}
function provider(storage, write) {
  const harness = hooks();
  global.window = { navigator: { locks: storage.locks }, localStorage: storage, addEventListener() {}, removeEventListener() {} };
  global.localStorage = storage;
  const { GameProvider } = loadWithMocks('../app/_lib/gameContext.tsx', {
    react: harness.react,
    './userContext': { useUser: () => ({ user: player, loading: false }) },
    './resultToFirebase': { default: write },
  });
  return { ...harness, value: () => harness.render(() => GameProvider({ children: null })).props.value };
}

test('a failed result is recoverable after provider remount', async () => {
  const storage = memoryStorage();
  const originalError = console.error;
  console.error = () => {};
  try {
    const first = provider(storage, async () => { throw new Error('Offline'); });
    await first.value().saveResult(fixture());
    assert.equal(first.value().savedResults[0].status, 'error');
    first.cleanup();
    const refreshed = provider(storage, async () => {});
    assert.equal(refreshed.value().savedResults.length, 1);
    assert.equal(refreshed.value().savedResults[0].result.id, 'score-1');
    refreshed.cleanup();
  } finally { console.error = originalError; }
});

test('reset waits for an active save and prevents a stale retry restoring it', async () => {
  const storage = memoryStorage();
  const network = deferred();
  const remote = new Map();
  const queue = provider(storage, async (result) => { await network.promise; remote.set(result.id, result); });
  const value = queue.value();
  const saving = value.saveResult(fixture());
  await Promise.resolve();
  const resetting = value.resetResults(async () => { remote.clear(); });
  network.resolve();
  await Promise.all([saving, resetting]);
  assert.equal(remote.size, 0);
  assert.equal(queue.value().savedResults.length, 0);
  queue.cleanup();
});

function accountForm(updateName, updatePassword = async () => {}) {
  const harness = hooks();
  let closed = 0;
  const { default: Settings } = loadWithMocks('../app/settings/page.tsx', {
    react: harness.react,
    'firebase/auth': { updateProfile: updateName, updatePassword: updatePassword, deleteUser: async () => {} },
    '../_lib/Firebase': { auth: { currentUser: player } },
    '../_lib/verifiedTests': { verifiedBackendEnabled: false },
    '../_lib/getResults': { deleteData: async () => {} },
    '../_lib/userContext': { useUser: () => ({ user: player, loading: false }) },
    '../_lib/gameContext': { useGameContext: () => ({ resetResults: async (action) => action(), resettingResults: false }) },
    'next/navigation': { useRouter: () => ({ push() {}, replace() {} }) },
  });
  const tree = harness.render(Settings);
  find(tree, (node) => node.type === 'dialog').props.ref.current = { close: () => { closed++; }, showModal() {} };
  return { ...harness, render: () => harness.render(Settings), closed: () => closed };
}

test('account name form stays open and retains input until the update succeeds', async () => {
  const update = deferred();
  const form = accountForm(() => update.promise);
  find(form.render(), (node) => node.type === 'button' && node.props.children === 'Update name').props.onClick();
  find(form.render(), (node) => node.type === 'input').props.onChange({ target: { value: 'New name' } });
  const submitted = find(form.render(), (node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
  await Promise.resolve(); await Promise.resolve();
  assert.equal(form.closed(), 0);
  assert.equal(find(form.render(), (node) => node.type === 'input').props.value, 'New name');
  update.resolve();
  await submitted;
  assert.equal(form.closed(), 1);
  form.cleanup();
});

test('IME intermediate insertText is not counted in addition to compositionend', () => {
  const harness = hooks();
  const { useTypingInput } = loadWithMocks('../app/_lib/typing/useTypingInput.ts', { react: harness.react });
  const input = new EventTarget();
  input.value = '';
  input.setSelectionRange = () => {};
  const emitted = [];
  harness.render(() => useTypingInput({ current: input }, { onChar: (char) => emitted.push(char), onSpace() {}, onBackspace() {}, onDeleteWord() {} }));
  function dispatch(type, fields = {}) {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, fields);
    input.dispatchEvent(event);
  }
  dispatch('compositionstart');
  dispatch('beforeinput', { inputType: 'insertText', data: 'a', isComposing: true });
  dispatch('compositionend', { data: 'a' });
  assert.deepEqual(emitted, ['a']);
  harness.cleanup();
});

test('a successful retry removes durable recovery data and keeps the original ID', async (t) => {
  t.mock.method(console, 'error', () => {});
  const storage = memoryStorage();
  const first = provider(storage, async () => { throw new Error('Offline'); });
  await first.value().saveResult(fixture());
  first.cleanup();
  const writes = [];
  const refreshed = provider(storage, async (result) => writes.push(result.id));
  await refreshed.value().retryResult('score-1');
  assert.deepEqual(writes, ['score-1']);
  refreshed.cleanup();
  const again = provider(storage, async () => {});
  assert.deepEqual(again.value().savedResults, []);
  again.cleanup();
});

test('reset in another tab cancels an old retry even before its storage event arrives', async (t) => {
  t.mock.method(console, 'error', () => {});
  const storage = memoryStorage();
  let offline = true;
  let writes = 0;
  const stale = provider(storage, async () => { if (offline) throw new Error('Offline'); writes++; });
  await stale.value().saveResult(fixture());
  const otherTab = provider(storage, async () => {});
  await otherTab.value().resetResults(async () => {});
  offline = false;
  const reloaded = provider(storage, async () => { writes++; });
  // Keep the old tab's in-memory retry; no storage event was delivered by this fixture.
  await stale.value().retryResult('score-1');
  assert.equal(stale.value().savedResults.length, 0);
  assert.equal(writes, 0);
  assert.equal(reloaded.value().savedResults.length, 0);
  stale.cleanup(); otherTab.cleanup(); reloaded.cleanup();
});

test('a rejected reset keeps failed saves recoverable and retryable', async (t) => {
  t.mock.method(console, 'error', () => {});
  const storage = memoryStorage();
  let offline = true;
  let writes = 0;
  const queue = provider(storage, async () => { if (offline) throw new Error('Offline'); writes++; });
  await queue.value().saveResult(fixture());
  await assert.rejects(queue.value().resetResults(async () => { throw new Error('Recent login required'); }), /Recent login/);
  assert.equal(queue.value().savedResults.length, 1);
  const remount = provider(storage, async () => {});
  assert.equal(remount.value().savedResults.length, 1);
  offline = false;
  await queue.value().retryResult('score-1');
  assert.equal(writes, 1);
  assert.equal(queue.value().savedResults[0].status, 'saved');
  queue.cleanup(); remount.cleanup();
});

test('storage quota failure still allows saving online and a same-tab retry', async (t) => {
  t.mock.method(console, 'error', () => {});
  const storage = memoryStorage();
  storage.setItem = () => { throw new Error('Quota exceeded'); };
  let offline = true;
  let writes = 0;
  const queue = provider(storage, async () => { if (offline) throw new Error('Offline'); writes++; });
  await queue.value().saveResult(fixture());
  assert.match(queue.value().savedResults[0].message, /Keep this tab open/);
  offline = false;
  await queue.value().retryResult('score-1');
  assert.equal(writes, 1);
  assert.equal(queue.value().savedResults[0].status, 'saved');
  queue.cleanup();
});

test('failed password updates retain input, show the error, and prevent duplicate requests', async (t) => {
  t.mock.method(console, 'error', () => {});
  const update = deferred();
  let calls = 0;
  const form = accountForm(async () => {}, () => { calls++; return update.promise; });
  find(form.render(), (node) => node.type === 'button' && node.props.children === 'Change password').props.onClick();
  find(form.render(), (node) => node.type === 'input').props.onChange({ target: { value: 'new-password' } });
  const submitted = find(form.render(), (node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
  await find(form.render(), (node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
  assert.equal(calls, 1);
  const { FirebaseError } = require('firebase/app');
  update.reject(new FirebaseError('auth/network-request-failed', 'Offline'));
  await submitted;
  assert.equal(form.closed(), 0);
  assert.equal(find(form.render(), (node) => node.type === 'input').props.value, 'new-password');
  assert.match(find(form.render(), (node) => node.props?.role === 'alert').props.children, /Check your connection/);
  form.cleanup();
});

test('recovery ignores invalid or other-account entries and strips unknown fields', async (t) => {
  t.mock.method(console, 'error', () => {});
  const storage = memoryStorage();
  storage.setItem('rockettype:pending-results:v1:alice', JSON.stringify({ version: 1, generation: 'test', results: [
    { ...fixture(), unexpected: 'discard', characters: { ...fixture().characters, unexpected: 1 } },
    { ...fixture(), id: 'other', userUID: 'bob' },
    { ...fixture(), id: 'invalid', elapsedSeconds: -1 },
  ] }));
  const { readPendingResults } = require('../app/_lib/pendingResults.ts');
  const restored = readPendingResults(storage, 'alice').results;
  assert.deepEqual(restored, [fixture()]);
  storage.setItem('rockettype:pending-results:v1:alice', '{broken');
  assert.throws(() => readPendingResults(storage, 'alice'));
});

test('Zen stops existing effects and suppresses new motion when the preference changes', () => {
  const harness = hooks();
  const preference = new EventTarget();
  preference.matches = false;
  global.window = { innerWidth: 800, innerHeight: 600, matchMedia: () => preference, addEventListener() {}, removeEventListener() {} };
  const frames = new Set();
  global.requestAnimationFrame = () => { const id = frames.size + 1; frames.add(id); return id; };
  global.cancelAnimationFrame = (id) => frames.delete(id);
  const { default: ZenSky } = loadWithMocks('../app/_components/zen/ZenSky.tsx', {
    react: { ...harness.react, useImperativeHandle: (ref, create) => { ref.current = create(); } },
  });
  const handle = { current: null };
  const tree = harness.render(() => ZenSky({ ref: handle }));
  let canceled = 0;
  let cleared = 0;
  const effects = find(tree, (node) => node.type === 'g' && node.props.ref && typeof node.props.ref !== 'function');
  effects.props.ref.current = { getAnimations: () => [{ cancel: () => { canceled++; } }], replaceChildren: () => { cleared++; } };
  preference.matches = true;
  preference.dispatchEvent(new Event('change'));
  assert.equal(frames.size, 0);
  assert.equal(canceled, 1);
  assert.equal(cleared, 1);
  // Any attempt to create an animated SVG node would throw with this document.
  global.document = { createElementNS: () => { throw new Error('Motion was created'); } };
  handle.current.keystroke();
  handle.current.word();
  preference.matches = false;
  preference.dispatchEvent(new Event('change'));
  assert.equal(frames.size, 1);
  harness.cleanup();
  assert.equal(frames.size, 0);
});

test('Zen counts multilingual words without counting standalone punctuation', () => {
  const harness = hooks();
  global.window = { matchMedia: () => ({ matches: false }) };
  global.document = { addEventListener() {}, removeEventListener() {} };
  const { default: ZenMode } = loadWithMocks('../app/_components/ZenMode.tsx', {
    react: harness.react, './WordCounter': { default: 'WordCounter' }, './zen/ZenSky': { default: 'ZenSky' },
  });
  const tree = harness.render(ZenMode);
  find(tree, (node) => node.type === 'textarea').props.onChange({ target: { value: 'Hello, 世界 — café 123' } });
  assert.equal(find(harness.render(ZenMode), (node) => node.type === 'WordCounter').props.complete, 4);
  harness.cleanup();
});

test('reset deletion waits for all requests before reporting a partial failure', async () => {
  const slowDelete = deferred();
  const failure = new Error('Permission denied');
  const { deleteData } = loadWithMocks('../app/_lib/getResults.tsx', {
    './Firebase': { db: {}, auth: { currentUser: player } },
    './verifiedTests': { verifiedBackendEnabled: false },
    'firebase/firestore': {
      collection() {}, query() {}, where() {}, orderBy() {}, doc: (_, __, id) => id,
      getDocs: async () => ({ docs: ['failed', 'slow'].map((id) => ({ id, data: () => ({}) })) }),
      deleteDoc: (id) => id === 'failed' ? Promise.reject(failure) : slowDelete.promise,
    },
  });
  let settled = false;
  const deleting = deleteData().catch((error) => error).finally(() => { settled = true; });
  await new Promise(setImmediate);
  assert.equal(settled, false, 'Other deletion requests must finish before retries are unlocked');
  slowDelete.resolve();
  assert.equal(await deleting, failure);
});

test('verified typing proof survives reload with the original score ID', async (t) => {
  t.mock.method(console, 'error', () => {});
  const storage = memoryStorage();
  const first = provider(storage, async () => { throw new Error('Offline'); });
  const result = { ...fixture(), proof: { sessionID: 'score-1', events: [{ type: 'char', char: 'h', ms: 0 }] } };
  await first.value().saveResult(result);
  first.cleanup();
  let recovered;
  const second = provider(storage, async (payload) => { recovered = payload; return { ...payload, verified: true }; });
  await second.value().retryResult('score-1');
  assert.deepEqual(recovered.proof, result.proof);
  assert.equal(second.value().savedResults[0].result.verified, true);
  second.cleanup();
});

test('verified saves await the server clock and accept only server-returned metrics', async () => {
  const begin = deferred();
  const canonical = { ...fixture(), verified: true, wpm: 12 };
  let calls = 0;
  const { default: save } = loadWithMocks('../app/_lib/resultToFirebase.tsx', {
    './Firebase': { auth: { currentUser: player }, db: {} },
    './verifiedTests': { verifiedBackendEnabled: true, beginVerifiedTest: () => begin.promise,
      forgetTestStart() {}, callBackend: async (name) => { assert.equal(name, 'submitResult'); calls++; return canonical; } },
  });
  const saving = save({ ...fixture(), wpm: 99999, proof: { sessionID: 'score-1', events: [] } });
  await Promise.resolve();
  assert.equal(calls, 0);
  begin.resolve();
  assert.deepEqual(await saving, canonical);
  assert.equal(calls, 1);
});

test('verified typing waits for server words and records one replay through the deadline', async (t) => {
  t.mock.method(console, 'error', () => {});
  const harness = hooks();
  global.window = { matchMedia: () => ({ matches: false }) };
  global.document = { addEventListener() {}, removeEventListener() {} };
  let clock = 1000;
  t.mock.method(performance, 'now', () => clock);
  let input;
  let preparationCalls = 0;
  let beginCalls = 0;
  let saved;
  let navigated;
  const settings = { start: true, mode: 'Rocket Run', time: 15, count: 20, words: '1k' };
  const context = { gameMode: settings, practiceWords: null, savedResults: [], setGameMode() {}, setTrackBySecond() {}, setTestDetails() {}, saveResult: async (result) => { saved = result; } };
  const router = { push: (url) => { navigated = url; } };
  const { default: TypingTest } = loadWithMocks('../app/_components/typing/TypingTest.tsx', {
    react: harness.react, 'next/navigation': { useRouter: () => router },
    './WordsDisplay': { default: 'WordsDisplay' }, '../Clock': { Clock: 'Clock' }, '../WordCounter': { default: 'WordCounter' },
    '../../_lib/userContext': { useUser: () => ({ user: player }) },
    '../../_lib/gameContext': { useGameContext: () => context },
    '../../_lib/getResults': { getPersonalBest: async () => null },
    '../../_lib/typing/useTypingInput': { useTypingInput: (_, handlers) => { input = handlers; } },
    '../../_lib/verifiedTests': { verifiedBackendEnabled: true, createVerifiedTest: async (id) => {
      preparationCalls++;
      if (preparationCalls === 1) throw new Error('Offline');
      return { id, targets: ['hello', 'world'] };
    }, beginVerifiedTest: async () => { beginCalls++; } },
  });
  let tree = harness.render(TypingTest);
  input.onChar('x');
  assert.equal(beginCalls, 0);
  await new Promise(setImmediate);
  tree = harness.render(TypingTest);
  assert.ok(find(tree, (node) => node.props?.role === 'alert'));
  find(tree, (node) => node.type === 'button' && node.props.children === 'Try again').props.onClick();
  harness.render(TypingTest);
  await new Promise(setImmediate);
  tree = harness.render(TypingTest);
  assert.deepEqual(find(tree, (node) => node.type === 'WordsDisplay').props.state.words, ['hello', 'world']);
  input.onChar('h');
  clock = 1100; input.onChar('x');
  clock = 1200; input.onBackspace();
  clock = 1300; input.onChar('e');
  harness.render(TypingTest);
  clock = 16000; input.onChar('l');
  assert.equal(beginCalls, 1);
  assert.equal(saved.id, saved.proof.sessionID);
  assert.deepEqual(saved.proof.events, [{ type: 'char', char: 'h', ms: 0 }, { type: 'char', char: 'x', ms: 100 }, { type: 'backspace', ms: 200 }, { type: 'char', char: 'e', ms: 300 }]);
  assert.equal(saved.keyCount, 3);
  assert.equal(saved.errors, 1);
  assert.equal(saved.elapsedSeconds, 15);
  assert.equal(navigated, '/result');
  harness.cleanup();
});
