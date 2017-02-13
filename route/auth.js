const express = require('express');
const passport = require('passport');
const google = require('passport-google-oauth20').Strategy;
const cookieParser = require('cookie-parser');


const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/analytics.readonly'
];

var config = require('../cert/config');
var line = require('../module/line');
var db = require('../module/db');

/**
 * 메인 진입점.
 * route를 사용하기 위해 router를 그대로 리턴
 *
 */
function auth() {
  setupPassport();
  var router = setupRouter();
  return router;
}

module.exports = auth();

/**
 * Passport를 이용한 OAuth2 로그인 관련 로직 초기화
 *
 */
function setupPassport() {
  __logger.info('auth.js:setupPassport()');

  passport.use(
    new google({
        clientID: config.passportGoogle.web.client_id,
        clientSecret: config.passportGoogle.web.client_secret,
        callbackURL: "/auth/google/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        __logger.info('OAuth completed :', profile);

        profile.accessToken = accessToken;
        profile.refreshToken = refreshToken;

        return done(null, profile);
      }
    )
  );

  passport.serializeUser(function(user, done) {
    __logger.info('auth.js:serializeUser()');

    db.user.save(user);

    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    __logger.info('auth.js:deserializeUser()');
    done(null, id);
  });
}

/**
 * OAuth2 구현을 위한 안내화면 및 Callback 구현
 *
 */
function setupRouter() {
  __logger.info('route()');

  var router = express.Router();

  router.get('/welcome', function(req, res) {
    __logger.info('/auth/welcome');
    res.send(`
      <h1>링크를 눌러 로그인하라우</h1>
      <ul>
        <li><a href="google/login">Google</a></li>
      </ul>
    `);
  });

  // 로그인 시, 챗방id, 계정정보, 뷰 정보를 쿠키로 전달
  router.get('/google/login', function(req, res) {
    __logger.info('google oauth login()');

    var source = {
      type: req.query.type,
      chatId: req.query.id,
      accountId: req.query.account,
      viewId: req.query.view
    }

    res.cookie('chats', source);

    passport.authenticate('google', {
      scope: SCOPES,
      accessType: 'offline',
      approvalPrompt: 'force'
    })(req, res);
  });


  // router.get('/google/login', function(req, res) {
  //   __logger.info('google oauth login()');
  //   passport.authenticate('google', {
  //     scope: SCOPES,
  //     accessType: 'offline',
  //     approvalPrompt: 'force'
  //   })(req, res);
  // });

  router.get('/google/callback', [
    function(req, res, next) {
      // console.log(req);
      next();
    },
    passport.authenticate('google', {
      successRedirect: '/auth/finish',
      failureRedirect: '/auth/google/login'
    })]
  );

  router.get('/finish', function(req, res) {
    __logger.info('/auth/finish');
    res.send('<script>window.close()</script>');
  });

  return router;
}