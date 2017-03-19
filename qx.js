'use strict';

//const req = require('request');
const _ = require('lodash');
const requestPromise = require('minimal-request-promise');
const buildQuote = require('./src/build_quote');
const summariseQuote = require('./src/quote_summariser');

module.exports = {

    addQuote: function(credentials,contact,quoteEntries,sessionId){

        return buildQuote(contact,quoteEntries)
            .then(function (body){

                var options = {
                    method: 'POST',
                    hostname: credentials.hostname,
                    path: '/api/1/quotes.json',
                    port: 443,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': "Basic " + new Buffer(credentials.pass).toString("base64")
                    }
                };
                //optional session id so that qx can reference back to other systems
                if(!_.isEmpty(sessionId)){
                    body.sessionId = sessionId;
                }
                body.campaignId = credentials.campaignId;
                console.log('body is ',body);
                options.body = JSON.stringify(body);

                return requestPromise(options);

            }, function (err) {
                console.error(err);
            })
            .then(function (response) {
                let body = JSON.parse(response.body);
                console.log('quote is ', body);
                if(_.get(body, ['quoteId']) && _.get(body, ['hash'])){
                    let resp = {
                        success : true,
                        quoteId : body.quoteId,
                        hash : body.hash
                    }
                    return resp;
                }
                else{
                    return {success:false};
                }
            }, function (error) {
                console.log('got error', error.body, error.headers, error.statusCode, error.statusMessage);
            })
            .then(function(res) {
                return res;
            }, function (error) {
                console.log('got error', error);
            });
    },
    retrieveQuote: function(credentials,hash){

            var options = {
                method: 'GET',
                hostname: credentials.hostname,
                path: '/api/1/quotes/' + hash + '.json',
                port: 443,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Basic " + new Buffer(credentials.pass).toString("base64")
                }
            };

            return requestPromise(options)
            .then(function (response) {
                let body = JSON.parse(response.body);
                //console.log('quote is ', body);
                if(_.get(body, ['quoteId'])){
                    return summariseQuote(body);
                }
                else{
                    return {success:false};
                }
            }, function (error) {
                console.log('got error', error.body, error.headers, error.statusCode, error.statusMessage);
            })
            .then(function(res) {
                return res;
            }, function (error) {
                console.log('got error', error);
            });
    }
};