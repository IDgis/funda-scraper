#!/bin/bash

# Load environment variables
. /etc/gemeente

until curl -sf "$BEDRIJVENTERREINEN_FEATURES"; do
  echo "Waiting for Bedrijventerreinen WFS..."
  sleep 5
done

echo "Bedrijventerreinen WFS is ready"

# Download new bedrijventerreinen features
curl --insecure "$BEDRIJVENTERREINEN_FEATURES" > /tmp/bedrijventerreinen.json
