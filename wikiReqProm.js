/*
 * File: wikiReqProm.js
 * Author: Richard Shen
 * Usage: 
 * First written on 10/23/16. Last modified on 10/23/16.
 */


var rp = require('request-promise');
var https = require('https');
var fs = require('fs');

// currently gets only the top option from the search
var searchOptions = {
  uri: 'https://en.wikipedia.org/w/api.php',
  qs: {
    action: 'opensearch',
    limit: '1',
    format: 'json',
    search: 'Eiffel Tower' // PLACEHOLDER value
  },
  json: true
};

// currently gets only the summary text for the Wiki page
var queryOptions = {
  uri: 'https://en.wikipedia.org/w/api.php',
  qs: {
    action: 'query',
    prop: 'extracts|pageimages',
    exintro: '',
    explaintext: '',
    format: 'json',
    redirects: '',
    pithumbsize: 300,
    titles: ''
  },
  json: true
};

queryWiki(searchOptions, queryOptions);

function queryWiki (searchOptions, queryOptions) {
  rp(searchOptions)
    .then(function (resp) {
      // console.log(resp);
      if (resp[1][0] !== undefined) {
        queryOptions.qs.titles = resp[1][0]; /* HOW BEST TO DEAL WITH WRONG PAGES RETURNED??? */
        rp(queryOptions)
          .then(function (resp) {
            var pages = Object.keys(resp.query.pages);

            console.log(resp.query.pages[pages[0]].title);
            console.log(resp.query.pages[pages[0]].extract);

            var imgSrc = resp.query.pages[pages[0]].thumbnail.source;
            var imgFile = fs.createWriteStream("test.jpg");
            var request = https.get(imgSrc, function(resp) {
              resp.pipe(imgFile);
            });
          })
          .catch(function (err) {
            console.log(err);
          });
      }
      else { /* HOW BEST TO SEARCH THROUGH SUBSTRINGS??? */
        //console.log(searchOptions.qs.search);
        var searchQuery = searchOptions.qs.search.split(" ");
        if (searchQuery.length > 1) {
          searchOptions.qs.search = searchQuery.slice(0,searchQuery.length-1).join(" ");
          //searchOptions.qs.search = searchQuery.slice(1, searchQuery.length).join(" ");
          queryWiki(searchOptions, queryOptions);
        }
        else {
          console.log("Page not found.");
        }
      }
    })
    .catch(function (err) {
      console.log(err);
    });
};