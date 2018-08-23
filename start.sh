#!/bin/bash

if [ -d /root/Desktop/Funda ]; then
    rm -rf /root/Desktop/Funda
fi

mkdir -p /root/Desktop/Funda/Koop
mkdir -p /root/Desktop/Funda/Huur

for i in {1..5}
do
    echo "Download Funda $GEMEENTE te koop page $i"
    /root/Desktop/savePages.sh "https://fundainbusiness.nl/alle-bedrijfsaanbod/$GEMEENTE/koop/p$i/" -b "firefox" -d "/root/Desktop/Funda/Koop/$GEMEENTE$i.html"
    sleep 5s

    echo "Download Funda $GEMEENTE te huur page $i"
    /root/Desktop/savePages.sh "https://fundainbusiness.nl/alle-bedrijfsaanbod/$GEMEENTE/huur/p$i/" -b "firefox" -d "/root/Desktop/Funda/Huur/$GEMEENTE$i.html"
    sleep 5s
done

echo "Finished downloading pages..."

echo "-----------------------------"

echo "Parsing downloaded pages..."
nodejs /root/Desktop/parser.js
sleep 10s
echo "Parsing finished..."

echo "-----------------------------"

echo "Geocoding json files..."
nodejs /root/Desktop/geocode.js
sleep 5s
echo "Geocoding finished..."

echo "-----------------------------"

if [ -d /root/Desktop/Funda ]; then
    rm -rf /root/Desktop/Funda
fi

echo "FINISHED"
