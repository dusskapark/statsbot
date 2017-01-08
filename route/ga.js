var gapi = require("googleapis");
var profileid = 'ga:106249323';
var key = require('../cert/nodejs-77d06e1a80af.json');
var scopes = 'https://www.googleapis.com/auth/analytics.readonly';
var jwt = new gapi.auth.JWT(key.client_email, null, key.private_key, scopes);



function queryData(message) {

    message["auth"] = jwt;
    message["ids"] = profileid;
    
    return new Promise((resolve, reject) => {
        gapi.analytics('v3').data.ga.get(message, function(err, response) {
            if (err) {
                reject(err);
                return;
            } else {
                resolve(response);
            }
        });
    });
};

// var msg = { metrics: [ 'ga:pageViews', 'ga:newUsers' ],
//   'start-date': '30daysAgo',
//   'end-date': 'today' }

// queryData(msg).then(x => {
//     console.log(x);
// }).catch(err => console.error(err));

module.exports.queryData = queryData

module.exports.getGAdata = function(message){
    jwt.authorize(function(err, tokens) {
        if (err) {
            console.log(err);
            return;
            
        }
        
        queryData(message);
        
    });
}

