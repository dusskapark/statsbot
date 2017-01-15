var fs = require('fs');


function getTemplate(req, msg, res) {
    return new Promise(function(resolve, reject) {
        var id = msg.id;

        fs.writeFile('data/' + id + '.json', req, 'utf8', (err) => {
            if (err) throw err;
            console.log('It\'s saved!');
        });
    });
}

module.exports.getTemplate = getTemplate