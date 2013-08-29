var querystring = require('querystring'),
  url = require('url'),
  request = require('request');
var sogou = require('./proxy');

//Provided by User
var vid = "t00124j130x";
var plid = "";
var webUrl = "";
var stream_t = "mp4";
//
var requrl = 'http://vv.video.qq.com/geturl?otype=json&vid=' + vid;
var p_headers = sogou.new_sogou_proxy_headers(url.parse(requrl).hostname, url.parse(requrl).host);
console.dir(p_headers);
var options = {
    url: requrl,
    proxy: sogou.new_sogou_proxy_addr(),
    headers: p_headers
};

var urls = {
  vTitle: "",
  vList: []
};
request(options, function(error, response, body) {
  if (!error && response.statusCode == 200) {
    //console.log(body);
    var res = eval(body);
    console.log(JSON.stringify(res, null, 2));
    var data = res.vd.vi[0];
    console.log(data.url);
    getMediaUrls(data.url);
  } else {
    console.log("ERR " + error);
  }
});

function getMediaUrls(oriUrl) {
  request({
    url: oriUrl,
    followRedirect: false
  }, function(error, response, body) {
    if (!error && (response.statusCode >= 300 && response.statusCode < 400)) {
      console.log(response.headers["location"]);
      var url = response.headers["location"];
    }

  });
}