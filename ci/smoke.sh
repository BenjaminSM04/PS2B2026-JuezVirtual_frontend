#!/usr/bin/env bash
set -euo pipefail
container="lizard-fe-smoke-${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-1}"
trap 'docker rm -f "$container" > /dev/null 2>&1 || true' EXIT
docker run -d --name "$container" lizard-frontend:local
for attempt in {1..20}; do
  if [ "$(docker inspect --format '{{.State.Health.Status}}' "$container")" = healthy ]; then
    docker exec "$container" wget -q -O /dev/null http://127.0.0.1:8080/admin/
    docker exec "$container" wget -q -O - http://127.0.0.1:8080/version.json
    test "$(docker exec "$container" id -u)" = 101
    exit 0
  fi
  sleep 2
done
docker logs "$container"
exit 1
