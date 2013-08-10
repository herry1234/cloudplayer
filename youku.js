var http = require('http'),
   util = require('util');
var url = require('url'),
   fs = require('fs');


//https://github.com/cscscheng/Raspberry-Pi-NetworkPlayer/blob/master/youku.py
//http://userscripts.org/scripts/review/131926
//http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
var request = require('request');

//Provided by User
var vid = "XNTE0NDc4NzA4";
var stream_t = "mp4";

//
var youku_f_link = "http://f.youku.com/player/getFlvPath/sid/";
var url = "http://v.youku.com/player/getPlayList/VideoIDS/" + vid + "/timezone/+08/version/5/source/video?n=3&ran=5061&password="
var options = {
   url: url,
   proxy: 'http://222.197.188.39:8080'
};

var urls = {
   vTitle: "",
   vList: []
};
request(options, function(error, response, body) {
   if (!error && response.statusCode == 200) {
      console.log(body);
      var res = JSON.parse(body);
      var data = res.data[0];
      console.log(data.seed);
      console.log(data.title);
      urls.vTitle = data.title;
      console.log(data.videoid);
      var segs = data.segs[stream_t];
      var fileids = data.streamfileids[stream_t];
      getMediaUrls(fileids, data.seed, segs);
      var downloader = require('./downloader.js');
      downloader.setlist(urls.vList);
      downloader.start();
   } else {
      console.log("ERR" + error);
   }
});

function getMediaUrls(fids, seed, segs) {
   var fullfids = getFileId(fids, seed);
   var sid = getsid();
   for (var i = 0; i < segs.length; i++) {
      var video_part_num = parseInt(segs[i]["no"]);
      var key = segs[i]["k"];
      var part_num_hex = ('0' + video_part_num.toString(16)).slice(-2);
      part_num_hex = part_num_hex.toUpperCase();
      console.log("video-part-num: " + video_part_num + "part_num_hex : " + part_num_hex);
      var converted_fid = fullfids.substring(0, 8) + part_num_hex + fullfids.substring(10);
      var request_url = youku_f_link + sid + '_' + ('0' + video_part_num).slice(-2) + '/st/' + stream_t + '/fileid/' + converted_fid + '?K=' + key;
      console.log(request_url);
      urls.vList.push(request_url);
   }
}



function oetRandom(min, max) {
   return Math.random() * (max - min) + min;
};

function getRandomInt(min, max) {
   return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getsid() {
   //var sid=new Date().getTime() + "" + (1000 + new Date().getMilliseconds()) + "" + (parseInt(Math.random() * 9000,10) + 1000);

   var now = new Date().getTime();
   var r1 = getRandomInt(1000, 1998);
   var r2 = getRandomInt(1000, 9999);
   var output = String(now) + String(r1) + String(r2);
   return output;
}

function getFileId(str, seed) {
   var mixstr = getMixString(seed);
   var ids = str.split('*');
   var fileid = "";
   var idx = 0;
   for (var i = 0; i < ids.length - 1; i++) {
      idx = parseInt(ids[i], 10);
      fileid += mixstr.charAt(idx);
   }
   return fileid;
};

function getMixString(seed) {

   var o = "";
   var source = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ/\\:._-1234567890";
   var len = source.length;
   for (var i = 0; i < len; ++i) {
      seed = (seed * 211 + 30031) % 65536;
      var index = seed / 65536 * source.length;
      var c = source.charAt(index);
      o += c;
      source = source.replace(c + '', '');
   }
   return o;
}