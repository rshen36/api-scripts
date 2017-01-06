/*
 * File: gCloudWrapper.js
 * Author: Richard Shen
 * Usage: module for exporting functions for interacting with Google Cloud APIs
 * First written on 7/26/16. Last modified on 7/27/16.
 */

var fs = require('fs');

var gcloud = require('gcloud')({ // NOTE: Google Vision API is currently in beta
  projectId: 'insight-1380', // PLACEHOLDER value
  keyFilename: './keyfile.json' // PLACEHOLDER value
}); 
var vision = gcloud.vision();

// NOTE: 'faces' may be useful in combination with Google image search?
var defaultTypes = [
  'labels',
  'landmarks',
  'logos',
  'text'
  // 'faces', // <-- identifies the location (and emotions) of any faces in the image
  // 'properties',
  // 'safeSearch'
];

// can be either a string array of types or an object of multiple options
var defaultOptions = {
  // imageContext: , // object containing latLongRect and/or languageHints properties to further narrow the results
  // maxResults: ,
  types: defaultTypes,
  // verbose: true, // false by default
}

module.exports = {
  /*
   * Usage: 
   * @params img - a file location passed as a string (required)
   * @params options - either an array of strings (types) or an object of the same general construct as defaultOptions (optional)
   * @params callback - function to be called in response to the output from the call vision.detect()
   */
  getTags: function (img, options, callback) {
    // check if options have been passed
    var cb = callback, opts = options;
    if (typeof options === 'function') {
      cb = options;
      opts = defaultOptions;
    }

    if (typeof img === 'string') {
      // TODO: check if image passed is a valid local file/file stored on Google Cloud Storage
    
      fs.readFile(img, {encoding: 'base64'}, function (err, imgBase64) {
        if (err) { // <-- make this error handling more robust
          console.log(err);
        }   
        
        var base64Data = imgBase64.replace(/^data:image\/png;base64,/, "");
        fs.writeFileSync("out.png", base64Data, 'base64', function(err) {
          console.log(err);
        });

        vision.detect("out.png", opts, function (err, detections /*, apiResponse */) {
          if (err) { return cb(err, null); }
          cb(null, detections);
        });
      });
    }
    else { // invalid data type for img parameter
      return cb(err, null);
    }    
  }
};
  