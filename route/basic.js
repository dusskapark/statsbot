const emotion = require('./sticker');
var stickersJSON = require("../cert/stickers/basic.json");
var _ = require("underscore");
var fs = require('fs');
var path = require("path");
var resize = require('im-resize');


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


module.exports.getStickerSet = function(message) {
  try {
    var pkg = _.findWhere(stickersJSON, {
      packageId: message.packageId
    });
    var sticker = _.findWhere(pkg.stickers, {
      stickerId: message.stickerId
    });
    return sticker;
  }
  catch (e) {
    console.log(e);
    return null;
  }
};




function getPlot(paths) {
  var image = {
    path: paths,

  };
  var output = {
    versions: [{
      suffix: '-thumb',
      maxHeight: 240,
      maxWidth: 240
    }]
  };


  return new Promise((resolve, reject) => {
    resize(image, output, function(err, versions) {
      if (err) {
        console.log('error: ' + err);
        reject(err);
      }
      else {


        var plot = [{
          "type": "image",
          "originalContentUrl": "https://statsbot-dusskapark.c9users.io/public/figure/" + path.parse(paths).base,
          "previewImageUrl": "https://statsbot-dusskapark.c9users.io/public/figure/" + path.parse(versions[0].path).base

        }];

        resolve(plot);
      }
    });


  });
}

module.exports.getPlot = getPlot;

function delPlot(id) {

  fs.unlink('/home/ubuntu/workspace/public/figure/' + id + '.png', (err) => {
    if (err) {
      console.log(err);
    }
    else {
      console.log('successfully deleted' + id + '.png');
    }
  }, 10000);

  fs.unlink('/home/ubuntu/workspace/public/figure/' + id + '-thumb.png', (err) => {
    if (err) {
      console.log(err);
    }
    else {
      console.log('successfully deleted thumb.png');

    }
  }, 10000);
}
module.exports.delPlot = delPlot;

// delPlot('001');

function getQurey(json) {
  // return new Promise((resolve, reject) => {
  var dateRange = json['date-period'].split('/');
  var dimensions = json['dimensions'];

  function dimensionsQuery(dimensions) {
    if (dimensions[0] === undefined) {
      var dimensionQuery = "ga:date";

      return dimensionQuery;
    }
    else {
      return dimensions;
    }
  }


  var query = {
    "type": json['chart-type'],
    "parameters": {
      "metrics": json['metrics'],
      "dimensions": dimensionsQuery(dimensions),
      "start-date": dateRange[0],
      "end-date": dateRange[1]
    }
  };


  return query;
}

// var test_text = {
//   "chart-type": "line",
//   "date-period": "30daysAgo",
//   "dimensions": [],
//   "dimensions-original": [],
//   "metrics": ["ga:pageviews"],
//   "metrics-original": ["pageviews"]
// }

// console.log(getQurey(test_text));

module.exports.getQuery = getQurey



function setLanguage(language) {

  var lang = {
    "type": "buttons",
    "title": language.title,
    "text": language.text,
    "actions": [{
      "type": "postback",
      "label": "Japanese",
      "data": "action=lang&lang=ja"
    }, {
      "type": "postback",
      "label": "English",
      "data": "action=lang&lang=en"
    }, {
      "type": "postback",
      "label": "Korean",
      "data": "action=lang&lang=ko"
    }]
  }

  return lang
}

module.exports.setLanguage = setLanguage;

// // 테스트 코드 
// var test_text = {
//   "language": {
// 	  "title": "Set your language",
// 	  "text": "Please let me know the language your prefer"
// 	}
// }

// console.log(JSON.stringify(setLanguage(test_text)));

function getHelp(language) {

  var help = {
    "type": "carousel",
    "columns": [{
      "thumbnailImageUrl": "https://statsbot-dusskapark.c9users.io/public/S__12279813.jpg",
      "title": language[0].title,
      "text": language[0].text,
      "actions": [{
        "type": "postback",
        "label": "Japanese",
        "data": "action=lang&lang=ja"
      }, {
        "type": "postback",
        "label": "English",
        "data": "action=lang&lang=en"
      }, {
        "type": "postback",
        "label": "Korean",
        "data": "action=lang&lang=ko"
      }]
    }, {
      "thumbnailImageUrl": "https://statsbot-dusskapark.c9users.io/public/S__12279814.jpg",
      "title": language[1].title,
      "text": language[1].text,
      "actions": [{
        "type": "message",
        "label": "Sample 01",
        "text": "@let me know pageviews and users per last month by page title"
      }, {
        "type": "message",
        "label": "Sample 02",
        "text": "@unique pageviews per last week  by pages"
      }, {
        "type": "uri",
        "label": "View detail",
        "uri": "https://youtu.be/ZKRBEyMgo_U"
      }]
    }, {
      "thumbnailImageUrl": "https://statsbot-dusskapark.c9users.io/public/S__12279815.jpg",
      "title": language[2].title,
      "text": language[2].text,
      "actions": [{
        "type": "uri",
        "label": "See how to video",
        "uri": "https://youtu.be/ZKRBEyMgo_U"
      },{
        "type": "uri",
        "label": "See our blog!",
        "uri": "https://youtu.be/ZKRBEyMgo_U"
      },{
        "type": "uri",
        "label": "Please contact us",
        "uri": "https://youtu.be/ZKRBEyMgo_U"
      }]
    }, {
      "thumbnailImageUrl": "https://statsbot-dusskapark.c9users.io/public/S__12279816.jpg",
      "title": language[3].title,
      "text": language[3].text,
      "actions": [{
        "type": "message",
        "label": "Do init!",
        "text": "@init"
      }, {
        "type": "message",
        "label": "Do modifiy!",
        "text": "@init"
      }, {
        "type": "message",
        "label": "Do edit!",
        "text": "@init"
      }]
    }]
  }


  return help;
}

module.exports.getHelp = getHelp;
