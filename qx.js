'use strict';

//const req = require('request');

const requestPromise = require('minimal-request-promise');
const buildQuote = require('./src/build_quote');

module.exports = function qx(contact,quoteEntries) {

    let pass = 'some user' + ":" + 'some password';
    let hostname = 'hostname';
    let campaignId = 'some campaign id';

    return buildQuote(contact,quoteEntries)
        .then(function (body){

            var options = {
                method: 'POST',
                hostname: hostname,
                path: '/api/1/quotes.json',
                port: 443,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + pass
                }
            };

            body.campaignId = campaignId;
            options.body = JSON.stringify(body);

            return requestPromise(options);

        }, function (err) {
            console.error(err);
        })
        .then(function (response) {
            console.log('got response', response.body, response.headers);
            //parse the quote data
            return response.body;
        }, function (error) {
            console.log(error);
            console.log('got error', error.body, error.headers, error.statusCode, error.statusMessage, error.errors);
        })
        .catch(function (error) {
            console.error(error);
            return 'An error occurred';
        });
};