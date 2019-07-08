const express = require('express')
const download = require('image-downloader')
const axios = require('axios');
const app = express()
const port = 3000
app.get('/', (request, response) => {
	var options = {
	  url: 'https://cdn-images-1.medium.com/max/600/1*1f0Rw_N_1Dp3aZwPyGUNpA.png',
	  dest: 'photo.jpg'        // Save to /path/to/dest/photo.jpg
	}
 
download.image(options)
  .then(({ filename, image }) => {
    console.log('File saved to', filename)
  })
  .catch((err) => {
    console.error(err)
  })


    response.send((request.query))
})
app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})
