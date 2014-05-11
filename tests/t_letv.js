
//github
//https://github.com/LiuLang/monkey-videos/blob/master/letv/letv.js

var querystring = require('querystring'),
  request = require('request'),
  url = require('url');

//http://www.letv.com/ptv/pplay/pid.html will be redired to
//http://www.letv.com/ptv/vplay/vid.html

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

getTimestamp(function(key) {

  var tkey = key;
  var vid = 20068215;
  var format = "1300"; //350, 1000, 1300, 1080p, 720p

  var requrl = "http://api.letv.com/mms/out/video/play?id=" + vid +
    "&platid=1&splatid=101&format=1&domain=http%3A%2F%2Fwww.letv.com&tkey=" + tkey;

  request({
    url: requrl
  }, function(error, response, body) {
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
        });

      } else {
        console.log('Failed to get video json');
      }
    } else {
      console.log("ERR" + error);
    }
  });
});

//NO Use anymore
function escapeUrl(url) {
  var index = url.search('&platid');
  if (index > -1) {
    return url.substr(0, index);
  } else {
    console.log('Failed to escape url:', url);
  }
};

//NO USE anymore

function base64(url) {
  //get the fake code
  var fcode, codereg = /\/([A-Za-z0-9]+)\?/;
  var match = codereg.exec(url);
  if (match) {
    fcode = match[1];
    var fcode_len = fcode.length;
    console.log("fake code is " + fcode);
    //decode 64base
    var decode64 = new Buffer(fcode, 'base64').toString('ascii');
    console.log(url.substr(0, match.index));
    console.log(url.substr(fcode_len + 1 + match.index));
    var realURL = url.substr(0, match.index - 7) + '/' + decode64 + url.substr(fcode_len + 1 + match.index);
    console.log(realURL);
  }
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