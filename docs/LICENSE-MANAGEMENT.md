# Network-D License Management API

This MVP adds license endpoints to the existing Next.js 15 App Router application.

## Database setup

The API uses Supabase Postgres through its REST API. Run `database/license-schema.sql` in the Supabase SQL Editor.

Configure server-only environment variables:

- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: service-role secret. Never expose it to browser code or use a `NEXT_PUBLIC_` prefix.
- `LICENSE_ADMIN_TOKEN`: long random secret (at least 32 random bytes), stored only in deployment secrets.

## Customer API

- `POST /api/license/activate`: `{ "license_key": "ND-...", "device_id": "stable-installation-id" }`; returns an activation token once.
- `POST /api/license/validate`: `{ "activation_token": "...", "device_id": "stable-installation-id" }`.
- `POST /api/license/deactivate`: same payload as validate.

Use a stable random installation ID, not a MAC address or hardware serial. Store the activation token securely and never log it.

## Admin API

All requests require `Authorization: Bearer <LICENSE_ADMIN_TOKEN>`.

- `GET /api/license/admin`: list license metadata (never returns key hashes).
- `POST /api/license/admin`: issue a license. Payload: `{ "customer_email": "buyer@example.com", "plan": "developer-monthly", "duration_days": 30, "max_activations": 1 }`. The plaintext key is returned once only.
- `PATCH /api/license/admin`: update status. Payload: `{ "id": "license-uuid", "status": "active|suspended|revoked" }`.

Do not embed the admin token in browser code or the distributed Docker image.

## Production hardening still required

1. This is an MVP single-admin credential, not a complete admin user/role system. Rotate the token and protect it as a production secret.
2. The existing app login/session implementation is not production-grade; replace it with signed server-side sessions, secure cookies, CSRF protection, login rate limits, and roles before commercial release.
3. Supabase service-role credentials bypass RLS and must remain server-side.
4. Run the SQL migration before using the endpoints.
5. Online validation currently fails closed when the license service is unavailable. Define and implement an explicit offline grace policy before release.
6. Revocation blocks subsequent validation but cannot erase an image already downloaded or prevent a modified client from bypassing checks.
7. Payment webhooks, Docker Hub distribution entitlements, rate limiting, audit logs, monitoring, backup/restore, and automated tests are not included yet.
