#!/bin/bash

# Param Adventures - Quick Rollback Script
# Usage: ./scripts/rollback.sh <target_version_or_tag>

if [ -z "$1" ]; then
  echo "Usage: $0 <target_version_or_tag>"
  echo "Example: $0 v1.0.1"
  exit 1
fi

TARGET_VERSION=$1

echo "----------------------------------------------------"
echo "INITIATING ROLLBACK TO VERSION: $TARGET_VERSION"
echo "----------------------------------------------------"

# 1. Check if git is clean
if ! git diff-index --quiet HEAD --; then
  echo "WARNING: Git working directory is not clean. Stashing changes..."
  git stash
fi

# 2. Checkout the target version
echo "Checking out version $TARGET_VERSION..."
git checkout $TARGET_VERSION
if [ $? -ne 0 ]; then
  echo "ERROR: Failed to checkout $TARGET_VERSION. Ensure the tag exists."
  exit 1
fi

# 3. Pull latest if it's a branch, or just ensure we have the state
# (Assuming Docker images are tagged by version)

# 4. Rebuild and Restart Containers
echo "Rebuilding and restarting services..."
docker-compose down
docker-compose build
docker-compose up -d

# 5. Database Cleanup (Optional Manual Step)
echo "----------------------------------------------------"
echo "ROLLBACK COMPLETE (Application Level)"
echo "----------------------------------------------------"
echo "NOTE: If database schema changes occurred, you may need"
echo "to restore a manual snapshot if the new code is"
echo "incompatible with the current schema."
echo ""
echo "To restore DB snapshot (MANUAL):"
echo "  dropdb -h localhost -p 5432 -U postgres param_adventures"
echo "  createdb -h localhost -p 5432 -U postgres param_adventures"
echo "  psql -h localhost -p 5432 -U postgres param_adventures < backup_pre_migration.sql"
echo "----------------------------------------------------"
