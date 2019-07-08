const fs = require('fs');
const request = require('request');
const md5 = require('md5');
const sizeOf = require('image-size');
const webp = require('webp-converter');
const jimp = require('jimp');
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36';
const maxWidth = 640;

const getSize = (fullName)=>{
    return new Promise((resolve, reject)=>{
      sizeOf(fullName, function (err, dimensions) {
        if (err) reject(err)
        resolve({fullName, width:dimensions.width});
      });
    })
}

const resizeImage = (fullName, width)=>{
  return new Promise((resolve, reject)=>{
      if (width > maxWidth) {
         jimp.read(fullName)
         .then(x=>{
          x.resize(maxWidth, jimp.AUTO)
         .write(fullName);
         resolve(fullName)
         })
         .catch(err=>reject(err));
      } else {
        resolve(fullName);
      }
  })
}

const downloadImage = (url, destFolder)=>{
  return new Promise((resolve, reject) => {
    var options;
    options = {url, headers:{'User-Agent':userAgent}, rejectUnauthorized: false};
    request.head(options, function(err, res, body){
      var mimeType, fileName, type, fullName;
      if (err) reject(err);
      mimeType = res.headers['content-type'];
      console.log(mimeType)
      type =  mimeType.split('/')[1]
      if (/^image/.test(mimeType)) {
        fileName = md5(url) + '.' + type
        fullName = destFolder + '/' + fileName;
        request(options).pipe(fs.createWriteStream(fullName))
        .on('close', ()=>resolve({type, fileName, fullName}))
        .on('error',(err)=>reject(err))
      } else {
        reject('not an image');
      }
    });
  });
}

const convertToJpg = (arg)=>{
  return new Promise((resolve, reject)=>{
    var outputFile;
    outputFile = arg.jpgFolder + '/' + arg.fileName.split('.')[0] + '.jpg';
    switch (arg.type){
      case 'webp':
      webp.dwebp(arg.fullName, outputFile,"-o", function(status,error)
        {
            if (error) reject(error);
            if (status == 100) {resolve(outputFile)}
            else reject(status);
        });
        break;
      case 'png':
      case 'gif':
      case 'bmp':
      case 'tiff':
      case "jpeg":
        jimp.read(arg.fullName)
        .then(res=> {
          return res
            .quality(100) // set JPEG quality
            .write(outputFile); // save
            resolve(outputFile)
        })
        .catch(err => {
          reject(console.error(err));
        });
        break;
      default:
        reject('not able to process ' + arg.type);
    }
  })
}

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

urls.slice(0, 1).forEach((url)=>{
  console.log(url);
  downloadImage(url, './downloads')
    .then((res)=>{
        return convertToJpg(Object.assign(res, {jpgFolder:'./public'}));
      })
    .then((fullName)=>{
      return getSize(fullName);
    })
    .then((res)=>{
      return resizeImage(res.fullName, res.width);
    })
    .then((res)=>{
        console.log(res);  
        console.log('success');
    })
    .catch((err)=>{console.log(err)});
})

