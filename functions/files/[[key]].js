export async function onRequestGet({ params, env }) {
  try {
    if (!env.ASSETS) return new Response('R2 not configured', { status: 500 });
    const key = Array.isArray(params.key) ? params.key.join('/') : params.key;
    const obj = await env.ASSETS.get(key);
    if (!obj) return new Response('Not found', { status: 404 });
    const headers = new Headers();
    const ct = obj.httpMetadata?.contentType || 'application/octet-stream';
    headers.set('Content-Type', ct);
    headers.set('Cache-Control', obj.httpMetadata?.cacheControl || 'public, max-age=31536000, immutable');
    return new Response(obj.body, { status: 200, headers });
  } catch (e) {
    return new Response('Error', { status: 500 });
  }
}
