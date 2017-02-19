/**
 * 라인 API를 이용해 메시지를 보내고, API용 메시지를 가공하는 모듈
 * 
 */

const rp = require('request-promise');
const path = require('path');

const REPLY_URL = 'https://api.line.me/v2/bot/message/reply';
const PUSH_URL = 'https://api.line.me/v2/bot/message/push';

var credentials = require('../config/credentials.json');
var logger = require('../module/logger');
var util = require('../module/util');
var figure = require('../module/figure');

var headers = {
  'Content-type': 'application/json',
  'Authorization': `Bearer ${credentials.line.CHANNEL_ACCESS_TOKEN}`
};

/**
 * webhook으로 들어온 메시지에 대해 응답(reply)
 * 
 */
function reply(replyToken, messages) {
  logger.info(`line.reply(): replyToken = ${replyToken}, messages = ${messages}`);

  return messages
    .then(messages => rp({
      url: REPLY_URL,
      method: 'POST',
      headers: headers,
      resolveWithFullResponse: true,
      json: {
        replyToken: replyToken,
        messages: messages
      }
    }));
}

/**
 * 특정 수신자에게 메시지 발송
 * 
 */
function push(to, messages) {
  logger.info(`line.push(): to = ${to}, messages = ${messages}`);

  return messages.then(messages => rp({
    url: PUSH_URL,
    method: 'POST',
    headers: headers,
    resolveWithFullResponse: true,
    json: {
      to: to,
      messages: messages
    }
  }));
}

/**
 * 텍스트 메시지 포맷
 *
 */
function text(body) {
  return new Promise(function(resolve, reject) {
    resolve([{
      "type": "text",
      "text": body
    }]);
  });
}

/**
 * 템플릿 메시지 포맷
 *
 */
function template(altMessage, body) {
  return new Promise(function(resolve, reject) {
    
    resolve([{
      "type": "template",
      "altText": altMessage,
      "template": body
    }]);
  });
}


/**
 * 이미지 메시지 포맷
 *
 */
function image(file) {
  return new Promise(function(resolve, reject) {
    figure.createThumbnail(file)
      .then(thumb => resolve([{
        "type": "image",
        "originalContentUrl": util.url_https(`/public/figure/${path.basename(file)}`),
        "previewImageUrl": util.url_https(`/public/figure/${path.basename(thumb)}`)
      }]));
  });
}

module.exports = {
  reply: reply,
  push: push,
  text: text,
  template: template,
  image: image
};
