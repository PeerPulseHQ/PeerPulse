// React Native resolves DNS natively — pass hostname straight through.
export function lookup(hostname, _opts, cb) {
  if (typeof _opts === 'function') cb = _opts;
  cb(null, hostname, 4);
}
export const resolve  = lookup;
export const resolve4 = lookup;
export const promises = { lookup, resolve, resolve4 };
export default { lookup, resolve, resolve4, promises };
