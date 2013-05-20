var querystring = require('querystring'), request = require('request'), async = require('async'), fs = require('fs'), path = require('path'),
zlib = require('zlib');
var sohu = require('./sohu.js');
var url = 'http://tv.sohu.com/s2013/houseofcards1/';
var options = {
	url : url,
	'content-type' : 'text/html'
};
var res = request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log("Here");
		} else {
			console.log("ERR" + error);
		}
	});

function gunzipHtml(res) {
	var gunzip = zlib.createGunzip();
	var html = "";
	gunzip.on('data', function (data) {
		html += data.toString();
	});
	gunzip.on('end', function () {
		var pt_vid = /var vid="([0-9]+)";/;
		var pt_vids = /var vids="([0-9,]+)";/;
		/*
		fd = fs.openSync(path.join(process.cwd(), 'debug'), 'w');
		fs.writeSync(fd,html.toString());
		fs.closeSync(fd);
		 */

		var vid = pt_vid.exec(html);
		var vids = pt_vids.exec(html);
		console.log(vid[1]);
		console.log(vids[1]);
		var vid_list = vids[1].split(',');
		for (var i = 0; i < vid_list.length; i++) {
			//download one
			getOne(vid_list[i]);
		};

	});
	res.pipe(gunzip);

}

gunzipHtml(res);

function getOne(vid) {

	sohu.config({
		vid : vid
	});
	sohu.go();
}
