// Minimal path shim — libp2p uses path only for multiaddr string operations.
export const sep      = '/';
export const join     = (...parts) => parts.join('/').replace(/\/+/g, '/');
export const resolve  = (...parts) => join(...parts);
export const dirname  = (p) => p.split('/').slice(0, -1).join('/') || '/';
export const basename = (p, ext) => {
  const b = p.split('/').pop();
  return ext && b.endsWith(ext) ? b.slice(0, -ext.length) : b;
};
export const extname  = (p) => { const m = p.match(/\.[^.]+$/); return m ? m[0] : ''; };
export default { sep, join, resolve, dirname, basename, extname };
