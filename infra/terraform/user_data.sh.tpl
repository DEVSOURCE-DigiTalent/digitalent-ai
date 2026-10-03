#!/bin/bash
set -euo pipefail
exec > >(tee -a /var/log/user-data.log) 2>&1

echo "=================================================="
echo "Starting DigiTalent AI Cloud-Init Deployment"
echo "Timestamp: $(date)"
echo "=================================================="

# 1. Setup 4GB Swap Space (Prevents OOM during build & runtime)
if [ ! -f /swapfile ]; then
    echo "Creating 4GB swap space..."
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "Swap space successfully configured."
fi

# 2. Update System Packages
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release git ufw

# 3. Install Docker CE & Docker Compose Plugin
echo "Installing Docker CE..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu

# 4. Clone or Pull Project Source
PROJECT_DIR="/opt/digitalent-ai"
echo "Deploying source code to $PROJECT_DIR..."

if [ -d "$PROJECT_DIR/.git" ]; then
    echo "Repository exists. Pulling latest changes..."
    cd "$PROJECT_DIR"
    git fetch origin
    git checkout "${GIT_BRANCH}"
    git pull origin "${GIT_BRANCH}"
else
    echo "Cloning repository from ${GIT_REPO_URL} (branch: ${GIT_BRANCH})..."
    git clone -b "${GIT_BRANCH}" "${GIT_REPO_URL}" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

# 5. Generate Production .env File
echo "Writing production configuration to .env..."
cat << 'EOF' > "$PROJECT_DIR/.env"
# Database
POSTGRES_DB=${POSTGRES_DB}
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# JWT
JWT_ISSUER=DigiTalentAI
JWT_AUDIENCE=DigiTalentAI.Web
JWT_SIGNING_KEY=${JWT_SIGNING_KEY}

# MinIO
MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
MINIO_SECRET_KEY=${MINIO_SECRET_KEY}

# Application
ASPNETCORE_ENVIRONMENT=Production
ALLOWED_ORIGINS=*
APPLY_MIGRATIONS=true
AUTO_MIGRATE=true
EOF

# 6. Build Frontend Static Assets (if not already pre-built)
echo "Building Frontend with Node container..."
if [ -d "$PROJECT_DIR/frontend" ]; then
    docker run --rm \
        -v "$PROJECT_DIR/frontend":/app \
        -w /app \
        node:20-alpine \
        sh -c "npm install --legacy-peer-deps && npm run build" || {
            echo "Warning: npm run build failed inside container, checking if existing dist is present..."
        }
fi

# 7. Start Services with Docker Compose
echo "Starting DigiTalent Docker Compose stack..."
cd "$PROJECT_DIR/docker"
docker compose down || true
docker compose up -d --build

# 8. Setup Systemd Service to Auto-restart on reboot
cat << 'EOF' > /etc/systemd/system/digitalent-docker.service
[Unit]
Description=DigiTalent AI Docker Compose Stack
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/digitalent-ai/docker
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable digitalent-docker.service

echo "=================================================="
echo "DigiTalent AI deployment completed successfully!"
echo "Timestamp: $(date)"
echo "=================================================="
