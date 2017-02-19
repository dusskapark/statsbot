/**
 * 데이터베이스 관리용 모듈.
 * 
 * - fileAsync를 이용해 async mode로 데이터를 관리함.
 * - 따라서 save()를 호출하는 쪽에서 then(), catch()를 구현해 주어야 함.
 */

const lowdb = require('lowdb');
const fileAsync = require('lowdb/lib/storages/file-async');

var logger = require('../module/logger');

var db = lowdb('./cache/db.json', {
  storage: fileAsync
});

function user() {
  var instance = {};

  instance.users = db.get('users');

  /**
   * ID로 사용자 조회
   * 
   */
  instance.findByID = function(id) {
    return instance.users.find({
      googleId: id
    }).value();
  }

  /**
   * 사용자 정보를 DB에 저장
   *
   */
  instance.save = function(user) {
    logger.info('user.js:save() :', user);

    var u = instance.users.find({
      googleId: user.googleId
    });

    return u.value() ? 
      u.assign(user).write() : 
      instance.users.push(user).last().write();
  }

  return instance;
}

/**
 * chatting 정보관리용 모듈.
 * 
 */

function chat() {
  var instance = {};

  instance.chats = db.get('chats');

  /**
   * ID로 챗방 조회
   * 
   */
  instance.findByID = function(id) {
    return instance.chats.find({
      lineId: id
    }).value();
  }

  /**
   * 챗방 정보를 DB에 저장
   *
   */
  instance.save = function(googleId, source) {
    logger.info('chat.save()');
    logger.debug('chat.js googleId:', googleId);
    logger.debug('chat.js source:', source);
  
    var chat = {
      type: source.type,
      lineId: source.lineId,
      gaViewId: source.gaViewId,
      gaAccountId: source.gaAccountId,
      googleId: googleId
    };
  
    var c = instance.chats.find({
      lineId: source.lineId
    });
  
    return c.value() ?
      c.assign(chat).write() :
      instance.chats.push(chat).last().write();
  }
  
  /**
   * 
   */
  instance.getLocale = function(id) {
    logger.debug('db.chat.getLocale(): chatid =', id);
    try {
      return instance.findByID(id).locale;
    } catch (err) {
      return 'en';
    }
  }
  
  /**
   * 채팅방 주사용언어 변경
   *
   */
  instance.changeLocale = function(lineId, locale) {
    logger.info('chat.changeLocale()');
    logger.debug('chat.js lineId:', lineId);
    logger.debug('chat.js locale:', locale);
    var c = instance.chats.find({
      lineId: lineId
    });
    
    c.value() ?
      c.assign({ locale: locale}).write() :
      instance.chats.push({ lineId: lineId, locale: locale}).last().write()
  }
  
  return instance;
}

module.exports = {
  user: user(),
  chat: chat()
};
