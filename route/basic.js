const emotion = require('./sticker');

module.exports.getBasicExpress = function () {

    var basicEmotion = emotion.basicSet;
    
    return [{
        "type": "text",
        "text": basicEmotion[Math.floor(Math.random() * basicEmotion.length)]
    }];

};


module.exports.getBasicCallback = function (message) {
    return [{
        "type": "text",
        "text": message
    }];
};