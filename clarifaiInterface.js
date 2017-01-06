/*
 * File: clarifaiInterface.js
 * Author: Richard Shen
 * Usage: interface for the Clarifai wrapper
 * First written on 7/19/16. Last modified on 7/21/16.
 */

/* ACTUALLY WRITE TESTS YOU SHITHEAD */
// SLOW AS FUCK (9-10s) <-- NEED TO SPEED THIS UP

var readline = require('readline');
var wrapper = require('./clarifaiWrapper.js');

// initialize interactive interface
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var img, tags;

// repeatedly prompt for input image
getImageTags();

// how to properly handle the errors sent back by Clarifai???
function getImageTags () {
  rl.question('image: ', function (ans) {
    if (ans.toLowerCase() === 'quit') { // <-- may want to change the exit prompt
      rl.close();
      return;
    }
    img = ans;
    wrapper.getTags(img, function (err, results) { // PLACEHOLDER callback function
      if (err) {
        console.log(err);
      }
      else {
        tags = results;
        console.log(tags);
      }

      getImageTags();
    });
  });
}