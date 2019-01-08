"use strict"
console.log('Start geocoding ...');

const request = require('request');
const fs = require('fs');

const locationTeKoop = '/root/Desktop/teKoop.json';
const locationTeHuur = '/root/Desktop/teHuur.json';

geocode(locationTeKoop);
geocode(locationTeHuur);

function geocode(fileLocation) {
    const inputFile = fs.readFileSync(fileLocation, 'utf8');
    const json = JSON.parse(inputFile);
    const features = json['features'];

    for (const feature of features) {
        const properties = feature['properties'];
        const straat = properties['Straat'];
        const nummer = properties['Huisnummer'];
        const plaats = properties['Plaats'];
        const coordinates = feature['geometry']['coordinates'];

        if (coordinates.length === 0) {
            getFromLocationServer(fileLocation, straat, nummer, plaats);
        }
    }
}

function getFromLocationServer(fileLocation, straat, nummer, plaats, altNummer) {
    const huisnummer = altNummer ? altNummer : nummer;
    request(`https://geodata.nationaalgeoregister.nl/locatieserver/v3/suggest?wt=json&q=${straat}+${huisnummer}+${plaats}`, (error, response, body) => {
        if (error) {
            console.log(error);
            return;
        }
        if (response.statusCode === 200) {
            const json = JSON.parse(body);
            const jsonResponse = json['response'];
            if (jsonResponse['numFound'] === 0) {
                // No features found, try with different home number is not already tried
                if (nummer.indexOf('-') !== -1 && altNummer === undefined) {
                    console.log(`No coordinates found for ${straat} ${nummer} ${plaats}. Trying again ...`);
                    getFromLocationServer(fileLocation, straat, nummer, plaats, nummer.split('-')[0]);
                } else {
                    console.log(`No coordinates found for ${straat} ${nummer} ${plaats}`);
                    console.log('Adding default coords [0, 0]...');
                    const coordinates = [0, 0];
                    addCoords(fileLocation, straat, nummer, plaats, coordinates);
                }
            } else {
                if (altNummer) {
                    console.log(`Coordinates found for ${straat} ${nummer} ${plaats}`);
                }
                const result = jsonResponse['docs'][0];
                const adresId = result['id'];
                lookupAdresId(adresId, straat, nummer, plaats, fileLocation);
            }
        }
    });
}

function lookupAdresId(adresId, straat, nummer, plaats, fileLocation) {
    if (adresId) {
        request(`https://geodata.nationaalgeoregister.nl/locatieserver/v3/lookup?wt=json&id=${adresId}`, (error, response, body) => {
            if (error) {
                console.log(error);
                return;
            }
            if (response.statusCode === 200) {
                const json = JSON.parse(body);
                if (json['response']['numFound'] == 0) {
                    console.log(`No coordinates found for ${straat} ${nummer} ${plaats}`);
                    console.log('Adding default coords [0, 0]...');
                    const coordinates = [0, 0];
                    addCoords(fileLocation, straat, nummer, plaats, coordinates);
                } else {
                    const locationData = json['response']['docs'][0];
                    const wkt = locationData['centroide_rd'];
                    const coordinates = wkt.substring(wkt.indexOf('(')+1, wkt.indexOf(')')).split(' ');
                    coordinates[0] = parseFloat(coordinates[0]);
                    coordinates[1] = parseFloat(coordinates[1]);
                    addCoords(fileLocation, straat, nummer, plaats, coordinates);
                }
            }
        });
    } else {
        console.log(`Adding default coords [0, 0] for ${straat} ${nummer} ${plaats}...`);
        const coordinates = [0, 0];
        addCoords(fileLocation, straat, nummer, plaats, coordinates);
    }
}

function addCoords(fileLocation, straat, nummer, plaats, coordinates) {
    const inputFile = fs.readFileSync(fileLocation, 'utf8');
    const json = JSON.parse(inputFile);
    const features = json['features'];

    for (const feature of features) {
        const properties = feature['properties'];
        const orgStraat = properties['Straat'];
        const orgNummer = properties['Huisnummer'];
        const orgPlaats = properties['Plaats'];
        const geometry = feature['geometry'];
        const coords = geometry['coordinates'];

        if (orgStraat === straat && orgNummer === nummer && orgPlaats === plaats && coords.length === 0) {
            feature['geometry']['coordinates'] = coordinates;
            fs.writeFileSync(fileLocation, JSON.stringify(json));
        }
    }
}
