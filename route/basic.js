module.exports.getBasicExpress = function () {

  var commendText =
      "안녕하세요 아래 명령어 목록을 참고하세요. \n" +
      "======== Help ======== \n" +
      "@bot 또는 @ga : call GA bot을 부릅니다. \n" +
      "@help 또는 @h : action 목록을 보여줍니다. \n" +
      "=====================";


    return [{
        "type": "text",
        "text": commendText
    }];
};
