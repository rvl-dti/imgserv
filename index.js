const express = require('express');
const path = require('path');
const downloader = require('./downloader');
const logger = require('./log.js');
const app = express();
const port = 3000;

const dir = path.join(__dirname, 'public');

app.use(express.static(dir));
app.get('/', (request, response) => {
  let url;
  const q = request.query;
  if (typeof q.url !== 'undefined') {
    url = decodeURIComponent(q.url);
    downloader.fetch(url, './downloads', './public')
        .then((fileName) => {
          const result = JSON.stringify({status: 'ok', data: fileName});
          logger.info(fileName + ' succesfully published');
          response.send(result);
        })
        .catch((err) => {
          const result = JSON.stringify({status: 'fail', data: err.message});
          logger.error(err.message);
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
