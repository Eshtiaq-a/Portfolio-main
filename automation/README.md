# Portfolio Intelligence Agent

The public Vite app never receives GitHub, database, AI, webhook, or admin
credentials. The migration
`supabase/migrations/20261110010000_portfolio_intelligence_agent.sql` adds the
reviewable data model, admin-only RLS policies, activity log, credential
allow-list, and the explicit publishing controls.

Configure a server-side endpoint at `CURATION_ENDPOINT` and the matching
`CURATION_SECRET` GitHub Actions secret. The endpoint must expose:

1. `POST /sync/github` for the daily backup scan.
2. `POST /webhooks/github` for repository push/release events.
3. `POST /submissions` for the protected `/admin/submit` form.
4. `GET /admin/activity` and mutation endpoints for the protected dashboard.

The server implementation must:

1. Fetch public repositories for `Eshtiaq-a` with a server-side GitHub client,
   including README/setup quality, history, structure, deployment configuration,
   assets, stars, forks, releases, and fork/tutorial/assignment/test signals.
2. Verify GitHub webhook signatures with a server-only secret before parsing the
   event, reject replayed events, and rate-limit both webhook and submission
   endpoints.
3. Upsert `source_records` and evaluate only on the server with an AI API
   secret. Validate the complete evaluator object against the decision, score,
   category, evidence, and valid URLs before storing it.
4. Use this decision policy: 85–100 may publish only when `auto_publish` is on
   and `require_approval_for_all` is off; 60–84 enters private review; below 60
   is rejected and retained in the audit log.
5. Never publish forks without original work, test/practice repositories,
   tutorial clones, assignments, unverified credentials, missing source URLs,
   invented metrics, or unsupported claims.
6. Never delete or overwrite an existing public item. Hide/unpublish is an
   explicit authenticated admin action and must be logged.
7. Accept LinkedIn, certificate, achievement, and publication URLs only through
   the admin submission flow. Never scrape or log in to LinkedIn.
8. Allow credentials only from the configured `credential_domains` list and
   require an official verification URL before publishing a credential.
9. Write source URL, evidence, score, decision, evaluation date, and publication
   state to the database before triggering any deployment or cache revalidation.
10. Send an admin notification containing exactly what was published and the
    verified evidence supporting it.

The public site should query only `portfolio_items where published = true`.
The `/admin/submit` client page intentionally contains no secret and relies on
the server's authenticated session and RLS policies for protection.
