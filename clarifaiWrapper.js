/*
 * File: clarifaiWrapper.js
 * Author: Richard Shen
 * Usage: module of exported functions for interacting with the Clarifai API
 * First written on 07/15/16. Last modified on: 07/19/16.
 */

// NOTE: play around with using the travel and food models
// NOTE: play around with the select_classes and remove_tags parameters

var clarifai = require('clarifai'),
    validator = require('validator'),
    fs = require('fs');

var client = {
  // PLACEHOLDER values
  id: 'cXo0OSEhVC70-PiLCdfvzlWAjIQ0NTrrEsW85Wod',
  secret: 'evGP3dJXIPvFgmXHLx1CiGHcuST8YxbRpP5V2wr6'
};

// initialize the Clarifai application
clarifai.initialize({
  'clientId': client.id,
  'clientSecret': client.secret
});

/*
 * successful response contains the following fields:
 *   status_code, status_msg, meta { tag: { timestamp, model, config } },
 *   results { [ {docid, url, status_code, status_msg, local_id, result: [Object], docid_str } ] },
 * response.results[0].result contains:
 *   tag: { concept_ids: [Object], classes: [Object], probs: [Object] } 
 */ 

/*
 * OPTIONS ALLOWED:
 * model used to tag the image, 
 * language used to tag the image,
 * classes/tags to return,
 * localID for each image to simplify tracking requests
 */

// may want to move handling of common responses and errors into private helper functions
module.exports = {
  /*
   *
   */
  getTags: function (img, callback) { // <-- should add ability to pass options
    // determine whether options have been passed
    var cb = callback;
    /*
    if (typeof options === 'function') {
      cb = options;
    }
    */

    // check the format of the given image to determine correct method to use
    /*
    if (validator.isURL(img)) { // publicly accessible URL
      clarifai.getTagsByUrl(img).then(
        function (res) { // <-- should this be modified to return more than the tags and probabilities?
          var tags = res.results[0].result.tag.classes;
          var probs = res.results[0].result.tag.probs;

          var results = []; // <-- inefficient???
          for (var i = 0; i < tags.length; i++) {
            var obj = { tag: tags[i], prob: probs[i] };
            results.push(obj);
          }

          cb(null, results);
        },
        function (err) {
          return cb(err, null);
        }
      );
    }
    else { // local file <-- should make this more robust

    // must be base64-encoded
    fs.readFile(img, {encoding: 'base64'}, function (err, imgBase64) {
      if (err) { // <-- make this error handling more robust
        console.log(err);
      }
    */
    clarifai.getTagsByImageBytes(img).then(
      function (res) {
        var tags = res.results[0].result.tag.classes;
        var probs = res.results[0].result.tag.probs;

        var results = [];
        for (var i = 0; i < tags.length; i++) { // FIX THIS
          var obj = { tag: tags[i], prob: probs[i] };
          var tag = tags[i].replace(/[\s]/g, '+');
          results[i] = obj;
        }

        cb(null, results);
      },
      function (err) {
        return cb(err, null);
      }
    );
  },

/*
  // get colors for the given image
  getColors: function (img, cb) {
    // this Clarifai feature is currently in beta
    clarifai.getColorsByimg(img).then(
      function (res) {
        // DO STUFF AND THINGS HERE

        cb(null, results);
      },
      handleError(err, cb);
    );
  },
*/
};