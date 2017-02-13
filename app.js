// 주요 library 초기화
const express = require('express');
const session = require('express-session');
const rp = require('request-promise');
const passport = require('passport');
const bodyParser = require('body-parser');
const path = require('path');
const lowdb = require('lowdb');
const log4js = require('log4js');

// 전역변수
global.__appRoot = path.resolve(__dirname);
global.__logger = log4js.getLogger();

var app = express();
app.use(session({ secret: 'statsbot', maxAge:null }));
app.use(passport.initialize());
app.use(passport.session());

var auth = require('./route/auth');
var webhook = require('./route/webhook');

app.use('/auth', auth);
app.use('/webhook', bodyParser.json(), webhook);
app.use('/public', express.static(global.__appRoot + '/public'));


app.listen(process.env.PORT, function() {
  console.log('Listening on port ' + process.env.PORT);
});
