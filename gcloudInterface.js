/*
 * File: gcloudInterface.js
 * Author: Richard Shen
 * Usage: interface for the Google Cloud wrapper
 * First written on 7/27/16. Last modified on 7/27/16.
 */

var readline = require('readline');
var gcloud = require('./gcloudWrapper.js');

// initialize interactive interface
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// repeatedly prompt for input image
getImageTags();

// how to properly handle the errors sent back by Google Cloud???
function getImageTags () {
  rl.question('image: ', function (ans) {
    if (ans.toLowerCase() === 'quit') { // <-- may want to change the exit prompt
      rl.close();
      return;
    }
    gcloud.getTags(ans, function (err, res) { // PLACEHOLDER callback function
      if (err) { console.log(err); }
      else { console.log(res); }

      getImageTags();
    });
  });
}
