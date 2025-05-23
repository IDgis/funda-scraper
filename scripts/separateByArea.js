"use strict";

import { flattenEach, booleanWithin } from '@turf/turf';
import fs from 'fs';

const teKoop = '/root/Desktop/teKoop.json';
const teHuur = '/root/Desktop/teHuur.json';

const teKoopBedrijf = '/root/Desktop/teKoopBedrijf.json';
const teHuurBedrijf = '/root/Desktop/teHuurBedrijf.json';
const teKoopDetailhandel = '/root/Desktop/teKoopDetailhandel.json';
const teHuurDetailhandel = '/root/Desktop/teHuurDetailhandel.json';

const teKoopGeoJson = loadFileAsGeoJson(teKoop);
const teHuurGeoJson = loadFileAsGeoJson(teHuur);

const bedrijventerreinen = loadFileAsGeoJson('/tmp/bedrijventerreinen.json');
separateFeatures(bedrijventerreinen, teKoopGeoJson, teKoopBedrijf, teKoopDetailhandel);
separateFeatures(bedrijventerreinen, teHuurGeoJson, teHuurBedrijf, teHuurDetailhandel);


/**
 * Reads a file from location and returns it as GeoJSON
 * 
 * @param {string} fileName The absolute path to load the file from
 */
function loadFileAsGeoJson(fileName) {
    console.log('Loading GeoJSON ...');
    const file = fs.readFileSync(fileName, 'utf8');
    return JSON.parse(file);
}

/**
 * 
 * @param {JSON} bedrijventerreinen The FeatureCollection of Polygons to check the Funda Features against
 * @param {JSON} inputJson The FeatureCollection of Points from Funda
 * @param {string} outputBedrijf The location to store the FeatureCollection of Bedrijven GeoJSON
 * @param {string} outputDetailhandel The location to store the FeatureCollection of Vastgoed GeoJSON
 */
function separateFeatures(bedrijventerreinen, inputJson, outputBedrijf, outputDetailhandel) {
    console.log('Splitting file based on geometry ...');
    const featureCollectionBedrijf = JSON.parse(JSON.stringify({type: inputJson.type, crs: inputJson.crs, properties: inputJson.properties, features: []}));
    const featureCollectionDetailhandel = JSON.parse(JSON.stringify({type: inputJson.type, crs: inputJson.crs, properties: inputJson.properties, features: []}));

    featureCollectionBedrijf.properties.title = inputJson.properties.title + ' Bedrijven';
    featureCollectionDetailhandel.properties.title = inputJson.properties.title + ' Detailhandel';

    inputJson.features.forEach(inputFeature => {
        let within = false;
        flattenEach(bedrijventerreinen, terreinFeature => {
            within = within || booleanWithin(inputFeature, terreinFeature);
        });

        if (within) {
            featureCollectionBedrijf.features.push(inputFeature);
        } else {
            featureCollectionDetailhandel.features.push(inputFeature);
        }
    });

    fs.writeFileSync(outputBedrijf, JSON.stringify(featureCollectionBedrijf));
    fs.writeFileSync(outputDetailhandel, JSON.stringify(featureCollectionDetailhandel));
}

