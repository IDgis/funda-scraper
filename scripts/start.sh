#!/bin/bash

# Load gemeente naam
. /etc/gemeente

echo Scraper started: $(date)

if [ -d /root/Desktop/Funda ]; then
    echo "Removing old Funda directory ..."
    rm -rf /root/Desktop/Funda
fi

echo "Creating Funda directories ..."
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

echo "Finished downloading pages ..."
echo "------------------------------"
echo "Parsing downloaded pages ..."

nodejs /root/Desktop/parser.js
sleep 5s

echo "Parsing finished ..."
echo "------------------------------"
echo "Geocoding json files ..."

nodejs /root/Desktop/geocode.js
sleep 5s
VALID=$(nodejs /root/Desktop/validate.js)
sleep 5s

if [ "$VALID" == "true" ]; then
    echo "Geocoding finished ..."

    URL="$BEDRIJVENTERREINEN_FEATURES" nodejs /root/Desktop/separateByArea.js

    cp /root/Desktop/teKoopBedrijf.json /home/meteorapp/build/bundle/programs/web.browser/app/data/vastgoedTeKoop.json
    cp /root/Desktop/teKoopDetailhandel.json /home/meteorapp/build/bundle/programs/web.browser/app/data/detailhandelTeKoop.json
    cp /root/Desktop/teHuurBedrijf.json /home/meteorapp/build/bundle/programs/web.browser/app/data/vastgoedTeHuur.json
    cp /root/Desktop/teHuurDetailhandel.json /home/meteorapp/build/bundle/programs/web.browser/app/data/detailhandelTeHuur.json
else
    echo "Some errors occured while geocoding ..."
    echo "Not saving results ..."
fi

echo "------------------------------"
echo "Cleaning up old files ..."

rm /root/Desktop/teKoop*.json
rm /root/Desktop/teHuur*.json

if [ -d /root/Desktop/Funda ]; then
    rm -rf /root/Desktop/Funda
fi

echo FINISHED: $(date)
