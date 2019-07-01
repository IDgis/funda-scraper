"use strict";

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

const outputTeKoop = '/root/Desktop/teKoop.json';
const outputTeHuur = '/root/Desktop/teHuur.json';

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
        'crs': {
            'type': 'name',
            'properties': {
                'name': 'urn:ogc:def:crs:EPSG:28992'
            }
        },
        'properties': {
            'title': title,
            'updated': new Date()
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

        $('.search-result-content-inner').each((index, elem) => {
            const searchResultHeader = elem.children.find(val => val.attribs && val.attribs.class === 'search-result-header')
                .children.find(val => val.attribs && val.attribs.class === 'search-result-header-title-col');
            const searchResultInfoPrijs = elem.children.find(val => val.attribs && val.attribs.class === 'search-result-info search-result-info-price');
            const searchResultInfo = elem.children.find(val => val.attribs && val.attribs.class === 'search-result-info');

            const url = getFundaUrl(searchResultHeader);
            const adres = getFundaAdres(searchResultHeader).split(' ');

            let adresEnd = 0;
            let straat = '';
            for (let adr in adres) {
                if (!isNaN(adres[adr])) {
                    adresEnd = adr;
                    break;
                }
                straat += adres[adr] + ' ';
                adresEnd++;
            }
            straat = straat.trim();

            let nummer = '';
            for (; adresEnd < adres.length; adresEnd++) {
                nummer += adres[adresEnd] + ' ';
            }
            nummer = nummer.trim();
            
            const postcodePlaats = getFundaPostcodePlaats(searchResultHeader).split(' ');
            let postcode;
            let plaats;
            if (postcodePlaats.length === 2) {
                postcode = postcodePlaats[0];
                plaats = postcodePlaats[1];
            } else {
                postcode = postcodePlaats[0] + ' ' + postcodePlaats[1];
                plaats = postcodePlaats[2];
            }

            const oppervlakte = getFundaOppervlakte(searchResultInfo);
            const prijs = getFundaPrijs(searchResultInfoPrijs);

            const feature = JSON.stringify({
                'type': 'Feature',
                'properties': {
                    'Straat': straat,
                    'Huisnummer': nummer,
                    'Toevoeging': '',
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
        });
    });

    return features;
}

function getFundaAdres(searchResultHeader) {
    return searchResultHeader.children.find(child => child.type === 'tag' && child.name === 'a' &&
                child.children.find(subChild => subChild.attribs && subChild.attribs.class === 'search-result-title'))
            .children.find(child => child.attribs && child.attribs.class === 'search-result-title')
            .children.find(child => child.type === 'text').data.trim();
}

function getFundaPostcodePlaats(searchResultHeader) {
    return searchResultHeader.children.find(child => child.type === 'tag' && child.name === 'a' &&
                child.children.find(subChild => subChild.attribs && subChild.attribs.class === 'search-result-subtitle'))
            .children.find(child => child.attribs && child.attribs.class === 'search-result-subtitle')
            .children.find(child => child.type === 'text').data.trim();
}

function getFundaOppervlakte(searchResultInfo) {
    const kenmerken = searchResultInfo.children.find(child => child.type === 'tag' && child.attribs && child.attribs.class.indexOf('search-result-kenmerken') !== -1)
            .children.find(child => child.type === 'tag' && child.name === 'li');
    const oppervlakteTag = kenmerken && kenmerken.children.find(child => child.type === 'tag' && child.attribs && child.attribs.title === 'Oppervlakte');
    return oppervlakteTag ? oppervlakteTag.children.find(child => child.type === 'text').data.trim() : '';
}

function getFundaUrl(searchResultHeader) {
    return searchResultHeader.children.find(child => child.type === 'tag' && child.name === 'a' && !!child.attribs.href).attribs.href;
}

function getFundaPrijs(searchResultInfoPrijs) {
    return searchResultInfoPrijs.children.find(child => child.type === 'tag' && child.attribs && child.attribs.class === 'search-result-price')
            .children.find(child => child.type === 'text').data.trim();
}
