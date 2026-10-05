# Production migration startup fix — TDD evidence

## Source and user journey

No plan file was supplied. The journey was derived from the production incident:

> As an operator, I want the API container to run EF Core migrations before startup when `APPLY_MIGRATIONS=true`, so a fresh production database contains the expected schema and seed data.

## Task report

| Stage | Command or check | Result | Evidence |
|---|---|---|---|
| RED | `dotnet test backend\\tests\\DigiTalent.Tests\\DigiTalent.Tests.csproj --no-restore --filter FullyQualifiedName~DockerComposeMigrationCommandTests` | Expected failure | `entrypoint: ["/bin/sh", "-c"]` was absent from Compose. Checkpoint: `661a91e`. |
| GREEN | Same targeted test after the Compose fix | PASS (1/1) | The backend service now overrides the image entrypoint with `/bin/sh -c` and passes one literal script argument. Checkpoint: `0226f36`. |
| Production backup | `pg_dump -Fc` before migration | PASS | `/opt/digitalent-ai/backups/digitalent-pre-migration-20261005-032653.dump`, 835 bytes, SHA-256 `52f0beaee05e47233ee8c572ce6a853daf5c577adae0a6513d53eb31457a4fc8`. |
| Production migration | `docker exec digitalent-api dotnet DigiTalent.Api.dll --migrate-only` | PASS | EF Core applied the migrations and seeded foundation data; 39 public tables and 5 roles were verified. |
| Runtime regression | Recreate only `backend-api` with the fixed Compose file | PASS | Startup log contains `Applying database migrations and seeding foundation data...`, followed by `No migrations were applied. The database is already up to date.` |
| Health | `curl -sk https://localhost/health` on the EC2 host | PASS | HTTP 200 after the API container was recreated. |

## Test specification

| # | What is guaranteed | Test or check | Type | Result |
|---|---|---|---|---|
| 1 | Compose invokes the startup script through a shell instead of passing it as ignored arguments to `dotnet` | `DockerComposeMigrationCommandTests.BackendApi_ExecutesMigrationScriptThroughShell` | Regression/unit | PASS |
| 2 | A fresh production database receives the EF Core schema and foundation seed data | One-time production `--migrate-only`, followed by read-only table and role counts | Deployment integration | PASS |
| 3 | Repeated container startup is idempotent | Recreated `backend-api`; EF Core reported the database is already up to date | Deployment integration | PASS |
| 4 | The API remains available after the corrected startup path | HTTPS health endpoint | Smoke | PASS |

## Coverage and known gaps

- The targeted regression test passes.
- The full backend suite was executed with `--collect:"XPlat Code Coverage"`: 126 passed and 58 failed because the local environment does not define `DIGITALENT_TEST_POSTGRES_CONNECTION` for disposable PostgreSQL integration tests. The failures are environment prerequisites, not failures introduced by this change.
- Coverage percentage is not claimed because the full suite could not complete successfully without a disposable PostgreSQL instance.
- The deploy script resets the server checkout to `origin/develop`. These local commits and the corrected Compose file are active on EC2, but the next deploy from `develop` can overwrite the fix until the commits are merged into that branch.
- PostgreSQL port `5432` remains reachable through the current infrastructure configuration. Restricting it and requiring SSH tunneling is a separate security hardening task.

## Merge evidence

- RED checkpoint: `661a91e test: reproduce skipped database migration command`
- GREEN checkpoint: `0226f36 fix: execute production database migrations before API startup`
