/*
var watson = require('watson-developer-cloud');
var fs = require('fs');
var visual_recognition = watson.visual_recognition({
  api_key: '5dc4357e73062f881728d17dd763fb1b31dbdef0',
  collection_id: 'myCollection_9779e8',
  version: 'v3',
  version_date: '2016-05-20'
});

var params = {
  images_file: fs.createReadStream('/Users/rshen/Downloads/silver-dress2.jpg')
};

visual_recognition.classify(params, function(err, res) {
  if (err)
    console.log(err);
  else
    console.log(JSON.stringify(res, null, 2));
});
*/

var rp = require('request-promise');
var https = require('https');
var fs = require('fs');

"image_file=@silver-dress2.jpg" "https://gateway-a.watsonplatform.net/visual-recognition/api/v3/collections/{collection_id}/find_similar?api_key={api-key}&version=2016-05-20"

var params = {
  uri: 'ttps://gateway-a.watsonplatform.net/visual-recognition/api/v3/collections/myCollection_9779e8/',
  qs: {
    action: 'find_similar',
    api_key: '5dc4357e73062f881728d17dd763fb1b31dbdef0',
    image_file: '@/Users/rshen/Downloads/silver-dress2.jpg,'
    version: '2016-05-20'
  },
  json: true
};