var http = require('http'),
   fs = require('fs'),
   url = require('url'); 


var liveurl = 'http://tvhd.ak.live.cntv.cn/cache/1_/seg0/index.m3u8';
//var liveurl = 'http://t.live.cntv.cn/m3u8/cctv-1.m3u8';
var channelId = 'pa://cctv_p2p_hdcctv1';
var html5_api = 'http://vdn.apps.cntv.cn/api/getLiveUrlHtml5Api.do?channel=' + channelId + '&type=ipad';


var myagent='Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B334b Safari/531.21.10';
var options = {
   host: 'vdn.apps.cntv.cn',
   port: 80,
   path: '/api/getLiveUrlHtml5Api.do?channel=' + channelId + '&type=ipad',
   headers: {'user-agent': myagent},
   method: 'GET'
};
var pids = [];
// Download ts file one by one. So Agent is introduced. 
var myAgent = new http.Agent({maxSockets: 1});
var myM3U8Host = '';
//Parsing the m3u8 file to get the list of ts file. 
var m3u8_parser = function (chunk) {

   console.log('BODY: ' + chunk);
   var buffer = [];
   var bodyLen = 0;
   buffer.push(chunk);
   bodyLen += chunk.length;
   var lines = chunk.toString().split("\n");
   var isM3U8 = false;
   var patten1 = /#EXT-X-STREAM-INF:PROGRAM-ID=(\d+),\s?BANDWIDTH=(\d+)/;
   //3.3.10.  EXT-X-STREAM-INF

   //   The EXT-X-STREAM-INF tag identifies a media URI as a Playlist file
   //   containing a multimedia presentation and provides information about
   //   that presentation.  It applies only to the URI that follows it.  Its
   //   format is:
   //
   //   #EXT-X-STREAM-INF:<attribute-list>
   //   <URI>
   var patten2 = /#EXT-X-TARGETDURATION:(\d+)/;
   //RFC: 3.3.2.  EXT-X-TARGETDURATION

   //  The EXT-X-TARGETDURATION tag specifies the maximum media segment
   //  duration.  The EXTINF duration of each media segment in the Playlist
   //  file MUST be less than or equal to the target duration.  This tag
   //  MUST appear once in the Playlist file.  It applies to the entire
   //  Playlist file.  Its format is:

   //  #EXT-X-TARGETDURATION:<s>
   var patten3 = /#EXTINF:(\d+),/;
   var patten4 = /#EXT-X-MEDIA-SEQUENCE:(\d+)/;
   //  Each media URI in a Playlist has a unique integer sequence number.
   //  The sequence number of a URI is equal to the sequence number of the
   //  URI that preceded it plus one.  The EXT-X-MEDIA-SEQUENCE tag
   //  indicates the sequence number of the first URI that appears in a
   //  Playlist file.  Its format is:

   //  #EXT-X-MEDIA-SEQUENCE:<number>


   //The initial minimum reload delay is the duration of the last media
   //   segment in the Playlist.  Media segment duration is specified by the
   //   EXTINF tag.
   var segments = [];
   var last_duration = 10;
   var cur_seq = 0;
   var pid_bw = null;
   for ( var i=0;i<lines.length; i++ ) {
      //console.log('M3U8 file line [' + lines[i] );
      var line_str = lines[i].replace(/^\s+|\s+$/g, '');
      if(line_str === '#EXTM3U') {
         console.log('Got firstline of M3U8');
         isM3U8 = true;
      }
      pid_bw = patten1.exec(line_str);
      var maxduration = patten2.exec(line_str);
      var inf = patten3.exec(line_str);
      var seq = patten4.exec(line_str);
      //pid_bw[0] is the whole matched string
      if(pid_bw != null) {
         console.log('Show pid and bandwith: ' + pid_bw[1] + ' : ' + pid_bw[2]);
         var pid = {};
         pid.id = pid_bw[1];
         pid.bw = pid_bw[2];
         pid.pl = lines[i+1];
         pids.push(pid);
      }
      if(maxduration != null) {

      }
      if(seq != null) {
         cur_seq = seq[1];
         //compare seq with existing seq
      }
      if(inf != null) {
         last_duration = inf[1];
         segments.push(lines[i+1]);
         cur_seq ++;
      }

   };
   if(!pid_bw) pids.push({});
   if(segments.length > 0) {
      //TODO: always pick up the first bw
      console.log("DEBUG");
      pids[0].segments = segments;
   }
};

//HTTP Response Callback
var router = {
   "video/MP2T": "cb_ts_data",
   "audio/x-mpegurl":"get_playlist",
   "application/x-mpegurl":"get_ts_file",
};
   
var cb_m3u8 = function(res) {
};
function show_http_header (res) {
   console.log('STATUS: ' + res.statusCode);
   console.log('HTTPVersion: ' + res.httpVersion);
   for (var header in res.headers) {
      var iValue = res.headers[header];
      console.log('HTTP Response header [' + header + ':' + iValue + '\]');
   };

}
var write_ts = function(fname,chunk) {
   //console.log('Receiving data length '+ chunk.length);
   var filename = '' + fname + '.ts';
   var fd = fs.openSync(filename,'a+');
   fs.writeSync(fd,chunk,0,chunk.length,0);
   fs.closeSync(fd);
}
var req = http.request(options, function(res) {
   show_http_header(res);
   var type = res.headers['content-type']; 
   res.on('data',function(data) {
      console.log(data.toString());
      function getHtml5VideoData(data) {};
      eval(data.toString());
      //now we have var html5VideoData;
      var M3U8Url = JSON.parse(html5VideoData).ipad;
      get_playlist(M3U8Url);

   });
   res.on('close',function () { console.log('close');});
    

});
req.on('error', function(e) {
   console.log('problem with request: ' + e.message);
});
req.end();

var get_playlist = function(m3u8url) {
   //choose one bandwitdh
   var options2 = url.parse(m3u8url);
   var options = {};
   myM3U8Host = options.host = options2.host;
   options.method = 'GET';
   options.path = options2.path;
   options.agent = myAgent;
   //var dir = '';
   //for(var i = 1; i < path.length-1;i++ ) {
   //   dir += '/' + path[i];
   //}
   //if (options2.path.split('/')[0] != '') {
   //    dir = dir + '/' + options2.path.split('/')[0];
   //    options2.path = dir + '/'+ options2.path.split('/')[1];
   //} else {
   //    options2.path = dir + '/' + options2.path;
   //}
   //options.dir = dir;
      
   console.log('dump options: host ' + options.host +' path: ' + options.path + ' method: ' + options.method);
   console.log('Requesting m3u8 list');
   var req2 = http.request(options,function(res) {
      show_http_header(res);
      var type = res.headers['content-type']; 
      res.on('data',m3u8_parser);
      res.on('end', function() {
         if(type === "application/x-mpegURL") {
            get_ts_file();
         } else {
            console.log("NOT expected res from server");
         };
      });
      res.on('close',function () { console.log('close');});
   });
   req2.on('error', function(e) {
      console.log('problem with request1: ' + e.message);
   });
   req2.end();
};


var get_ts_file = function() {
   var fname = "cctv1";

   //choose one media uri according with bandwitdh
   for (var i=0; i< pids[0].segments.length; i++) {
      var options2 ={};
      options2.path =  pids[0].segments[i];
      options2.method = 'GET';
      options2.host = myM3U8Host;
      options2.agent = myAgent;
      console.log('dump options: host ' + options2.host +' path: ' + options2.path + ' method: ' + options2.method);
      console.log('Requesting Ts file list');
      var req2 = http.request(options2,function(res) {
         res.on('data',function(data){
               write_ts(fname,data);
         });
         res.on('end', function () { 
            console.log('End of TS file download'); 
         });
         res.on('close',function () { console.log('close');});
      });
      req2.on('error', function(e) {
         console.log('problem with request2: ' + e.message);
      });
      req2.end();
   }
};
