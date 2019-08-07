const Jimp = require('jimp');
const md5 = require('md5');
const path = require('path');
const WIDTH = 640;
const HEIGHT = 200;

const imageText = (text, dir) => {
  return new Promise((resolve, reject) => {
    const image = new Jimp(WIDTH, HEIGHT, 0xffffffff);
    Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)
        .then((font) => {
          const filename = md5(text)+ '.jpg';
          const fullname = path.join(dir, filename);
          image.print(font, 0, 0, {
            text: text,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
          }, WIDTH, HEIGHT);
          image.write(fullname, (err, res) => {
            if (err) reject(new Error(err));
            resolve(filename);
          });
        });
  });
};

exports.imageText = imageText;
