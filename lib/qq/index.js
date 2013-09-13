var querystring = require('querystring'),
  url = require('url'),
  request = require('request');
var sogou = require('../util/proxy');


var Qq = {
  fetchUrl: function(input, callback) {
    if (!input.vid || !input.vtype) {
      return;
    }
    var vid = input.vid,
      stream_t = input.vtype;

    var requrl = 'http://vv.video.qq.com/geturl?otype=json&vid=' + vid;
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
        var res = eval(body);
        console.log(JSON.stringify(res, null, 2));
        var data = res.vd.vi[0];
        console.log(data.url);
        getMediaUrls(data.url, function(error,realurl) {
          if(error) {
            console.log("error on fetch reald url");
            callback(error);
          } else {
            var VideoMetaData = {
               vTitle: "",
               vLogo: "",
               vTags: "",
               vCat: "qq",
               vCategories: "",
               vVid: "",
               vIdEncoded: "",
               vTvList: [],
               vNext: {},
               vShow: {},
               vSize: {},
               vList: []
            };
            VideoMetaData.vTitle = "QQ Video";
            VideoMetaData.vVid = vid;
            VideoMetaData.vTvList = [];
            VideoMetaData.vIdEncoded = vid;
            VideoMetaData.vType = stream_t;
            VideoMetaData.vList = [realurl];
            callback(null,VideoMetaData);
          }

        });
      } else {
        console.log("ERR " + error);
      }
    });
  }
};
module.exports = Qq;
function getMediaUrls(oriUrl,cb) {
  request({
    url: oriUrl,
    followRedirect: false
  }, function(error, response, body) {
    if (!error && (response.statusCode >= 300 && response.statusCode < 400)) {
      console.log(response.headers["location"]);
      var url = response.headers["location"];
      cb(null,url);
    } else {
      cb(error);
    }

  });
}