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

const requestPromise = require('minimal-request-promise');

/*
need to pass in:
quote details
contact details
api username and password
url for the api endpoint we are hitting

 */

module.exports = function quotexpressQuoteRequest(contact,quoteDetails){

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
            'contact':{
                'title':contact.title,
                'forename':contact.forename,
                'surname':contact.surname,
                'emailAddress':contact.email_address,
                'homeTelno':contact.contact_number
            }
        };
    }

    function buildRemortgage(remortgage) {
        return {
            'workTypeId':WORK_TYPE_REMORTGAGE,
            'conveyancingValues':{
                'propertyPrice':remortgage.remortgage_amount,
                'tenureTypeId':formatTenure(remortgage.remortgage_tenure),
                'involvedParties':remortgage.remortgage_num_owners,
                'isBuyToLet':remortgage.remortgage_buy_to_let
            }
        };
    }

    function buildRequest(contact,quoteDetails){

        var quoteEntries=[];
        if(quoteDetails.remortgage){
            quoteEntries[0] = buildRemortgage(remortgage);
        }

        return {
            'contacts' : buildContact(contact),
            'quoteEntries' : quoteEntries
        };
    }

    function getHttpUserPass() {
        return 'something' + ":" + 'somethingelse';
    }
    
    return buildRequest(contact,quoteDetails)
        .then(function (request){
            
            var options = {
                method: 'POST',
                hostname: 'demo.quotexpress.co.uk',
                path: 'api/1/quotes.json',
                port: 443,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + getHttpUserPass()
                },
                body: JSON.stringify(request)
            };
            
            return requestPromise(options);
            
        }, function (err) {
            console.error(err);
        })
        .then(function (response) {
            console.log('got response', response.body, response.headers);
            //parse the quote data 
        }, function (error) {
            console.log('got error', error.body, error.headers, error.statusCode, error.statusMessage);
        })
        .catch(function (error) {
            console.error(error);
            return 'An error occurred';
        });
};