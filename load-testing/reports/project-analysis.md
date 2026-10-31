# Project analysis

Analysis of the checked-in source, not a measurement of the deployed service.

## Architecture and deployment

- `client/`: React/Vite; `client/src/services/api.js` uses same-origin `/api` and sends cookies. `server/src/index.js` is the Express API; `server/src/models.js` defines Mongoose schemas. Production serves `client/dist` from Express.
- `deploy.sh` builds the client and starts/reloads PM2 (`game-qa` by default), or restarts a named systemd service. No Docker, Nginx configuration, or infrastructure-as-code was found. Nginx may still exist on the host. Lightsail 2 GB and Atlas are target assumptions, not verified deployment facts.
- `MONGODB_URI` connects via `mongoose.connect` without explicit pool/timeout options; local MongoDB is the fallback. JWT_SECRET, PORT, NODE_ENV and CLIENT_ORIGIN are used by the server. The frontend uses relative URLs. There is no API health endpoint.
- Authentication: JWT in `gqa_session` HTTP-only cookie; secure in production, same-site lax. Every authenticated request verifies JWT and loads the user from MongoDB. Admin routes additionally require admin role. Login, admin login and registration use a shared IP rate limiter of 30 requests per 15 minutes. Avoid treating high-concurrency login as representative unless separately authorized and designed.

## Endpoint inventory

Paths below are relative to `/api`; methods are exactly those registered in `server/src/index.js`.

| Methods | Path | Access |
|---|---|---|
| POST | `/auth/register`, `/auth/login`, `/auth/admin/login` | Public, rate limited |
| POST | `/auth/logout` | Public, clears cookie |
| GET, PATCH | `/auth/me` | Authenticated |
| GET | `/modules`, `/theory`, `/dashboard`, `/bugs`, `/cases`, `/feedback` | Authenticated |
| POST | `/modules/:id/complete`, `/bugs`, `/cases`, `/feedback`, `/certificates/issue` | Authenticated, writes |
| PATCH, DELETE | `/bugs/:id`, `/cases/:id` | Authenticated owner, writes |
| GET | `/certificates/download` | Authenticated; 404 if no uploaded file |
| GET | `/certificates/verify/:code` | Public; 404 for missing certificate |
| GET | `/admin/stats`, `/admin/users`, `/admin/bugs`, `/admin/cases`, `/admin/feedback`, `/admin/certificates` | Admin |
| PATCH | `/admin/users/:id`, `/admin/bugs/:id/review`, `/admin/cases/:id/review`, `/admin/feedback/:id` | Admin, writes |
| PUT | `/admin/users/:id/certificate-file` | Admin, raw PDF/PNG/JPEG up to 10 MB, writes |
| POST | `/admin/modules`, `/admin/theory` | Admin, writes |
| PATCH, DELETE | `/admin/modules/:id`, `/admin/theory/:id` | Admin, writes |

No server-side search, pagination, or record-detail GET routes are implemented for these lists. No email, SMS, AI, or external API integration was found in the server; certificate upload stores a binary in MongoDB. No project test scripts were found.

## Query and workload observations

`/dashboard` performs multiple concurrent counts and a certificate lookup plus another module count; each request also loads the user. Modules and theory fetch full published lists; bugs, cases and feedback fetch full per-user lists sorted by date without pagination. Admin lists use population and up to 500 records; stats issues six concurrent counts. `Bug.user`, `TestCase.user`, unique `User.email`, `Certificate.user` and `Certificate.code` have declared indexes. Feedback.user and sorting combinations have no explicit schema index; an actual Atlas index inventory and explain plans may differ. No aggregation pipelines were found. Automatic index creation behavior and deployed indexes must be checked before recommending changes.

Use Atlas metrics and query profiler/Performance Advisor only if already enabled and permitted: compare active connections and pool wait/timeouts, query latency, scanned documents and index plans over the exact run. No profiling or index is enabled by these scripts. Capture Atlas and application errors independently; do not infer pool saturation or event-loop blocking from latency alone.

## Coverage

Preflight authenticates once and checks every workload endpoint. Each VU then reads profile, dashboard, modules, theory, bugs, cases and feedback with think time. The same dedicated account's signed session is shared read-only to avoid login limiter and mutation races. This makes account data and login volume unrepresentative; use a separate, representative staging dataset and interpret results accordingly. Admin, certificate downloads, uploads, write operations and integrations are excluded. No endpoints or production data are created by this suite.
