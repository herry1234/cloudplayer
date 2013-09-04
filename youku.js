var http = require('http'),
   util = require('util'),
   url = require('url'),
   fs = require('fs'),
   request = require('request');
var sogou = require('./proxy');
//https://github.com/cscscheng/Raspberry-Pi-NetworkPlayer/blob/master/youku.py
//http://userscripts.org/scripts/review/131926
//http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
//Provided by User

var Youku = {
   // init: function(vid, type) {
   //    this.vid = vid;
   //    this.stream_t = type;
   //    return this;
   // },
   fetchUrl: function(input, cb) {
      //https://github.com/zhuzhuor/Unblock-Youku/blob/master/server/server.js
      //var youku_f_link = "http://f.youku.com/player/getFlvPath/sid/";
      if (!input.vid || !input.vtype) {
         return;
      }
      var vid = input.vid,
         stream_t = input.vtype;

      var requrl = "http://v.youku.com/player/getPlayList/VideoIDS/" + vid + "/timezone/+08/version/5/source/video?n=3&ran=5061&password=";
      var p_headers = sogou.new_sogou_proxy_headers(url.parse(requrl).hostname, url.parse(requrl).host);
      console.dir(p_headers);
      var options = {
         url: requrl,
         proxy: sogou.new_sogou_proxy_addr(),
         headers: p_headers
      };

      var myself = this;
      request(options, function(error, response, body) {
         if (!error && response.statusCode == 200) {
            var res = JSON.parse(body);
            var data = res.data[0];
            console.dir(data);
            if (data.streamfileids[stream_t] == undefined) {
               console.log("ERR: no such stream type in streamfileids");
               cb("Err Data parse");
               return;
            }
            var VideoMetaData = {
               vTitle: "",
               vLogo: "",
               vTags: "",
               vCategories: "",
               vVid: "",
               vIdEncoded: "",
               vTvList: [],
               vNext: {},
               vShow: {},
               vSize: {},
               vList: []
            };
            VideoMetaData.vTitle = data.title;
            VideoMetaData.vLogo = data.logo;
            VideoMetaData.vTags = data.tags;
            VideoMetaData.vCategories = data.categories;
            VideoMetaData.vVid = data.videoid;
            VideoMetaData.vTvList = data.list;
            VideoMetaData.vIdEncoded = data.vidEncoded;
            VideoMetaData.vNext = data.list_next;
            VideoMetaData.vShow = data.show;
            VideoMetaData.vSize = data.streamsizes;
            VideoMetaData.vList = [];
            VideoMetaData.vType = stream_t;

            var segs = data.segs[stream_t];
            var fileids = data.streamfileids[stream_t];
            VideoMetaData.vList = getMediaUrls(fileids, data.seed, segs, stream_t);
            // var downloader = require('./downloader.js');
            // downloader.setlist(urls.vList);
            // downloader.start();
            cb(null, VideoMetaData);
         } else {
            console.log("ERR: " + error);
            cb(error);
         }
      });
   },


   // foo: function(req, res, next) {
   //    Youku.fetchUrl(function() {
   //       var v = {
   //          type: "foo",
   //          source: req.url.split('/')[2]
   //       };
   //       v.data = Youku.urls.vList;
   //       req.video = v;
   //       console.dir(req.video);
   //       next();

   //    });
   //    console.log("----");
   //    console.log(req.url);


   // }

};
module.exports = Youku;

//return the downloadable media URLs

function getMediaUrls(fids, seed, segs, type) {
   if (fids.length == 0) return [];
   var youku_f_link = "http://f.youku.com/player/getFlvPath/sid/";
   var fullfids = getFileId(fids, seed);
   var sid = getsid();
   var outputList = [];
   for (var i = 0; i < segs.length; i++) {
      var video_part_num = parseInt(segs[i]["no"]);
      var key = segs[i]["k"];
      var part_num_hex = ('0' + video_part_num.toString(16)).slice(-2);
      part_num_hex = part_num_hex.toUpperCase();
      console.log("video-part-num: " + video_part_num + " part_num_hex : " + part_num_hex);
      var converted_fid = fullfids.substring(0, 8) + part_num_hex + fullfids.substring(10);
      var request_url = youku_f_link + sid + '_' + ('0' + video_part_num).slice(-2) + '/st/' + type + '/fileid/' + converted_fid + '?K=' + key;
      console.log(request_url);
      outputList.push(request_url);
   };
   return outputList;
};

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