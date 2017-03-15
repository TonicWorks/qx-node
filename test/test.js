'use strict'

const qx = require('qx');

let contact = {
    'title':'Mr',
    'forename':'Matt',
    'surname':'Pennington',
    'emailAddress':'mp@tonic.works',
    'homeTelno':'07543389333'
}

let remortgage = {
    'propertyPrice': 175000,
    'tenure': 'Leasehold',
    'involvedParties': 2,
    'isBuyToLet':false
}

let quoteEntries = [];

quoteEntries['remortgage'] = remortgage;

return qx(contact,quoteEntries);