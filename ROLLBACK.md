# Production Rollback Strategy

## 1. Automated Fallback (Docker)

In case of a failed deployment, run the following command to revert to the previous stable image:

```bash
# Revert to last stable tag
docker-compose down
git checkout v1.x.x (stable tag)
docker-compose build
docker-compose up -d
```

## 2. Database Recovery

Before every migration, an automated snapshot is recommended. To restore:

1. Stop application containers.
2. Restore the latest DB snapshot:
   ```bash
   # Restore via psql
   dropdb -h localhost -p 5432 -U postgres param_adventures
   createdb -h localhost -p 5432 -U postgres param_adventures
   psql -h localhost -p 5432 -U postgres param_adventures < backup_pre_migration.sql
   ```
3. Restart containers.

## 3. Kill Switches (Emergency)

If the payment flow is behaving erratically, use the following environment variables to disable features without a full redeploy (requires app restart):

- `ENABLE_BOOKINGS=false`
- `ENABLE_PAYMENTS=false`

## 4. Incident Response Playbook

In the event of a production failure (e.g., payment loop, data corruption, 500 errors):

### Stage 1: Triage (0-5 mins)

1. **Identify**: Check logs (Vercel/Render) and monitoring dashboards.
2. **Impact**: Determine if all users are affected or just a subset.
3. **Notify**: Post in #incident-response slack channel.

### Stage 2: Mitigation (5-15 mins)

1. **Kill Switch**: If the bug is in payments/bookings, set `ENABLE_PAYMENTS=false` in environment variables and redeploy/restart.
2. **Rollback**: If the latest deployment is the cause, run `./scripts/rollback.sh <stable_tag>`.

### Stage 3: Resolution (15 mins+)

1. **Schema Check**: If a migration broke the app, perform the manual DB restore steps in Section 2.
2. **Root Cause**: Once stable, analyze logs to find the bug.
3. **Hotfix**: Prepare a tested fix and deploy.

## 5. Contact List:

- Platform Lead: Principal Engineer
- DevOps: Site Reliability Engineer
- Payments On-call: Finance Engineering Team
