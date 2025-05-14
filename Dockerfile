FROM idgis/ubuntu-desktop:1.1.11

LABEL maintainer="IDgis bv"

# Install packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        cron \
        xdotool

# Install Node
RUN bash -c 'curl "https://nodejs.org/dist/v17.9.1/node-v17.9.1-linux-x64.tar.gz" > /tmp/required-node-linux-x64.tar.gz' \
  && cd /usr/local \
  && tar --strip-components 1 -xzf /tmp/required-node-linux-x64.tar.gz \
  && rm /tmp/required-node-linux-x64.tar.gz

# kopieer alle scripts naar de desktop
COPY package.json /root/Desktop/
COPY package-lock.json /root/Desktop/
COPY scripts/ /root/Desktop/

WORKDIR /root/Desktop
RUN npm install

RUN chmod a+x /root/Desktop/*.sh

VOLUME /home/meteorapp/build/bundle/programs/web.browser/app/data

# Keep running
ENTRYPOINT ["/root/Desktop/run.sh"]
