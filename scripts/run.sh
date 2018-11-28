#!/bin/bash

# Store gemeente naam
echo GEMEENTE=$GEMEENTE > /etc/gemeente

echo "Logging started ..." > /var/log/funda-scraper.log

# Add cron schedule
echo "# Example of job definition:" > /etc/crontab
echo "# .---------------- minute (0 - 59)" >> /etc/crontab
echo "# |  .------------- hour (0 - 23)" >> /etc/crontab
echo "# |  |  .---------- day of month (1 - 31)" >> /etc/crontab
echo "# |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ..." >> /etc/crontab
echo "# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat" >> /etc/crontab
echo "# |  |  |  |  |" >> /etc/crontab
echo "# *  *  *  *  * user-name  command to be executed" >> /etc/crontab
echo "  55 14 *  *  1  root      /root/Desktop/start.sh >> /var/log/funda-scraper.log 2>&1" >> /etc/crontab
echo "  43  8 *  *  2  root      /root/Desktop/start.sh >> /var/log/funda-scraper.log 2>&1" >> /etc/crontab
echo "  11 15 *  *  3  root      /root/Desktop/start.sh >> /var/log/funda-scraper.log 2>&1" >> /etc/crontab
echo "  34 11 *  *  4  root      /root/Desktop/start.sh >> /var/log/funda-scraper.log 2>&1" >> /etc/crontab
echo "  28 12 *  *  5  root      /root/Desktop/start.sh >> /var/log/funda-scraper.log 2>&1" >> /etc/crontab
echo "# An empty line is required at the end of this file for a valid cron file." >> /etc/crontab

echo "Starting cron ..." >> /var/log/funda-scraper.log

cron

exec /start.sh
