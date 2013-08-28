var http = require('http'),
    util = require('util'),
    url = require('url'),
    fs = require('fs'),
    request = require('request');
var vid = 'XNTk1MjY0MDky';
var sogou = require('./proxy');

var requrl = "http://v.youku.com/player/getPlayList/VideoIDS/" + vid + "/timezone/+08/version/5/source/video?n=3&ran=5061&password="
var timestamp = Math.round(Date.now() / 1000).toString(16);
var sogou_headers = {};
sogou_headers['X-Sogou-Auth'] = sogou.new_sogou_auth_str();;
sogou_headers['X-Sogou-Timestamp'] = timestamp;
sogou_headers['X-Sogou-Tag'] = sogou.compute_sogou_tag(timestamp, url.parse(requrl).hostname);;
sogou_headers['X-Forwarded-For'] = sogou.new_random_ip();
sogou_headers.Host = url.parse(requrl).host;

console.dir(sogou_headers);
var options = {
    url: requrl,
    proxy: sogou.new_sogou_proxy_addr(),
    headers: sogou_headers
};
console.dir(options);

//https://github.com/zhuzhuor/Unblock-Youku/blob/master/server/server.js
request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
        var res = JSON.parse(body);
        var data = res.data[0];
        console.dir(data);
    } else {
        console.log("ERR: " + error);

    }
});