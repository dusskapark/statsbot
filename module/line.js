const request = require('request');

const REPLY_URL = 'https://api.line.me/v2/bot/message/reply';
const PUSH_URL = 'https://api.line.me/v2/bot/message/push';

var config = require(__appRoot + '/cert/config.js');

var headers = {
  'Content-type': 'application/json',
  'Authorization': `Bearer ${config.line.CHANNEL_ACCESS_TOKEN}`
};

/**
 * webhook으로 들어온 메시지에 대해 응답(reply)
 * 
 */
function reply(replyToken, messages) {
  __logger.info(`line.reply(): replyToken = ${replyToken}, messages = ${messages}`)

  var options = {
    url: REPLY_URL,
    method: 'POST',
    headers: headers,
    resolveWithFullResponse: true,
    json: {
      replyToken: replyToken,
      messages: messages
    }
  };

  // return new pending promise
  return new Promise((resolve, reject) => {
    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        __logger.info('request sent');
        resolve(body);
      }
      else {
        reject(new Error('Failed to load page, status code: ' + response.statusCode));
      }
    });
  });
}

/**
 * 특정 수신자에게 메시지 발송
 * 
 */
function push(to, messages) {
  __logger.info(`line.push(): to = ${to}, messages = ${messages}`)

  var options = {
    url: PUSH_URL,
    method: 'POST',
    headers: headers,
    resolveWithFullResponse: true,
    json: {
      to: to,
      messages: messages
    }
  };

  // return new pending promise
  return new Promise((resolve, reject) => {
    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        __logger.info('request sent');
        resolve(body);
      }
      else {
        reject(new Error('Failed to load page, status code: ' + response.statusCode));
      }
    });
  });
}

module.exports = {
  reply : reply,
  push : push
};
