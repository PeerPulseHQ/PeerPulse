'use strict';

const proc = globalThis.process;

// Mark as ESM so Metro's _interopNamespace doesn't try to re-wrap us
// and assign `default` (which would clash with our own `default` export).
Object.defineProperty(module.exports, '__esModule', { value: true });

// `import process from 'node:process'` reads `.default`.
module.exports.default = proc;

// `import { env } from 'node:process'` reads named exports — mirror them.
for (const key of Object.keys(proc)) {
  if (key === 'default') continue;
  module.exports[key] = proc[key];
}
