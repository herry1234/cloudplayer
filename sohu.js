
//https://github.com/cscscheng/Raspberry-Pi-NetworkPlayer/blob/master/youku.py
//http://userscripts.org/scripts/review/131926
//http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
var request = require('request');

//Provided by User
var vid = "";
var plid = "";
var webUrl = "";
var stream_t = "mp4";

//
var youku_f_link = "http://f.youku.com/player/getFlvPath/sid/";
var url = 'http://hot.vrs.sohu.com/vrs_flash.action?vid=1114447&af=1&bw=1361&plid=1012140&out=0&g=7&referer=http%3A//tv.sohu.com/20130429/n374439125.shtml&t=0.06235922733321786';
var options = {
   url : url,
   proxy : 'http://222.197.188.39:8080'
};

var urls = {
   vTitle : "",
   vList : []
};
request(options, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    //console.log(body);
    var res = JSON.parse(body);
    console.log(JSON.stringify(res,null,2));
    var data = res.data;
    console.log(data.tvName);
    urls.vTitle = data.tvName;
    //console.log(data.videoid);
    //var segs=data.segs[stream_t];
    //var fileids = data.streamfileids[stream_t];
    getMediaUrls(data);
  } else {
    console.log("ERR" + error);
   }
});

function getMediaUrls (data) {
   //Step 3:  Get the real (CDN ?) media URL
   //http://220.181.61.229/?prot=2&file=/tv/20130429/823840-1114448-1a75e257-d34b-46b0-95a1-35f667f2e319.mp4&new=/121/22/wJZeNPnns9YQ4iGw9k3I84.mp4&t=0.9826031643897295
   var su_l = data.su;
   var url_l = data.clipsURL;
   var req =  require('request');
   if(su_l.length != url_l.length) { console.log("something wrong"); return }
   for(var i=0; i< su_l.length; i++ ) {
      var mp4filename = url_l[i].replace('http://data.vod.itc.cn', "");// remove http://data.vod.itc.cn
      console.log(mp4filename);
      var suname = su_l[i];
      var query_url = 'http://220.181.61.229/?prot=2&file=' + mp4filename + '&new=' + suname ;
      console.log(query_url);
      req({url: query_url}, function(error,response, body) {
            if (!error && response.statusCode == 200) {
               console.log(body);
               var out = body;
               out = out.split('|');
               var key = out[3];
               var url = out[0];
               if(url.charAt(url.length-1) == '/') url = url.slice(0,url.length-1);
               var video_url = url + suname + '?key=' + key;
               console.log(video_url);
         }
         
      });
   
   }
}


