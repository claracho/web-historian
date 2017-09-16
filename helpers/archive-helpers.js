var fs = require('fs');
var path = require('path');
var _ = require('underscore');
const http = require('http');

/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

const paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../web/archives/sites'),
  list: path.join(__dirname, '../web/archives/sites.txt')
};
exports.paths = paths;

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function(callback) {
  fs.readFile(paths.list, 'utf8', (err, fileContent) => {
    if (err) {
      console.log(err);
    } else {
      let urls = fileContent.split('\n');
      urls.pop();
      callback(urls);
    }
  }); 
};

let isUrlInList = function(url, callback) {
  fs.readFile(paths.list, 'utf8', (err, fileContent) => {
    if (err) {
      console.log(err);
    } else {
      callback(fileContent.includes(url));
    }
  }); 
};
exports.isUrlInList = isUrlInList;

let isUrlArchived = function(url, callback) {
  fs.readFile(paths.archivedSites + '/' + url, (err, fileContent) => {
    if (err) {
      callback(false);
    } else {
      callback(true);
    }
  }); 
};
exports.isUrlArchived = isUrlArchived;

let addUrlToList = function(url, callback) {
  isUrlInList(url, (itIs) => {
    if (itIs) {
      callback(true);
    } else {

      fs.readFile(paths.list, 'utf8', (err, fileContent) => {
        if (err) {
          console.log(err);
        } else {

          fs.writeFile(paths.list, fileContent += url + '\n', 'utf8', (err) => {
            if (err) {
              console.log(err);
            } else {
              callback(true);
            }
          });

        }
      });

    }
  }); 
};
exports.addUrlToList = addUrlToList;

exports.downloadUrls = function(urls) {
  for (let url of urls) {
    isUrlArchived(url, (itIs) => {
      if (!itIs) {
        http.get('http://' + url, (response) => {
          let data = '';
          response.on('data', (chunk) => {
            data += chunk;
          }).on('end', () => {
            fs.writeFile(paths.archivedSites + '/' + url, data, (err) => { 
              if (err) { console.log(err); }
            });
          });
        }).on('error', (err) => {
          console.log(err);
        }).end();
      }
    });
  }
};
