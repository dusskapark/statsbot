var firebase = require("firebase");

var firebaseConfig = {
    apiKey: "AIzaSyAclqh9yEefRg0tUCPR8wvX3YotXoGCj2U",
    authDomain: "line-stats-bot.firebaseapp.com",
    databaseURL: "https://line-stats-bot.firebaseio.com",
    storageBucket: "line-stats-bot.appspot.com"
//    messagingSenderId: "661617612438"
};


function getAuth(message) {
    // 나중에는 비동기가 될 것이므로... 이를 표현하기 위해 readFile 함수를 사용
    return new Promise(function(resolve, reject) {
        if (err) reject(err);
        else resolve(firebase.initializeApp(firebaseConfig));
    });

module.exports.getAuth = getAuth;