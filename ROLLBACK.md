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

## 4. Incident Response contacts:

- Platform Lead: Principal Engineer
- DevOps: Site Reliability Engineer
- Payments On-call: Finance Engineering Team
