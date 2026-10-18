/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const React = require('react');

for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => {
    module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
    }).outputText, filename);
  };
}

function loadWithMocks(filename, mocks) {
  const original = Module._load;
  Module._load = function (name, ...args) {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    return original.call(this, name, ...args);
  };
  try {
    const resolved = require.resolve(filename);
    delete require.cache[resolved];
    return require(resolved);
  } finally { Module._load = original; }
}

function hooks() {
  const slots = [];
  let cursor = 0;
  let dirty = true;
  let effects = [];
  const same = (a, b) => a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
  const api = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!slots[index]) slots[index] = { value: typeof initial === 'function' ? initial() : initial };
      return [slots[index].value, (next) => {
        const value = typeof next === 'function' ? next(slots[index].value) : next;
        if (!Object.is(slots[index].value, value)) { slots[index].value = value; dirty = true; }
      }];
    },
    useRef(initial) {
      const index = cursor++;
      return (slots[index] ??= { current: initial });
    },
    useMemo(factory, deps) {
      const index = cursor++;
      if (!slots[index] || !same(slots[index].deps, deps)) slots[index] = { value: factory(), deps };
      return slots[index].value;
    },
    useCallback(callback, deps) { return api.useMemo(() => callback, deps); },
    useEffect(callback, deps) {
      const index = cursor++;
      if (!slots[index] || !same(slots[index].deps, deps)) {
        const cleanup = slots[index]?.cleanup;
        slots[index] = { deps };
        effects.push(() => { cleanup?.(); slots[index].cleanup = callback(); });
      }
    },
    useLayoutEffect(callback, deps) { api.useEffect(callback, deps); },
  };
  return {
    react: api,
    render(component) {
      let output;
      let rounds = 0;
      do {
        if (rounds++ > 20) throw new Error('Hook harness did not settle');
        dirty = false; cursor = 0; effects = [];
        output = component();
        for (const effect of effects) effect();
      } while (dirty);
      return output;
    },
    cleanup() { for (const slot of slots) slot?.cleanup?.(); },
  };
}

function memoryStorage() {
  const data = new Map();
  const tails = new Map();
  const locks = { request(name, options, callback) {
    const action = callback ?? options;
    const previous = tails.get(name) ?? Promise.resolve();
    const next = previous.catch(() => {}).then(action);
    tails.set(name, next);
    return next;
  } };
  return { locks, getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) };
}
function find(node, predicate) {
  if (!node || typeof node !== 'object') return undefined;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const match = find(child, predicate);
    if (match) return match;
  }
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
module.exports = { loadWithMocks, hooks, memoryStorage, find, deferred };
