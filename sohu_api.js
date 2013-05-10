

//using sohu API. 

var request = require('request'),
  fs = require('fs'), 
	path = require('path');
//Provided by User
var vid = "337381";
//,
//1114447,990617

var plid = "";
var webUrl = "";
var stream_t = {
	pc : "url_ori_mp4",
	android : "downloadurl",
	ios : "url_ori",
	ios_high: "url_high",
	orig: "url_ori_mp4",
	high: "url_high_mp4",
	nomal: "url_nor_mp4",
	sup : "url_super_mp4"
};

var url = 'http://api.tv.sohu.com/video/info/' + vid + '.json?api_key=88a12cee7016fe81ac2ab686d918bc7c&ugc=2&playurls=1'
var options = {
   url : url
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
	if(res.status != 200) {
		console.log("NOT expected data: " + body);
	} else {
		var data = res.data;
		console.log(data.tv_name);
		urls.vTitle = data.tv_name;
		console.log(data[stream_t["high"]]);
		getMediaUrls(data[stream_t["high"]]);
		savetofile(urls);
	}
  } else {
    console.log("ERR" + error);
   }
});

function getMediaUrls (data) {
	if(data.length > 0) {
		var vlist = data.split(',');
		for(var i = 0; i < vlist.length; i++) {
			console.log(vlist[i]);
			urls.vList.push(vlist[i]);
		}
		
	}

}
function savetofile(data) {
	fd = fs.openSync(path.join(process.cwd(), 'sohuplaylist.txt'), 'a')
	for(var i = 0; i< data.vList.length; i ++ ) {

		fs.writeSync(fd, data.vList[i] + "\r\n");
	}

	fs.closeSync(fd);
}
