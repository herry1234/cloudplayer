var http = require('http'),
   url = require('url'),
   request = require('request');
var sogou = require('../util/proxy.js');
//
// exports object sohu

//https://github.com/cscscheng/Raspberry-Pi-NetworkPlayer/blob/master/youku.py
//http://userscripts.org/scripts/review/131926
//http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
//http://www.showmycode.com/ : decompile swf file.
var querystring = require('querystring'),
   async = require('async'),
   path = require('path');

var Sohu = {
   fetchUrl: function(sohu_vid, callback) {
      var vid = sohu_vid.vid;
      var requrl = 'http://hot.vrs.sohu.com/vrs_flash.action?vid=' + vid + '&af=1&bw=1361&plid=1012140&out=0&g=7&t=0.06235922733321786';
      var p_headers = sogou.new_sogou_proxy_headers(url.parse(requrl).hostname, url.parse(requrl).host);
      console.dir(p_headers);
      var options = {
         url: requrl,
         proxy: sogou.new_sogou_proxy_addr(),
         headers: p_headers
      };
      request(options, function(error, response, body) {
         if (!error && response.statusCode == 200) {
            //console.log(body);
            var res = JSON.parse(body);
            console.log(JSON.stringify(res, null, 2));
            var data = res.data;
            console.log(data.tvName);

            var VideoMetaData = {
               vTitle: "",
               vLogo: "",
               vTags: "",
               vCat: "sohu",
               vCategories: "",
               vVid: "",
               vIdEncoded: "",
               vTvList: [],
               vNext: {},
               vShow: {},
               vSize: {},
               vList: []
            };
            VideoMetaData.vTitle = data.tvName;
            VideoMetaData.vLogo = data.coverImg;
            VideoMetaData.vTags = res.caname;
            VideoMetaData.vCategories = res.catcode;
            VideoMetaData.vVid = res.id;
            VideoMetaData.vTvList = [data.norVid, data.highVid, data.superVid, data.oriVid];
            VideoMetaData.vIdEncoded = res.id;
            // VideoMetaData.vNext = data.list_next;
            // VideoMetaData.vShow = data.show;
            VideoMetaData.vSize = data.totalBytes;
            // VideoMetaData.vList = [];
            VideoMetaData.vType = "mp4";
            getMediaUrls({
               su: data.su,
               clipsURL: data.clipsURL
            }, function(err, data) {
               if (err) {
                  console.log(err);
                  callback(err);
               } else {
                  VideoMetaData.vList = data;
                  callback(null, VideoMetaData);
               }
            });
         } else {
            console.log("ERR" + error);
         }
      });

   }
};

function getMediaUrls(data, callback) {
   //Step 3:  Get the real (CDN ?) media URL
   //http://220.181.61.229/?prot=2&file=/tv/20130429/823840-1114448-1a75e257-d34b-46b0-95a1-35f667f2e319.mp4&new=/121/22/wJZeNPnns9YQ4iGw9k3I84.mp4&t=0.9826031643897295
   var su_l = data.su;
   var url_l = data.clipsURL;
   if (su_l.length != url_l.length) {
      console.log("something wrong");
      callback("su and clipsURL length is not match");
      return;
   }
   var query_urls = [];
   for (var i = 0; i < su_l.length; i++) {
      var mp4filename = url_l[i].replace('http://data.vod.itc.cn', ""); // remove http://data.vod.itc.cn
      console.log(mp4filename);
      var suname = su_l[i];
      var query_url = 'http://220.181.61.229/?prot=2&file=' + mp4filename + '&new=' + suname;
      console.log(query_url);
      query_urls.push(query_url);
   }
   async.mapLimit(query_urls, 1, fetch_real_url, function(err, results) {
      if (err) {
         console.log("error on async download : " + err);
         callback(err);
      } else {
         console.log("All Done");
         callback(null, results);
      }
   });
};

function fetch_real_url(oriUrl, callback) {
   var p_headers = sogou.new_sogou_proxy_headers(url.parse(oriUrl).hostname, url.parse(oriUrl).host);
   console.dir(p_headers);
   var options = {
      url: oriUrl
      //proxy: sogou.new_sogou_proxy_addr(),
      //headers: p_headers
   };
   request(options, function(error, response, body) {
      if (error) {
        console.log("Err " + error);
         return;
      }
      if (!error && response.statusCode == 200) {
         var hash = querystring.parse(response.req.path);
         var fname = hash.new;
         var out = body;
         out = out.split('|');
         var key = out[3];
         var url = out[0];
         if (url.charAt(url.length - 1) == '/')
            url = url.slice(0, url.length - 1);
         var video_url = url + fname + '?key=' + key;
         console.log("downloadable url " + video_url);
         if(url.indexOf("http://newflv.sohu.ccgslb.net") != -1) {
            fetch_real_url(oriUrl, callback);
         } else {
            callback(null, video_url); //sucess
         }
         
      } else {
         console.log("Problbem with URL: " + oriUrl + "error " + error + " status " + response.statusCode);
         callback("Error in " + oriUrl);
      }
   });
};

module.exports = Sohu;