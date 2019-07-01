FROM idgis/ubuntu-desktop:1.1.3
LABEL maintainer="IDgis bv"

# Install packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        cron \
        npm \
        nodejs \
        xdotool

# kopieer alle scripts naar de desktop
COPY package.json /root/Desktop/
COPY scripts/ /root/Desktop/

WORKDIR /root/Desktop
RUN npm install

RUN chmod a+x /root/Desktop/*.sh

VOLUME /home/meteorapp/build/bundle/programs/web.browser/app/data

# Keep running
ENTRYPOINT /root/Desktop/run.sh
