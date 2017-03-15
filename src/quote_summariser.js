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

    let promise = new Promise(function(resolve, reject) {

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
            //console.log(quoteEntry);
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
                        vars['quoteSnapshotDisbursementStampDuty'] = currencyFormatter.format(quoteEntry['fees'][i]['total'], { locale: 'en-GB' });
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

            vars['quoteOnlyLegalExVat']            = currencyFormatter.format(vars['quoteOnlyLegalExVat'], { locale: 'en-GB' });
            vars['quoteSnapshotDisbursementOther'] = currencyFormatter.format(otherDisbursements, { locale: 'en-GB' });
            vars['quoteTotalVat']                  = currencyFormatter.format(vat, { locale: 'en-GB' });
            vars['quoteSnapshotSubtotal']          = currencyFormatter.format(totalDisbursement + vat, { locale: 'en-GB' });
            vars['quoteAllDisbursementSubtotal']   = currencyFormatter.format(totalDisbursement, { locale: 'en-GB' });

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
            vars['quoteSnapshotDisbursementSearchPack'] = currencyFormatter.format(vars['quoteSnapshotDisbursementSearchPack'], { locale: 'en-GB' });

            return vars;
        }

        let vars = {
            contact : quote.contacts[0],
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
                purchase: false,
            }
        };

        for (var i = 0, len = quote.quoteEntries.length; i < len; i++) {
            let entry = quote.quoteEntries[i];
            let res = summariseWork(entry);

            if(res.quoteCaseTypeId == WORK_TYPE_PURCHASE){
                vars.cases.purchase = res;
            }
            else if(res.quoteCaseTypeId == WORK_TYPE_SALE){
                vars.cases.sale = res;

            }
            else if(res.quoteCaseTypeId == WORK_TYPE_TRANSFER){
                vars.cases.transfer = res;
            }
            else if(res.quoteCaseTypeId == WORK_TYPE_REMORTGAGE){
                vars.cases.remortgage = res;
            }
            vars.rawFirmFees += res.rawFirmFees;
            vars.rawFirmDisbursements += res.rawFirmDisbursements;
            vars.rawFirmVat += res.rawFirmVat;
            vars.rawFirmTotal += res.rawFirmTotal;
            vars.rawSearchPack += res.rawSearchPack;
            vars.rawLandReg += res.rawLandReg;
            vars.rawStampDuty += res.rawStampDuty;
            //console.log(res);
        }

        resolve(vars);
    });
    return promise;
}