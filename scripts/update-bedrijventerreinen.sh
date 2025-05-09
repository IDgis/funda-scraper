#!/bin/bash

# Load environment variables
. /etc/gemeente

# 15 minutes in terms of sleep between tries
MAX_TRIES=90
try=1
until curl -sf "$BEDRIJVENTERREINEN_FEATURES"; do
  echo "Waiting for Bedrijventerreinen WFS, try $try"
  if [ "$try" -gt "$MAX_TRIES" ]; then
    echo "max tries reached, exiting"
    exit 1
  fi

  try=$((try +1))
  sleep 10
done

echo "Bedrijventerreinen WFS is ready"

# Download new bedrijventerreinen features
curl --insecure "$BEDRIJVENTERREINEN_FEATURES" > /tmp/bedrijventerreinen.json
