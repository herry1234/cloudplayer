
var util = require('util'), http = require('follow-redirects').http;
var URL = require('url'),fs=require('fs'),qs=require('querystring');

var async = require('async');

var media_file_list = [];
var setMediaList = function (list) {
  media_file_list  = list;
};
exports.setlist = setMediaList;
exports.start = start;

var items = [];
function _change(list) {
   for(var i=0;i<list.length;i++) {
      var filename = i.toString() + '.mp4';
      fs.appendFileSync("mylist.txt","file " + "'" + filename + "'" + "\r\n",null);
      items.push({url: list[i], fname: filename});
   }
}

function start() {
	console.log(media_file_list);
	_change(media_file_list);
	console.log(items);
	//async.eachSeries(items, download_one, function(err){
	async.eachLimit(items, 5,download_one, function(err){
		if(err) console.log(err);
		console.log("All Done");
	});
}
//url, output filename, callback. 
function download_one(one,callback) {
	var url = one.url;
	var fname = one.fname;
	var fd = fs.openSync(fname,'a+');
	var opts = URL.parse(url);
	   http.get(opts,function (res) {
		  console.log("Got response: " + res.statusCode);
		  //console.log('HEADERS: ' + JSON.stringify(res.headers));
		  res.on('data',function(chunk) {
			 fs.writeSync(fd,chunk,0,chunk.length,null);
		  });
		  res.on('end',function() {
			 console.log(fd);
			 fs.closeSync(fd);
			 callback();
		  });
		  res.on('close',function() {
			 console.log("closing ");
			 //callback();
		  });


	   });
}
