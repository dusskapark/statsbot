var fs = require('fs');

function getQurey(message) {
    // 나중에는 비동기가 될 것이므로... 이를 표현하기 위해 readFile 함수를 사용
    return new Promise(function(resolve, reject) {
      fs.readFile('./route/' + message + '.json', 'utf8', function(err, data) {
          if (err) reject(err);
          else resolve(JSON.parse(data).result.callback[0]);
      });

    });
}

// getQurey('sample').then(x => {
//     console.log(x);
// })

module.exports.getQuery = getQurey
