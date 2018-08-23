"use strict";

let request = require('request');
let cheerio = require('cheerio');
let fs = require('fs');

let fundaKoopUrl = '/root/Desktop/Funda/Koop/';
let fundaHuurUrl = '/root/Desktop/Funda/Huur/';

// Search for all files in te koop & te huur
let filesFundaTeKoop = fs.readdirSync(fundaKoopUrl);
let filesFundaTeHuur = fs.readdirSync(fundaHuurUrl);

// Search for all files that end with .html
let pagesFundaTeKoop = getPages(fundaKoopUrl, filesFundaTeKoop);
let pagesFundaTeHuur = getPages(fundaHuurUrl, filesFundaTeHuur);

let outputTeKoop = '/home/meteorapp/build/bundle/programs/web.browser/app/data/vastgoedTeKoop.json';
let outputTeHuur = '/home/meteorapp/build/bundle/programs/web.browser/app/data/vastgoedTeHuur.json';

// Build the GeoJson output file
buildOutputFile('Te Koop', outputTeKoop, pagesFundaTeKoop);
buildOutputFile('Te Huur', outputTeHuur, pagesFundaTeHuur);


/**
 * Returns all files that end with .html
 * @param {string[]} files All file and folder names in an array
 * @param {string} locationUrl The URL of the file locations
 */
function getPages(locationUrl, files) {
    let pages = [];

    for(let i = 0; i < files.length; i++) {
        if(files[i].endsWith('.html')) {
            pages.push(locationUrl + files[i]);
        }
    }

    return pages;
}

/**
 * Parses all html files from the input and turns them into GeoJson
 * @param {string} outputFile The output file location
 * @param {*} fundaInput The array of html files to be parsed
 */
function buildOutputFile(outputName, outputFile, fundaInput) {
    let data = fs.readFileSync(fundaInput[0], 'utf8');
    let $ = cheerio.load(data);
    let nav = $('.pagination-pages');

    // Get the number of pages to parse
    /*let numFundaPages = 0;
    for(let i = 0; i < nav[0].children.length; i++) {
        if(nav[0].children[i].name === 'a') {
            numFundaPages++;
        }
    }*/
    let numFundaPages = fundaInput.length;

    let features = [];
    
    // Add parsed Funda data to the features array
    parseFundaPages(numFundaPages, fundaInput, features);

    // Create valid GeoJson from the found features and write it to the specified output file
    let json = JSON.stringify({
        'type':'FeatureCollection',
        'name':outputName,
        'crs': {'type':'name', 'properties':{'name':'urn:ogc:def:crs:EPSG:28992'}},
        'features':features
    });
    fs.writeFileSync(outputFile, json);

    console.log('Build finished...');
}

/**
 * Parse the funda pages and add them to the features array
 * @param {Number} numFundaPages 
 * @param {URL} fundaInput 
 * @param {JSON[]} features 
 */
function parseFundaPages(numFundaPages, fundaInput, features) {
    // Find all features in the Funda html page
    for(let i = 0; i < numFundaPages; i++) {
        console.log('Parsing file: ' + fundaInput[i]);
        let data = fs.readFileSync(fundaInput[i], 'utf8');
        let $ = cheerio.load(data);
        let length = $('.search-result-content-inner').length;

        for(let j = 0; j < length; j++) {
            let adres = getFundaAdres($, j).split(' ');
            let straat = adres[0];
            let nummer = adres[1];
            if(nummer === undefined) nummer = '';
            let toevoeging = adres[2];
            if(toevoeging === undefined) toevoeging = '';
            let postcodePlaats = (getFundaPostcodePlaats($, j)).split(' ');
            let postcode;  //postcodePlaats.substring(0, 8);
            let plaats; //postcodePlaats.substring(8, postcodePlaats.length);
            if(postcodePlaats.length === 2) {postcode = postcodePlaats[0]; plaats = postcodePlaats[1];}
            else {postcode = postcodePlaats[0] + ' ' + postcodePlaats[1]; plaats = postcodePlaats[2];}

            let oppervlakte = getFundaOppervlakte($, j);
            let url = getFundaUrl($, j);
            let prijs = getFundaPrijs($, j);

            let feature = JSON.stringify({
                'type':'Feature',
                'properties':{'Straat':straat,'Huisnummer':nummer,'Toevoeging':toevoeging,'Postcode':postcode,'Plaats':plaats,'Oppervlakte':oppervlakte,'Prijs':prijs,'URL':url},
                'geometry':{'type':'Point', 'coordinates':[]}
            });
            features.push(JSON.parse(feature));
        }
    }
}

function getFundaAdres($, i) {
    let title = $('.search-result-title');
    return title[i].children[0].data.trim();
}

function getFundaPostcodePlaats($, i) {
    let pp = $('.search-result-subtitle');
    return pp[i].children[0].data.trim();
}

function getFundaOppervlakte($, i) {
    let opp = $('.search-result-kenmerken');

    if(opp[i].children[0].next !== null) {
        return opp[i].children[0].next.children[1].children[0].data.trim();
    } else
        return '';
}

function getFundaUrl($, i) {
    let url = $('.search-result-header');
    return url[i].children[1].attribs.href;
}

function getFundaPrijs($, i) {
    let prijs = $('.search-result-price');
    return prijs[i].children[0].data.trim();
}
