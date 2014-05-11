var http = require('http'),
   url = require('url'),
   request = require('request');
var sogou = require('../util/proxy.js');
//https://github.com/cscscheng/Raspberry-Pi-NetworkPlayer/blob/master/youku.py
//http://userscripts.org/scripts/review/131926
//http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
//Provided by User

function getTimestamp(cb) {
   console.log('getTimestamp() --');
   var tn = Math.random(),
      url = 'http://api.letv.com/time?tn=' + tn.toString();

   console.log('url:', url);
   request({
      url: url
   }, function(error, response, body) {
      console.log('response:' + JSON.parse(body).stime);
      var stime = parseInt(JSON.parse(body).stime);
      var tkey = getKey(stime);
      console.log("tkey: " + tkey);
      cb(tkey);
   });
};

function getKey(t) {
   console.log('getKey() --', t);
   for (var e = 0, s = 0; s < 8; s += 1) {
      e = 1 & t;
      t >>= 1;
      e <<= 31;
      t += e;
   }
   return t ^ 185025305;
};

function getMediaUrls(data, format, callback) {
   var meta = JSON.parse(data);
   console.log(meta);
   var dispatch = meta.dispatch;
   console.log(dispatch[format]);
   var url, realURL = "";
   if (dispatch[format]) {
      url = (dispatch[format])[0];
      console.log(url);
      //the original url is not working; hack required.
      var hack_url = url + '&format=1&expect=3'; //format 2: xml, format & expect are required.
      hack_url = hack_url.replace("&tss=ios", "&tss=none");
      console.log(hack_url);
      request({
         url: hack_url
      }, function(err, res, body) {
         var res = JSON.parse(body);
         console.log(res);
         if (res.location) {
            realURL = res.location;
         }
         console.log("real URL " + realURL);
         callback(realURL);
      });
   };
}
var Letv = {
   fetchUrl: function(input, cb) {
      //https://github.com/zhuzhuor/Unblock-Youku/blob/master/server/server.js
      //var youku_f_link = "http://f.youku.com/player/getFlvPath/sid/";
      if (!input.vid || !input.vtype) {
         return;
      }
      //var stream_t = input.vtype;
      var vid = input.vid;
      var format = "1300"; //350, 1000, 1300, 1080p, 720p

      getTimestamp(function(key) {

         var tkey = key;


         var requrl = "http://api.letv.com/mms/out/video/play?id=" + vid +
            "&platid=1&splatid=101&format=1&domain=http%3A%2F%2Fwww.letv.com&tkey=" + tkey;

         var p_headers = sogou.new_sogou_proxy_headers(url.parse(requrl).hostname, url.parse(requrl).host);
      console.dir(p_headers);
      var options = {
         url: requrl,
         // proxy: sogou.new_sogou_proxy_addr(),
         headers: p_headers
      };   

         request(options, function(error, response, body) {
            if (!error && response.statusCode == 200) {
               console.log(body);
               var txt = body,
                  jsonReg = /<playurl><!\[CDATA\[([\s\S]+)\]\]><\/playurl/,
                  match = jsonReg.exec(txt),
                  jsonTxt = '',
                  json = '';
               if (match && match.length == 2) {
                  jsonTxt = match[1];
                  getMediaUrls(jsonTxt, format, function(url) {
                     console.log("Play URL is " + url);
                     var VideoMetaData = {
                        vTitle: "",
                        vLogo: "",
                        vTags: "",
                        vCat: "letv",
                        vCategories: "",
                        vVid: "",
                        vIdEncoded: "",
                        vTvList: [],
                        vNext: {},
                        vShow: {},
                        vSize: {},
                        vList: []
                     };
                     var meta = JSON.parse(jsonTxt);
                     VideoMetaData.vTitle = meta.title;
                     VideoMetaData.vIdEncoded = vid;
                     VideoMetaData.vList.push(url);
                     cb(null, VideoMetaData);
                  });

               } else {
                  console.log('Failed to get video json');
               }
            } else {
               console.log("ERR" + error);
            }
         });
      });
   }
};
module.exports = Letv;