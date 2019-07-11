const request = require('request');
const download = require('image-downloader');
const md5 = require('md5');
const sizeOf = require('image-size');
const webp = require('webp-converter');
const jimp = require('jimp');
const userAgent = 'Chrome/74.0.3729.169 Safari/537.36';
const maxWidth = 640;

const extractFileName = (fullName) => fullName.split('/').pop();

const downloadImage = (url, dest) => {
  return new Promise((resolve, reject) => {
    download.image({rejectUnauthorized: false, url, dest,
      headers: {'User-Agent': userAgent}})
        .then(({filename, image}) => {
          console.log('File saved to', filename);
          resolve(filename);
        })
        .catch((err) => {
          reject(err);
        });
  });
};

const getMimeType = (url) => {
  return new Promise((resolve, reject) => {
    const options = {url, headers: {'User-Agent': userAgent},
      rejectUnauthorized: false};
    console.log(url);
    request(options, function(err, res, body) {
      if (err) {
        reject(err);
      } else {
        const mimeType = res.headers['content-type'];
        console.log(mimeType);
        resolve({url, mimeType});
      }
    });
  });
};

const fetch = (url, dFolder, pFolder) => {
  return new Promise((resolve, reject) => {
    getMimeType(url)
        .then((res) => {
          const type = res.mimeType.split('/')[1];
          if (/^image/.test(res.mimeType)) {
            fileName = md5(url) + '.' + type;
            fullName = dFolder + '/' + fileName;
            return downloadImage(url, fullName);
          } else {
            reject(new Error({message: 'not an image', code: 'NOTANIMAGE'}));
          }
        })
        .then((fullName) => {
          return convertToJpg({fullName, jpgFolder: pFolder});
        })
        .then((fullName) => {
          return getSize(fullName);
        })
        .then((res) => {
          return resizeImage(res.fullName, res.width);
        })
        .then((fullName) => {
          resolve(extractFileName(fullName));
        })
        .catch((err) => {
          reject(err);
        });
  });
};

const getSize = (fullName) => {
  return new Promise((resolve, reject) => {
    sizeOf(fullName, function(err, dimensions) {
      if (err) {
        reject(new Error(err));
      } else {
        resolve({fullName, width: dimensions.width});
      }
    });
  });
};

const resizeImage = (fullName, width) => {
  return new Promise((resolve, reject) => {
    if (width > maxWidth) {
      jimp.read(fullName)
          .then((x) => {
            x.resize(maxWidth, jimp.AUTO)
                .write(fullName, () => resolve(fullName));
          })
          .catch((err) => reject(err));
    } else {
      resolve(fullName);
    }
  });
};

const convertToJpg = (arg) => {
  return new Promise((resolve, reject) => {
    const fileName = extractFileName(arg.fullName);
    const type = fileName.split('.')[1];
    const outputFile = arg.jpgFolder + '/'
       + fileName.split('.')[0] + '.jpg';
    switch (type) {
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
        jimp.read(arg.fullName, (err, res) => {
          if (err) {
            reject(new Error(err));
          } else {
            res
                .quality(100) // set JPEG quality
                .write(outputFile, () => {
                  resolve(outputFile);
                });
          }
        });
        break;
      default:
        reject(new Error({message: 'not able to process ' + type,
          code: 'UNKONWNTYPE'}));
    }
  });
};

urls = [
  'https://www.pwc.com.tr/tr/sektorler/Perakende-T%C3%BCketici/kuresel-tuketicileri-tanima-arastirmasi/kuresel-tuketici-gorusleri-arastirmasi-info-5en.png',
  'https://cdn-images-1.medium.com/max/800/0*QIEMpq1aAc4mb_oq',
  'https://www.capgemini.com/wp-content/uploads/2014/09/jerome-buvat-new-pix-2-4.jpg?w=960',
  'https://img.etimg.com/thumb/height-480,width-640,msid-69886419,imgsize-201874/growth-bccl.jpg',
  'http://hadoop.apache.org/docs/r2.6.0/hadoop-project-dist/hadoop-hdfs/images/hdfsarchitecture.png',
  'https://cdn-images-1.medium.com/max/800/1*WyTv5S6b8fmOG6aBrZyiHw.jpeg',
  'https://joviam.com/wp-content/uploads/2016/05/BigDataTools-e1468035485508.png',
  'https://image.slidesharecdn.com/datascienceinfographicbiginsight-141010162408-conversion-gate02/95/data-science-infographic-1-638.jpg?cb=1412963028',

];

urls.forEach((url) => {
  fetch(url, './downloads', './public')
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
});

exports.fetch = fetch;
exports.getMimeType = getMimeType;
