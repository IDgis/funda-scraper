#!/bin/bash

# Store gemeente naam
echo GEMEENTE=$GEMEENTE > /etc/gemeente
echo BEDRIJVENTERREINEN_FEATURES="\"$BEDRIJVENTERREINEN_FEATURES\"" >> /etc/gemeente

echo "Logging started ..." > /var/log/funda-scraper.log

# Add cron schedule
/root/Desktop/update-bedrijventerreinen.sh
/root/Desktop/update-cron.sh --init

echo "Starting cron ..." >> /var/log/funda-scraper.log

cron

exec /startup.sh
