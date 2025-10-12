export async function onRequestGet({ env }) {
  const out = { ok: true, THEMES_KV: {}, FONTS_KV: {}, ASSETS: {} };
  try {
    // Test THEMES_KV
    if (!env.THEMES_KV) {
      // Allow fallback to FONTS_KV for themes
      if (env.FONTS_KV) {
        const k = `diag:themes:${Date.now()}`;
        try {
          await env.FONTS_KV.put(k, '1', { expirationTtl: 60 });
          const v = await env.FONTS_KV.get(k);
          const list = await env.FONTS_KV.list({ prefix: 'diag:themes:' });
          await env.FONTS_KV.delete(k);
          out.THEMES_KV = { ok: true, note: 'Using FONTS_KV fallback', wrote: Boolean(v === '1'), listed: (list.keys || []).length >= 0 };
        } catch (e) {
          out.THEMES_KV = { ok: false, error: 'Missing binding THEMES_KV', detail: String(e) };
        }
      } else {
        out.THEMES_KV = { ok: false, error: 'Missing binding THEMES_KV' };
      }
    } else {
      const k = `diag:themes:${Date.now()}`;
      try {
        await env.THEMES_KV.put(k, '1', { expirationTtl: 60 });
        const v = await env.THEMES_KV.get(k);
        const list = await env.THEMES_KV.list({ prefix: 'diag:themes:' });
        await env.THEMES_KV.delete(k);
        out.THEMES_KV = { ok: true, wrote: Boolean(v === '1'), listed: (list.keys || []).length >= 0 };
      } catch (e) {
        out.THEMES_KV = { ok: false, error: String(e) };
      }
    }

    // Test FONTS_KV
    if (!env.FONTS_KV) {
      out.FONTS_KV = { ok: false, error: 'Missing binding FONTS_KV' };
    } else {
      const k = `diag:fonts:${Date.now()}`;
      try {
        await env.FONTS_KV.put(k, '1', { expirationTtl: 60 });
        const v = await env.FONTS_KV.get(k);
        const list = await env.FONTS_KV.list({ prefix: 'diag:fonts:' });
        await env.FONTS_KV.delete(k);
        out.FONTS_KV = { ok: true, wrote: Boolean(v === '1'), listed: (list.keys || []).length >= 0 };
      } catch (e) {
        out.FONTS_KV = { ok: false, error: String(e) };
      }
    }

    // Test R2 (ASSETS) with a head/list call if possible
    if (!env.ASSETS) {
      out.ASSETS = { ok: false, error: 'Missing binding ASSETS (R2)' };
    } else if (typeof env.ASSETS.put !== 'function' || typeof env.ASSETS.head !== 'function') {
      out.ASSETS = {
        ok: false,
        error: 'ASSETS binding missing R2 methods',
        detail: {
          hasPut: typeof env.ASSETS.put === 'function',
          hasHead: typeof env.ASSETS.head === 'function'
        }
      };
    } else {
      const key = `diag:r2:${Date.now()}`;
      let head;
      try {
        await env.ASSETS.put(key, 'diag', {
          httpMetadata: { contentType: 'text/plain' },
          customMetadata: { diag: 'true' }
        });
        head = await env.ASSETS.head(key);
        out.ASSETS = {
          ok: Boolean(head),
          wrote: Boolean(head),
          size: head ? head.size : null
        };
      } catch (e) {
        out.ASSETS = { ok: false, error: String(e) };
      } finally {
        try {
          await env.ASSETS.delete(key);
        } catch (cleanupError) {
          out.ASSETS = out.ASSETS || {};
          out.ASSETS.cleanupError = String(cleanupError);
        }
      }
    }
  } catch (e) {
    out.ok = false;
    out.error = String(e);
  }
  return new Response(JSON.stringify(out, null, 2), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
