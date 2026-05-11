module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // libp2p v2.x uses ES2022 private class fields (#field syntax).
      // Hermes supports them natively from RN 0.74+ but loose mode prevents
      // edge-case transpilation failures in older bundled deps.
      ['@babel/plugin-transform-private-methods', { loose: true }],

      // Maps both plain and node:-prefixed built-in imports to RN polyfills.
      // Must match the extraNodeModules entries in metro.config.js exactly.
      ['module-resolver', {
        alias: {
          'crypto':             'react-native-quick-crypto',
          'node:crypto':        'react-native-quick-crypto',
          'stream':             'stream-browserify',
          'node:stream':        'stream-browserify',
          'buffer':             '@craftzdog/react-native-buffer',
          'node:buffer':        '@craftzdog/react-native-buffer',
          'events':             'events',
          'node:events':        'events',
          'net':                'react-native-tcp-socket',
          'node:net':           'react-native-tcp-socket',
          'node:fs':            './shims/empty.js',
          'node:child_process': './shims/empty.js',
          'node:worker_threads':'./shims/empty.js',
          'node:os':            './shims/os.js',
          'node:path':          './shims/path.js',
          'node:dns':           './shims/dns.js',
          'node:dns/promises':  './shims/dns.js',
          'node:process':       './shims/process.js',
          'process':            './shims/process.js',
        },
      }],
    ],
  };
};
