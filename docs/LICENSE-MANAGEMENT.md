# Network-D License Management API

This first implementation adds a license API to the existing Next.js 15 App Router project. It does not replace the current Next.js/Python application.

## Storage

The API uses Supabase Postgres through its REST endpoint. Run `database/license-schema.sql` in the Supabase SQL Editor.

Set these server-only environment variables:

- `SUPABASE_URL`: project URL, for example `https://PROJECT.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY`: service-role secret. Never expose it to browser code, commit it, or use a `NEXT_PUBLIC_` prefix.

## Endpoints

### Customer endpoints

- `POST /api/license/activate` — JSON: `{ "license_key": "ND-...", "device_id": "stable-device-id" }`. Returns an activation token once.
- `POST /api/license/validate` — JSON: `{ "activation_token": "...", "device_id": "stable-device-id" }`.
- `POST /api/license/deactivate` — JSON: `{ "activation_token": "...", "device_id": "stable-device-id" }`.

The client must store the activation token securely and never log it. Use a stable random installation ID; do not use a MAC address or other hardware identifier.

### Admin endpoints

These endpoints currently reuse the project's existing cookie-based `requireAuth` helper:

- `GET /api/license/admin` — list license metadata (never returns key hashes).
- `POST /api/license/admin` — issue a license. JSON: `{ "customer_email": "buyer@example.com", "plan": "developer-monthly", "duration_days": 30, "max_activations": 1 }`. The plaintext key is returned once only.
- `PATCH /api/license/admin` — set status. JSON: `{ "id": "license-uuid", "status": "active|suspended|revoked" }`.

## Important security and release notes

1. Configure a strong unique `AUTH_PASS` and `AUTH_PASS_HASH`; the current repository's login/session implementation is not production-grade. Before selling, replace it with signed, server-side sessions, secure cookies, CSRF protection, login rate limits, and proper role checks. The current `requireAuth` only checks for the presence of a session cookie and must not be treated as hardened admin authentication.
2. Supabase service-role key bypasses RLS. Keep it only in server runtime secrets.
3. Run the SQL migration before calling endpoints. Without it, endpoints return service unavailable.
4. License checks are online checks. Define a deliberate offline grace period before commercial release; do not fail open if the server is unreachable.
5. License suspension/revocation blocks subsequent validation, but cannot erase a downloaded Docker image or stop a copied binary that has been modified to bypass checks.
6. Admin API is a technical MVP, not yet a payment integration or Docker Hub Gated Distribution integration.
7. Add rate limiting, audit logs, customer email verification, payment webhook verification, monitoring, backup/restore, and automated tests before production.
