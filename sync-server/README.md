# Shared presentation storage

The existing static app stays on Netlify. `public/config.js` points to a small Worker with durable R2 storage, hosted as the FHV Friends Presentation Sync Site. No service key is shipped to the browser.

Create a room under Profile → Settings → Presentation room, then open the same private room link on all phones. The room has four editable presentation profiles. Each device remembers its selected profile separately. Any room participant may select any of the four identities; this is intentionally a presentation feature, not verified FHV authentication.

Room tokens are 256-bit random values kept in URL fragments and device storage. Only their SHA-256 digest is used as the storage key. There is no room listing endpoint. API requests require the room token. Allowed origins are limited to the app and local preview. Keep room links out of the public repository.

The server applies three-way changes with conditional R2 writes, preventing concurrent profile edits and messages from replacing one another. The client polls every 2.5 seconds while visible, uses conditional reads, and persists pending changes locally for reconnect/reload. Direct chats use stable participant-based IDs. Room data, including photos, is capped at 3 MiB. There is no automatic reset or expiry.

Source: `sync-server/worker.js` and `src/merge.js`. The Sites checkout `../fhv-friends-sync` copies these into its build. Hosting identity: `appgprj_6b01ee555f5c8191a5ff978db502edc3`. Run `node --test tests/sync.test.mjs` for independent-client concurrency, reload, offline and room-access tests.
