"use strict";

const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

const fundaKoopDir = '/root/Desktop/Funda/Koop/';
const fundaHuurDir = '/root/Desktop/Funda/Huur/';

// Search for all files in Koop and Huur
const filesFundaTeKoop = fs.readdirSync(fundaKoopDir);
const filesFundaTeHuur = fs.readdirSync(fundaHuurDir);

// Filter all files that end with .html
const htmlTeKoop = filesFundaTeKoop.filter(file => file.endsWith('.html')).map(file => fundaKoopDir + file);
const htmlTeHuur = filesFundaTeHuur.filter(file => file.endsWith('.html')).map(file => fundaHuurDir + file);

const outputTeKoop = '/root/Desktop/vastgoedTeKoop.json';
const outputTeHuur = '/root/Desktop/vastgoedTeHuur.json';

// Build the GeoJson output file
buildOutputFile('Te Koop', outputTeKoop, htmlTeKoop);
buildOutputFile('Te Huur', outputTeHuur, htmlTeHuur);

/**
 * Parses all html files from the input and turns them into GeoJson
 * @param {string} title The title of output
 * @param {string} outputFile The output file location
 * @param {array} htmlPages The html files to be parsed
 */
function buildOutputFile(title, outputFile, htmlPages) {
    const features = parseFundaPages(htmlPages);

    // Create valid GeoJson from the found features and write it to the specified output file
    const json = JSON.stringify({
        'type': 'FeatureCollection',
        'name': title,
        'crs': {
            'type': 'name',
            'properties': {
                'name': 'urn:ogc:def:crs:EPSG:28992'
            }
        },
        'features': features
    });
    fs.writeFileSync(outputFile, json);

    console.log('Build finished ...');
}

/**
 * Parse the funda pages and return them as a feature array
 * @param {array} htmlPages The html pages to parse
 */
function parseFundaPages(htmlPages) {
    const features = [];

    htmlPages.forEach(page => {
        console.log(`Parsing file: ${page}`);
        const data = fs.readFileSync(page, 'utf8');
        const $ = cheerio.load(data);
        const length = $('.search-result-content-inner').length;

        for (let i = 0; i < length; i++) {
            const adres = getFundaAdres($, i).split(' ');
            const straat = adres[0];
            let nummer = adres[1];
            if (nummer === undefined) nummer = '';
            let toevoeging = adres[2];
            if (toevoeging === undefined) toevoeging = '';
            const postcodePlaats = getFundaPostcodePlaats($, i).split(' ');
            let postcode;
            let plaats;
            if (postcodePlaats.length === 2) {
                postcode = postcodePlaats[0];
                plaats = postcodePlaats[1];
            } else {
                postcode = postcodePlaats[0] + ' ' + postcodePlaats[1];
                plaats = postcodePlaats[2];
            }
            const oppervlakte = getFundaOppervlakte($, i);
            const url = getFundaUrl($, i);
            const prijs = getFundaPrijs($, i);

            const feature = JSON.stringify({
                'type': 'Feature',
                'properties': {
                    'Straat': straat,
                    'Huisnummer': nummer,
                    'Toevoeging': toevoeging,
                    'Postcode': postcode,
                    'Plaats': plaats,
                    'Oppervlakte': oppervlakte,
                    'Prijs': prijs,
                    'URL': url
                },
                'geometry': {
                    'type': 'Point',
                    'coordinates': []
                }
            });
            features.push(JSON.parse(feature));
        }
    });

    return features;
}

function getFundaAdres($, i) {
    const title = $('.search-result-title');
    return title[i].children[0].data.trim();
}

function getFundaPostcodePlaats($, i) {
    const pp = $('.search-result-subtitle');
    return pp[i].children[0].data.trim();
}

function getFundaOppervlakte($, i) {
    const opp = $('.search-result-kenmerken');

    if (opp[i].children[0].next !== null) {
        return opp[i].children[0].next.children[1].children[0].data.trim();
    } else {
        return '';
    }
}

function getFundaUrl($, i) {
    const url = $('.search-result-header');
    return url[i].children[1].attribs.href;
}

function getFundaPrijs($, i) {
    const prijs = $('.search-result-price');
    return prijs[i].children[0].data.trim();
}
