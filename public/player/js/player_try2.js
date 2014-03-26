//Player2.js
// var currentPlayer;
// There are two video tag. One is created html file, 
// Another one is created by js because 'display:none' doesn't for videojs videotag. 
// There are 2 player instances mapping to these two video tags.


/*

Problem: with android browser, the second player can't move forward.
currentTime is always 0 after calling play(). it results that we can't make it
as 'getreadyforplay'.
*/

var vlist = [];
var currentPosition = 0;
var VJSPlayers = [];
var VJS_DoItOnce = 0;
var isVJS_FullScreen;
var currentPlayer = 0;
/*
0: player 1 playing, 
1: player 2 playing.

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
   p.loading = false;
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
      
      this.loading = true;
      // P1.on('pause',function() {
      //    console.log("p1 paused occured");
      // });
      // P1.on('seeked',function() {
      //    console.log("p1 seeked occured");
      // });
      // P1.on("progress",function(){
      //    console.log("p1 progress");
      //    //P2.loading = false;
         
      // });
      // P1.on("playing",function(){
      //    console.log("p1 playing");
      //    //P1.loading = false;
         
      // });
      P1.on("timeupdate", function(e) {
         if (P1.loading && P1.currentTime() >= 1.0 ) {
         //if (P1.loading ) {
            P1.loading = false;
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
         //1
         console.log("p1 emptied");
         
      });
      P1.on("loadstart",function(){
         //2
         console.log("p1 loadstart");
         
      });
      
      P1.on("loadedmetadata", function(e) {
         //3
         console.log("p1 loadedmetadata");
         P1.width(e.target.videoWidth);
         P1.height(e.target.videoHeight);
      });

      P1.on("loadeddata",function(){
         //4
         console.log("p1 loadeddata");
         P1.volume(0);
         P1.play();
         //P1.loading = true;
      });
      P1.on("canplay",function(){
         //5
         console.log("p1 canplay");
         
      });
      P1.on("canplaythrough",function(){
         //6
         console.log("p1 canplaythrough");
         
      });
      P1.on("ended", function() {
         console.log("P1 Video ended");
         P1.loading = true;
         hide_video_ui("#vjs1");
         show_video_ui("#vjs2");
         console.log("currentPosition " + currentPosition); 
         preload(P1);
         currentPlayer++;
         if(currentPosition <= (vlist.length+1)) {
            wakeupNextPlayer(currentPlayer);
         }
      });
      preload(P1);
      VJSPlayers[0] = P1;

   });
   videojs("vjs2", {}, function() {
      console.log("vjs2 ready");
      var P2 = this;
      P2.hide();
      P2.loading = true;
      P2.timer = 0;
      P2.on("error", function(err) {
         console.log("ERROR " + err);
      });
      // P2.on('pause',function() {
      //    console.log("p2 paused occured");

      // }); 
      // P2.on("playing",function(){
      //    console.log("p2 playing");
      //    P2.loading = false;
         
      // });
      // P2.on("progress",function(){
      //    console.log("p2 progress");
      //    //P2.loading = false;
         
      // });
      P2.on("timeupdate", function(e) {
         //console.log("P2:" + P2.currentTime() + P2.loading);
         if ((P2.loading && P2.currentTime() >= 1.0 )) {
            P2.loading = false;
            console.log("---P2 ready ---");
            readyForPlay(P2)
         }
      });
      P2.on("loadeddata",function(){
         console.log("p2 loadeddata");
         P2.volume(0);
         P2.play();
         
      });
      P2.on("loadedmetadata", function(e) {
         console.log("P2 loadedmetadata");
         P2.width(e.target.videoWidth);
         P2.height(e.target.videoHeight);
      });
      P2.on("ended", function() {
         console.log("P2 Video ended");
         P2.loading = true;
         hide_video_ui("#vjs2");
         show_video_ui("#vjs1");
         console.log("currentPosition " + currentPosition);
         preload(P2);
         currentPlayer--;
         if(currentPosition <= (vlist.length+1)) {
            wakeupNextPlayer(currentPlayer);
         }
      });
      preload(P2);
      VJSPlayers[1] = P2;
   });

};


function preload(p) {
   var src = vlist[currentPosition];
   console.log(src);
   if (src != undefined) {
      console.log("currentPlayer is: " + currentPlayer);
      console.log("set source " + src + ", load, play and mute");
      p.pause();
      p.src([{ type: "video/mp4",src: src}]);
      p.load();
      
   }
   currentPosition++;

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
