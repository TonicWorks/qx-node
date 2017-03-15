'use strict'

const qx = require('qx');

let testCredentials = {
    pass : 'user' + ":" + 'pass',
    hostname : 'host',
    campaignId : 'campaignid'
};

let testHash = 'somehash';

let contact = {
    'title':'Mr',
    'forename':'John',
    'surname':'Doe',
    'emailAddress':'testing@tonic.works',
    'homeTelno':'01234567891'
}

let remortgage = {
    'propertyPrice': 175000,
    'tenure': 'Leasehold',
    'involvedParties': 2,
    'isBuyToLet':false
}

let quoteEntries = [];

quoteEntries['remortgage'] = remortgage;

/*qx.addQuote(credentials,contact,quoteEntries)
    .then(function(res) {
        console.log('res is ',res);
    }, function (error) {
        console.log('got error', error);
    });*/

qx.retrieveQuote(testCredentials,testHash)
    .then(function(res) {
        console.log('res is ',res);
    }, function (error) {
        console.log('got error', error);
    });