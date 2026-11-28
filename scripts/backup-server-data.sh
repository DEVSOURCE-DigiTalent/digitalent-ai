#!/bin/bash
set -euo pipefail

# Backup PostgreSQL, MinIO, upload volumes, and env/nginx configs before shutting down AWS EC2.
# Run on the server: bash /opt/digitalent-ai/scripts/backup-server-data.sh

PROJECT_DIR="${PROJECT_DIR:-/opt/digitalent-ai}"
BACKUP_ROOT="${BACKUP_ROOT:-/tmp/digitalent-backup-$(date +%Y%m%d-%H%M%S)}"
DOCKER_DIR="$PROJECT_DIR/docker"

mkdir -p "$BACKUP_ROOT"
echo "==> Saving backup to $BACKUP_ROOT"

if [ -f "$PROJECT_DIR/.env" ]; then
    set -a
    # shellcheck disable=SC1091
    source "$PROJECT_DIR/.env"
    set +a
    cp "$PROJECT_DIR/.env" "$BACKUP_ROOT/root.env"
fi

if [ -f "$DOCKER_DIR/.env" ]; then
    cp "$DOCKER_DIR/.env" "$BACKUP_ROOT/docker.env"
fi

if [ -f "$DOCKER_DIR/nginx/conf.d/default.conf" ]; then
    cp "$DOCKER_DIR/nginx/conf.d/default.conf" "$BACKUP_ROOT/nginx-default.conf"
fi

POSTGRES_DB="${POSTGRES_DB:-digitalent}"
POSTGRES_USER="${POSTGRES_USER:-digitalent_app}"

if docker ps --format '{{.Names}}' | grep -qx 'digitalent-postgres'; then
    echo "==> Dumping PostgreSQL database ($POSTGRES_DB)..."
    docker exec digitalent-postgres pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB" > "$BACKUP_ROOT/postgres.dump"
else
    echo "WARNING: Container digitalent-postgres is not running. Start docker compose first to dump DB."
fi

for vol_entry in \
    "docker_minio_data:minio_data.tar.gz" \
    "docker_backend_uploads:backend_uploads.tar.gz" \
    "digitalent-platform-assets:platform_assets_data.tar.gz"; do
    vol_name="${vol_entry%%:*}"
    out_name="${vol_entry##*:}"
    if docker volume inspect "$vol_name" >/dev/null 2>&1; then
        echo "==> Archiving volume $vol_name -> $out_name..."
        docker run --rm -v "${vol_name}:/source:ro" -v "${BACKUP_ROOT}:/backup" alpine \
            tar -czf "/backup/${out_name}" -C /source .
    else
        echo "INFO: Volume $vol_name not found, skipping."
    fi
done

ARCHIVE_PATH="${BACKUP_ROOT}.tar.gz"
tar -czf "$ARCHIVE_PATH" -C "$(dirname "$BACKUP_ROOT")" "$(basename "$BACKUP_ROOT")"
echo "==> Backup archive ready: $ARCHIVE_PATH"
ls -lh "$ARCHIVE_PATH"
