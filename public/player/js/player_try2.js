//Player2.js
// var currentPlayer;
// There are two video tag. One is created html file, 
// Another one is created by js because 'display:none' doesn't for videojs videotag. 
// There are 2 player instances mapping to these two video tags.

var vlist = [];
var currentPosition = 0;
var VJSPlayers = [];
var VJS_DoItOnce = 0;
var isVJS_FullScreen;
var currentPlayer = 0;
/*
0 : not playing,
1: player 1 playing, 
2: player 2 playing.

 */


function createHidenNewVideoTag() {
   var newvideo = document.createElement("video");
   newvideo.id = "vjs2";
   newvideo.display = "none";
   newvideo.preload = "none";
   newvideo.className = "video-js vjs-default-skin vjs-big-play-centered";
   var maindiv = document.getElementById("mainvideodiv");
   maindiv.appendChild(newvideo);
}

function startPlayCurrent(i) {
   var p = VJSPlayers[(currentPlayer + 1) % 2];
   currentPosition = i;
   preload(p);
   var p2 = VJSPlayers[(currentPlayer) % 2];
   p2.currentTime(3600);


}

function getPlaylist() {
   var ul = jQuery('#vlist li');
   var bl = document.getElementById('buttonList');
   for (var i = 0; i < ul.length; i++) {
      vlist.push(ul[i].innerHTML);
      console.log("Pushing video: " + ul[i].innerHTML);
      var newButton = document.createElement("input");
      newButton.type = "button";
      newButton.value = i + '';
      newButton.name = i + '';
      newButton.onclick = (function() {
         var currentI = i;
         return function() {
            startPlayCurrent(currentI);
         }
      })();
      bl.appendChild(newButton);
   }
}

function load() {
   getPlaylist();
   createHidenNewVideoTag();
   videojs("vjs1").ready(function() {
      console.log("vjs1 ready");

      var P1 = this;
      P1.on("error", function(err) {
         console.log("ERROR " + err);
      });
      
      this.do_it_once = true;
      P1.on('pause',function() {
         console.log("p1 paused occured");
      });
      // P1.on('seeked',function() {
      //    console.log("p1 seeked occured");
      // });
      P1.on("timeupdate", function(e) {
         if (P1.currentTime() >= 1.0 && P1.do_it_once ) {
            P1.do_it_once = false;
            console.log("---P1 ready ---");
            
            if (VJS_DoItOnce == 0) {
               VJS_DoItOnce = 1;
               console.log("Play init....");
               P1.volume(100);
               P1.play();
            } else {
               readyForPlay(P1);
            }
         }
      });
      P1.on("emptied",function(){
         console.log("p1 loadstart");
         if(P1.do_it_once) {
            P1.volume(0);
            P1.play();
         }
         
      });
      P1.on("loadedmetadata", function(e) {
         P1.width(e.target.videoWidth);
         P1.height(e.target.videoHeight);
      });
      P1.on("ended", function() {
         console.log("P1 Video ended");
         P1.do_it_once = true;
         hide_video_ui("#vjs1");
         show_video_ui("#vjs2");
         preload(P1);
         currentPlayer++;
         wakeupNextPlayer(currentPlayer);
      });
      preload(P1);
      VJSPlayers[0] = P1;

   });
   videojs("vjs2", {}, function() {
      console.log("vjs2 ready");
      var P2 = this;
      P2.hide();
      P2.do_it_once = true;
      P2.on("error", function(err) {
         console.log("ERROR " + err);
      });
      P2.on('pause',function() {
         console.log("p2 paused occured");

      }); 
      P2.on("timeupdate", function(e) {
         //console.log("P2:" + P2.currentTime());
         if ((P2.currentTime() >= 1.0) && (P2.do_it_once == true)) {
            P2.do_it_once = false;
            console.log("---P2 ready ---");
            readyForPlay(P2);
         }
      });
      P2.on("emptied",function(){
         console.log("p2 loadstart");
         P2.volume(0);
         P2.play();
      });
      P2.on("loadedmetadata", function(e) {
         console.log("Loaded metadata happened");
         P2.width(e.target.videoWidth);
         P2.height(e.target.videoHeight);
      });
      P2.on("ended", function() {
         console.log("P2 Video ended");
         P2.do_it_once = true;
         hide_video_ui("#vjs2");
         show_video_ui("#vjs1");
         setTimeout(function() {
            preload(P2);
         },1000);
         
         currentPlayer--;
         wakeupNextPlayer(currentPlayer);

      });
      preload(P2);
      VJSPlayers[1] = P2;
   });

};


function preload(p) {
   var src = vlist[currentPosition];
   currentPosition++;
   console.log(src);
   if (src != undefined) {
      console.log("currentPlayer is: " + currentPlayer);
      console.log("set source " + src + ", load, play and mute");
      p.pause();
      p.src([{ type: "video/mp4",src: src}]);
      p.load();
      // p.volume(0);
      // p.play();
   }

}

function wakeupNextPlayer(pIndex) {
   console.log("waking up player : " + pIndex);
   if (pIndex > 1 || pIndex < 0) {
      console.log("something wrong");
      return;
   }
   var p = VJSPlayers[pIndex];
   p.volume(100);
   p.play();
}

function readyForPlay(p) {
   console.log("readyForPlay....");
   
   // p.on('seeked',function() {
   //    if(p.currentTime === 0 ) {
         
   //    }
      
   // });
   p.pause();
   p.currentTime(0);

}

function hide_video_ui(vid) {
   var _vid = vid;
   $(_vid).removeClass("vjs-controls-enabled").addClass("vjs-controls-disabled");
   $(_vid).hide();
   $(_vid + "_html5_api").hide();
}

function show_video_ui(vid) {
   var _vid = vid;
   $(_vid).removeClass("vjs-controls-disabled").addClass("vjs-controls-enabled");
   $(_vid).show();
   $(_vid + "_html5_api").show();
}
