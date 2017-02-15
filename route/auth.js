const express = require('express');
const passport = require('passport');
const google = require('passport-google-oauth20').Strategy;
const cookieParser = require('cookie-parser');

const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/analytics.readonly'
];

var credentials = require('../config/credentials.json');
var logger = require('../module/logger');
var line = require('../module/line');
var db = require('../module/db');
var basic = require('../route/basic');

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

    db.user.save(user);

    done(null, {
      googleId: user.googleId,
      displayName: user.displayName
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
        
        if (isNa == undefined){
          req.session.source = source;
          next();  
        } else {
          res.send('<script>window.close()</script>');
          line.push(source.lineId, line.text("이 채팅방은 UA-" + isNa.gaAccountId + "에 이미 연동되고 있습니다."));
          
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
      db.chat.save(req.session.passport.user.googleId, req.session.source);
      
      res.send('<script>window.close()</script>');
      line.push(req.session.source.lineId, basic.getHelpExpress("Done! Welcome " + req.session.passport.user.displayName + "-san!"));
    });

    return router;
  }
