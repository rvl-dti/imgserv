const express = require('express');
const path = require('path');
const downloader = require('./downloader');
const app = express();
const port = 3000;

var dir = path.join(__dirname, 'public');

app.use(express.static(dir));
app.get('/', (request, response) => {
  var q, url
  q = request.query;
  console.log(q);
  url = decodeURIComponent(q.url); 
  console.log('url:' + (url == 'undefined'));
  if (url !== 'undefined'){
    downloader.fetch(url,  './downloads', './public')
    .then(fileName=>{
      const result = JSON.stringify({status:'ok', data:fileName});
      console.log(fileName)
      response.send(result);
    })
    .catch((err) => {
      const result = JSON.stringify({status:'fail', data:err.message});
      console.log(err);
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
