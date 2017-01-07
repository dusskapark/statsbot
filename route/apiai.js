var text = require('./sample.json');


function getQurey (cmd) {
  var json = JSON.parse(text).result.parameters;
  var metrics = json.metrics;
  var dimensions = json.dimensions + 'ga:'+ cmd;
  var start-date = json.dateRange;
}

console.log(getQurey('country'));
