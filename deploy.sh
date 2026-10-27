#!/usr/bin/env bash
# Deploy helper for Game QA Academy on a Linux server (for example, AWS Lightsail).
# Run this from any directory: bash /path/to/game-qa-mern/deploy.sh

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
SERVER_DIR="$PROJECT_DIR/server"
CLIENT_DIR="$PROJECT_DIR/client"
APP_NAME="${PM2_APP_NAME:-game-qa}"
SYSTEMD_SERVICE="${SYSTEMD_SERVICE:-}"
RUN_SEED=false
RESTART=true

usage() {
  cat <<'EOF'
Usage: bash deploy.sh [--seed] [--no-restart]

  --seed         Run the database seed script after dependencies are installed.
                 Use only when intentionally resetting/updating seed data.
  --no-restart   Build everything but leave the running app untouched.

Environment variables:
  PM2_APP_NAME=<name>       PM2 process name (default: game-qa)
  SYSTEMD_SERVICE=<name>    systemd service to restart instead of PM2
EOF
}

for argument in "$@"; do
  case "$argument" in
    --seed) RUN_SEED=true ;;
    --no-restart) RESTART=false ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $argument" >&2; usage >&2; exit 2 ;;
  esac
done

require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Required command not found: $1" >&2
    exit 1
  }
}

require_command node
require_command npm

[[ -f "$SERVER_DIR/package.json" && -f "$CLIENT_DIR/package.json" ]] || {
  echo "Could not find the client and server package.json files under $PROJECT_DIR" >&2
  exit 1
}

echo "Installing server dependencies..."
npm ci --prefix "$SERVER_DIR"

echo "Installing client dependencies..."
npm ci --prefix "$CLIENT_DIR"

if [[ "$RUN_SEED" == true ]]; then
  echo "Running database seed..."
  npm run seed --prefix "$SERVER_DIR"
fi

echo "Building production client..."
npm run build --prefix "$CLIENT_DIR"

if [[ "$RESTART" == false ]]; then
  echo "Build complete; restart skipped."
  exit 0
fi

if [[ -n "$SYSTEMD_SERVICE" ]]; then
  require_command systemctl
  echo "Restarting systemd service: $SYSTEMD_SERVICE"
  sudo systemctl restart "$SYSTEMD_SERVICE"
elif command -v pm2 >/dev/null 2>&1; then
  echo "Restarting PM2 app: $APP_NAME"
  if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    NODE_ENV=production pm2 reload "$APP_NAME" --update-env
  else
    NODE_ENV=production pm2 start "$SERVER_DIR/src/index.js" --name "$APP_NAME" --cwd "$SERVER_DIR"
  fi
  pm2 save
else
  cat >&2 <<'EOF'
Build completed, but no process manager was found.
Install/configure PM2, or rerun with SYSTEMD_SERVICE=<your-service-name>.
For PM2: npm install -g pm2 && bash deploy.sh
EOF
  exit 1
fi

echo "Deployment complete."
