const path = require('path');
const fs = require('fs');
const mime = require('mime-types'); 
var archive = require('../helpers/archive-helpers');
var http = require('./http-helpers');
// require more modules/folders here!

let notFoundHandler = (req, res) => {
  res.statusCode = 404;
  res.end();
};

let getHandler = (req, res) => {
  let headers = http.headers;
  let fileUrl;

  if (req.url.includes('www')) {
    fileUrl = archive.paths.archivedSites + req.url;      
  } else {
    fileUrl = (req.url === '/') 
      ? archive.paths.siteAssets + '/index.html' 
      : archive.paths.siteAssets + req.url;
  }
  
  // fetch files
  fs.readFile(fileUrl, (err, data) => {
    if (err) {
      console.log(err);
      notFoundHandler(req, res);
    } else {
      headers['Content-Type'] = mime.lookup(fileUrl);
      res.writeHead(200, headers);
      res.end(data);
    }
  });
};

let postHandler = (req, res) => {
  let data = '';
  req.on('data', (chunk) => {
    data += chunk;
  }).on('end', () => {
    data = data.toString();
    let url = data.split('=')[1];
    archive.isUrlInList(url, (itIs) => {
      if (!itIs) {
        archive.addUrlToList(url, () => {
          res.statusCode = 302;
          res.end();
        });
      } else {
        res.statusCode = 302;
        res.end();
      }
    });
  });
  
};

let actions = { 'GET': getHandler, 'POST': postHandler };

exports.handleRequest = function (req, res) {
  console.log('Serving request type ' + req.method + ' for url ' + req.url);

  let action = actions[req.method];

  action ? action(req, res) : notFoundHandler(req, res);

};
