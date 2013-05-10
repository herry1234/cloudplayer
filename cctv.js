var http = require('http');
var net = require('net');
var options = {
   host: 't.live.cntv.cn',
   port: 80,
   path: '/m3u8/cctv-news.m3u8',
   dir: '',
   method: 'GET'
};
var pids = new Array();
var myAgent = new http.Agent({maxSockets: 1});
// var options = {
//   host: '173.36.255.148',
//   port: 80,
//   path: '/live/ch1.isml/Manifest(format=m3u8-aapl).m3u8',
//   dir: '',
//   method: 'GET'
// };
//HTTP data body call back
m3u8_parser = function (chunk) {

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
   var segments = new Array();
   var last_duration = 10;
   var cur_seq = 0;
   for ( var i=0;i<lines.length; i++ ) {
      //console.log('M3U8 file line [' + lines[i] );
      var line_str = lines[i].replace(/^\s+|\s+$/g, '');
      if(line_str === '#EXTM3U') {
         console.log('Got firstline of M3U8');
         isM3U8 = true;
      }
      var pid_bw = patten1.exec(line_str);
      var maxduration = patten2.exec(line_str);
      var inf = patten3.exec(line_str);
      var seq = patten4.exec(line_str);
      //pid_bw[0] is the whole matched string
      if(pid_bw != null) {
         console.log('Show pid and bandwith: ' + pid_bw[1] + ' : ' + pid_bw[2]);
         var pid = new Object();
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
   if(segments.length > 0) {
      //TODO: always pick up the first bw
      pids[0].segments = segments;
   }
};

//HTTP Response Callback
var router = {
   "video/MP2T": "cb_ts_data",
   "audio/x-mpegurl":"get_playlist",
   "application/x-mpegurl":"get_ts_file",
};
   
cb_m3u8 = function(res) {
   show_http_header(res);
   var type = res.headers['content-type']; 
   res.on('data',m3u8_parser);
   res.on('end', function() {
      if(type === "audio/x-mpegurl") {
         get_playlist();
      } else {
         get_ts_file();
      };
      console.log('End of response HTTP1');
   });
   res.on('close',function () { console.log('close');});
};
function show_http_header (res) {
   console.log('STATUS: ' + res.statusCode);
   console.log('HTTPVersion: ' + res.httpVersion);
   for (var header in res.headers) {
      var iValue = res.headers[header];
      console.log('HTTP Response header [' + header + ':' + iValue + '\]');
   };

}
fs = require('fs');
var index_ts_files = 0;
cb_ts = function(res) {
   show_http_header(res);
   index_ts_files ++;
   res.on('data',save_ts_data);
   res.on('end', function () { 
      console.log('End of TS file download'); 
   });
   res.on('close',function () { console.log('close');});
};
save_ts_data = function(chunk) {
   console.log('Receiving data length '+ chunk.length);
   //var buffer = [];
   //var bodyLen = 0;
   //buffer.push(chunk);
   //bodyLen += chunk.length;
   var filename = index_ts_files + '.ts';
   var fd = fs.openSync(filename,'a+');
   fs.writeSync(fd,chunk,0,chunk.length,0);
   fs.closeSync(fd);

   //ws = fs.createWriteStream(index_ts_files+'.ts');
   //ws.write(chunk);

}
var req = http.request(options, cb_m3u8);
req.on('error', function(e) {
   console.log('problem with request: ' + e.message);
});
req.end();

get_playlist = function() {
   //choose one bandwitdh
   var url = require('url'); 
   var options2 = url.parse(pids[0].pl);
   console.log(pids[0].pl);
   options2.method = 'GET';
   if(!options2.host) {
      options2.host = options.host;
      var path = options.path.split('/');
      var dir = '';
      for(var i = 1; i < path.length-1;i++ ) {
         dir += '/' + path[i];
      }
      if (options2.path.split('/')[0] != '') {
          dir = dir + '/' + options2.path.split('/')[0];
          options2.path = dir + '/'+ options2.path.split('/')[1];
      } else {
          options2.path = dir + '/' + options2.path;
      }
      options.dir = dir;
      
   }
   console.log('dump options: host ' + options2.host +' path: ' + options2.path + ' method: ' + options2.method);
   pids[0].host = options2.host;
   options2.agent = myAgent;
   console.log('Requesting m3u8 list');
   var req2 = http.request(options2,cb_m3u8);
   req2.on('error', function(e) {
      console.log('problem with request1: ' + e.message);
   });
   req2.end();
};


get_ts_file = function() {

   //choose one media uri according with bandwitdh
   var url = require('url'); 
   for (var i=0; i< pids[0].segments.length; i++) {
      var options2 = url.parse(pids[0].segments[i]);
      console.log(options2.path);
      options2.method = 'GET';
      options2.host = pids[0].host;
      options2.agent = myAgent;
      options2.path = options.dir + '/' + options2.path;
      console.log('dump options: host ' + options2.host +' path: ' + options2.path + ' method: ' + options2.method);
      console.log('Requesting Ts file list');
      var req2 = http.request(options2,cb_ts);
      req2.on('error', function(e) {
         console.log('problem with request2: ' + e.message);
      });
      req2.end();
   }
};
