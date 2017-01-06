/*
 * File: gWrapper.js
 * Author: Richard Shen
 * Usage: module for exporting functions for interacting with Google Maps and Search APIs
 * First written on 7/21/16. Last modified on 7/25/16.
 */

/* NEED TO MAKE SURE INPUT DATA (e.g. latlngs, addresses, search terms) ARE FORMATTED CORRECTLY */
// COULD ALSO IMPLEMENT: directions, distance matrix, Places text search, Places radar search, Roads (premium)
/* FIGURE OUT A BETTER WAY TO GENERATE THE CORRESPONDING PARAMETERS */
/* JUST USE THE request-promise PACKAGE, YOU FUCKHEAD */

var https = require('https');
var querystring = require('querystring');

// global variables
// should make these more secure???
var key = 'AIzaSyD0-PcsiekagTjdf91orcKG6yq4r1u0Hw0'; // PLACEHOLDER value
var cx = '009788556614706032757%3Arkb3qk5p4za'; // custom search engine ID <-- PLACEHOLDER value

module.exports = {
  sendQuery: sendQuery,

  /*
   * 
   */
  getStreetView: function (location, size, heading, fov, pitch) { // for use with Clarifai API???
    var streetViewParams = {
      urlType: 'maps',
      queryType: 'streetview?',
      location: location, // can be address or latlng
      size: size, // e.g. 400x400
      heading: heading, // compass heading of the camera (0 to 360)
      fov: fov, // horizontal field of view of the image (default 90, max 120)
      pitch: pitch // up or down angle of the camera
    };
    var imageURL = buildQuery(streetViewParams);
    return imageURL;
  },
  runSearch: function (terms) {
    var customSearchParams = {
      urlType: 'google',
      queryType: 'customsearch/v1?',
      cx: cx,
      terms: terms
    };
    sendQuery(customSearchParams, handleCustomSearch);
  },

  // SHITTY PLACEHOLDER FUNCTIONS --> UPDATE THESE
  handlePlaces: handlePlaces,
  handlePlaceDetails: handlePlaceDetails,
  // handleGeocoding: handleGeocoding,
  handleReverseGeocoding: handleReverseGeocoding,
};

// EXAMPLES: different query parameter types
var placeSearchParams = { // PLACEHOLDER value
  urlType: 'maps',
  queryType: 'place/nearbysearch/',
  location: '34.0227206,-118.4961928', // NEEDS TO BE IN THIS FORMAT
  // radius: 50, // <-- can have EITHER the radius parameter OR the rankby: 'distance' parameter
  rankby: 'distance', // ranks by prominence by default <-- SHOULD RESULTS BE RANKED BY DISTANCE???
  type: 'restaurant', // one of type, keyword, or name is required when ranking by distance
  keyword: 'coffee'
  // language:
  // name: 
};
var placeDetailsParams = { // PLACEHOLDER value
  urlType: 'maps',
  queryType: 'place/details/',
  placeid: 'ChIJh-SW4xxz3IARbnw0nYLuph0', // PLACEHOLDER value
  // extensions: review_summary, // currently experimental and requires PREMIUM access
  // language:
};
var geocodeParams = {
  urlType: 'maps',
  queryType: 'geocode/',
  address: '1600+Amphitheatre+Parkway,+Mountain+View,+CA', // NEEDS TO BE IN THIS FORMAT
  // language: 
  // bounds: 
  // region: 
  // components:
};
var reverseGeocodeParams = {
  urlType: 'maps',
  queryType: 'geocode/',
  latlng: '34.0227206,-118.4961928', // NEEDS TO BE IN THIS FORMAT
  // placeid: , // can be used in place of latlng
  // language:
  // resultType: // address type(s) to return
  // locationType: // "ROOFTOP", "RANGE_INTERPOLATED", "GEOMETRIC_CENTER", or "APPROXIMATE" supported
};

var customSearchParams = {
  urlType: 'google',
  queryType: 'customsearch/v1?',
  cx: cx,
  terms: 'restaurant+coffee' // PLACEHOLDER value
};

/*
var geolocationParams = {
  urlType: 'google',
  queryType: '/geolocation/v1/geolocate?',
  // OTHER STUFF HERE
}
*/

// TEST CALLS
// sendQuery(placeSearchParams, handlePlaces); // <-- SHOULD BE WORKING (NEED TO DO MORE ROBUST TESTING)
// sendQuery(placeDetailsParams, handlePlaceDetails); // <-- SHOULD BE WORKING (NEED TO DO MORE ROBUST TESTING)
// sendQuery(geocodeParams, handleGeocoding); // <-- SHOULD BE WORKING (NEED TO DO MORE ROBUST TESTING)
// sendQuery(reverseGeocodeParams, handleReverseGeocoding); // <-- SHOULD BE WORKING (NEED TO DO MORE ROBUST TESTING)
sendQuery(customSearchParams, handleCustomSearch); // <-- SHOULD BE WORKING (NEED TO DO MORE ROBUST TESTING)
// sendQuery(geolocationParams, handleGeolocation); // NOT WORKING YET

/*
 *
 */
function sendQuery (params, callback) {
  var url = buildQuery(params);
    if (!url) {
    console.log("Invalid query parameters passed."); // IMPROVE THE ERROR MESSAGING
    return;
  }

  // handle different request types using different functions
  var req = https.request(url, function (res) {
    var output = '';
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
        output += chunk;
    });

    res.on('end', function() {
      var obj = JSON.parse(output);

      // check the status code
      // SHOULD MAKE THIS WORK FOR NORMAL SEARCH QUERIES TOO
      if (obj.status) { // <-- FIX THIS
        if (obj.status !== 'OK') {
          console.log(obj.status);
          if (obj.error_message) {
            console.log(obj.error_message);
          }
          return;
        }
      }
 
      callback(obj); // for handling the different types of query results
    });  
  });  

  // MAKE THIS MORE ROBUST
  req.on('error', function(err) {
    console.log(err);
  });

  req.end();
}

/*
 *
 */
function handlePlaces (obj) {
  var restaurants = []; // change this variable name later
  for (var i=0; i < obj.results.length; i++) { // MAKE THIS MORE ROBUST
    var rest = obj.results[i].name.replace(/[^a-z0-9\s]/gi, '').replace(/[\s]/g, '+'); // FIX THIS
    restaurants.push(rest);
  }
  return restaurants;
}


/*
 *
 */
function handlePlaceDetails (obj) {
  var reviews = [];
  for (var i=0; i < obj.result.reviews.length; i++) {
    var review =  { 
      author: obj.result.reviews[i].author_name,
      rating: obj.result.reviews[i].rating,
      text: obj.result.reviews[i].text
    };  
    reviews.push(review);
  }
  console.log(reviews);
}

// function handleGeocoding (obj) {}

/*
 *
 */
function handleReverseGeocoding (obj) { // FIX THIS
  var locality = ''; // <-- for now, ONLY returning the corresponding locality (i.e. town/city/etc.)
  var result = obj.results[0];
  for (var j=0; j < result.address_components.length; j++) {
    if (result.address_components[j].types.indexOf('locality') > -1) { // FIX THIS
      locality = locality + result.address_components[j].long_name.replace(/[\s]/g, '+') + '+';
    }
  }
  return locality;
}

// PLACEHOLDER function
function handleCustomSearch (obj) {
  if (obj.searchInformation.totalResults > 0) {
    console.log(obj.items[0]);
    /*
    for (var i=0; i < obj.items.length; i++) { // currently limited to 10 results max
      var result = obj.items[i];
      console.log(result.title);
    }
    */
  }
  else { console.log(obj.searchInformation); } // no results found
} 
  

// params MUST be an OBJECT containing the CORRESPONDING request parameters
// NOTE: relatively un-important options (e.g. language) have not been implemented below 
/*
 *
 */ 
function buildQuery (params) {
  var mapsURL = 'https://maps.googleapis.com/maps/api/';
  var googleURL = 'https://www.googleapis.com/'; // for both custom search and geolocation

  // THERE'S GOTTA BE A CLEANER WAY TO DO THIS
  // determine base URL upon which to build the query
  var url, queryType;
  if (params.urlType === 'maps') { 
    url = mapsURL; 
    queryType = params.queryType + 'json?';
  }
  else if (params.urlType === 'google') { 
    url = googleURL; 
    queryType = params.queryType;
  }    
  else { return; } // invalid URL type

  // basic query for all query types (to be added to as necessary)
  var query = {
    queryType: queryType,
    key: key,
    url: url
  };

  // required parameters for all query types
  // generalized, for if the above method is changed
  if (!query.queryType || !query.key || !query.url) { return; }
  var queryPath = query.url + query.queryType + 'key=' + query.key;

  // determine query type to build
  // THIS IS GROSS --> FIGURE OUT A BETTER WAY TO DO THIS YOU MORON
  if (params.queryType === 'place/nearbysearch/') {
    // required parameter
    if (!params.location) { return; }
    // UPDATE THIS TO GET LOCATION AUTOMATICALLY
    queryPath = queryPath + '&location=' + params.location;    
    
    // CHECK THIS ASSUMPTION
    // want to rank by distance (i.e. this parameter should ALWAYS have a value)
    if (!params.rankby) { return; }  
    else{ 
      queryPath = queryPath + '&rankby=' + params.rankby;

      // one of these parameters is now required
      if (!params.type && !params.keyword && !params.name) { return; }

      // NEED TO BETTER CHECK FOR THESE INPUTS IN PARTICULAR (i.e. for correctly passing multiple values for a parameter)
      if (params.type) { queryPath = queryPath + '&type=' + params.type; }
      if (params.keyword) { queryPath = queryPath + '&keyword=' + params.keyword; }
      if (params.name) { queryPath = queryPath + '&name=' + params.name; }
    }
  }
  else if (params.queryType === 'place/details/' ) {
    // required parameter
    if (!params.placeid) { return; }
    queryPath = queryPath + '&placeid=' + params.placeid;
  }  
  else if (params.queryType === 'streetview?') {
    if (!params.location || !params.size) { return; }

    queryPath = queryPath + '&location=' + params.location + '&size=' + params.size;
    if (params.heading) { queryPath = queryPath + '&heading=' + params.heading; }
    if (params.fov) { queryPath = queryPath + '&fov=' + params.fov; }
    if (params.pitch) { queryPath = queryPath + '&pitch=' + params.pitch; }
  }
  else if (params.queryType === 'geocode/') { // both geocode and reverse geocode
    // either an address (for geocoding) or a latlng (for reverse geocoding) is required
    if (params.address) {
      queryPath = queryPath + '&address=' + params.address;
      if (params.bounds) { queryPath = queryPath + '&bounds=' + params.bounds; }
      if (params.region) { queryPath = queryPath + '&region=' + params.region; }
      if (params.components) { queryPath = queryPath + '&components=' + params.components; }
    }
    else if (params.latlng || params.placeid) {
      if (params.latlng) { queryPath = queryPath + '&latlng=' + params.latlng; }
      if (params.placeid) { queryPath = queryPath + '&place_id=' + params.placeid; }
      if (params.resultType) { queryPath = queryPath + '&result_type=' + params.resultType; }
      if (params.locationType) { queryPath = queryPath + '&location_type=' + params.locationType; }
    }
    else { return; }
  }

  else if (params.queryType === 'customsearch/v1?') { // Custom Google Search
    // required parameters
    if (!params.cx || !params.terms) { return; }
    queryPath = queryPath + '&cx=' + params.cx + '&q=' + params.terms;
  }
  /*
  else if (query.queryType === '/geolocation/v1/geolocate?') {
    // DO STUFF AND THINGS HERE
  }
  */
  else { return; } // invalid query path

  return queryPath;
}

/*
function getGeolocation () { // add params as input argument
  // PLACEHOLDER value <-- ALL OF THIS DATA SHOULD BE PASSED IN
  var postData = querystring.stringify({
    "homeMobileCountryCode": 310,
    "homeMobileNetworkCode": 260,
    "radioType": "gsm",
    "carrier": "T-Mobile",
    "cellTowers": [
      {
        "cellId": 39627456,
        "locationAreaCode": 40495,
        "mobileCountryCode": 310,
        "mobileNetworkCode": 260,
        "age": 0,
        "signalStrength": -95
      }
    ],
    "wifiAccessPoints": [
      {
        "macAddress": "01:23:45:67:89:AB",
        "signalStrength": 8,
        "age": 0,
        "signalToNoiseRatio": -65,
        "channel": 8
      },
      {
        "macAddress": "01:23:45:67:89:AC",
        "signalStrength": 4,
        "age": 0
      }
    ]
  });

  var options = {
    host: 'www.googleapis.com',
    port: 443,
    path: '/geolocation/v1/geolocate?key=AIzaSyD0-PcsiekagTjdf91orcKG6yq4r1u0Hw0',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  // handle different request types using different functions
  var req = https.request(options, function (res) {
    console.log(res);
    var output = '';
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
        output += chunk;
        console.log(chunk);
    });

    res.on('end', function() {
      var obj = JSON.parse(output);

      // check the status code
      if (obj.code >= 400) {
        console.log(obj.status);
        console.log(obj.message);
        return;
      }
 
      console.log(obj);
      // callback(obj); // for handling the different types of query results
    });  
  });  

  // MAKE THIS MORE ROBUST
  req.on('error', function(err) {
    console.log(err);
  });

  req.end();
}
*/