
var querystring = require('querystring'),
  request = require('request'),
  url = require('url'),
  sogou = require('../lib/util/proxy');

//http://www.letv.com/ptv/pplay/pid.html will be redired to
//http://www.letv.com/ptv/vplay/vid.html

var __INFO__ = {
  search_word: [],
  url_client: {
    pc: 'http://pc.letv.com/letvfile/letvtg/120183/LeTV_setup.exe',
    iph: 'http://itunes.apple.com/cn/app/id385285922?mt=8',
    adr: 'http://app.m.letv.com/android/index.php?/stat/download/add/pcode/010110000',
    ipad: 'http://itunes.apple.com/cn/app/id412395632?mt=8&ls=1'
  },
  video: {
    title: "人质第一季04", //视频名称
    adseed: 1,
    cid: 2, //频道ID
    video_from: '网站', //视频来源
    pid: 91900, //专辑ID
    mpid: 0,
    vid: 2144566, //视频ID
    nextvid: 2151169,
    mmsid: 3181070, //视频mmsid
    poster: "http://i1.letvimg.com/yunzhuanma/201310/15/c16fa91e3d978d01fbb9b7afd2e3249f/thumb/2_320_180.jpg",
    share: {
      pic: "http://i1.letvimg.com/yunzhuanma/201310/15/c16fa91e3d978d01fbb9b7afd2e3249f/thumb/2_400_300.jpg",
      url: 'http://www.letv.com/ptv/vplay/2144566.html'
    }, //视频图片
    total: 15, //视频总数
    curno: 4, //当前播放集数
    totalcount: 15,
    isend: 1, //剧集是否完结
    score: 0.0, //分数
    doubanid: 0, //豆瓣ID
    download: 1, //下载
    authtype: 0,
    trylook: 0, //十分钟试看
    stime: 1398740657,
    skinid: 0, //皮肤ID
    albumtypeName: "正片", //类型   
    promotionsInfo: "", //推荐看点
    pTitle: "人质第一季", //专辑名称
    pPic: "http://i0.letvimg.com/vrs/201307/18/ff0948f87ab74b4db096aabb3d384360.jpg",
    duration: "41:18", //长时
    streamLevel: "720p"
  },
  playlist: {
    pid: 91900, //专辑ID
    video_from: '网站', //视频来源
    total: 15, //视频总数
    curno: 4, //当前播放集数
    isend: 1, //剧集是否完结
    playStatus: "每周二下午更新字幕版", //跟播状态
    mode: 0, //剧集列表模式0:剧集1:文字2:图片
    newMode: 0, //
    istitbits: 0, //是否片花
    //merge_titbits : 0,
    //title_julist : '视频列表',
    //title_titbits : '花絮·片花',
    ///hezi:'<li class="Li09">畅享极致大屏体验，<a href="http://hd.letv.com" target="_blank">尽在乐视盒子C1！</a></li>',
    txt_follow: '',
    mpid: 0,
    mtotal: 0,
    mcurno: 0,
    tv_preview: 0, //电视剧1正片专辑,2其他
    isshowepisode: 1, //电视剧 是否显示剧集
    isNarrow: 0 //窄屏
  },

  player: {
    version: ["", "", "", "http://player.letvcdn.com/p/201404/24/19/newplayer/LetvPlayer.swf", ""]
  }


};

var mmsid = "20299478";
var videop = 576;

/*

[ 'mp4_1080p6m_db',
  'mp4_1300',
  'mp4_1000',
  'mp4_1300_db',
  'h265_flv_1080p',
  'h265_flv_720p',
  'h265_flv_1300',
  'mp4_720p_db',
  'h265_flv_800',
  'mp4_350',
  'mp4_1080p',
  'mp4_800_db' ]


  http://g3.letv.cn/vod/v2/
  NTUvMTEvNTYvbGV0di11dHMvMTQvdmVyXzAwXzE0LTE1ODMzOTUzLWF2Yy05NTk0NjQtYWFjLTEyNzk5Mi01ODc4NDU1LTgwODIwNTc5NS0wODEwZTA5YTk3MTFmOWJiYmQzMjI1OWNiNTA4NWQxNy0xMzk2OTQ1OTMxNDU1Lm1wNA==
  ?b=1099&mmsid=20299478&tm=1399059010
  &key=e15214ac029bb7d383874029eb8358cc
  &platid=3&splatid=302&playid=0&tss=no
  &vtype=22&cvid=172092644688
  &format=1
  &sign=mb
  &dname=mobile
  &expect=3&tag=ios

  http://g3.letv.cn/vod/v2/
  NTUvMTEvNTYvbGV0di11dHMvMTQvdmVyXzAwXzE0LTE1ODMzOTUzLWF2Yy05NTk0NjQtYWFjLTEyNzk5Mi01ODc4NDU1LTgwODIwNTc5NS0wODEwZTA5YTk3MTFmOWJiYmQzMjI1OWNiNTA4NWQxNy0xMzk2OTQ1OTMxNDU1Lm1wNA==
  ?b=1099&mmsid=20299478&tm=1399060237
  &key=09310ccb0d772955d8fa6f6a7e909f4e
  &platid=1&splatid=101&playid=0&tss=ios
  &vtype=22&cvid=768353404446
*/

var requrl = "http://app.m.letv.com/android/mindex.php?mod=minfo&ctl=videofile&act=index&mmsid=" + mmsid + "&videoformat=ios&pcode=010110000&version=4.3.1";

request({url:requrl}, function(error, response, body) {
  if (!error && response.statusCode == 200) {
    var res = JSON.parse(body);
    console.log(JSON.stringify(res, null, 2));
    if (res.body && res.body.videofile && res.body.videofile.infos) {
      var infos = res.body.videofile.infos;
      console.log(Object.keys(infos));
      var mp4obj;
      switch (videop) {
        case 1088:
          mp4obj = infos.mp4_1080p6m_db;
          break;
        case 576:
          mp4obj = infos.mp4_1300;
          break;
        case 480:
          mp4obj = infos.mp4_1000;
          break;
        case 360:
          mp4obj = infos.mp4_350;
          break;
        case 1080:
          mp4obj = infos.mp4_1080p;
          break;
        default:
          console.log('no this videop!');
          break;
      }

      if (mp4obj && mp4obj.mainUrl) {
        //console.log(mp4obj);
        getMediaUrls(mp4obj.mainUrl, videop);
      } else {
        console.log('not found download url!');
      }
    }
  } else {
    console.log("ERR" + error);
  }
});

function getMediaUrls(oriUrl) {
  request({
    url: oriUrl
  }, function(err, res, body) {
    var res = JSON.parse(body);
    console.log(res);
    if (res.location) {
      var queryStringIndex = res.location.indexOf('?');
      if (queryStringIndex === -1) {
        realurl = res.location;
      } else {
        //realurl = resp.location.substr(0, queryStringIndex);
        realurl = res.location.replace("&tag=ios", "")
          .replace("&tss=ios", "")
          .replace("&m3u8=ios", "")
          .replace("&realext=.m3u8", "");
      }
    }
    console.log("real URL " + realurl);
  });
}