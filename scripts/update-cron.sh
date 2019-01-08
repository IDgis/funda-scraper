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

echo "# Example of job definition:" > /etc/crontab
echo "# .---------------- minute (0 - 59)" >> /etc/crontab
echo "# |  .------------- hour (0 - 23)" >> /etc/crontab
echo "# |  |  .---------- day of month (1 - 31)" >> /etc/crontab
echo "# |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ..." >> /etc/crontab
echo "# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat" >> /etc/crontab
echo "# |  |  |  |  |" >> /etc/crontab
echo "# *  *  *  *  * user-name  command to be executed" >> /etc/crontab
echo "  $MONDAY_MINUTE $MONDAY_HOUR *  *  1  root      /root/Desktop/start.sh >> /var/log/funda-scraper.log 2>&1" >> /etc/crontab
echo "  $TUESDAY_MINUTE  $TUESDAY_HOUR *  *  2  root      /root/Desktop/start.sh >> /var/log/funda-scraper.log 2>&1" >> /etc/crontab
echo "  $WEDNESDAY_MINUTE $WEDNESDAY_HOUR *  *  3  root      /root/Desktop/start.sh >> /var/log/funda-scraper.log 2>&1" >> /etc/crontab
echo "  $THURSDAY_MINUTE $THURSDAY_HOUR *  *  4  root      /root/Desktop/start.sh >> /var/log/funda-scraper.log 2>&1" >> /etc/crontab
echo "  $FRIDAY_MINUTE $FRIDAY_HOUR *  *  5  root      /root/Desktop/start.sh >> /var/log/funda-scraper.log 2>&1" >> /etc/crontab
echo "  00  0 *  *  6  root      /root/Desktop/update-cron.sh" >> /etc/crontab
echo "# An empty line is required at the end of this file for a valid cron file." >> /etc/crontab
