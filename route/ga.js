var gapi = require("googleapis");
var profileid = 'ga:106249323';
var key = require('../cert/nodejs-77d06e1a80af.json');
var scopes = 'https://www.googleapis.com/auth/analytics.readonly';
var jwt = new gapi.auth.JWT(key.client_email, null, key.private_key, scopes);


function queryData(message) {
    gapi.analytics('v3').data.ga.get({
        'auth': jwt,
        'ids': profileid,
        'metrics': 'ga:'+message,
        // 'dimensions': 'ga:pagePath',
        'start-date': '7daysAgo',
        'end-date': 'today',
        // 'sort': '-ga:uniquePageviews',
        'max-results': 10,
        // 'filters': 'ga:pagePath=~/ch_[-a-z0-9]+[.]html$',
    }, function(err, response) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(JSON.stringify(response, null, 4));
    });
};

module.exports.getGAdata = function(message){
    jwt.authorize(function(err, tokens) {
        if (err) {
            console.log(err);
            return;
            
        }
        
        queryData(message);
        
    });
}

