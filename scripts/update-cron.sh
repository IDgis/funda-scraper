#!/bin/bash

MONDAY_HOUR=$(( ( RANDOM % 9 ) + 8 ))
MONDAY_MINUTE=$(( ( RANDOM % 60 ) + 1 ))
TUESDAY_HOUR=$(( ( RANDOM % 9 ) + 8 ))
TUESDAY_MINUTE=$(( ( RANDOM % 60 ) + 1 ))
WEDNESDAY_HOUR=$(( ( RANDOM % 9 ) + 8 ))
WEDNESDAY_MINUTE=$(( ( RANDOM % 60 ) + 1 ))
THURSDAY_HOUR=$(( ( RANDOM % 9 ) + 8 ))
THURSDAY_MINUTE=$(( ( RANDOM % 60 ) + 1 ))
FRIDAY_HOUR=$(( ( RANDOM % 9 ) + 8 ))
FRIDAY_MINUTE=$(( ( RANDOM % 60 ) + 1 ))

crontab -u root - <<EOF
# Example of job definition:
# .---------------- minute (0 - 59)
# |  .------------- hour (0 - 23)
# |  |  .---------- day of month (1 - 31)
# |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ...
# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat
# |  |  |  |  |
# *  *  *  *  *  command to be executed
  $MONDAY_MINUTE $MONDAY_HOUR *  *  1  /root/Desktop/start.sh >> /var/log/funda-scraper.log 2>&1
  $TUESDAY_MINUTE $TUESDAY_HOUR *  *  2  /root/Desktop/start.sh >> /var/log/funda-scraper.log 2>&1
  $WEDNESDAY_MINUTE $WEDNESDAY_HOUR *  *  3  /root/Desktop/start.sh >> /var/log/funda-scraper.log 2>&1
  $THURSDAY_MINUTE $THURSDAY_HOUR *  *  4  /root/Desktop/start.sh >> /var/log/funda-scraper.log 2>&1
  $FRIDAY_MINUTE $FRIDAY_HOUR *  *  5  /root/Desktop/start.sh >> /var/log/funda-scraper.log 2>&1
  00  0 *  *  6  /root/Desktop/update-cron.sh
# An empty line is required at the end of this file for a valid cron file.
EOF
