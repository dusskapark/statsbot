/**
 * 이미지 파일 조작 모듈.
 * file i/o를 동반하므로 promise 패턴 이용
 *
 */

const fs = require('fs');
const resize = require('im-resize');

const FIGURE_DIR = global.__appRoot + '/public/figure';
const THUMBNAIL_SUFFIX = '-thumb';
const THUMBNAIL_MAX_WIDTH = 240;
const THUMBNAIL_MAX_HEIGHT = 240;

var logger = require('../module/logger');

/**
 * 이미지 크기를 조정한 뒤 callback 호출
 * 
 */
function createThumbnail(src) {
  return new Promise((resolve, reject) => {
    resize({
      path: src
    }, {
      versions: [{
        suffix: THUMBNAIL_SUFFIX,
        maxHeight: THUMBNAIL_MAX_WIDTH,
        maxWidth: THUMBNAIL_MAX_HEIGHT
      }]
    }, (err, results) => {
      if (err) {
        logger.error('Image resize error', err);
        reject(err);
      } else {
        resolve(results[0].path);
      }
    })
  });
}

/**
 * 이미지 삭제
 * 
 */
function remove(id) {
  return new Promise(function(resolve, reject) {
    var files = [`${FIGURE_DIR}/${id}.png`, `${FIGURE_DIR}/${id}${THUMBNAIL_SUFFIX}.png`];

    files.forEach(file => {
      fs.unlink(file, err => reject(new Error(err)));
    });
  });
  }

module.exports = {
  createThumbnail: createThumbnail,
  remove: remove
}
