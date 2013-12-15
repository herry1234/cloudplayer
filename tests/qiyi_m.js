var request = require('request');

//var vid = "b15ff4792a694e07bc6a80b29d0c453f";

var MQiyi = {

  fetchUrl: function(input, cb) {
    //
    if(!input.vid || !input.vtype) {
         return;
      }
    var vid = input.vid,stream_t = input.vtype;
    var requrl = 'http://cache.video.qiyi.com/m/' + vid + '/';
    var options = {
      url: requrl
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
        }, function(err,data) {
          if(err) {
            cb(err);
          } else {
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
            VideoMetaData.vList.push(data);
            cb(null,VideoMetaData);
          }

        });
      } else {
        console.log("ERR" + error);
        cb(error);
      }
    });
  }
};
module.exports = MQiyi;

function getRealUrl(data,callback) {
  var mediaurl = data.url;
  console.log(mediaurl);
  var options = {
    url: mediaurl
  };
  request(options, function(error, response, body) {
    var ret = undefined;
    if (!error && response.statusCode == 200) {
      if (data.type == "mp4") {
        ret = qiyi_m_parse_mp4(body);
      } else {
        ret = qiyi_m_parse_m3u(body);
      };
      callback(null,ret);
    } else {
      console.log(response.statusCode);
      callback(error);
    }

  });

};

function qiyi_m_parse_mp4(data) {
  eval(data);
  console.log(videoUrl.data.l);
  return videoUrl.data.l;
}

function qiyi_m_parse_m3u(data) {

  console.log(data);
  return data;
}