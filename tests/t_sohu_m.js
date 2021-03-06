//using sohu API. 
//fetch_real_url 
//in fact, no proxy required.
var request = require('request'),
   fs = require('fs'),
   url = require('url'),
   path = require('path'),
   async = require('async');

var sogou = require('../lib/util/proxy');

//Provided by User
var vid = "1114447";
var plid = "";
var webUrl = "";
var stream_t = {
   pc: "url_ori_mp4",
   android: "downloadurl",
   ios: "url_ori",
   ios_high: "url_high",
   orig: "url_ori_mp4",
   high: "url_high_mp4",
   nomal: "url_nor_mp4",
   sup: "url_super_mp4"
};

var apiurl = 'http://api.tv.sohu.com/video/info/' + vid + '.json?api_key=88a12cee7016fe81ac2ab686d918bc7c&ugc=2&playurls=1'
var options = {
   url: apiurl
};

var urls = {
   vTitle: "",
   vList: {}
};
request(options, function(error, response, body) {
   if (!error && response.statusCode == 200) {
      //console.log(body);
      var res = JSON.parse(body);
      console.log(JSON.stringify(res, null, 2));
      if (res.status != 200) {
         console.log("NOT expected data: " + body);
      } else {
         var data = res.data;
         console.log(data.tv_name);
         urls.vTitle = data.tv_name;
         getMediaUrls(data[stream_t["high"]], function(err) {
            console.log("trying saving list to file --- err: " + err);
            //if (!err) savetofile(urls);
         });
      }
   } else {
      console.log("ERR" + error);
   }
});

function getMediaUrls(data, callback) {
   if (data.length <= 0) {
      callback("Len of List is zero");
      return;
   }
   var vlist = data.split(',');
   var items = [];
   for (var i = 0; i < vlist.length; i++) {
      console.log(vlist[i]);
      items.push({
         url: vlist[i],
         fname: i
      });
      //supposely the URLS is not the final ones. 
   }

   async.eachLimit(items, 2, fetch_real_url, function(err) {
      if (err) console.log(err);
      console.log("All Done");
      callback(err);
   });
}

function savetofile(data) {
   fd = fs.openSync(path.join(process.cwd(), 'sohuplaylist.txt'), 'a');
   var lengh_of_list = 0;
   for (key in data.vList) {
      lengh_of_list++
   }

   for (var i = 0; i < lengh_of_list; i++) {
      fs.writeSync(fd, data.vList[i] + "\r\n");
   }

   fs.closeSync(fd);
}

function fetch_real_url(data, callback) {
   var fname = data.fname;
   var requrl = data.url;
   var p_headers = sogou.new_sogou_proxy_headers(url.parse(requrl).hostname, url.parse(requrl).host);
   console.dir(p_headers);
   var options = {
      url: requrl,
      //proxy: sogou.new_sogou_proxy_addr(),
      //headers: p_headers,
      followRedirect: false
   };
   setTimeout(function() {
      request(options, function(error, response, body) {
         if (!error && (response.statusCode >= 300 && response.statusCode < 400)) {
            //console.log(JSON.stringify(response,null,2));
            console.log(response.headers["location"]);
            var url = response.headers["location"];
            urls.vList[fname] = url;
            callback(); //sucess
         } else {
            console.log("Problbem with URL: " + requrl + "error " + error + " status " + response.statusCode);
            callback("Error on index " + fname);
         }
      });
   }, 3000);
}