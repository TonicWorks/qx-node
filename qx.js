'use strict';

const _ = require('lodash');
const urllib = require('url');
const requestPromise = require('minimal-request-promise');
const buildQuote = require('./src/build_quote');
const summariseQuote = require('./src/quote_summariser');

function credentialsToRequestOptions(credentials) {

    if (credentials.url) {
        const url = urllib.parse(credentials.url);
        return {
            hostname: url.hostname,
            path:     url.pathname,
            port:     url.port,
            protocol: url.protocol,

            headers:  {
                'Content-Type':  'application/json',
                'Authorization': 'Basic ' + new Buffer(credentials.pass).toString('base64')
            },
        }
    } else {
        return {
            hostname: credentials.hostname,
            path:     '',
            port:     443,

            headers:  {
                'Content-Type':  'application/json',
                'Authorization': 'Basic ' + new Buffer(credentials.pass).toString('base64')
            },
        }
    }
}

module.exports = {

    addQuote:      function (credentials, contact, quoteEntries, sessionId) {

        return buildQuote(contact, quoteEntries)
            .then(function (body) {

                var options = {
                    method:  'POST',
                };

                Object.assign(options, credentialsToRequestOptions(credentials));
                options.path += '/api/1/quotes.json';

                //optional session id so that qx can reference back to other systems - qx needs to be extended to accept it before we can start sending it
                /*if(!_.isEmpty(sessionId)){
                    body.sessionId = sessionId;
                }*/
                body.campaignId = credentials.campaignId;
                if (credentials.extraParams) {
                    body = Object.assign(body, credentials.extraParams);
                }
                //console.log('body is now',JSON.stringify(body));
                options.body = JSON.stringify(body);
                //console.log('options are now',JSON.stringify(options));
                return requestPromise(options);

            }, function (err) {
                console.error('error building quote', err);
                return { success: false };
            })
            .then(function (response) {
                console.log('quote is ok')
                console.log('response is ', response.body);
                let body = JSON.parse(response.body);
                //console.log('quote is ', body);
                if (_.get(body, ['quoteId']) && _.get(body, ['hash'])) {
                    let resp = {
                        success: true,
                        quoteId: body.quoteId,
                        hash:    body.hash
                    }
                    return Promise.resolve(resp);
                }
                else {
                    return { success: false };
                }
            }, function (error) {
                console.log('got error', error.body, error.headers, error.statusCode, error.statusMessage);
                return { success: false };
            })
        /*.then(function(res) {
            return res;
        }, function (error) {
            console.log('got error', error);
            return {success:false};
        });*/
    },
    retrieveQuote: function (credentials, hash) {

       let options = {
            method: 'GET',
        };

        Object.assign(options, credentialsToRequestOptions(credentials));
        options.path += '/api/1/quotes/' + hash + '.json';

        return requestPromise(options)
            .then(function (response) {
                let body = JSON.parse(response.body);
                //console.log('quote is ', body);
                if (_.get(body, ['quoteId'])) {
                    return summariseQuote(body);
                }
                else {
                    return { success: false };
                }
            }, function (error) {
                console.log('got error', error.body, error.headers, error.statusCode, error.statusMessage);
                return { success: false };
            })
            .then(function (res) {
                return res;
            }, function (error) {
                console.log('got error', error);
                return { success: false };
            });
    }
};