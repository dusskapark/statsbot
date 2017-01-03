var gapi = require("googleapis");
var profileid = '106249323';
var key = require('../cert/nodejs-77d06e1a80af.json');
var scopes = 'https://www.googleapis.com/auth/analytics.readonly';
var jwt = new gapi.auth.JWT(key.client_email, null, key.private_key, scopes);

module.exports.getGAdata = jwt.authorize(function(err, request, response) {
    gapi.analytics('v3').data.ga.get({
        'auth': jwt,
        'ids': 'ga:' + profileid,
        'start-date': '7daysAgo',
        'end-date': 'today',
        'metrics': 'ga:'+ request
        // 'dimensions': 'ga:pagePath'
    }, function(err, result) {

        console.log(result);

    });
});

// let jwtClient = new google.auth.JWT(key.client_email, null, key.private_key, scopes, null);
// jwtClient.authorize(function(err, tokens) {
//     if (err) {
//         console.log(err);
//         return;
//     }
//     let analytics = google.analytics('v3');
//     queryData(analytics);
// });
//
// function queryData(analytics) {
//     analytics.data.ga.get({
//         'auth': jwtClient,
//         'ids': VIEW_ID,
//         'metrics': 'ga:uniquePageviews',
//         'dimensions': 'ga:pagePath',
//         'start-date': '30daysAgo',
//         'end-date': 'yesterday',
//         // 'sort': '-ga:uniquePageviews',
//         'max-results': 10,
//         // 'filters': 'ga:pagePath=~/ch_[-a-z0-9]+[.]html$',
//     }, function(err, response) {
//         if (err) {
//             console.log(err);
//             return;
//         }
//         console.log(JSON.stringify(response, null, 4));
//     });
// };
