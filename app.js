var express = require('express');
var bodyParser = require('body-parser');
var config = require('./cert/config.js');
var fs = require('fs');
var firebase = require("firebase");
var firebaseConfig = require('./cert/firebase');

// const translate = require('./route/translate'); // 메시지를 분석하고 구글 번역기를 돌립니다.
const apiai = require('./route/apiai'); // 메시지를 json 으로 만듦
const ga = require('./route/ga'); // GA에 명령어를 보내고 데이터를 수신합니다.
const template = require('./route/template'); // 데이터를 그래프나 테이블로 바꿉니다.
const reply = require('./route/reply'); // 최종적으로 메시지를 콜백합니다.
const actionBasic = require('./route/basic'); // 명령어 모음
const actionHelp = require('./route/help'); // help 명령어


// 서버 시작
var app = express();
app.use('/public', express.static(__dirname + '/public'));
app.set('views', './views'); // 템플릿은 여기에 저장함
app.set('view engine', 'jade');


app.set('port', process.env.PORT || 3030);
app.use(bodyParser.json());

app.get('/webhook', function(reqeust, response) {
    response.writeHead(200, {
        'Content-Type': 'text/html'
    });
    response.end('<a href="https://github.com/dusskapark/statsbot">See you on Github</a>');
});

// ID 파라미터를 달고 들어오는 경우,
// app.get('/:id', function(req, res) {
//     var id = req.params.id;
//     console.log('here' + id);
//     fs.readFile('data/' + id + '.json', 'utf8', function(err, data) {
//         if (err) {
//             console.log(err);
//             res.status(500).send('Internal Server Error');
//         }
//         // res.send(data);
//         res.render('view', {
//             title: "타이틀은 뭘 줘야하나?",
//             type: "barchart", // 차트 타입을 정합니다.
//             json: data

//         });
//     });
// });

function getAuth(message) {
    // 나중에는 비동기가 될 것이므로... 이를 표현하기 위해 readFile 함수를 사용
    return new Promise((resolve, reject) => {
        firebase.initializeApp(firebaseConfig, function(err, response) {
            if (err) {
                reject(err);
                return;
            }
            else {
                resolve(response);
            }
        });
    });
}


app.post('/webhook', function(request, response) {

    var eventObj = request.body.events[0];
    var source = eventObj.source;
    var message = eventObj.message;

    // request log
    console.log('======================', new Date(), '======================');
    console.log('[request]', request.body);
    console.log('[request source] ', eventObj.source);
    console.log('[request messages]', eventObj.message);

    if (message.type == "sticker") {

        // 스티커로 메시지가 들어오면 packageId, stickerId 를 기준으로 파악  'Step1:getQuery'
        // (async) 검색결과가 null 이 아닐 경우, 스티커로 데이터 조회

        var sticker_result = JSON.stringify(actionBasic.getStickerSet(message));

        if (sticker_result !== "null") {

            console.log('Step1:getQuery', sticker_result);

            // 목록에 있는 스티커면, quertData 로 그래프 png를 생성
            ga.queryData(message.id, JSON.parse(sticker_result))
                .then(response => {
                    // 생성된 png 파일을 LINE 용으로 wrapping
                    console.log('Step2:get Plots');
                    return template.getPlot(response);
                }).then(response => {
                    // 봇에서 전송 
                    console.log('Step3:sendReply', response);
                    return reply.send(config.CHANNEL_ACCESS_TOKEN, eventObj.replyToken, response);

                }).then(response => {
                    console.log('Step4: Remove files');
                    template.delPlot(message.id);

                }).catch(err => {
                    console.log('error = ' + err)
                });
        }
        else {
            console.log("error");
            reply.send(config.CHANNEL_ACCESS_TOKEN, eventObj.replyToken, actionBasic.getBasicExpress());

        }


    }
    else if (message.type == "text" && message.text.indexOf("@bot") != -1) {

        // // 로그인 여부 판단 
        // console.log('here');
        // firebase.initializeApp(firebaseConfig);

        // var google = new firebase.auth.GoogleAuthProvider();
        // firebase.auth().signInWithPopup(google);


        // 이미 로그인이 된 상태라면 이모티콘으로 응답한다. 
        reply.send(config.CHANNEL_ACCESS_TOKEN, eventObj.replyToken, actionBasic.getBasicExpress());
    }
    else if (message.type == "text" && /^@.+/g.test(message.text)) {
        var cmd = message.text.split('@')[1];
        console.log('[command]', cmd);

        if (typeof cmd !== "undefined" && cmd != "") {
            if (cmd == "h" || cmd == "help") {
                reply.send(config.CHANNEL_ACCESS_TOKEN, eventObj.replyToken, actionHelp.getHelpExpress());
            }
            else {
                apiai.getQuery(cmd).then(response => {
                        console.log('Step1:getQuery', response);
                        return ga.queryData(message.id, response);
                    }).catch(err => console.error(err))
                    .then(response => {
                        console.log('Step2:get Plots');
                        return template.getPlot(response);

                    }).then(response => {
                        console.log('Step3:sendReply', response);
                        return reply.send(config.CHANNEL_ACCESS_TOKEN, eventObj.replyToken, response);

                    }).then(response => {
                        console.log('Step4: Remove files');
                        template.delPlot(message.id);

                    }).catch(err => console.error(err));
            }

        }
        else {

            var warning =
                "======== Help ======== \n" +
                "잘못된 명령입니다. @h 또는 @help로 명령을 검색하십시오.\n" +
                "An invalid command. Search commands by @h or @help. \n" +
                "無効なコマンドです。 コマンドを@hまたは@helpで検索します。\n" +
                "=====================";

            reply.send(config.CHANNEL_ACCESS_TOKEN, eventObj.replyToken, actionBasic.getBasicCallback(warning));
        }

        response.sendStatus(200);

    }
});

app.listen(app.get('port'), function() {
    console.log('Listening on port ' + app.get('port'));

});
