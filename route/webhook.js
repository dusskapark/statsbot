/**
 * 라인메신저로부터 오는 webhook을 처리하는 router 모듈
 * 
 */

const _ = require('lodash');
const apiaiPromise = require('apiai-promise');
const i18n = require('i18n');
const querystring = require('querystring');

var actionBasic = require('./basic'); // 명령어 모음
var logger = require('../module/logger');
var db = require('../module/db');
var util = require('../module/util');

const LOGIN_WELCOME_URL = util.url_node('/auth/welcome');
const LOGIN_URL = util.url_node('/auth/google/login');

var credentials = require('../config/credentials.json');
var apiai = apiaiPromise(credentials.apiai.client_access_token);
var ga = require('../module/ga');
var line = require('../module/line');
var db = require('../module/db');

function webhook(req, res) {
  var event = getEvent(req);
  var source = getSource(req);
  var replyToken = getReplyToken(req);
  var message = getMessage(req);

  // req log
  logger.info('webhook()');
  logger.debug('request :', req.body);
  logger.debug('source : ', source);
  logger.debug('message : ', message);

  // setting locale
  try {
    i18n.setLocale(db.chat.getLocale(getChatId(source)));
  } catch (err) {
    i18n.setLocale('en');
  }

  switch (getEventType(req)) {
    case 'postback':
      var data = event.postback.data;
      postbackHandler(source, replyToken, data);
      break;
    case 'message':
      switch (message.type) {
        case 'sticker':
          stickerHandler(source, replyToken, message);
          break;
        case 'text':
          if (message.text.match(/^http(s?)/)) {
            urlHandler(source, replyToken, message.text);
          }
          else if (message.text.match(/^@[a-z ]+/)) {
            commandHandler(source, replyToken, message);
          }
          break;
      }
  }
}

module.exports = webhook;

function chatCheck(source) {
  // 등록된 챗방인지 확인하는 모듈 
  var checked = db.chat.findByID(getChatId(source));
  logger.debug('chat :', checked);
  if (checked == null) {
    logger.info("No auth history for ", source);
    return null;
  }
  else {
    return checked;
  }
}

/**
 * 이벤트가 Postback 형태로 들어오는 메시지에 대한 응답처리 handler
 *
 */
function postbackHandler(source, replyToken, data) {
  logger.info('postbackHandler()', data);

  var queries = querystring.parse(data);
  var action = queries.action;
  logger.info('action :', action);


  if (action == "lang") {
    var lang = queries.lang;
    db.chat.changeLocale(getChatId(source), lang);
    i18n.setLocale(lang);

    line.reply(replyToken, line.text(__("Language changed to %s", __(lang))));
  }
  else {
    logger.info('Postback queries: ', queries);
  }


}


// 스티커로 메시지가 들어오면 packageId, stickerId 를 기준으로 파악  'Step1:getQuery'
// (async) 검색결과가 null 이 아닐 경우, 스티커로 데이터 조회
/**
 * 스티커 형태로 들어오는 메시지에 대한 응답처리 handler
 *
 */
function stickerHandler(source, replyToken, message) {
  logger.info('stickerHandler()');
  var params = actionBasic.getStickerSet(message);

  // 사전 정의된 스티커가 아닌 경우
  if (params == null) {
    logger.error("Undefined sticker");
    // 등록되지 않은 스티커가 들어오면 null 을 return
    // line.reply(replyToken, line.text(__("Unregistered sticker")));

    return;
  }

  logger.debug('step1 :', params);

  var chat = chatCheck(source);
  logger.debug("chatCheck: ", chat);
  //  채팅 방이 등록된 것이 있는지 
  if (chat != null) {
    var user = db.user.findByID(chat.googleId);
    logger.debug('user :', user);

    // 목록에 있는 스티커면, quertData 로 그래프 png를 생성
    var promise = ga.getChart({
        site_name: 'onestore_app',
        view_id: chat.gaViewId,
        access_token: user.accessToken,
        refresh_token: user.refreshToken
      }, {
        title: params.title,
        type: params.type,
        lang: i18n.getLocale(),
        filename: `${message.id}.png`
      },
      params.query);

    promise
      .then(figure => {
        line.reply(replyToken, line.image(figure));

      })
      .catch(err => {
        logger.error(err);
        line.reply(replyToken, line.text(`R server error: ${err}`));
      });
  }
  else {
    line.reply(replyToken, line.text(__("No auth token")));
  }


}

/**
 * URL 메시지에 대한 응답처리 handler
 * 
 */
function urlHandler(source, replyToken, url) {
  var sourceId = getChatId(source);
  logger.debug('urlHandler(): url = ', url);

  // GA
  if (url.match(/analytics.google.com/)) {
    var params = url.replace(/.*a([0-9]+)/, '$1');
    var accountId = params.split('w')[0];
    var viewId = params.split('p')[1].split('/')[0];
    logger.debug('urlHandler(): ga = ', accountId, viewId);

    var authURL = `${LOGIN_URL}?type=${source.type}&id=${sourceId}&account=${accountId}&view=${viewId}`;

    var tempURL = {
      "type": "carousel",
      "columns": [{
        "thumbnailImageUrl": util.url_https("https://statsbot-dusskapark.c9users.io/public/S__12279816.jpg"),
        "title": "Google Auth",
        "text": "Please sign in your Google Analytics",
        "actions": [{
          "type": "uri",
          "label": "Google Login",
          "uri": authURL
        }]
      }]
    }

    line.reply(replyToken, line.template(authURL, tempURL));
  }
}

/**
 * @help 형태의 명령어 메시지에 대한 응답처리 handler
 *
 */
function commandHandler(source, replyToken, message) {
  var tokens = message.text.substring(1).split(' ');
  var cmd = tokens.shift();

  logger.debug('commandHandler(): cmd =', cmd);

  if (typeof cmd == "undefined" || cmd == "") return;

  switch (cmd) {
    case 'h':
    case 'help':
      logger.info('Help command activated');
      
      var language = [__("language"), __("howto"), __("add"), __("init")];
      logger.debug(actionBasic.getHelp(language));
      line.reply(replyToken, line.template(__("Help message"), actionBasic.getHelp(language)));
      
      // line.reply(replyToken, line.text(__("Help message")));
      break;
      
    case 'lang':
      logger.info('1) Modified language setting');
      if (!tokens[0]) {
        line.reply(replyToken, line.template(__("Set language"), actionBasic.setLanguage(__("language"))));
      }
      else {
        db.chat.changeLocale(getChatId(source), tokens[0]);
        i18n.setLocale(tokens[0]);

        line.reply(replyToken, line.text(__("Language changed to %s", __(tokens[0]))));
      }
      break;
      
    case 'add':
      line.reply(replyToken, line.text(LOGIN_WELCOME_URL));
      break;
      
    default:
      var chat = chatCheck(source);
      logger.debug("chatCheck: ", chat);
      
      //  채팅 방이 등록된 것이 있는지 
      if (chat != null) {
        var user = db.user.findByID(chat.googleId);
        
        
        apiai.textRequest(message.text, {
            sessionId: credentials.apiai.session_id
          }).then(res => {
            var params = actionBasic.getQuery(res.result.parameters);
            logger.debug('api.ai(): params =', params);
            
            var ga_params = {
              site_name: 'onestore_app',
              view_id: chat.gaViewId,
              access_token: user.accessToken,
              refresh_token: user.refreshToken
            };
            
            logger.debug('ga_params =', ga_params);

            var chart_params = {
              title: res.result.fulfillment.speech,
              type: params.type,
              lang: i18n.getLocale(),
              filename: `${message.id}.png`
            };
            
            logger.debug('chart_params =', chart_params);

            return ga.getChart(ga_params, chart_params, params.parameters);
          })
          .then(figure => {
            line.reply(replyToken, line.image(figure));

          })
          .catch(err => {
            logger.error(err);
            line.reply(replyToken, line.text(`R server error: ${err}`));
          });
      }
      else {
        line.reply(replyToken, line.text(__("No auth token")));
      }
  }
}


function getEvent(req) {
  return req.body.events[0];
}

function getSource(req) {
  return req.body.events[0].source;
}

function getChatId(source) {
  return source[source.type + 'Id'];
}

function getMessage(req) {
  return req.body.events[0].message;
}

function getReplyToken(req) {
  return req.body.events[0].replyToken;
}

function getEventType(req) {
  return req.body.events[0].type;
}
