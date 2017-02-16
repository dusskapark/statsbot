/**
 * Google Analytics 관련 로직을 정리한 모듈
 * 
 * - 차트생성: getChart()
 * 
 */

const google = require('googleapis');
const rio = require('rio');

var logger = require('../module/logger');
var db = require('../module/db');

var site_id = 'onestore_app';
rio.enableDebug(false);

/**
 * 차트를 생성해서 파일 경로를 리턴. 리턴타잎은 Promise
 *
 */
function getChart(ga_params, chart_params, query_params) {
  logger.info('getChart(): message = ', query_params);

  return new Promise((resolve, reject) => {
    rio.e({
      filename: global.__appRoot + "/module/gaplotr/from_node.R",
      entrypoint: 'generateChart',
      data: {
        "ga_params": ga_params,
        "chart_params": chart_params,
        "query_params": query_params
      },
      callback: function(err, res) {
        if (!err) {
          logger.debug('chart generated: ', res);
          resolve(res);
        }
        else {
          logger.error('chart generation error', err);
          reject(err);
        }
      }
    });
  });
}

module.exports.getChart = getChart;

function getViewID(params) {
  // console.log('here: ' + JSON.stringify(params));
  return new Promise(function(resolve, reject) {

    var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

    oauth2Client.setCredentials({
      access_token: params.accessToken
    });

    analytics.management.accounts.list({
      auth: oauth2Client
    }, function(err, response) {
      if (err) {
        reject(err);
      }
      else {
        resolve(response);
      }
    });
  });
}
