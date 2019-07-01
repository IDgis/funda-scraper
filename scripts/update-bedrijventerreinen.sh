#!/bin/bash

# Load environment variables
. /etc/gemeente

# Download new bedrijventerreinen features
curl --insecure "$BEDRIJVENTERREINEN_FEATURES" > /tmp/bedrijventerreinen.json
