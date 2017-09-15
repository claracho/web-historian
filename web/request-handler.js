const path = require('path');
const fs = require('fs');
const mime = require('mime-types'); 
var archive = require('../helpers/archive-helpers');
var http = require('./http-helpers');
// require more modules/folders here!

exports.handleRequest = function (req, res) {
  console.log('Serving request type ' + req.method + ' for url ' + req.url);

  let statusCode;
  let headers = http.headers;

  if (req.method === 'GET') {
    let fileUrl = (req.url === '/') 
      ? archive.paths.siteAssets + '/index.html' 
      : archive.paths.siteAssets + req.url; 
    // fetch files
    fs.readFile(fileUrl, (err, data) => {
      if (err) {
        console.log('error');
        statusCode = 404;
        headers['Content-Type'] = 'text/plain';
        res.writeHead(statusCode, headers);
        res.end();
      } else {
        statusCode = 200;
        headers['Content-Type'] = mime.lookup(fileUrl);
        res.writeHead(statusCode, headers);
        res.end(data);
      }
    });
  }
};
