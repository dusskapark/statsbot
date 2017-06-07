```sequence
사용자 -> bot: Friend 추가
bot -> 사용자: init msg
사용자 -> bot: GA 등록시도
bot -> Firebase: GA 및 authId 등록여부 체크
Firebase -> bot: response
note left of Firebase: if 둘다 없다면
bot -> 사용자: Google 로그인
사용자 -> bot: 로그인
bot -> 사용자: 로그인 성공 msg & 언어설정 요청
bot --> Firebase: 로그인 값 & 언어값 저장
사용자 -> bot: 메시지
bot -> api.ai: getQuery(자연어)
api.ai -> bot: query(json)
bot -> GA: getData(json)
GA-> bot: data(json)
bot-> 사용자: 응답1: chart(data, png)
bot-> 사용자: 응답2: survey\n(Good or bad)
사용자->bot: Result
note right of 사용자: 조합으로 차트 다시 출력
bot-->api.ai: 기계학습
```
