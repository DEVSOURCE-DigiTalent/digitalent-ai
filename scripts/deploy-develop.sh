#!/bin/bash
set -euo pipefail

echo "=========================================="
echo "Starting Continuous Deployment to Develop"
echo "Timestamp: $(date)"
echo "=========================================="

cd /opt/digitalent-ai

# 1. Backup environment configs
if [ -f .env ]; then
    cp .env /tmp/.env.digitalent.bak
fi
if [ -f docker/.env ]; then
    cp docker/.env /tmp/.env.docker.bak
fi

# 2. Pull latest code from develop branch
echo "--> Pulling latest code from develop branch..."
git fetch origin develop
git checkout -f develop
git reset --hard origin/develop

# 3. Restore environment configs
if [ -f /tmp/.env.digitalent.bak ]; then
    cp /tmp/.env.digitalent.bak .env
fi
if [ -f /tmp/.env.docker.bak ]; then
    cp /tmp/.env.docker.bak docker/.env
fi

# 4. Apply compatibility fixes if needed
sed -i 's|image: minio/minio:latest|image: coollabsio/minio:latest|g' docker/docker-compose.yml
sed -i 's|RUN dotnet restore$|RUN dotnet restore src/DigiTalent.Api/DigiTalent.Api.csproj|g' backend/src/DigiTalent.Api/Dockerfile

# 5. Build frontend inside container
echo "--> Building frontend assets with node container..."
docker run --rm \
    -v /opt/digitalent-ai/frontend:/app \
    -w /app \
    node:20-alpine \
    sh -c "npm install --include=dev --legacy-peer-deps && npx vite build"

# 6. Build and restart Docker containers
echo "--> Rebuilding and launching Docker containers..."
cd /opt/digitalent-ai/docker
docker compose up -d --build

# 6. Verify health
echo "--> Checking API health status..."
for i in {1..15}; do
    if curl -s -f http://localhost:80/health > /dev/null; then
        echo "API health check PASSED!"
        break
    fi
    echo "Waiting for backend API to become healthy... ($i/15)"
    sleep 4
done

# 7. Clean up dangling images
docker image prune -f

echo "=========================================="
echo "Continuous Deployment completed successfully!"
echo "Timestamp: $(date)"
echo "=========================================="
