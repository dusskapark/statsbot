/**
 * 라인메신저로부터 오는 webhook을 처리하는 router 모듈
 * 
 */
 
const _ = require('lodash');
const apiaiPromise = require('apiai-promise');
const rp = require('request-promise');

var actionBasic = require('./basic'); // 명령어 모음
var actionHelp = require('./help'); // help 명령어
var logger = require('../module/logger');

const LOGIN_WELCOME_URL = `http://${process.env.C9_HOSTNAME}:${process.env.C9_PORT}/auth/welcome`;
const LOGIN_URL = `http://${process.env.C9_HOSTNAME}:${process.env.C9_PORT}/auth/google/login`;
const WARNING_MESSAGE = "======== Help ======== \n" +
  "잘못된 명령입니다. @h 또는 @help로 명령을 검색하십시오.\n" +
  "An invalid command. Search commands by @h or @help. \n" +
  "無効なコマンドです。 コマンドを@hまたは@helpで検索します。\n" +
  "=====================";

const routers = {
  sticker: {
    type: 'sticker',
    handler: stickerHandler
  },
  url: {
    type: 'text',
    regex: /^http(s?)/,
    handler: urlHandler
  },
  command: {
    type: 'text',
    regex: /^@([a-z]+)$/,
    handler: commandHandler
  }
};

var config = require('../cert/config');
var apiai = apiaiPromise(config.apiai.clientAccessToken);
var ga = require('../module/ga');
var line = require('../module/line');
var db = require('../module/db');

function webhook(req, res) {
  var eventObj = req.body.events[0];
  var message = eventObj.message;

  res.locals.source = eventObj.source;
  res.locals.replyToken = eventObj.replyToken;
  res.locals.message = message;

  // req log
  logger.info('webhook()');
  logger.debug('request :', req.body);
  logger.debug('source : ', res.locals.source);
  logger.debug('message : ', res.locals.message);

  var router = _.find(routers, function(o) {
    return o.type == message.type && (!message.text || message.text.match(o.regex));
  });
  if (router) {
    router.handler(req, res);
  }
}

module.exports = webhook;

// 스티커로 메시지가 들어오면 packageId, stickerId 를 기준으로 파악  'Step1:getQuery'
// (async) 검색결과가 null 이 아닐 경우, 스티커로 데이터 조회
function stickerHandler(req, res) {
  logger.info('stickerHandler()');
  var sticker_result = actionBasic.getStickerSet(res.locals.message);

  if (sticker_result !== null) {
    logger.debug('step1 :', sticker_result);

    // 목록에 있는 스티커면, quertData 로 그래프 png를 생성
    ga.getChart(res.locals.message.id, '제목', sticker_result)
      .then(chart => {
        // 생성된 png 파일을 LINE 용으로 wrapping
        logger.debug('step2');
        return actionBasic.getPlot(chart);
      }).then(plotReply => {
        // 봇에서 전송 
        logger.debug('step3: reply', plotReply);
        return line.reply(res.locals.replyToken, plotReply);
      }).then(function(res, body) {
        logger.debug('step4: body = ', body);
      }).catch(err => {
        logger.error(err);
      });
  }
  else {
    logger.error("error");
    line.reply(res.locals.replyToken, actionBasic.getBasicExpress());
  }
}

function urlHandler(req, res) {
  var url = res.locals.message.text;
  var source = res.locals.source;
  var sourceId = source.type + "Id";
  logger.debug('urlHandler(): url = ', url);
  
  // GA
  if (url.match(/analytics.google.com/)) {
    var params = url.replace(/.*a([0-9]+)/, '$1');
    var accountId = params.split('w')[0];
    var viewId = params.split('p')[1].split('/')[0];
    logger.debug('urlHandler(): ga = ', accountId, viewId);
    
    var authURL = `${LOGIN_URL}?type=${source.type}&id=${source[sourceId]}&account=${accountId}&view=${viewId}`;
    
    line.reply(res.locals.replyToken, actionBasic.getAuthTemplate(authURL));

  }
}

function commandHandler(req, res) {
  var cmd = res.locals.message.text.replace(/^@(.+)/, '$1');
  logger.debug('commandHandler(): cmd =', cmd);

  if (typeof cmd !== "undefined" && cmd != "") {
    if (cmd == "h" || cmd == "help") {
      line.reply(res.locals.replyToken, actionHelp.getHelpExpress());
    }
    else if (cmd == "auth") {
      line.reply(res.locals.replyToken, actionBasic.getBasicCallback(LOGIN_WELCOME_URL));
    }
    else {
      apiai.textreq(cmd, {
        sessionId: config.apiai.sessionId
      }).then(function(res) {
        var title = res.result.fulfillment.speech;
        var params = res.result.parameters;
        return ga.getChart(res.locals.message.id, title, params);
      }).then(res => {
        return actionBasic.getPlot(res);
      }).then(plotMessage => {
        return line.reply(res.locals.replyToken, plotMessage);
      }).then(res => {
        console.log('Step4: Remove files: ' + res);
        // actionBasic.delPlot(message.id);
      }).catch(err => console.error(err));
    }
  }
  else {
    line.reply(res.locals.replyToken, actionBasic.getBasicCallback(WARNING_MESSAGE));
  }
}
