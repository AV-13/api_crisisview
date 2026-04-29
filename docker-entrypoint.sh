#!/bin/sh
set -e

echo "[entrypoint] waiting for MySQL ${DB_HOST}:${DB_PORT}..."
i=0
until node -e "
  import('mysql2/promise').then(({ default: m }) =>
    m.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    }).then(c => c.end()).then(() => process.exit(0))
     .catch(() => process.exit(1))
  ).catch(() => process.exit(1));
" 2>/dev/null; do
  i=$((i+1))
  if [ "$i" -gt 60 ]; then
    echo "[entrypoint] MySQL not reachable after 60 attempts, aborting"
    exit 1
  fi
  echo "[entrypoint] mysql not ready yet (attempt $i)..."
  sleep 2
done

echo "[entrypoint] running migrations"
node migration.js

echo "[entrypoint] starting application: $@"
exec "$@"
