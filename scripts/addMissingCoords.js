"use strict"

import fs from 'fs';

const locationTeKoop = '/root/Desktop/teKoop.json';
const locationTeHuur = '/root/Desktop/teHuur.json';

addMissingCoords(locationTeKoop);
addMissingCoords(locationTeHuur);

function addMissingCoords(fileLocation) {
    const inputFile = fs.readFileSync(fileLocation, 'utf8');
    const json = JSON.parse(inputFile);
    const features = json['features'];

    for (const feature of features) {
        const geometry = feature['geometry'];
        const coords = geometry['coordinates'];

        if (coords.length === 0) {
            feature['geometry']['coordinates'] = [0, 0];
        }
    }

    fs.writeFileSync(fileLocation, JSON.stringify(json));
}
