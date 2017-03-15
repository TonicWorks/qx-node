'use strict'

const WORK_TYPE_PURCHASE   = 1;
const WORK_TYPE_SALE       = 2;
const WORK_TYPE_TRANSFER   = 3;
const WORK_TYPE_REMORTGAGE = 4;

const WORK_TYPE_SCOTLAND_PURCHASE   = 51;
const WORK_TYPE_SCOTLAND_SALE       = 52;

const WORK_TYPE_COMM_PURCHASE = 101;
const WORK_TYPE_COMM_SALE     = 102;

const TENURE_TYPE_FREEHOLD  = 1;
const TENURE_TYPE_LEASEHOLD = 2;

const MORTGAGE_TYPE_NONE   = 0;
const MORTGAGE_TYPE_NORMAL = 1;

//const requestPromise = require('minimal-request-promise');

/*
need to pass in:
quote details
contact details
api username and password
url for the api endpoint we are hitting

 */

module.exports = function buildQuote(contact,quoteEntries){

    function formatTenure(tenure){
        if(tenure=='Leasehold'){
            return TENURE_TYPE_LEASEHOLD;
        }
        else{
            return TENURE_TYPE_FREEHOLD;
        }
    }

    function buildContact(contact) {
        return {
            'contact': {
                'title':contact.title,
                'forename':contact.forename,
                'surname':contact.surname,
                'emailAddress':contact.emailAddress,
                'homeTelno':contact.homeTelno}

        };
    }

    function buildRemortgage(remortgage) {
        return {
            'workTypeId':WORK_TYPE_REMORTGAGE,
            'conveyancingValues':{
                'propertyPrice':remortgage.propertyPrice,
                'tenureTypeId':formatTenure(remortgage.tenure),
                'involvedParties':remortgage.involvedParties,
                'isBuyToLet':remortgage.isBuyToLet
            }
        };
    }

    function buildRequest(contact,quoteEntries){

        var quoteLines=[];
        if(quoteEntries.remortgage){
            quoteLines[0] = buildRemortgage(quoteEntries.remortgage);
        }

        return {
            'contacts' : buildContact(contact),
            'quoteEntries' : quoteLines
        };
    }

    let promise = new Promise(function(resolve, reject) {
        let request = buildRequest(contact,quoteEntries);
        if(request!=false){
            resolve(request);
        }
        else{
            console.error("Error building request!: ", err);
            reject(err);
        }
    });

    return promise;
};