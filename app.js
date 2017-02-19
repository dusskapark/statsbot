// 주요 library 초기화
const express = require('express');
const session = require('express-session');
const sessionFileStore = require('session-file-store')(session);
const requestId = require('express-request-id');
const passport = require('passport');
const bodyParser = require('body-parser');
const i18n = require('i18n');
const path = require('path');

// 전역변수
global.__appRoot = path.resolve(__dirname);

i18n.configure({
  locales: ['en', 'ja', 'ko'],
  directory: __dirname + '/locales',
  register: global //global 단위의 레지스터
});

var app = express();
app.use(session({
  store: new sessionFileStore({
    path: './cache/sessions'
  }),
  secret: 'statsbot',
  resave: false,
  saveUninitialized: false,
  maxAge: null
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(i18n.init);

var logger = require('./module/logger');
var ga = require('./module/ga');
var auth = require('./route/auth');
var webhook = require('./route/webhook');

ga.runServer();

app.use('/auth', auth);
app.use('/webhook', bodyParser.json(), webhook);
app.use('/public', express.static('./public'));

app.listen(process.env.PORT, function() {
  logger.info('Listening on port ', process.env.PORT);
});
