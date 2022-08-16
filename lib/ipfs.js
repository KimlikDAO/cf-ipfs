import { base58 } from '/lib/çevir';

/**
 * @param {!Uint8Array} data heş
 * @return {Promise<!ArrayBuffer>}
 */
const hash = (data) => {
  let encoded = new Uint8Array(8 + 1864 + 3);
  encoded.set([10, 208, 14, 8, 2, 18, 200, 14], 0)
  encoded.set(data, 8);
  encoded.set([24, 200, 14], 8 + 1864);
  return crypto.subtle.digest('SHA-256', encoded);
}

const hashArrayBuffer = (buff) => hash(new Uint8Array(buff));

/**
 * @param {!Uint8Array} hash
 * @return {string} CID
 */
const CID = (hash) => {
  let bytes = new Uint8Array(34);
  bytes.set([18, 32], 0)
  bytes.set(hash, 2);
  return base58(bytes);
}

export default { CID, hash, hashArrayBuffer };
