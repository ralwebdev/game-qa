# Game QA Academy — MERN Edition

MERN conversion of the supplied `Game QA Academy — Learner Studio` HTML mockup. Preserves its midnight-blue / lime branding, six original course lessons, 12 theory reference entries, QA practice workflows, portfolio, and certificate eligibility rules.

## Requirements
- Node.js 20+
- MongoDB 6+ running locally or MongoDB Atlas connection string

## Run locally

```bash
cd server
cp .env.example .env
# Edit JWT_SECRET (32+ chars), ADMIN_EMAIL, ADMIN_PASSWORD (12+ chars), and optionally MONGODB_URI
npm install
npm run seed
npm run dev
```

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173 for learner sign-in and registration. Open http://localhost:5173/admin for administrator sign-in, using the admin email/password from `.env`.

Or after installing both subprojects, from repository root run `npm install` and `npm run dev`.

## Production

Use environment variables for secrets, HTTPS behind a reverse proxy, and MongoDB credentials restricted to this database. Set `NODE_ENV=production` and configure `CLIENT_ORIGIN` for your deployed hostname. Build the React client with `npm run build --prefix client`, then start the Express server with `npm start --prefix server`. The server serves the built client automatically in production.

If frontend and backend are hosted on different origins, configure cookies and CSRF defense appropriately before production deployment; the supplied application assumes a same-origin reverse-proxy setup.

## Core roles and features

**Learner:** email/password accounts, profile editing, learning dashboard, lesson modules and completion, searchable glossary, bug reports, test cases, editing/deleting own artifacts, portfolio JSON export, feedback, and server-issued verifiable completion certificates.

**Admin:** overview metrics, learner enable/disable, CRUD for modules and glossary, submission review with notes/status, feedback replies, and certificate register.

**Eligibility:** complete every currently published module, submit >=1 bug report, and submit >=1 test case. Certificate codes are generated and stored on the server. Certificates reflect course completion only, not an external accreditation.

**Security foundations:** bcrypt password hashes, HttpOnly SameSite cookies carrying signed JWTs, per-request account lookup, authorization on all protected endpoints, learner ownership checks for artifacts, login rate limiting, Helmet, request body limits, and validation of required fields. This is a starter implementation, not a completed security audit.

## Routes

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/admin/login`, `POST /api/auth/logout`, `GET/PATCH /api/auth/me`
- `GET /api/dashboard`, `GET /api/modules`, `POST /api/modules/:id/complete`, `GET /api/theory`
- `GET/POST /api/bugs`, `PATCH/DELETE /api/bugs/:id`
- `GET/POST /api/cases`, `PATCH/DELETE /api/cases/:id`
- `GET/POST /api/feedback`
- `POST /api/certificates/issue`, `GET /api/certificates/verify/:code`
- `GET /api/admin/stats`, `GET /api/admin/users`, `PATCH /api/admin/users/:id`
- `POST/PATCH/DELETE /api/admin/modules`, `POST/PATCH/DELETE /api/admin/theory` (specific IDs for mutation routes)
- `GET /api/admin/bugs`, `GET /api/admin/cases`, `PATCH /api/admin/:type/:id/review`
- `GET /api/admin/feedback`, `PATCH /api/admin/feedback/:id`, `GET /api/admin/certificates`

## Differences from original HTML

Original is a standalone browser-local simulator with optional 4-digit local PIN and browser-generated certificates. Here those are deliberately replaced by server-authenticated accounts, MongoDB state and server-issued certificate IDs. No payment, grading/exam engine, file upload, email, or learner import is implemented. Attachment support is currently URL/reference text only. Export is JSON; browser printing provides certificate PDF via print dialogue. Admin content management is basic and requires styling polish for larger content volumes.

## Source conversion

`extract.cjs` extracts the original six modules and 12 theory entries from the source HTML into JSON seed data. This source file itself is not included; the extracted dataset is included under `server/src/`.
