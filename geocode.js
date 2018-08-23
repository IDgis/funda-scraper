"use strict";
console.log('Start geocoding...');

const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

const locationTeKoop = '/home/meteorapp/build/bundle/programs/web.browser/app/data/vastgoedTeKoop.json';
const locationTeHuur = '/home/meteorapp/build/bundle/programs/web.browser/app/data/vastgoedTeHuur.json';
geocode(locationTeKoop);
geocode(locationTeHuur);

function geocode(location) {
    const inputFile = fs.readFileSync(location, 'utf8');
    const json = JSON.parse(inputFile);
    const features = json['features'];
    
    for(let i = 0; i < features.length; i++) {
        const properties = (features[i])['properties'];
        const straat = properties['Straat'];
        const nummer = properties['Huisnummer'];
        const plaats = properties['Plaats'];
        
        request('https://geodata.nationaalgeoregister.nl/locatieserver/v3/suggest?wt=xml&q=' + straat + '+' + nummer + '+' + plaats, (error, response, body) => {
            if(error) {
                console.log(error);
                return;
            }
            if(response.statusCode === 200) {
                const $ = cheerio.load(body, {xmlMode: true});
                const result = $('result');

                if(result.attr('numFound') == 0) {
                    console.log('No coordinates found for ' + straat + ' ' + nummer + ' ' + plaats + '. Trying again...');
                    retryGeocoding(straat, nummer, plaats, location);
                } else {
                    const children = result.children('doc').first()
                        .children('str').filter((index, element) => element['attribs']['name'] === 'id');
                    const adresId = children.first().text();

                    lookupAdresId(adresId, straat, nummer, plaats, location);
                }
            }
        });
    }
}

function retryGeocoding(straat, nummer, plaats, location) {
    let altNummer;
    if(nummer.indexOf('-') != -1) {
        altNummer = nummer.split('-')[0];
    }

    request('https://geodata.nationaalgeoregister.nl/locatieserver/v3/suggest?wt=xml&q=' + straat + '+' + (altNummer ? altNummer : nummer) + '+' + plaats, (error, response, body) => {
            if(error) {
                console.log(error);
                return;
            }
            if(response.statusCode === 200) {
                const $ = cheerio.load(body, {xmlMode: true});
                const result = $('result');

                if(result.attr('numFound') == 0) {
                    console.log('No coordinates found for ' + straat + ' ' + nummer + ' ' + plaats);
                    lookupAdresId(null, straat, nummer, plaats, location);
                } else {
                    const children = result.children('doc').first()
                        .children('str').filter((index, element) => element['attribs']['name'] === 'id');
                    const adresId = children.first().text();

                    lookupAdresId(adresId, straat, nummer, plaats, location);
                }
            }
        });
}

function lookupAdresId(adresId, straat, nummer, plaats, location) {
    if(adresId) {
        request('https://geodata.nationaalgeoregister.nl/locatieserver/v3/lookup?wt=xml&id=' + adresId, (error, response, body) => {
            if(error) {
                console.log(error);
                return;
            }
            if(response.statusCode === 200) {
                const $ = cheerio.load(body, {xmlMode: true});
                const result = $('result');

                if(result.attr('numFound') == 0) {
                    console.log('No coordinates found for ' + straat + ' ' + nummer + ' ' + plaats);
                    console.log('Adding default coords [0, 0]...');
                    const coords = [0, 0];
                    addCoords(location, straat, nummer, plaats, coords);
                } else {
                    const children = result.children('doc').first()
                        .children('str').filter((index, element) => element['attribs']['name'] === 'centroide_rd');
                    const wkt = children.first().text();
                    const coordinates = wkt.substring(wkt.indexOf('(')+1, wkt.indexOf(')')).split(' ');
                    const x = parseFloat(coordinates[0]);
                    const y = parseFloat(coordinates[1]);
                    const coords = [x, y];
                    addCoords(location, straat, nummer, plaats, coords);
                }
            }
        });
    } else {
        console.log('Adding default coords [0, 0]...');
        const coords = [0, 0];
        addCoords(location, straat, nummer, plaats, coords);
    }
}

function addCoords(location, straat, nummer, plaats, coords) {
    const inputFile = fs.readFileSync(location, 'utf8');
    const json = JSON.parse(inputFile);
    let features = json['features'];
    for(let i = 0; i < features.length; i++) {
        const properties = (features[i])['properties'];
        const oldStraat = properties['Straat'];
        const oldNummer = properties['Huisnummer'];
        const oldPlaats = properties['Plaats'];
        const geometry = (features[i])['geometry'];
        const coordinates = geometry['coordinates'];

        if(oldStraat === straat && oldNummer === nummer && oldPlaats === plaats && coordinates.length === 0) {
            (features[i])['geometry']['coordinates'] = coords;
            fs.writeFileSync(location, JSON.stringify(json));
        }
    }
}