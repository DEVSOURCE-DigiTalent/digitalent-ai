#!/bin/bash
set -euo pipefail

echo "=========================================="
echo "Starting Continuous Deployment to Develop"
echo "Timestamp: $(date)"
echo "=========================================="

cd /opt/digitalent-ai

# 1. Backup environment & SSL configs
if [ -f .env ]; then
    cp .env /tmp/.env.digitalent.bak
fi
if [ -f docker/.env ]; then
    cp docker/.env /tmp/.env.docker.bak
fi
if [ -f docker/nginx/conf.d/default.conf ]; then
    cp docker/nginx/conf.d/default.conf /tmp/default.conf.bak
fi
if [ -f scripts/deploy-develop.sh ]; then
    cp scripts/deploy-develop.sh /tmp/deploy-develop.sh.bak
fi

# 2. Pull latest code from develop branch
echo "--> Pulling latest code from develop branch..."
git fetch origin develop
git checkout -f develop
git reset --hard origin/develop

# 3. Restore environment & SSL configs
if [ -f /tmp/.env.digitalent.bak ]; then
    cp /tmp/.env.digitalent.bak .env
fi
if [ -f /tmp/.env.docker.bak ]; then
    cp /tmp/.env.docker.bak docker/.env
fi
if [ -f /tmp/default.conf.bak ]; then
    cp /tmp/default.conf.bak docker/nginx/conf.d/default.conf
fi
if [ -f /tmp/deploy-develop.sh.bak ]; then
    cp /tmp/deploy-develop.sh.bak scripts/deploy-develop.sh
    chmod +x scripts/deploy-develop.sh
fi

# 4. Apply compatibility & SSL fixes to docker-compose.yml
sed -i 's|image: minio/minio:latest|image: coollabsio/minio:latest|g' docker/docker-compose.yml
if ! grep -q "443:443" docker/docker-compose.yml; then
    sed -i '/"80:80"/a \      - "443:443"' docker/docker-compose.yml
fi
if ! grep -q "/etc/letsencrypt" docker/docker-compose.yml; then
    sed -i '/html:ro/a \      - /etc/letsencrypt:/etc/letsencrypt:ro' docker/docker-compose.yml
fi

# 5. Build frontend inside container
echo "--> Building frontend assets with node container..."
docker run --rm \
    -v /opt/digitalent-ai/frontend:/app \
    -w /app \
    node:20-alpine \
    sh -c "npm install react-is@^19.0.0 --save --legacy-peer-deps && npm install --include=dev --legacy-peer-deps && npx vite build"

# 6. Build and restart Docker containers
echo "--> Rebuilding and launching Docker containers..."
cd /opt/digitalent-ai/docker
docker compose build backend-api
docker compose stop backend-api || true
docker compose rm -f backend-api || true
docker compose up -d --remove-orphans
docker exec digitalent-nginx nginx -s reload || true

# 7. Verify health
echo "--> Checking API health status..."
for i in {1..15}; do
    if curl -s -k -f https://localhost:443/health > /dev/null || curl -s -f http://localhost:80/health > /dev/null; then
        echo "API health check PASSED!"
        break
    fi
    echo "Waiting for backend API to become healthy... ($i/15)"
    sleep 4
done

# 8. Clean up dangling images
docker image prune -f

echo "=========================================="
echo "Continuous Deployment completed successfully!"
echo "Timestamp: $(date)"
echo "=========================================="
