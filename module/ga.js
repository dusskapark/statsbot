/**
 * Google Analytics 관련 로직을 정리한 모듈
 * 
 * - 차트생성: getChart()
 * 
 */

const google = require('googleapis');
const rio = require('rio');
const spawn = require('child_process').spawn;

const RSERVER_SCRIPT = 'scripts/start_rserver.R';

var analytics = google.analytics('v3');
var config = require('../config/credentials');
var logger = require('../module/logger');
var db = require('../module/db');

var site_id = 'onestore_app';
rio.enableDebug(false);

/**
 * 차트를 생성해서 파일 경로를 리턴. 리턴타잎은 Promise
 *
 */
function getChart(ga_params, chart_params, query_params) {
  logger.info(`ga:getChart(): ${ga_params}, ${chart_params}, ${query_params}`);

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

/**
 * Rserve를 구동
 * 
 * - module/gaplotr/env.R을 읽어들이고 Rscript process를 그대로 Rserve로 전환
 * - child process의 STDOUT과 STDERR를 node로 연결
 */
function runServer() {
  logger.info('ga:runServer()');
  
  var workdir = global.__appRoot + '/cache/Rserve';
  var envfile = global.__appRoot + '/module/gaplotr/env.R';
  var rscript = `library(Rserve); source('${envfile}'); run.Rserve(workdir = '${workdir}')`;

  try {
    var child = spawn('/usr/bin/Rscript', ['-e', rscript]);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  } catch (err) {
    logger.error('ga:runServer() error, ', err);
  }
}

module.exports = {
  getChart: getChart,
  runServer: runServer
};

function getViewID(params) {
  // console.log('here: ' + JSON.stringify(params));
  return new Promise(function(resolve, reject) {

    var oauth2Client = new google.auth.OAuth2(
      config.google.web.client_id,
      config.google.web.client_secret, 
      '');

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
