// Use the code in `archive-helpers.js` to actually download the urls
// that are waiting.
var archive = require('../helpers/archive-helpers');
var Promise = require('bluebird');

var work = () => {
  archive.readListOfUrlsAsync()
    .then((urls) => {
      archive.downloadUrlsAsync(urls)
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

work();
