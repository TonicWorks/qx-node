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
                'quoteSnapshotLegalExVat'        : 0,
                'quoteTotalLegalFeesEx'          : 0,
                'quoteOnlyLegalExVat'            : 0,
                'quoteAdditionalCosts'           : [],
                'quoteDisbursements'             : [],
                'quoteServiceFees'               : [],
                'noOfPeople'                     : quoteEntry['work']['conveyancingValues']['involvedParties'],
                'propertyPrice'                  : quoteEntry['work']['conveyancingValues']['propertyPrice'],
                'quoteCaseTypeId'                : quoteEntry['work']['workTypeId'],
                'quoteCaseTypeName'              : quoteEntry['work']['workType']['name'],
                'quoteCaseTypeCssClass'          : quoteEntry['work']['workType']['name'].replace(' ', '').toLowerCase(),
                'quoteCaseTypeVerb'              : getCaseTypeVerb(quoteEntry['work']['workTypeId']),
                'quoteSnapshotDisbursementOther' : 0,
                'quoteTotalVat'                  : 0,
                'quoteTotal'                     : 0,
                //'quotePartPaymentAmountExVat'    : 0,
                //'quotePartPaymentAmountIncVat'   : 0,
                'rawFirmFees'                   :0,
                'rawFirmDisbursements'          :0,
                'rawFirmVat'                    :0,
                'rawFirmTotal'                  :0,
                'rawSearchPack'                 :0,
                'rawLandReg'                    :0,
                'rawStampDuty'                  :0
            };

            let otherDisbursements = 0;
            let totalDisbursement  = 0;
            let totalService       = 0;
            let vat                = 0;

            for (var i = 0, len = quoteEntry['fees'].length; i < len; i++) {
                if (_.isEmpty(quoteEntry['fees'][i]['commission'])) quoteEntry['fees'][i]['commission'] = 0;

                vars['quoteTotal'] += quoteEntry['fees'][i]['value'] + quoteEntry['fees'][i]['commission'] + quoteEntry['fees'][i]['tax'];;

                switch (quoteEntry['fees'][i]['feeCategoryId']) {
                    case FEE_CATEGORY_LEGAL_FEES_ID:
                        vars['quoteSnapshotLegalExVat'] += quoteEntry['fees'][i]['value'] + quoteEntry['fees'][i]['commission'];
                        vars['quoteTotalLegalFeesEx'] += quoteEntry['fees'][i]['value'] + quoteEntry['fees'][i]['commission'];
                        vars['quoteOnlyLegalExVat'] += quoteEntry['fees'][i]['value'] + quoteEntry['fees'][i]['commission'];
                        break;
                    case FEE_CATEGORY_ADDITIONAL_COSTS_ID:
                        // The snapshot shows the total fees and then has
                        // discount values separately.
                        if (quoteEntry['fees'][i]['value'] > 0) {
                            vars['quoteSnapshotLegalExVat'] += quoteEntry['fees'][i]['value'] + quoteEntry['fees'][i]['commission'];
                        } else {
                            vars['hasDiscountFee']   = true;
                            vars['discountFeeName']  = quoteEntry['fees'][i]['name'];
                            vars['discountFeeExVat'] = currencyFormatter.format(quoteEntry['fees'][i]['value'] + quoteEntry['fees'][i]['commission'], { locale: 'en-GB' });
                        }
                        vars['quoteTotalLegalFeesEx'] += quoteEntry['fees'][i]['value'] + quoteEntry['fees'][i]['commission'];
                        vars['quoteAdditionalCosts'].push({
                            'name'   : quoteEntry['fees'][i]['name'],
                            'amount' : currencyFormatter.format(quoteEntry['fees'][i]['value'], { locale: 'en-GB' })
                        });
                        break;
                    case FEE_CATEGORY_DISBURSEMENTS_ID:
                        vars['quoteDisbursements'].push({
                            'name'   : quoteEntry['fees'][i]['name'],
                            'amount' : currencyFormatter.format(quoteEntry['fees'][i]['value'], { locale: 'en-GB' })
                        });

                        totalDisbursement += quoteEntry['fees'][i]['value'];
                        break;
                    case FEE_CATEGORY_SERVICE_FEES_ID:
                        vars['quoteServiceFees'].push({
                            'name'   : quoteEntry['fees'][i]['name'],
                            'amount' : currencyFormatter.format(quoteEntry['fees'][i]['value'], { locale: 'en-GB' })
                        });
                        totalService += quoteEntry['fees'][i]['value'];
                        break;
                    default:
                        return Promise.reject('could not get fee category');
                }

                /*if (quoteEntry['fees'][i]['commission'] > 0) {
                    vars['quotePartPaymentAmountExVat'] += quoteEntry['fees'][i]['commission'];
                    vars['quotePartPaymentAmountIncVat'] += quoteEntry['fees'][i]['commission'] + quoteEntry['fees'][i]['commissionTax'];
                }*/

                switch (quoteEntry['fees'][i]['name']) {
                    case 'Stamp Duty':
                        vars['quoteSnapshotDisbursementStampDuty'] = quoteEntry['fees'][i]['total'];
                        vars['rawStampDuty'] = vars['quoteSnapshotDisbursementStampDuty'];
                        break;
                    case 'Land Registry Fee':
                        vars['quoteSnapshotDisbursementLandReg'] = quoteEntry['fees'][i]['total'];
                        vars['rawLandReg'] = vars['quoteSnapshotDisbursementLandReg'];
                        break;
                    case 'Search Pack':
                        vars['quoteSnapshotDisbursementSearchPack'] = quoteEntry['fees'][i]['total'];
                        vars['rawSearchPack'] = vars['quoteSnapshotDisbursementSearchPack'];
                        break;
                    default:
                        if (quoteEntry['fees'][i]['feeCategoryId'] == FEE_CATEGORY_DISBURSEMENTS_ID) {
                            otherDisbursements += quoteEntry['fees'][i]['value'];
                        }
                }

                if(_.get(quoteEntry['fees'][i], ['tax'])){
                    vat += quoteEntry['fees'][i]['tax'];
                }
            }

            vars['quotePartPayment'] = false;

            vars['rawFirmFees'] = vars['quoteTotalLegalFeesEx'];
            vars['rawFirmDisbursements'] = otherDisbursements;
            vars['rawFirmVat'] = vat;
            vars['rawFirmTotal'] = vars['quoteTotalLegalFeesEx'] + otherDisbursements + vat;
            vars['rawQuoteTotal'] = vars['quoteTotal'];

            vars['quoteOnlyLegalExVat']            = currencyFormatter.format(vars['quoteOnlyLegalExVat'], { locale: 'en-GB' });
            vars['quoteSnapshotDisbursementOther'] = currencyFormatter.format(otherDisbursements, { locale: 'en-GB' });
            vars['quoteTotalVat']                  = currencyFormatter.format(vat, { locale: 'en-GB' });
            vars['quoteSnapshotSubtotal']          = currencyFormatter.format(totalDisbursement + vat, { locale: 'en-GB' });
            vars['quoteAllDisbursementSubtotal']   = currencyFormatter.format(totalDisbursement, { locale: 'en-GB' });

            vars['quoteTotal'] = currencyFormatter.format(vars['quoteTotal'], { locale: 'en-GB' });
            vars['quoteTotalExVat']  = currencyFormatter.format(vars['quoteTotalLegalFeesEx'] + totalDisbursement + totalService, { locale: 'en-GB' });
            vars['quoteTotalIncVat'] = currencyFormatter.format(vars['quoteTotalLegalFeesEx'] + totalDisbursement + totalService + vat, { locale: 'en-GB' });
            vars['quoteTotalLegalFeesEx'] = currencyFormatter.format(vars['quoteTotalLegalFeesEx'], { locale: 'en-GB' });
            vars['quoteTotalServiceFee'] = currencyFormatter.format(totalService, { locale: 'en-GB' });

            vars['quoteTotalExcStampDutyIncVat'] = currencyFormatter.format(
                vars['quoteSnapshotLegalExVat'] +
                otherDisbursements +
                vars['quoteSnapshotDisbursementLandReg'] +
                vars['quoteSnapshotDisbursementSearchPack'] +
                vat
                , { locale: 'en-GB' });

            vars['quoteSnapshotLegalExVat'] = currencyFormatter.format(vars['quoteSnapshotLegalExVat'], { locale: 'en-GB' });
            vars['quoteSnapshotDisbursementLandReg'] = currencyFormatter.format(vars['quoteSnapshotDisbursementLandReg'], { locale: 'en-GB' });
            vars['quoteSnapshotDisbursementStampDuty'] = currencyFormatter.format(vars['quoteSnapshotDisbursementStampDuty'], { locale: 'en-GB' });
            vars['quoteSnapshotDisbursementSearchPack'] = currencyFormatter.format(vars['quoteSnapshotDisbursementSearchPack'], { locale: 'en-GB' });

            return vars;
        }

        let quoteDetails = {
            success : true,
            contact : quote.contacts[0],
            quoteTotal: 0,
            firmFees: 0,
            firmDisbursements: 0,
            firmVat: 0,
            firmTotal: 0,
            searchPack: 0,
            landReg: 0,
            stampDuty: 0,
            rawQuoteTotal: 0,
            rawFirmFees: 0,
            rawFirmDisbursements: 0,
            rawFirmVat: 0,
            rawFirmTotal: 0,
            rawSearchPack: 0,
            rawLandReg: 0,
            rawStampDuty: 0,
            cases : {
                transfer : false,
                remortgage : false,
                sale : false,
                purchase: false
            },
            quoteTypeString:false
        };

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
            quoteDetails.rawQuoteTotal += res.rawQuoteTotal;
            quoteDetails.rawFirmFees += res.rawFirmFees;
            quoteDetails.rawFirmDisbursements += res.rawFirmDisbursements;
            quoteDetails.rawFirmVat += res.rawFirmVat;
            quoteDetails.rawFirmTotal += res.rawFirmTotal;
            quoteDetails.rawSearchPack += res.rawSearchPack;
            quoteDetails.rawLandReg += res.rawLandReg;
            quoteDetails.rawStampDuty += res.rawStampDuty;
        }
        quoteDetails.quoteTotal = currencyFormatter.format(quoteDetails.rawQuoteTotal, { locale: 'en-GB' });
        quoteDetails.firmFees = currencyFormatter.format(quoteDetails.rawFirmFees, { locale: 'en-GB' });
        quoteDetails.firmDisbursements = currencyFormatter.format(quoteDetails.rawFirmDisbursements, { locale: 'en-GB' });
        quoteDetails.firmVat = currencyFormatter.format(quoteDetails.rawFirmVat, { locale: 'en-GB' });
        quoteDetails.firmTotal = currencyFormatter.format(quoteDetails.rawFirmTotal, { locale: 'en-GB' });
        quoteDetails.searchPack = currencyFormatter.format(quoteDetails.rawSearchPack, { locale: 'en-GB' });
        quoteDetails.landReg = currencyFormatter.format(quoteDetails.rawLandReg, { locale: 'en-GB' });
        quoteDetails.stampDuty = currencyFormatter.format(quoteDetails.rawStampDuty, { locale: 'en-GB' });

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
        description += ' conveyancing will be ' + quoteDetails.firmTotal + ' (including VAT). ';
        quoteText.push(description);

        if(quoteDetails.rawLandReg > 0 && quoteDetails.rawStampDuty > 0){
            quoteText.push("In addition there is a fee of " + quoteDetails.landReg + " (payable to the Land Registry) and Stamp Duty Land Tax of " + quoteDetails.stampDuty + " (payable to HM Revenue and Customs) when your transaction completes. ");
            quoteText.push("We will ask you to transfer funds to us to cover these costs prior to completion of your matter, and then pay them on your behalf. ");
        }
        else{
            if(quoteDetails.rawLandReg > 0){
                quoteText.push("In addition there is a fee of " + quoteDetails.landReg + " (payable to the Land Registry) when your transaction completes. ");
                quoteText.push("We will ask you to transfer funds to us to cover this fee prior to completion of your matter, and then pay it on your behalf. ");
            }
            if(quoteDetails.rawStampDuty > 0){
                quoteText.push("In addition there is Stamp Duty (SDLT) of " + quoteDetails.stampDuty + " (payable to HM Revenue and Customs) when your transaction completes. ");
                quoteText.push("We will ask you to transfer funds to us to cover this tax prior to completion of your matter, and then pay it on your behalf. ");
            }        
        }
        if(quoteDetails.rawSearchPack > 0){
            quoteText.push("Because you are buying a property with a mortgage, your mortgage lender will require that property searches are ordered too, and these will cost and additional " + quoteDetails.searchPack + ". ");
            quoteText.push("Depending on where your property is located, your lender may ask us to order some more searches which will cost extra (for example if your property is located in a Coal Mining area or their is a perceived Flood Risk). ");
        }
        if(quoteDetails.rawLandReg > 0 || quoteDetails.rawStampDuty > 0 || quoteDetails.rawSearchPack > 0){
            quoteText.push("In total, your conveyancing will therefore cost " + quoteDetails.quoteTotal + ". ");
        }
        quoteDetails.quoteText = quoteText,
        resolve(quoteDetails);
    });
}