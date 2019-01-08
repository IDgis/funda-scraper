"use strict"

const fs = require('fs');
let validGeometry = true;

validGeometry = validGeometry && validateGeometry('/root/Desktop/teKoop.json');
validGeometry = validGeometry && validateGeometry('/root/Desktop/teHuur.json');

function validateGeometry(fileLocation) {
    const inputFile = fs.readFileSync(fileLocation, 'utf8');
    const json = JSON.parse(inputFile);
    const features = json['features'];
    let valid = true;

    for (const feature of features) {
        const geometry = feature['geometry'];
        const coordinates = geometry['coordinates'];
        if (coordinates.length === 0) {
        	valid = false;
        }
    }
    
    return valid;
}

console.log(validGeometry);
