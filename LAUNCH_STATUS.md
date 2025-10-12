# Launch Readiness

## Current Status
- ✅ Code fixes for remote KV seeding and email send button behaviour are merged into `index.html`.
- ✅ Cloudflare `wrangler.toml` now binds the `ASSETS` variable to the `photos` R2 bucket used by deployment.
- ✅ EmailJS test/send flows now surface the provider's error text instead of `undefined`, simplifying credential debugging.
- ✅ HTML structure validated via `npx -y htmlhint index.html` (2025-10-12).
- ⚠️ No automated or manual integration test evidence yet for Cloudflare KV/R2 syncing or the EmailJS send flow.

## Outstanding Verification
1. **Cloudflare bindings smoke test** – Deploy to staging/production and hit `/api/diag`; capture the JSON output showing `THEMES_KV`, `FONTS_KV`, and `ASSETS` all `ok: true` (the R2 probe now performs a temporary `put/head/delete` cycle so expect a small `wrote: true` entry).
2. **Remote seed & sync** – From the hosted admin UI over HTTPS, clear local storage, trigger **Sync now**, and confirm the "Seeded to server" status without fallback alerts.
3. **EmailJS end-to-end** – With live keys, submit test emails and confirm the button re-enables on success/failure while the new error messaging reports any credential issues; capture screenshots/logs.
4. **Offline queue retry** – Force offline mode, queue messages, reconnect, and use **Send Pending** to verify retries and counter resets.

Once the above checks are documented (screenshots or logs) alongside the existing lint result, the release can be marked launch-ready.
