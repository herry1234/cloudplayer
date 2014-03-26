// NOT working anymore. There is one key parameter missing in the request. 
var querystring = require('querystring'),
  request = require('request'),
  url = require('url'),
  sogou = require('../lib/util/proxy');
//Provided by User
var vid = "b15ff4792a694e07bc6a80b29d0c453f";
var tvid = "463918";
var aid = "391603";
var plid = "";
var webUrl = "";
var stream_t = "mp4";
var bid = "2";// video profile ?

//
var requrl = 'http://cache.video.qiyi.com/vd/' + tvid + '/' + vid + '/';
var p_headers = sogou.new_sogou_proxy_headers(url.parse(requrl).hostname, url.parse(requrl).host);
console.dir(p_headers);
var options = {
  url: requrl,
  //proxy: sogou.new_sogou_proxy_addr(),
  headers: p_headers
};

var urls = {
  vTitle: "",
  vList: []
};
request(options, function(error, response, body) {
  if (!error && response.statusCode == 200) {
    var res = JSON.parse(body);
    console.log(JSON.stringify(res, null, 2));
    var data = res;
    console.log(data.dd);
    console.log(data.dm);
    var urls = data.tkl[0]["vs"][0]["fs"];
    getMediaUrls(urls);
  } else {
    console.log("ERR" + error);
  }
});

function getMediaUrls(oriUrl) {

  var url1 = 'http://data.video.qiyi.com/v.f4v?id=' + aid + '&tvid=' + tvid + '&tn=' + Math.random();
  request({
    url: url1
  }, function(err, res, body) {
    var res = JSON.parse(body);
    var time = res.time;
    console.log(res.l);
    console.log(res.time);
    var expire_time = Math.ceil(new Date().getTime() / 1000) + 2374323850;
    getRealUrl(oriUrl, expire_time);
  });
}

function getRealUrl(urls, expire_time) {
  for (var i = 0; i < urls.length; i++) {
    var time = expire_time;
    var url = 'http://data.video.qiyi.com/' + time + '/videos' + urls[i]["l"];
    console.log(url);
    request({
      url: url
    }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log("DEBUG REAL URL : " + body);
      } else {
        console.log(response.statusCode);
      }

    });
  }

}