// var gapi = require("googleapis");
// var key = require('../cert/nodejs-77d06e1a80af.json');
// var scopes = 'https://www.googleapis.com/auth/analytics.readonly';
// var jwt = new gapi.auth.JWT(key.client_email, null, key.private_key, scopes);

var site_id = 'onestore_app';
var rio = require('rio');
rio.enableDebug(false);

function queryData(id, message) {
    console.log('ga.js: queryData() - message = ' + JSON.stringify(message));
    
    return new Promise((resolve, reject) => {
        console.log('ga.js: before Promise(): dir = ' + process.cwd());
        rio.e({
            filename: "/home/ubuntu/workspace/gaplotr/plotr.R",
            entrypoint: 'getChart',
            data: { 
                "site_id": site_id, 
                "filename": id + '.png', 
                "type": message.type,
                "params": message.parameters
            },
            callback: function(err, res) {
                console.log('callback activiated: res = ' + res);
                if (!err) {
                    console.log(res);
                    resolve(res);
                } else {
                    console.log('error: ' + err);
                    reject(err);
                }
            }
        });
        console.log('ga.js: after Promise()');
    });
}


//  var message = {
//       "type": "line",
//       "metrics": ["ga:pageViews", "ga:newUsers"],
//       "dimensions": ["ga:pagePath", "ga:pageTitle"],
//       "start-date": "30daysAgo",
//       "end-date": "today",
//       "max-length": 10
//      };
    
// queryData('5562434846692', message);

module.exports.queryData = queryData;

