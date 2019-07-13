var assert = require('assert');
const dl = require('../downloader');
describe('Downloader', function() {
  describe('#getMimeType', function() {
    it('should throw an error', function() {
      var url = 'https://blablabla';
      this.timeout(5000);
      return dl.getMimeType(url).catch((err) => {
        assert.equal('ENOTFOUND', err.code)
      });
    });
    it('should return image/jpeg', function() {
      var url = 'https://cdn-images-1.medium.com/max/800/1*WyTv5S6b8fmOG6aBrZyiHw.jpeg';
      return dl.getMimeType(url).then((result) => {
        assert.equal('image/jpeg', result);
      });
    });
    it('should return image/png', function() {
      var url = 'https://dl.dropboxusercontent.com/s/hzb3hrlsh0pwv3f/2019-07-08_21-44-14.png?dl=0';
      return dl.getMimeType(url).then((result) => {
        assert.equal('image/png', result);
      });
    });
  });
});
