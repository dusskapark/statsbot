```sequence
사용자 -> Line bot: request(@자연어)
Line bot -> server: webhook (source, message 등)
server -> Firebase: Google oAuth 확인
Firebase -> server: 로그인 성공
server -> api.ai: getQuery(자연어)
api.ai -> server: json(query)
server -> GA(Rserv): getChart(query)
GA(Rserv)-> server: chart.png
server->Line bot: post(chart.png)
Line bot->사용자: response(chart.png)
```

![001](https://github.com/dusskapark/statsbot/wiki/assets/001.png)