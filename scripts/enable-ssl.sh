#!/bin/bash
set -euo pipefail

# Issue or renew Let's Encrypt TLS certificate for nanglucso.pro.vn once DNS points to this VPS.
DOMAIN="${DOMAIN:-nanglucso.pro.vn}"
EMAIL="${CERTBOT_EMAIL:-admin@${DOMAIN}}"

mkdir -p /var/www/certbot

# If a temporary self-signed cert exists without renewal config, remove it so certbot creates a real lineage.
if [ -d "/etc/letsencrypt/live/${DOMAIN}" ] && [ ! -f "/etc/letsencrypt/renewal/${DOMAIN}.conf" ]; then
    echo "Removing temporary self-signed certificate for ${DOMAIN}..."
    rm -rf "/etc/letsencrypt/live/${DOMAIN}" "/etc/letsencrypt/archive/${DOMAIN}"
fi

# Check whether www subdomain resolves to this server too
SERVER_IP=$(curl -s4 ifconfig.me || true)
WWW_IP=$(getent ahostsv4 "www.${DOMAIN}" | awk '{print $1; exit}' || true)
DOMAINS=(-d "$DOMAIN")
if [ -n "$SERVER_IP" ] && [ "$WWW_IP" = "$SERVER_IP" ]; then
    DOMAINS+=(-d "www.${DOMAIN}")
fi

certbot certonly --webroot -w /var/www/certbot \
    "${DOMAINS[@]}" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive

docker exec digitalent-nginx nginx -s reload
echo "SSL enabled and nginx reloaded for ${DOMAIN}!"
