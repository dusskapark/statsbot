var fs = require('fs');
var path = require("path");
var resize = require('im-resize');



function getPlot(paths) {
    var image = {
        path: paths,

    };
    var output = {
        versions: [{
            suffix: '-thumb',
            maxHeight: 240,
            maxWidth: 240
        }]
    };


    return new Promise((resolve, reject) => {
        resize(image, output, function(err, versions) {
            if (err) {
                console.log('error: ' + err);
                reject(err);
            }
            else {


                var plot = [{
                    "type": "image",
                    "originalContentUrl": "https://statsbot-dusskapark.c9users.io/public/figure/" + path.parse(paths).base,
                    "previewImageUrl": "https://statsbot-dusskapark.c9users.io/public/figure/" + path.parse(versions[0].path).base

                }];

                resolve(plot);
            }
        });


    });
}

module.exports.getPlot = getPlot;

function delPlot(id) {

    fs.unlink('/home/ubuntu/workspace/public/figure/' + id + '.png', (err) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log('successfully deleted' + id + '.png');
        }
    });

    fs.unlink('/home/ubuntu/workspace/public/figure/' + id + '-thumb.png', (err) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log('successfully deleted thumb.png');

        }
    });
}
module.exports.delPlot = delPlot;

// delPlot('001');
