const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const monoroot = path.resolve(__dirname, '../..');

const config = getDefaultConfig(__dirname);

// Watch monorepo packages so hot reload works across workspace boundaries
config.watchFolders = [monoroot];

// Block pnpm virtual store temp dirs — they get created then deleted during
// install and Metro's FallbackWatcher crashes trying to watch them.
config.resolver.blockList = [
  /node_modules\/\.pnpm\/.*_tmp_.*/,
];

// Required for libp2p v3.x which uses the node: URL scheme for built-in imports
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames       = ['react-native', 'require', 'default'];

// Node built-ins → RN-safe polyfills.  When unstable_enablePackageExports is on,
// extraNodeModules is bypassed for `node:` prefixed imports, so we use
// resolveRequest to intercept them explicitly.
const NODE_BUILTIN_ALIASES = {
  'crypto':              require.resolve('react-native-quick-crypto'),
  'stream':              require.resolve('stream-browserify'),
  'buffer':              require.resolve('@craftzdog/react-native-buffer'),
  'events':              path.dirname(require.resolve('events/package.json')) + '/events.js',
  'net':                 require.resolve('react-native-tcp-socket'),
  'process':             path.resolve(__dirname, 'shims/process.js'),
  'fs':                  path.resolve(__dirname, 'shims/empty.js'),
  'child_process':       path.resolve(__dirname, 'shims/empty.js'),
  'worker_threads':      path.resolve(__dirname, 'shims/empty.js'),
  'os':                  path.resolve(__dirname, 'shims/os.js'),
  'path':                path.resolve(__dirname, 'shims/path.js'),
  'dns':                 path.resolve(__dirname, 'shims/dns.js'),
  'dns/promises':        path.resolve(__dirname, 'shims/dns.js'),
};

// Patch RN 0.83.6's webidl Event: upstream defines Event.prototype.NONE
// as non-writable, then the constructor tries `this.NONE = void 0` which
// throws in strict mode on every `new Event(...)` (e.g. WebSocket 'open').
const RN_EVENT_PATCH = path.resolve(__dirname, 'shims/rn-event.js');
const isRNWebidlEvent = (p) =>
  !!p && /\/react-native\/src\/private\/webapis\/dom\/events\/Event\.[jt]s$/.test(p);

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const stripped = moduleName.startsWith('node:') ? moduleName.slice(5) : null;
  const target = NODE_BUILTIN_ALIASES[stripped] || NODE_BUILTIN_ALIASES[moduleName];
  if (target) {
    return { type: 'sourceFile', filePath: target };
  }
  // Delegate to default resolver first to get absolute path, then redirect.
  const resolved = defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
  if (resolved?.type === 'sourceFile' && isRNWebidlEvent(resolved.filePath)) {
    return { type: 'sourceFile', filePath: RN_EVENT_PATCH };
  }
  return resolved;
};

module.exports = config;
