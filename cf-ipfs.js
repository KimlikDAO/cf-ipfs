import ipfs from '/lib/ipfs';

const fetch = (request, env, ctx) => {
  /** @const {URL} */
  const url = new URL(request.url);
  if (url.pathname == '/api/v0/add') {
    return (request.formData()
      .then((form) => form.get("blob").arrayBuffer())
      .then((file) => {
        return file.byteLength != 1864
          ? Promise.reject()
          : ipfs.hashArrayBuffer(file)
            .then((hash) => {
              /** @const {string} */
              const cid = ipfs.CID(new Uint8Array(hash));
              ctx.waitUntil(env.KV.put(cid, file));
              return new Response(`{"Hash":"${cid}"}`, {
                headers: {
                  'content-type': 'application/json',
                  'access-control-allow-origin': 'https://kimlikdao.org',
                  'cache-control': 'must-revalidate,no-cache,no-store',
                  'X-size': file.byteLength
                }
              });
            });
      }));
  } else if (url.pathname.startsWith('/ipfs/')) {
    /** @const {Promise<Response>} */
    const fromCache = caches.default
      .match(request.url)
      .then((response) => response ? response : Promise.reject());
    /** @const {Promise<Response>} */
    const fromKV = env.KV.get(url.pathname.slice(6), 'arrayBuffer')
      .then((body) => {
        if (!body) return Promise.reject();
        /** @const {Response} */
        const response = new Response(body, {
          headers: {
            'cache-control': 'max-age=29030400,public,immutable',
            'content-type': 'application/json;charset=utf-8',
            'content-length': body.byteLength,
            'expires': 'Sun, 01 Jan 2034 00:00:00 GMT',
          }
        });
        ctx.waitUntil(caches.default.put(request.url, response.clone()))
        return response;
      });
    return Promise.any([fromCache, fromKV]);
  } else {
    return (new Response('NAPİM?', {
      status: 404,
      headers: { 'content-type': 'text/plain;charset=utf-8' }
    }));
  }
}

export default { fetch };