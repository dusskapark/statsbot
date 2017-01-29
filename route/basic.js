const emotion = require('./sticker');
var stickersJSON = require("../cert/stickers/basic.json");
var _ = require("underscore");


module.exports.getBasicExpress = function() {

    var basicEmotion = emotion.basicSet;

    return [{
        "type": "text",
        "text": basicEmotion[Math.floor(Math.random() * basicEmotion.length)]
    }];

};


module.exports.getBasicCallback = function(message) {
    return [{
        "type": "text",
        "text": message
    }];
};


function getStickerSet(message) {


        var variable = _.findWhere(stickersJSON, {
            packageId: message.packageId
        });
        if (variable === undefined) {
            return null;
        }
        else {
            var sticker = _.findWhere(variable.stickers, {
                stickerId: message.stickerId
            });

            if (sticker === undefined) {

                return null;

            }
            else {
                delete sticker.stickerId;
                return sticker;
            }

        }
}

module.exports.getStickerSet = getStickerSet;

