const path = require('path');
const fs = require('fs');
const mime = require('mime-types'); 
var archive = require('../helpers/archive-helpers');
var http = require('./http-helpers');
const fetcher = require('../workers/htmlfetcher.js');
// require more modules/folders here!

let notFoundHandler = (req, res) => {
  res.statusCode = 404;
  res.end();
};

let getHandler = (req, res) => {
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
      http.headers['Content-Type'] = mime.lookup(fileUrl);
      res.writeHead(200, http.headers);
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
    archive.isUrlArchived(url, (itIs) => {
      // if url archived, redirect to archived page
      if (itIs) {
        fileUrl = archive.paths.archivedSites + '/' + url;
        fs.readFile(fileUrl, (err, data) => {
          if (err) {
            console.log(err);
          } else {
            http.headers['Content-Type'] = 'text/html';
            res.writeHead(302, http.headers);
            res.end(data);
          }
        });
      } else {
        // if url not archived, add url to list (archive: if url not in list)
        archive.addUrlToList(url, () => {
          fileUrl = archive.paths.siteAssets + '/loading.html';
          // redirect to loading.html
          fs.readFile(fileUrl, (err, data) => {
            if (err) {
              console.log(err);
            } else {
              fetcher.work();
              http.headers['Content-Type'] = mime.lookup(fileUrl);
              res.writeHead(302, http.headers);
              res.end(data);
            }
          });
        });
        
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
