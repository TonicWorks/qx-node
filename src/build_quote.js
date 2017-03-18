'use strict'

const WORK_TYPE_PURCHASE   = 1;
const WORK_TYPE_SALE       = 2;
const WORK_TYPE_TRANSFER   = 3;
const WORK_TYPE_REMORTGAGE = 4;

const WORK_TYPE_SCOTLAND_PURCHASE   = 51;
const WORK_TYPE_SCOTLAND_SALE       = 52;

const WORK_TYPE_COMM_PURCHASE = 101;
const WORK_TYPE_COMM_SALE     = 102;

const FEE_CATEGORY_LEGAL_FEES_ID       = 1;
const FEE_CATEGORY_ADDITIONAL_COSTS_ID = 2;
const FEE_CATEGORY_DISBURSEMENTS_ID    = 3;
const FEE_CATEGORY_SERVICE_FEES_ID     = 1000;

const STATUS_CREATED              = 1;
const STATUS_INSTRUCTED           = 3;
const STATUS_PARTIALLY_INSTRUCTED = 5;

const TENURE_TYPE_FREEHOLD  = 1;
const TENURE_TYPE_LEASEHOLD = 2;

const MORTGAGE_TYPE_NONE   = 0;
const MORTGAGE_TYPE_NORMAL = 1;

const _ = require('lodash');

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

    function formatMortgage(mortgage){
        //need to handle islamic too
        if(mortgage==true){
            return MORTGAGE_TYPE_NORMAL;
        }
        else{
            return MORTGAGE_TYPE_NONE;
        }
    }
    
    function buildContact() {
        return {
            'contact': {
                'title':contact.title,
                'forename':contact.forename,
                'surname':contact.surname,
                'emailAddress':contact.emailAddress,
                'homeTelno':contact.homeTelno}
        };
    }

    function buildRemortgage(details) {
        let res = {
            'workTypeId':WORK_TYPE_REMORTGAGE,
            'conveyancingValues':{
                'propertyPrice':details.propertyPrice,
                'tenureTypeId':formatTenure(details.tenure),
                'involvedParties':details.involvedParties,
            }
        };
        if(_.get(details, ['isBuyToLet'])){
            res.conveyancingValues.isBuyToLet = true;
        }
        return res;
    }

    function buildTransfer(details) {
        let res = {
            'workTypeId':WORK_TYPE_TRANSFER,
            'conveyancingValues':{
                'propertyPrice':details.propertyPrice,
                'tenureTypeId':formatTenure(details.tenure),
                'involvedParties':details.involvedParties,
                'transferMoneyExchanged':details.transferMoneyExchanged,
                'transferMortgageValue':details.transferMortgageValue,
                'transferPercentTransferred':details.transferPercentTransferred
            }
        };
        /*if(_.get(details, ['isBuyToLet'])){
            res.conveyancingValues.isBuyToLet = true;
        }*/
        return res;
    }

    function buildSale(details) {
        return {
            'workTypeId':WORK_TYPE_SALE,
            'conveyancingValues':{
                'propertyPrice':details.propertyPrice,
                'tenureTypeId':formatTenure(details.tenure),
                'mortgageTypeId':formatMortgage(details.mortgage),
                'involvedParties':details.involvedParties,
            }
        };
    }

    function buildPurchase(details) {
        return {
            'workTypeId':WORK_TYPE_PURCHASE,
            'conveyancingValues':{
                'propertyPrice':details.propertyPrice,
                'tenureTypeId':formatTenure(details.tenure),
                'mortgageTypeId':formatMortgage(details.mortgage),
                'involvedParties':details.involvedParties,
            }
        };
    }

    function buildRequest(){
        var quoteLines=[];
        if(_.get(quoteEntries, ['remortgage'])){
            quoteLines.push(buildRemortgage(quoteEntries.remortgage));
        }
        if(_.get(quoteEntries, ['transfer'])){
            quoteLines.push(buildTransfer(quoteEntries.transfer));
        }
        if(_.get(quoteEntries, ['sale'])){
            quoteLines.push(buildSale(quoteEntries.sale));
        }
        if(_.get(quoteEntries, ['purchase'])){
            quoteLines.push(buildPurchase(quoteEntries.purchase));
        }
        if(quoteLines.length==0){
            return false;
        }
        else{
            return {
                'contacts' : [
                    buildContact(contact)
                ],
                'quoteEntries' : quoteLines
            };
        }
    }

    let promise = new Promise(function(resolve, reject) {
        let request = buildRequest();
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