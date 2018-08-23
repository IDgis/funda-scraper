FROM idgis/ubuntu-desktop:1.0.0
LABEL maintainer="IDgis bv"

# kopieer alle scripts naar de desktop
COPY . /root/Desktop

RUN apt-get update && \
    apt-get install -y npm \
        nodejs \
        xdotool

WORKDIR /root/Desktop
RUN npm install
WORKDIR /root

#install rsyslog to capture cron log in /var/log/cron.log
RUN apt-get update \
    && apt-get install rsyslog --assume-yes \
    && sed 's/^#cron/cron/' </etc/rsyslog.d/50-default.conf >/etc/rsyslog.d/50-default.conf.tmp \
    && mv /etc/rsyslog.d/50-default.conf.tmp /etc/rsyslog.d/50-default.conf
    
#install cron    
RUN apt-get install cron

#overwrite default contab file (unclear why a cron file in cron.d is not read)
COPY crontab /etc/crontab
RUN chmod 0644 /etc/crontab
# Create the log file to be able to run tail
RUN touch /opt/funda-data.log

# Keep running
ENTRYPOINT /root/Desktop/run.sh
