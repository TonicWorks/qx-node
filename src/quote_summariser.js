'use strict'

const WORK_TYPE_PURCHASE   = 1;
const WORK_TYPE_SALE       = 2;
const WORK_TYPE_TRANSFER   = 3;
const WORK_TYPE_REMORTGAGE = 4;

const WORK_TYPE_SCOTLAND_PURCHASE   = 51;
const WORK_TYPE_SCOTLAND_SALE       = 52;

const WORK_TYPE_COMM_PURCHASE = 101;
const WORK_TYPE_COMM_SALE     = 102;

// Not actually WorkTypeIds - we just need a value to represent combined cases locally.
const COMBINED_TRANSFER_REMO = 1000000;
const COMBINED_SALE_PURCHASE = 1000001;

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

const currencyFormatter = require('currency-formatter');

const _ = require('lodash');

module.exports = function quoteSummariser(quote){

    return new Promise(function(resolve, reject) {

        let quoteDetails = {
            success : true,
            contact : quote.contacts[0],

            rawTotal                  : 0,
            rawTotalExVat             : 0,
            rawVat                    : 0,
            rawFees                   : 0,
            rawServiceFee             : 0,
            rawDisbursementTotal      : 0,
            rawDisbursementOther      : 0,
            rawDisbursementSearchPack : 0,
            rawDisbursementLandReg    : 0,
            rawDisbursementStampDuty  : 0,

            rawCommonLineItems : {
                auction : false,
                helpToBuyLoan : false,
                helpToBuyMortgage: false,
                leasehold : false,
                mortgage : false,
                newbuild : false,
                rightToBuy : false,
                sharedOwnership : false,
                unregistered : false,
                buyTolet : false,
                isa : false,
                searchPackAdmin : false,
                additionalProperty : false,
                bankTransfer : false,
                sdlt: false,
                bankruptcy : false,
                landRegistrySearch : false,
                officialCopies : false,
                clientId : false,
            },

            total                    : 0,
            totalExVat               : 0,
            vat                      : 0,
            fees                     : 0,
            serviceFee               : 0,
            disbursementTotal        : 0,
            disbursementOther        : 0,
            disbursementSearchPack   : 0,
            disbursementLandReg      : 0,
            disbursementStampDuty    : 0,

            cases : {
                transfer : false,
                remortgage : false,
                sale : false,
                purchase: false
            },

            quoteTypeString:false
        };

        //console.log(quoteEntry);
        if(_.isEmpty(quote)){
            reject('Quote details were empty');
        }

        function getCaseTypeVerb(caseTypeId) {
            let verb = 'conveyancing';
            if(caseTypeId == WORK_TYPE_PURCHASE){
                verb = 'buying';
            }
            else if(caseTypeId == WORK_TYPE_SALE){
                verb = 'selling';
            }
            else if(caseTypeId == WORK_TYPE_TRANSFER){
                verb = 'transferring equity';
            }
            else if(caseTypeId == WORK_TYPE_REMORTGAGE){
                verb = 'remortgaging';
            }
            return verb;
        }

        function summariseWork(quoteEntry) {

            let vars = {
                'noOfPeople'                    : quoteEntry['work']['conveyancingValues']['involvedParties'],
                'propertyPrice'                 : quoteEntry['work']['conveyancingValues']['propertyPrice'],
                'quoteCaseTypeId'               : quoteEntry['work']['workTypeId'],
                'quoteCaseTypeName'             : quoteEntry['work']['workType']['name'],
                'quoteCaseTypeCssClass'         : quoteEntry['work']['workType']['name'].replace(' ', '').toLowerCase(),
                'quoteCaseTypeVerb'             : getCaseTypeVerb(quoteEntry['work']['workTypeId']),

                'rawTotal'                      : 0,
                'rawTotalExVat'                 : 0,
                'rawVat'                        : 0,
                'rawFees'                       : 0,
                'rawServiceFee'                 : 0,
                'rawDisbursementTotal'          : 0,
                'rawDisbursementOther'          : 0,
                'rawDisbursementSearchPack'     : 0,
                'rawDisbursementLandReg'        : 0,
                'rawDisbursementStampDuty'      : 0,
                
                'total'                         : 0,
                'totalExVat'                    : 0,
                'vat'                           : 0,
                'fees'                          : 0,
                'serviceFee'                    : 0,
                'disbursementTotal'             : 0,
                'disbursementOther'             : 0,
                'disbursementSearchPack'        : 0,
                'disbursementLandReg'           : 0,
                'disbursementStampDuty'         : 0,

                'additionalCostsArray'          : [],
                'disbursementsArray'            : [],
                'serviceFeesArray'              : []
            };

            let otherDisbursements = 0;
            let totalService       = 0;
            let vat                = 0;

            for (var i = 0, len = quoteEntry['fees'].length; i < len; i++) {
                if (_.isEmpty(quoteEntry['fees'][i]['commission'])) quoteEntry['fees'][i]['commission'] = 0;

                vars['rawTotal'] += quoteEntry['fees'][i]['value'] + quoteEntry['fees'][i]['commission'] + quoteEntry['fees'][i]['tax'];
                vars['rawTotalExVat'] += quoteEntry['fees'][i]['value'] + quoteEntry['fees'][i]['commission'];
                
                switch (quoteEntry['fees'][i]['feeCategoryId']) {
                    case FEE_CATEGORY_LEGAL_FEES_ID:
                        vars['rawFees'] += quoteEntry['fees'][i]['value'] + quoteEntry['fees'][i]['commission'];
                        break;
                    case FEE_CATEGORY_ADDITIONAL_COSTS_ID:
                        if (quoteEntry['fees'][i]['value'] < 0) {
                            vars['hasDiscountFee']   = true;
                            vars['discountFeeName']  = quoteEntry['fees'][i]['name'];
                            vars['discountFeeExVat'] = currencyFormatter.format(quoteEntry['fees'][i]['value'] + quoteEntry['fees'][i]['commission'], { locale: 'en-GB' });
                        }
                        vars['rawFees'] += quoteEntry['fees'][i]['value'] + quoteEntry['fees'][i]['commission'];
                        vars['additionalCostsArray'].push({
                            'name'   : quoteEntry['fees'][i]['name'],
                            'amount' : currencyFormatter.format(quoteEntry['fees'][i]['value'], { locale: 'en-GB' })
                        });
                        break;
                    case FEE_CATEGORY_DISBURSEMENTS_ID:
                        vars['disbursementsArray'].push({
                            'name'   : quoteEntry['fees'][i]['name'],
                            'amount' : currencyFormatter.format(quoteEntry['fees'][i]['value'], { locale: 'en-GB' })
                        });
                        break;
                    case FEE_CATEGORY_SERVICE_FEES_ID:
                        vars['serviceFeesArray'].push({
                            'name'   : quoteEntry['fees'][i]['name'],
                            'amount' : currencyFormatter.format(quoteEntry['fees'][i]['value'], { locale: 'en-GB' })
                        });
                        totalService += quoteEntry['fees'][i]['value'];
                        break;
                    default:
                        return Promise.reject('could not get fee category');
                }

                switch (quoteEntry['fees'][i]['name']) {
                    case 'Stamp Duty':
                        vars['rawDisbursementStampDuty'] = quoteEntry['fees'][i]['total'];
                        break;
                    case 'Land Registry Fee' || 'HM Land registry':
                        vars['rawDisbursementLandReg']  = quoteEntry['fees'][i]['total'];
                        break;
                    case 'Search Pack':
                        vars['rawDisbursementSearchPack']  = quoteEntry['fees'][i]['total'];
                        break;
                    default:
                        if (quoteEntry['fees'][i]['feeCategoryId'] == FEE_CATEGORY_DISBURSEMENTS_ID) {
                            otherDisbursements += quoteEntry['fees'][i]['value'];
                        }
                }

                if(quoteEntry['fees'][i]['total'] > 0) {
                    let feeName = quoteEntry['fees'][i]['name'].toLowerCase();
                    if (feeName.includes('auction')) {
                        quoteDetails.rawCommonLineItems.auction += quoteEntry['fees'][i]['total'];
                    }
                    else if (feeName.includes('buy loan')) {
                        quoteDetails.rawCommonLineItems.helpToBuyLoan += quoteEntry['fees'][i]['total'];
                    }
                    else if (feeName.includes('buy mortgage')) {
                        quoteDetails.rawCommonLineItems.helpToBuyMortgage += quoteEntry['fees'][i]['total'];
                    }
                    else if (feeName.includes('leasehold')) {
                        quoteDetails.rawCommonLineItems.leasehold += quoteEntry['fees'][i]['total'];
                    }
                    else if (feeName.includes('mortgage admin') || feeName.includes('acting for lender')) {
                        quoteDetails.rawCommonLineItems.mortgage += quoteEntry['fees'][i]['total'];
                    }
                    else if (feeName.includes('newbuild') || feeName.includes('new build')) {
                        quoteDetails.rawCommonLineItems.newbuild += quoteEntry['fees'][i]['total'];
                    }
                    else if (feeName.includes('right to buy')) {
                        quoteDetails.rawCommonLineItems.rightToBuy += quoteEntry['fees'][i]['total'];
                    }
                    else if (feeName.includes('shared ownership')) {
                        quoteDetails.rawCommonLineItems.sharedOwnership += quoteEntry['fees'][i]['total'];
                    }
                    else if (feeName.includes('unregistered')) {
                        quoteDetails.rawCommonLineItems.unregistered += quoteEntry['fees'][i]['total'];
                    }
                    else if (feeName.includes('buy to let')) {
                        quoteDetails.rawCommonLineItems.buyTolet += quoteEntry['fees'][i]['total'];
                    }
                    else if (feeName.includes('buy isa')) {
                        quoteDetails.rawCommonLineItems.isa += quoteEntry['fees'][i]['total'];
                    }
                    else if (feeName.includes('search pack admin')) {
                        quoteDetails.rawCommonLineItems.searchPackAdmin += quoteEntry['fees'][i]['total'];
                    }
                    else if (feeName.includes('additional property')) {
                        quoteDetails.rawCommonLineItems.additionalProperty += quoteEntry['fees'][i]['total'];
                    }
                    else if (feeName.includes('chaps')||feeName.includes('tt fee')||feeName.includes('telegraphic transfer')||feeName.includes('bank transfer')||feeName.includes('bank fee')||feeName.includes('bank tt')) {
                        quoteDetails.rawCommonLineItems.bankTransfer += quoteEntry['fees'][i]['total'];
                        console.log(feeName);
                    }
                    else if (feeName.includes('sdlt')) {
                        quoteDetails.rawCommonLineItems.sdlt += quoteEntry['fees'][i]['total'];
                    }
                    else if (feeName.includes('bankruptcy')) {
                        quoteDetails.rawCommonLineItems.bankruptcy += quoteEntry['fees'][i]['total'];
                    }
                    else if ((feeName.includes('land registry')||feeName.includes('lr search')) && feeName != "hm land registry" && feeName != "land registry fee") {
                        quoteDetails.rawCommonLineItems.landRegistrySearch += quoteEntry['fees'][i]['total'];
                    }
                    else if (feeName.includes('official')||feeName.includes('office')||feeName.includes('oc1')) {
                        quoteDetails.rawCommonLineItems.officialCopies += quoteEntry['fees'][i]['total'];
                    }
                    else if (feeName.includes('aml search')||feeName.includes('id check')||feeName.includes('client id')||feeName.includes('aml check')||feeName.includes('electronic id')) {
                        quoteDetails.rawCommonLineItems.clientId += quoteEntry['fees'][i]['total'];
                    }
                }

                if(_.get(quoteEntry['fees'][i], ['tax'])){
                    vat += quoteEntry['fees'][i]['tax'];
                }
            }

            vars['quotePartPayment'] = false;
            
            vars['rawServiceFee'] = totalService;
            vars['rawDisbursementOther'] = otherDisbursements;
            vars['rawDisbursementTotal'] = vars['rawDisbursementOther'] + vars['rawDisbursementStampDuty'] + vars['rawDisbursementLandReg'] + vars['rawDisbursementSearchPack'];
            vars['rawVat'] = vat;
            vars['total'] = currencyFormatter.format(vars['rawTotal'], { locale: 'en-GB' });
            vars['totalExVat']  = currencyFormatter.format(vars['rawTotalExVat'], { locale: 'en-GB' });
            vars['fees'] = currencyFormatter.format(vars['rawFees'], { locale: 'en-GB' });
            vars['serviceFee'] = currencyFormatter.format(vars['rawServiceFee'], { locale: 'en-GB' });
            vars['disbursementOther']   = currencyFormatter.format(vars['rawDisbursementOther'], { locale: 'en-GB' });
            vars['disbursementTotal']   = currencyFormatter.format(vars['rawDisbursementTotal'], { locale: 'en-GB' });
            vars['vat'] = currencyFormatter.format(vat, { locale: 'en-GB' });
            vars['disbursementSearchPack'] = currencyFormatter.format(vars['rawDisbursementSearchPack'], { locale: 'en-GB' });
            vars['disbursementLandReg'] = currencyFormatter.format(vars['rawDisbursementLandReg'], { locale: 'en-GB' });
            vars['disbursementStampDuty'] = currencyFormatter.format(vars['rawDisbursementStampDuty'], { locale: 'en-GB' });
            
            return vars;
        }

        for (var i = 0, len = quote.quoteEntries.length; i < len; i++) {
            let entry = quote.quoteEntries[i];
            let res = summariseWork(entry);

            if(res.quoteCaseTypeId == WORK_TYPE_PURCHASE){
                quoteDetails.cases.purchase = res;
                quoteDetails.quoteTypeString = 'purchase';
            }
            else if(res.quoteCaseTypeId == WORK_TYPE_SALE){
                quoteDetails.cases.sale = res;
                quoteDetails.quoteTypeString = 'sale';

            }
            else if(res.quoteCaseTypeId == WORK_TYPE_TRANSFER){
                quoteDetails.cases.transfer = res;
                quoteDetails.quoteTypeString = 'equity transfer';
            }
            else if(res.quoteCaseTypeId == WORK_TYPE_REMORTGAGE){
                quoteDetails.cases.remortgage = res;
                quoteDetails.quoteTypeString = 'remortgage';
            }

            quoteDetails.rawTotal += res.rawTotal;
            quoteDetails.rawTotalExVat += res.rawTotalExVat;
            quoteDetails.rawVat += res.rawVat;
            quoteDetails.rawFees += res.rawFees;
            quoteDetails.rawServiceFee += res.rawServiceFee;
            quoteDetails.rawDisbursementTotal += res.rawDisbursementTotal;
            quoteDetails.rawDisbursementOther += res.rawDisbursementOther;
            quoteDetails.rawDisbursementSearchPack += res.rawDisbursementSearchPack;
            quoteDetails.rawDisbursementLandReg += res.rawDisbursementLandReg;
            quoteDetails.rawDisbursementStampDuty += res.rawDisbursementStampDuty;
        }
        
        quoteDetails.total = currencyFormatter.format(quoteDetails.rawTotal, { locale: 'en-GB' });
        quoteDetails.totalExVat = currencyFormatter.format(quoteDetails.rawTotalExVat, { locale: 'en-GB' });
        quoteDetails.vat = currencyFormatter.format(quoteDetails.rawVat, { locale: 'en-GB' });
        quoteDetails.fees = currencyFormatter.format(quoteDetails.rawFees, { locale: 'en-GB' });
        quoteDetails.serviceFee = currencyFormatter.format(quoteDetails.rawServiceFee, { locale: 'en-GB' });
        quoteDetails.disbursementTotal = currencyFormatter.format(quoteDetails.rawDisbursementTotal, { locale: 'en-GB' });
        quoteDetails.disbursementOther = currencyFormatter.format(quoteDetails.rawDisbursementOther, { locale: 'en-GB' });
        quoteDetails.disbursementSearchPack = currencyFormatter.format(quoteDetails.rawDisbursementSearchPack, { locale: 'en-GB' });
        quoteDetails.disbursementLandReg = currencyFormatter.format(quoteDetails.rawDisbursementLandReg, { locale: 'en-GB' });
        quoteDetails.disbursementStampDuty = currencyFormatter.format(quoteDetails.rawDisbursementStampDuty, { locale: 'en-GB' });

        let commonlineItems = {};
        for (var item in quoteDetails.rawCommonLineItems) {
            if(quoteDetails.rawCommonLineItems[item]> 0){
                commonlineItems[item] = currencyFormatter.format(quoteDetails.rawCommonLineItems[item], { locale: 'en-GB' });
            }
            else{
                commonlineItems[item] = false;
            }
        }
        quoteDetails.commonlineItems = commonlineItems;

        let quoteText = [];
        //build a friendly set of information about the quote
        let description = 'We estimate the cost for us to complete ';

        if(quoteDetails.cases.transfer!=false && quoteDetails.cases.remortgage!=false){
            quoteDetails.quoteTypeString = 'transfer of equity and remortgage';
            description += 'both your ' + quoteDetails.quoteTypeString;
        }
        else if(quoteDetails.cases.sale!=false && quoteDetails.cases.purchase!=false){
            quoteDetails.quoteTypeString = 'sale and purchase';
            description += 'both your ' + quoteDetails.quoteTypeString;
        }
        else{
            description += 'your ' + quoteDetails.quoteTypeString;
        }
        description += ' conveyancing will be ' + currencyFormatter.format(quoteDetails.rawTotal - quoteDetails.rawDisbursementSearchPack - quoteDetails.rawDisbursementLandReg -quoteDetails.rawDisbursementStampDuty, { locale: 'en-GB' }); + ' (including VAT). ';
        quoteText.push(description);

        if(quoteDetails.rawDisbursementLandReg > 0 && quoteDetails.rawDisbursementStampDuty > 0){
            quoteText.push("In addition there is a fee of " + quoteDetails.disbursementLandReg + " (payable to Land Registry) and Stamp Duty of " + quoteDetails.disbursementStampDuty + " (payable to HMRC) when your transaction completes. ");
            quoteText.push("We will ask you to transfer funds to us to cover these costs prior to completion of your matter, and then pay them on your behalf. ");
        }
        else{
            if(quoteDetails.rawDisbursementLandReg > 0){
                quoteText.push("In addition there is a fee of " + quoteDetails.disbursementLandReg + " (payable to Land Registry) when your transaction completes. ");
                quoteText.push("We will ask you to transfer funds to us to cover this fee prior to completion of your matter, and then pay it on your behalf. ");
            }
            if(quoteDetails.rawDisbursementStampDuty > 0){
                quoteText.push("In addition there is Stamp Duty of " + quoteDetails.disbursementStampDuty + " (payable to HMRC) when your transaction completes. ");
                quoteText.push("We will ask you to transfer funds to us to cover this tax prior to completion of your matter, and then pay it on your behalf. ");
            }        
        }
        if(quoteDetails.rawDisbursementSearchPack > 0){
            quoteText.push("Because you are buying a property with a mortgage, your mortgage lender will require that property searches are ordered too, and these will cost an additional " + quoteDetails.disbursementSearchPack + ". ");
            quoteText.push("Depending on where your property is located, your lender may ask us to order some more searches which will cost extra (for example if your property is located in a Coal Mining area or their is a perceived Flood Risk). ");
        }
        if(quoteDetails.rawDisbursementLandReg > 0 || quoteDetails.rawDisbursementStampDuty > 0 || quoteDetails.rawDisbursementSearchPack > 0){
            quoteText.push("In total, your conveyancing will therefore cost " + quoteDetails.total + ". ");
        }
        quoteDetails.quoteText = quoteText,
        resolve(quoteDetails);
    });
}