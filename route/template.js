var fs = require('fs');


function getTemplate(req, msg, res) {
    return new Promise(function(resolve, reject) {

        var id = msg.id;
        var json = JSON.stringify(req);

        fs.writeFile('data/' + id + '.json', json, 'utf8', function(err, data) {
            if (err) reject(err);
            else resolve(data);

        });
    });
}
