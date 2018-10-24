"use strict"
console.log('Validating GeoJsons ...');

const fs = require('fs');

validateGeometry('/root/Desktop/vastgoedTeKoop.json');
validateGeometry('/root/Desktop/vastgoedTeHuur.json');

function validateGeometry(fileLocation) {
    const inputFile = fs.readFileSync(fileLocation, 'utf8');
    const json = JSON.parse(inputFile);
    const features = json['features'];

    for (const feature of features) {
        const geometry = feature['geometry'];
        const coordinates = geometry['coordinates'];
        if (coordinates.length === 0) {
            throw new Error(`Invalid coordinates in file ${fileLocation}`);
        }
    }
}

console.log('GeoJson valid ...');
