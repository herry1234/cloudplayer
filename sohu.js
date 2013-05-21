//
// exports object sohu

//https://github.com/cscscheng/Raspberry-Pi-NetworkPlayer/blob/master/youku.py
//http://userscripts.org/scripts/review/131926
//http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
//http://www.showmycode.com/ : decompile swf file.
var querystring = require('querystring'), request = require('request'), async = require('async'), fs = require('fs'), path = require('path');

var sohu = {

   vid : undefined,
   plid : "",
   webUrl:  "",
   stream_t : "mp4",
   cn_proxy : 'http://219.138.90.114:8080',
   sohu_gip_pool :  ["115.25.217.132", "219.238.10.34", "220.181.61.229", "221.130.27.2", "61.135.183.46", "data.vod.itc.cn"],
   outfname : 'sohuplaylist.txt',
   url : '',
   options :  {},

   init :  function (cfg) {
      //Provided by User
      this.vid = cfg.vid;
      this.outfname = this.vid + '.txt';
      this.url = 'http://hot.vrs.sohu.com/vrs_flash.action?vid=' + this.vid + '&af=1&bw=1361&plid=1012140&out=0&g=7&t=0.06235922733321786';
      this.options = {
         url : this.url,
         proxy : this.cn_proxy
      };
   },

   urls : {
      vTitle : "",
      vList : []
   },
   go : function (callback) {
      var myself = this;
      console.log(myself.options.url);
      request(myself.options, function (error, response, body) {
         if (!error && response.statusCode == 200) {
            //console.log(body);
            var res = JSON.parse(body);
            console.log(JSON.stringify(res, null, 2));
            var data = res.data;
            console.log(data.tvName);
            myself.urls.vTitle = data.tvName;
            //console.log(data.videoid);
            //var segs=data.segs[stream_t];
            //var fileids = data.streamfileids[stream_t];
            myself.getMediaUrls(data, function (err) {
               console.log("trying saving list to file --- err: " + err);
               if (!err) {
                  myself.savetofile(myself.urls);
                  callback();
               }
            });
         } else {
            console.log("ERR" + error);
         }
      });

   },
   getMediaUrls : function (data, callback) {
      //Step 3:  Get the real (CDN ?) media URL
      //http://220.181.61.229/?prot=2&file=/tv/20130429/823840-1114448-1a75e257-d34b-46b0-95a1-35f667f2e319.mp4&new=/121/22/wJZeNPnns9YQ4iGw9k3I84.mp4&t=0.9826031643897295
      var su_l = data.su;
      var url_l = data.clipsURL;
      //var req =  require('request');
      if (su_l.length != url_l.length) {
         console.log("something wrong");
         return
      }
      var items = [];
      for (var i = 0; i < su_l.length; i++) {
         var mp4filename = url_l[i].replace('http://data.vod.itc.cn', ""); // remove http://data.vod.itc.cn
         console.log(mp4filename);
         var suname = su_l[i];
         var query_url = 'http://220.181.61.229/?prot=2&file=' + mp4filename + '&new=' + suname;
         console.log(query_url);
         items.push({
            url : query_url,
            index : i
         });
      }
      async.eachLimit(items, 1, fetch_real_url.bind(sohu), function (err) {
         if (err)
            console.log(err);
         console.log("All Done");
         callback(err);
      });
   },
   savetofile: function (data) {
      fd = fs.openSync(path.join(process.cwd(), this.outfname), 'w');
      var lengh_of_list = 0;
      for (key in data.vList) {
         lengh_of_list++;
      }
      for (var i = 0; i < lengh_of_list; i++) {
         //fs.writeSync(fd, data.vList[i]["index"] + data.vList[i]["url"] + "\r\n");
         fs.writeSync(fd, data.vList[i] + "\r\n");
      }
      fs.closeSync(fd);
   }
};


function fetch_real_url (data, callback) {
   var oriUrl = data.url;
   var index = data.index;
   var myself = this;
   setTimeout(function () {

      request({
         url : oriUrl,
         proxy : myself.cn_proxy
      }, function (error, response, body) {
         if (!error && response.statusCode == 200) {
            var hash = querystring.parse(response.req.path);
            var fname = hash.new;
            //console.log(fname);
            var out = body;
            out = out.split('|');
            var key = out[3];
            var url = out[0];
            if (url.charAt(url.length - 1) == '/')
               url = url.slice(0, url.length - 1);
            var video_url = url + fname + '?key=' + key;
            console.log(video_url);
            myself.urls.vList[index] = video_url;
            callback(); //sucess
         } else {
            console.log("Problbem with URL: " + oriUrl + "error " + error + " status " + response.statusCode);
            callback("Error on index " + index);
         }
      });
   }, 3000);
};

module.exports = sohu;
