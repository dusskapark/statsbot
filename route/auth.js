const express = require('express');
const passport = require('passport');
const google = require('passport-google-oauth20').Strategy;
const i18n = require('i18n');
const actionBasic = require('./basic'); // 명령어 모음


const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/analytics.readonly'
];

var credentials = require('../config/credentials.json');
var logger = require('../module/logger');
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
  logger.info('auth.js:setupPassport()');

  passport.use(
    new google({
        clientID: credentials.google.web.client_id,
        clientSecret: credentials.google.web.client_secret,
        callbackURL: '/auth/google/callback'
      },
      function(accessToken, refreshToken, profile, done) {
        logger.info('OAuth completed');
        logger.debug('profile = ', profile);

        var user = {
          googleId: profile.id,
          displayName: profile.displayName,
          accessToken: accessToken,
          refreshToken: refreshToken
        };

        return done(null, user);
      }
    )
  );

  passport.serializeUser(function(user, done) {
    logger.info('auth.js:serializeUser(): ', user);

    db.user.save(user).then(user => {
      logger.info('then(): ', user);
      done(null, {
        googleId: user.googleId,
        displayName: user.displayName
      });
    }).catch(err => {
      done(err, null);
    });
  });

  passport.deserializeUser(function(user, done) {
    logger.info('auth.js:deserializeUser()');
    done(null, {
      googleId: user.googleId,
      displayName: user.displayName
    });
  });
}

/**
 * OAuth2 구현을 위한 안내화면 및 Callback 구현
 *
 */
function setupRouter() {
  logger.info('route()');

  var router = express.Router();

  router.get('/welcome', function(req, res) {
    logger.info('/auth/welcome');
    res.send(`
      <h1>링크를 눌러 로그인하라우</h1>
      <ul>
        <li><a href="google/login">Google</a></li>
      </ul>
    `);
  });

  // 로그인 시, 챗방id, 계정정보, 뷰 정보를 쿠키로 전달
  // 이미 연결된 lineId가 있는 경우, Stop
  router.get('/google/login', function(req, res, next) {

      var source = {
        type: req.query.type,
        lineId: req.query.id,
        gaAccountId: req.query.account,
        gaViewId: req.query.view
      };

      var isNa = db.chat.findByID(source.lineId);
      logger.info('google oauth login()', isNa);

      if (isNa == undefined) {
        req.session.source = source;
        next();
      }
      else {
        res.send('<script>window.close()</script>');
        line.push(source.lineId, line.text(__('Already added GA account: UA-%s', isNa.gaAccountId)));
      }
    },
    passport.authenticate('google', {
      scope: SCOPES,
      accessType: 'offline',
      prompt: 'consent'
    })
  );

  router.get('/google/callback',
    passport.authenticate('google', {
      successRedirect: '/auth/finish',
      failureRedirect: '/auth/google/login'
    })
  );

  router.get('/finish', function(req, res) {
    logger.info('/auth/finish');
    logger.debug('source revived in session:', req.session.passport.user.googleId, req.session.source);

    // 채팅방의 정보를 저장한다. 
    db.chat.save(
        req.session.passport.user.googleId,
        req.session.source)
      .then(chat => {
        res.send('<script>window.close()</script>');
        line.push(chat.lineId, line.text(__("Auth completed! Welcome," + req.session.passport.user.displayName)));
        line.push(chat.lineId, line.template(__("Set language"), actionBasic.setLanguage(__("language"))));

      })
      .catch(err => {
        logger.error('Error in writing chat', err);
      })
  });
  
  return router;
}
