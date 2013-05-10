var http = require('follow-redirects').http;
//var http = require('http');
var util = require('util');
var URL = require('url'),fs=require('fs'),qs=require('querystring');

var async = require('async');

var url_super_mp4 = ""


var media_file_list = url_super_mp4.split(',');

console.log(media_file_list);
var items = [];
function _change(list) {
   //var fd = fs.openSync("mylist.txt",'a+');
   for(var i=0;i<list.length;i++) {
      var filename = i.toString() + '.mp4';

      fs.appendFileSync("mylist.txt","file " + "'" + filename + "'" + "\r\n",null);
      items.push({url: list[i], fname: filename});
      //console.log("URL is " + myoptions.host + " path is: " + myoptions.path);
   }
   //fs.closeSync(fd);
}

_change(media_file_list);
console.log(items);
//async.eachSeries(items, download_one, function(err){
//console.log(err);
//});
function download_one(item,callback) {
   var url = item.url;
   var fname = item.fname;
   var fd = fs.openSync(fname,'a+');
   var opts = URL.parse(url);
   http.get(opts,function(res) {
      console.log("Got response: " + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.on('data',function(chunk) {
         fs.writeSync(fd,chunk,0,chunk.length,null);
      });
      res.on('end',function() {
         console.log(fd);
         fs.closeSync(fd);
      });
      res.on('close',function(err) {
         console.log(err);
         callback(err);
      });


   });
}

