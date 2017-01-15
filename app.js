var express = require('express');
var bodyParser = require('body-parser');
var config = require('./cert/config.js');
var fs = require('fs');

// const auth = require('./route/auth')
// const translate = require('./route/translate'); // 메시지를 분석하고 구글 번역기를 돌립니다.
const apiai = require('./route/apiai'); // 메시지를 json 으로 만듦
const ga = require('./route/ga'); // GA에 명령어를 보내고 데이터를 수신합니다.
const template = require('./route/template'); // 데이터를 그래프나 테이블로 바꿉니다.
const reply = require('./route/reply'); // 최종적으로 메시지를 콜백합니다.
const actionBasic = require('./route/basic'); // 명령어 모음
const actionHelp = require('./route/help'); // help 명령어
// const firebase = require('./route/firebase');


// 서버 시작
var app = express();
app.use('/assets', express.static(__dirname + '/public'));
app.set('views', './views'); // 템플릿은 여기에 저장함
app.set('view engine', 'pug');


app.set('port', process.env.PORT || 3030);
app.use(bodyParser.json());

app.get('/webhook', function(reqeust, response) {
    response.writeHead(200, {
        'Content-Type': 'text/html'
    });
    response.end('<a href="https://github.com/dusskapark/statsbot">See you on Github</a>');
});

// ID 파라미터를 달고 들어오는 경우, 
app.get('/:id', function(req, res) {
    var id = req.params.id;
    fs.readFile('data/' + id + '.json', 'utf8', function(err, data) {
        if (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
        // res.send(data);
        res.render('graph', {
            json: data,
            title: id
        });
    });
});



app.post('/webhook', function(request, response) {

    var eventObj = request.body.events[0];
    var source = eventObj.source;
    var message = eventObj.message;

    // request log
    console.log('======================', new Date(), '======================');
    console.log('[request]', request.body);
    console.log('[request source] ', eventObj.source);
    console.log('[request messages]', eventObj.message);

    if (message.type == "text" && message.text.indexOf("@bot") != -1) {
        reply.send(config.CHANNEL_ACCESS_TOKEN, eventObj.replyToken, actionBasic.getBasicExpress());
    } else if (message.type == "text" && /^@.+/g.test(message.text)) {
        var cmd = message.text.split('@')[1];
        console.log('[command]', cmd);

        if (typeof cmd !== "undefined" && cmd != "") {
            if (cmd == "h" || cmd == "help") {
                reply.send(config.CHANNEL_ACCESS_TOKEN, eventObj.replyToken, actionHelp.getHelpExpress());
            } else {
                apiai.getQuery(cmd).then(response => {
                    console.log('Step1:getQuery', response);
                    return ga.queryData(response);
                }).then(response => {
                    console.log('Step2:queryData', response);
                    return template.getTemplate(response, message);

                }).then(response => {
                    console.log('Step3:getTemplate', response);
                    // return reply.send(config.CHANNEL_ACCESS_TOKEN, eventObj.replyToken, actionBasic.getBasicCallback(message.id));

                }).catch(err => console.error(err));
            }

        } else {

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
