//Player2.js
// var currentPlayer;
var vlist = [];
var p1, p2, p3;
function load() {
  
   videojs("vid1").ready(function() {

      var myPlayer = this;
      this.ispreloading = true;
      p1 = myPlayer;
      myPlayer.on("error", function(err) {
         console.dir(err);
      });
      preload(myPlayer);
      var ispreloading = true;
      myPlayer.on("timeupdate", function(e) {
         if (myPlayer.currentTime() >= 1.0 && myPlayer.ispreloading) {
            finishPrebuffering(myPlayer);
            myPlayer.play();
         }
      });
      myPlayer.on("ended", function() {
         console.log("vid1 end");
         myPlayer.hide();
         //p2.show();
         jQuery("#list1").hide();
         p2.play();
         jQuery("#list2").show();
      });

   });
   videojs("vid2", {}, function() {
      var myPlayer = this;
      p2 = myPlayer;
      this.ispreloading = true;
      preload(myPlayer);
      console.log("new video ready preload");
      var do_it_once = true;
      myPlayer.on("error", function(err) {
         console.dir(err);
      });
      myPlayer.on("timeupdate", function(e) {
         if (myPlayer.currentTime() >= 1.0 && myPlayer.ispreloading) {
            finishPrebuffering(myPlayer);

         }
      });
      myPlayer.on("ended", function() {
         console.log("vid2 ended");
         myPlayer.hide();
      });
   });


};

function preload(currentPlayer) {
   currentPlayer.ispreloading = true;
   currentPlayer.volume(0);
   currentPlayer.play();
}

function finishPrebuffering(currentPlayer) {
   console.log("pause....");
   if(currentPlayer.ispreloading) {
      currentPlayer.ispreloading = false;
      currentPlayer.currentTime(0);
      
   }
   if(currentPlayer.currentTime() == 0) {
      currentPlayer.pause();
      currentPlayer.volume(100);
   }
   
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