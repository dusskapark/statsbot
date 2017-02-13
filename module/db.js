/**
 * 데이터베이스 관리용 모듈.
 * 
 */

const lowdb = require('lowdb');

var db = lowdb('./cert/db2.json');

function user() {
  this.users = db.get('users');

  /**
   * ID로 사용자 조회
   * 
   */
  this.findByID = function(id) {
    return this.users.find({
      id: id
    });
  }

  /**
   * 사용자 정보를 DB에 저장
   *
   */
  this.save = function(user) {
    __logger.info('user.js:save() :', user);

    this.findByID(user.id).assign(user).write();
  }

  return this;
}

/**
 * chatting 정보관리용 모듈.
 * 
 */

function chat() {
  this.chats = db.get('chats');

  /**
   * ID로 챗방 조회
   * 
   */
  this.findByID = function(source) {
    return this.chats.find(source.chatId);
  }

  /**
   * 챗방 정보를 DB에 저장
   *
   */
  this.save = function(authId, source) {
    __logger.info('chat.save()');
    __logger.debug('authId:', authId);
    __logger.debug('source:', source);

    var chat = this.findByID(source);
    if (chat) {
      return chat;
    }
    else {
      return this.findByID(source.chatId).assign({
        type: source.type,
        chatId: source.chatId,
        viewId: source.viewId,
        accountId: source.accountId,
        authId: authId
      }).write();
    }
  }
  
  return this;
}

module.exports = {
  user: user,
  chat: chat
};
