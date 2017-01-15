```sequence
사용자 -> Line bot: request(자연어)
Line bot --> Firebase: Google oAuth 확인
Firebase --> Line bot: 로그인 성공
Line bot -> Google 번역API: request(다국어, #Auto)
Google 번역API -> GA API: json(English)
GA API -> Line bot: response(data)
Line bot -> 사용자: response(graph)
```
![](/public/001.png)


# Scenario

## webhook

```json
{
  "events": [
      {
        "replyToken": "nHuyWiB7yP5Zw52FIkcQobQuGDXCTA",
        "type": "message",
        "timestamp": 1462629479859,
        "source": {
             "type": "user",
             "userId": "U206d25c2ea6bd87c17655609a1c37cb8"
         },
         "message": {
             "id": "325708",
             "type": "text",
             "text": "@statsbot 지난 한달간의 활성 사용자수와 페이지뷰를 보여줘"
          }
      }
  ]
}
```

## oAuth

```json
"source": {
     "type": "user",
     "userId": "U206d25c2ea6bd87c17655609a1c37cb8"
 }
 ```

## Translate

```json
"message": {
    "id": "325708",
    "type": "text",
    "text": "@statsbot 지난 한달간의 활성 사용자수와 페이지뷰를 보여줘",
    "translate": "Show the number of active users and pageviews in the last month"

 }
```

## request

```json
"req": {
  "metrics" : {
    "matric1": "ga:pageviews",
    "matric2": "ga:active_users"
  },
  "start-date": "1monthAgo",
  "end-date": "today"
}
```

## response (reply)

```shell

curl -X POST \
-H 'Content-Type:application/json' \
-H 'Authorization: Bearer {ENTER_ACCESS_TOKEN}' \
-d '{
    "replyToken":"nHuyWiB7yP5Zw52FIkcQobQuGDXCTA",
    "messages":[
        {
            "type":"text",
            "text":"GA response data"
        },
        {
          "type": "image",
          "originalContentUrl": "https://example.com/original_graph.jpg",
          "previewImageUrl": "https://example.com/preview_graph.jpg"
        }
    ]
}' https://api.line.me/v2/bot/message/reply


```

# 1. webhook 받기

상세 내용은 [라인 개발자센터](https://devdocs.line.me/en/#webhook-event-object) 를 참고


# 2. oAuth

`Firebase`로 구글 로그인 구현



# 3. 영어로 변역하기 (Translate)

`Line bot`으로 전달받은 `message` 데이터를 영문으로 변경


# 4. request 만들기

영문 텍스트의 string을 분석해서 명령어를 만듦

> API.AI를 사용할 수 있을지 여부는 여기서 검토



# 5. GA API 조회하기

GA API를 조회해서 결과를 피드백



# 6. Replay Response msg

GA API 결과값을 그래프 형태로 피드백
