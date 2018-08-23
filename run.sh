#!/bin/bash

echo Starting cron...
service cron start

exec /startup.sh