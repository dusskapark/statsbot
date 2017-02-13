/**
 * 
 * 
 */

const log4js = require('log4js');

log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'logs/statsbot.log' }
  ]
});

var logger = log4js.getLogger();

module.exports = logger;