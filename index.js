const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const downloader = require('./downloader');
const generate = require('./generate');
const logger = require('./log.js');
const app = express();
const port = 3000;

dotenv.config();
const downloadDir = process.env.DOWNLOAD_FOLDER;
const publicDir = process.env.PUBLIC_FOLDER;

const dir = publicDir.substr(0, 1) == '.'?
  path.join(__dirname, publicDir):publicDir;
app.use(express.static(dir));

app.get('/generate', (request, response) => {
  const q = request.query;
  if (typeof q.text !== 'undefined') {
    generate.imageText(decodeURIComponent(q.text), publicDir)
        .then((fileName) => {
          const result = JSON.stringify({status: 'ok', data: fileName});
          response.send(result);
        })
        .catch((err) => {
          const errObject = JSON.stringify(err,
              Object.getOwnPropertyNames(err));
          const result = JSON.stringify({status: 'fail', data: errObject});
          response.send(result);
        });
  } else {
    response.send('provide text');
  }
});

app.get('/', (request, response) => {
  let url;
  const q = request.query;
  if (typeof q.url !== 'undefined') {
    url = decodeURIComponent(q.url);
    downloader.fetch(url, downloadDir, publicDir)
        .then((fileName) => {
          const result = JSON.stringify({status: 'ok', data: fileName});
          logger.info(fileName + ' succesfully published');
          response.send(result);
        })
        .catch((err) => {
          const errObject = JSON.stringify(err,
              Object.getOwnPropertyNames(err));
          const result = JSON.stringify({status: 'fail', data: errObject});
          logger.error(errObject);
          response.send(result);
        });
  } else {
    response.send('hello');
  }
});

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }
  console.log(`server is listening on ${port}`);
});
