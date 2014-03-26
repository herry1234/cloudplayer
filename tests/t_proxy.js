var http = require('http'),
    util = require('util'),
    url = require('url'),
    fs = require('fs'),
    request = require('request');
var vid = 'XNTk1MjY0MDky';
var sogou = require('../lib/util/proxy');

var requrl = "http://v.youku.com/player/getPlayList/VideoIDS/" + vid + "/timezone/+08/version/5/source/video?n=3&ran=5061&password="
var p_headers = sogou.new_sogou_proxy_headers(url.parse(requrl).hostname,url.parse(requrl).host);
console.dir(p_headers);
var options = {
    url: requrl,
    proxy: sogou.new_sogou_proxy_addr(),
    headers: p_headers
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