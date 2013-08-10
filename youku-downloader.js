var source_url = process.argv[2];
var video_name = process.argv[3];
if (video_name == undefined) video_name = "untitled";
video_name = "learning/noderest/public/video/" + video_name;
console.log("YOUKU URL: " + source_url);
var http = require('http'),
   util = require('util');
var url = require('url'),
   fs = require('fs');
var match = new RegExp('"(http://f.youku.com/player/getFlvPath/.+?)" target="_blank"', 'g');
var options = {
   host: 'www.flvcd.com',
   port: 80,
   path: ''
};
options.path = '/parse.php?flag=&format=&kw=' + source_url;
var response;
http.get(options, function(res) {
   console.log("Got response: " + res.statusCode);
   console.log('HEADERS: ' + JSON.stringify(res.headers));
   res.on('data', function(chunk) {

      //console.log('Body: ' + chunk);
      response += chunk;
      console.log('------------------------------------');

      //console.log("----",result);
   });
   res.on('end', function() {
      var result;
      var proglist = [];
      //var result = match.exec(response);
      //var result = response.match(match);
      while (result = match.exec(response)) {
         //console.log("--",result[1]);
         proglist.push(result[1]);
      }
      for (var i = 0; i < proglist.length; i++) {
         console.log("ProgURL: " + proglist[i]);
      }
      download_all(proglist);
   });

}).on('error', function(e) {
   console.log("Got error: " + e.message);
});

function pad(a, b) {
   return (1e15 + a + "").slice(-b)
};

function download_all(list) {
   for (var i = 0; i < list.length; i++) {
      var myoptions = url.parse(list[i]);
      var filename = video_name + '_' + pad(i, 2) + '.flv';
      console.log("Download filename : " + filename);
      download_one(myoptions, filename);
      //console.log("URL is " + myoptions.host + " path is: " + myoptions.path);
   }
}

function download_one(opts, fname) {
   var fd = fs.openSync(fname, 'a+');
   http.get(opts, function(res) {
      console.log("Got response: " + res.statusCode);
      if (res.statusCode == 302) {
         var newoptions = url.parse(res.headers.location);
         download_one(newoptions, fname);
      }
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.on('data', function(chunk) {
         fs.writeSync(fd, chunk, 0, chunk.length, null);
      });
      res.on('end', function() {
         console.log(fd);
         fs.closeSync(fd);
      });


   });
}