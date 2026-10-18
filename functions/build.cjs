/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const out = path.join(__dirname, 'lib');
fs.mkdirSync(out, { recursive: true });
// Use the same scoring engine on both sides; ship only the generated pure modules.
for (const name of ['engine', 'stats']) {
  const source = fs.readFileSync(path.join(__dirname, '../app/_lib/typing', name + '.ts'), 'utf8');
  fs.writeFileSync(path.join(out, name + '.js'), ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText);
}
const wordSource = fs.readFileSync(path.join(__dirname, '../app/_ui/words.tsx'), 'utf8');
const wordModule = { exports: {} };
new Function('exports', ts.transpileModule(wordSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(wordModule.exports);
fs.writeFileSync(path.join(out, 'words.json'), JSON.stringify({ '1k': wordModule.exports.top1kWords, '5k': wordModule.exports.top5kWords }));
