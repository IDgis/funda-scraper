"use strict"

import fetch from "node-fetch";
import fs from 'fs';

console.log('Start geocoding ...');

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
        const nummer = parseHuisNummer(properties['Nummer']);
        const plaats = properties['Plaats'];
        const coordinates = feature['geometry']['coordinates'];

        if (coordinates.length === 0) {
            getFromLocationServer(fileLocation, straat, nummer, plaats);
        }
    }
}

function parseHuisNummer(nummer) {
    let returnNum = nummer;
    if (isNaN(nummer)) {
        for (let i = nummer.length; i > 0; i--) {
            const num = nummer.substring(0, i);
            if (!isNaN(num)) {
                returnNum = num;
                break;
            }
        }
    }

    return returnNum;
}

function getFromLocationServer(fileLocation, straat, nummer, plaats) {
    const defaultCoords = [0, 0];
    fetch(`https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest?wt=json&q=${straat}+${nummer}+${plaats}`)
        .then(response => response.json())
        .then(json => json['response'])
        .then(jsonResponse => {
            if (jsonResponse['numFound'] === 0) {
                console.log(`No coordinates found for ${straat} ${nummer} ${plaats}`);
                console.log('Adding default coords [0, 0]...');
                addCoords(fileLocation, straat, nummer, plaats, defaultCoords);
            } else {
                const result = jsonResponse['docs'][0];
                const adresId = result['id'];
                lookupAdresId(adresId, straat, nummer, plaats, fileLocation);
            }
        })
        .catch(error => {
            console.log(error);
            console.log('Error with request to locatieserver. Adding default coords [0, 0]...');
            addCoords(fileLocation, straat, nummer, plaats, defaultCoords);
        });
}

function lookupAdresId(adresId, straat, nummer, plaats, fileLocation) {
    const defaultCoords = [0, 0];
    // adr-a7ad85fed9db0fd3c9d238343d045829
    if (adresId) {
        fetch(`https://api.pdok.nl/bzk/locatieserver/search/v3_1/lookup?wt=json&id=${adresId}`)
            .then(response => response.json())
            .then(json => json['response'])
            .then(jsonResponse => {
                if (jsonResponse['numFound'] === 0) {
                    console.log(`No coordinates found for ${straat} ${nummer} ${plaats}. Adding default coords [0, 0]...`);
                    addCoords(fileLocation, straat, nummer, plaats, defaultCoords);
                } else {
                    const locationData = jsonResponse['docs'][0];
                    const wkt = locationData['centroide_rd'];
                    const coordinates = wkt.substring(wkt.indexOf('(')+1, wkt.indexOf(')')).split(' ');
                    coordinates[0] = parseFloat(coordinates[0]);
                    coordinates[1] = parseFloat(coordinates[1]);
                    addCoords(fileLocation, straat, nummer, plaats, coordinates);
                }
            })
            .catch(error => {
                console.log(error);
                console.log('Error looking up adres id. Adding default coords [0, 0]...');
                addCoords(fileLocation, straat, nummer, plaats, defaultCoords);
            });
    } else {
        console.log('No adres id found. Adding default coords [0, 0]...');
        addCoords(fileLocation, straat, nummer, plaats, defaultCoords);
    }
}

function addCoords(fileLocation, straat, nummer, plaats, coordinates) {
    const inputFile = fs.readFileSync(fileLocation, 'utf8');
    const json = JSON.parse(inputFile);
    const features = json['features'];

    for (const feature of features) {
        const properties = feature['properties'];
        const orgStraat = properties['Straat'];
        const orgNummer = properties['Nummer'];
        const orgPlaats = properties['Plaats'];
        const geometry = feature['geometry'];
        const coords = geometry['coordinates'];

        if (orgStraat === straat && orgNummer === nummer && orgPlaats === plaats && coords.length === 0) {
            feature['geometry']['coordinates'] = coordinates;
            fs.writeFileSync(fileLocation, JSON.stringify(json));
        }
    }
}
