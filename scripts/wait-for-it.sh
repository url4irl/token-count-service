#!/bin/sh
# wait-for-it.sh

set -e

TIMEOUT=15
QUIET=0

HOST="$1"
shift
PORT="$1"
shift

while ! nc -z "$HOST" "$PORT" >/dev/null 2>&1; do
  TIMEOUT=$((TIMEOUT - 1))
  if [ "$TIMEOUT" -eq 0 ]; then
    echo "Error: Timeout waiting for $HOST:$PORT"
    exit 1
  fi
  sleep 1
done

exec "$@"
