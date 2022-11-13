import ipfs from '/lib/ipfs';

addEventListener('fetch', (event) => {
  /** @const {URL} */
  const url = new URL(event.request.url);
  if (url.pathname == '/api/v0/add') {
    event.respondWith(event.request.formData()
      .then((form) => form.get("blob").arrayBuffer())
      .then((file) => ipfs.hash(file)
        .then((hash) => {
          /** @const {string} */
          const cid = ipfs.CID(new Uint8Array(hash));
          event.waitUntil(KV.put(cid, file));
          return new Response(`{"Hash":"${cid}"}`, {
            headers: {
              'content-type': 'application/json',
              'access-control-allow-origin': "*",
              'cache-control': 'must-revalidate,no-cache,no-store',
              'X-size': file.byteLength
            }
          });
        })));
  } else if (url.pathname.startsWith('/ipfs/')) {
    /** @const {Promise<Response>} */
    const fromCache = caches.default
      .match(event.request.url)
      .then((response) => response ? response : Promise.reject());
    /** @const {Promise<Response>} */
    const fromKV = KV.get(url.pathname.slice(6), 'arrayBuffer')
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
        event.waitUntil(caches.default.put(event.request.url, response.clone()))
        return response;
      });
    event.respondWith(Promise.any([fromCache, fromKV]));
  } else {
    return (new Response('NAPİM?', {
      status: 404,
      headers: { 'content-type': 'text/plain;charset=utf-8' }
    }));
  }
})
