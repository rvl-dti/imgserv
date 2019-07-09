const fs = require('fs');
const request = require('request');
const md5 = require('md5');
const sizeOf = require('image-size');
const webp = require('webp-converter');
const jimp = require('jimp');
const userAgent = 'Chrome/74.0.3729.169 Safari/537.36';
const maxWidth = 640;

const fetch = (url, dFolder, pFolder) => {
  return new Promise((resolve, reject) => {
    console.log(url);
    downloadImage(url, dFolder)
        .then((res) => {
          return convertToJpg(Object.assign(res, {jpgFolder: pFolder}));
        })
        .then((fullName) => {
          return getSize(fullName);
        })
        .then((res) => {
          return resizeImage(res.fullName, res.width);
        })
        .then((fullName) => {
          resolve(fullName.split('/').pop());
        })
        .catch((err) => {
          reject(err);
        });
  });
};

const getSize = (fullName) => {
  return new Promise((resolve, reject) => {
    sizeOf(fullName, function(err, dimensions) {
      if (err) reject(err);
      resolve({fullName, width: dimensions.width});
    });
  });
};

const resizeImage = (fullName, width) => {
  return new Promise((resolve, reject) => {
    if (width > maxWidth) {
      jimp.read(fullName)
          .then((x) => {
            x.resize(maxWidth, jimp.AUTO)
                .write(fullName);
            resolve(fullName);
          })
          .catch((err) => reject(err));
    } else {
      resolve(fullName);
    }
  });
};

const downloadImage = (url, destFolder) => {
  return new Promise((resolve, reject) => {
    const options = {url, headers: {'User-Agent': userAgent},
      rejectUnauthorized: false};
    request(options, function(err, res, body) {
      let fileName; let fullName;
      if (err) reject(err);
      const mimeType = res.headers['content-type'];
      console.log(mimeType);
      const type = mimeType.split('/')[1];
      if (/^image/.test(mimeType)) {
        fileName = md5(url) + '.' + type;
        fullName = destFolder + '/' + fileName;
        request(options).pipe(fs.createWriteStream(fullName))
            .on('close', () => resolve({type, fileName, fullName}))
            .on('error', (err) => reject(err));
      } else {
        reject('not an image');
      }
    });
  });
};

const convertToJpg = (arg) => {
  return new Promise((resolve, reject) => {
    const outputFile = arg.jpgFolder + '/'
       + arg.fileName.split('.')[0] + '.jpg';
    switch (arg.type) {
      case 'webp':
        webp.dwebp(arg.fullName, outputFile, '-o', function(status, error) {
          if (error) reject(error);
          if (status == 100) {
            resolve(outputFile);
          } else reject(status);
        });
        break;
      case 'png':
      case 'gif':
      case 'bmp':
      case 'tiff':
      case 'jpeg':
        jimp.read(arg.fullName)
            .then((res) => {
              return res
                  .quality(100) // set JPEG quality
                  .write(outputFile); // save
            })
            .then(()=>{resolve(outputFile)})
            .catch((err) => {
              reject(err);
            });
        break;
      default:
        reject('not able to process ' + arg.type);
    }
  });
};

urls = [
  'https://cdn-images-1.medium.com/max/800/0*QIEMpq1aAc4mb_oq',
  'https://www.capgemini.com/wp-content/uploads/2014/09/jerome-buvat-new-pix-2-4.jpg?w=960',
  'https://img.etimg.com/thumb/height-480,width-640,msid-69886419,imgsize-201874/growth-bccl.jpg',
  'http://hadoop.apache.org/docs/r2.6.0/hadoop-project-dist/hadoop-hdfs/images/hdfsarchitecture.png',
  'https://cdn-images-1.medium.com/max/800/1*WyTv5S6b8fmOG6aBrZyiHw.jpeg',
  'https://joviam.com/wp-content/uploads/2016/05/BigDataTools-e1468035485508.png',
  'https://www.pwc.com.tr/tr/sektorler/Perakende-T%C3%BCketici/kuresel-tuketicileri-tanima-arastirmasi/kuresel-tuketici-gorusleri-arastirmasi-info-5en.png',
  'https://image.slidesharecdn.com/datascienceinfographicbiginsight-141010162408-conversion-gate02/95/data-science-infographic-1-638.jpg?cb=1412963028',

];

urls.slice(0, 1).forEach((url) => {
  fetch(url,  './downloads', './public')
  .then(fileName=>console.log(fileName))
  .catch((err) => {
    console.log(err);
  });
});

exports.fetch = fetch;
