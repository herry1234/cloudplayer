var querystring = require('querystring'),
  url = require('url'),
  request = require('request'),
  sogou = require('./proxy');

//Provided by User
//var vid = "4c239fe260524abaa20999f866441ee5";
//var tvid = "497275";
//var aid = "234453";
//MP4 is not working anymore
// M3U8 is still good.

var vid = "b15ff4792a694e07bc6a80b29d0c453f";
var tvid = "463918";
var aid = "391603";
var plid = "";
var webUrl = "";
var stream_t = "mp4";
var bid = "2";

//
var requrl = 'http://cache.video.qiyi.com/m/' + vid + '/';
var p_headers = sogou.new_sogou_proxy_headers(url.parse(requrl).hostname, url.parse(requrl).host);
console.dir(p_headers);
var options = {
  url: requrl,
  //proxy: sogou.new_sogou_proxy_addr(),
  //headers: p_headers
};
var urls = {
  vTitle: "",
  vList: []
};
request(options, function(error, response, body) {
  if (!error && response.statusCode == 200) {

    eval(body);
    console.log(JSON.stringify(ipadUrl, null, 2));
    var oriM3uUrl = ipadUrl.data.url;
    var oriMp4Url = ipadUrl.data.mp4Url;
    console.log(oriMp4Url);
    console.log(oriM3uUrl);
    //getRealUrl({type:"m3u8",url:oriM3uUrl});
    //adding v value.
    getRealUrl({
      type: "mp4",
      url: oriMp4Url + '?v=880216502'
    });
  } else {
    console.log("ERR" + error);
  }
});

function getMediaUrls(oriUrl) {

}

function getRealUrl(data) {
  var mediaurl = data.url;
  console.log(mediaurl);
  var p_headers = sogou.new_sogou_proxy_headers(url.parse(mediaurl).hostname, url.parse(mediaurl).host);
  console.dir(p_headers);
  var options = {
    url: mediaurl,
    // proxy: sogou.new_sogou_proxy_addr(),
    // headers: p_headers
  };
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      if (data.type == "mp4") {
        qiyi_m_parse_mp4(body);
      } else {
        qiyi_m_parse_m3u(body);
      }
    } else {
      console.log(response.statusCode);
    }

  });

}

function qiyi_m_parse_mp4(data) {

  eval(data);
  console.log(videoUrl.data.l);
}

function qiyi_m_parse_m3u(data) {

  console.log(data);
}