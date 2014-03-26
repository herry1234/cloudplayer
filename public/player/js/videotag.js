function load() {
  
  /*
  http://stackoverflow.com/questions/12496144/can-you-autoplay-html5-videos-on-the-ipad


"Apple has made the decision to disable the automatic playing of video on iOS devices,
 through both script and attribute implementations.

In Safari, on iOS (for all devices, including iPad), 
where the user may be on a cellular network and be charged per data unit, 
preload and auto-play are disabled. No data is loaded until the user initiates it." 
- Apple documentation.

Tested on Android:
-- Native browser: video can be played without user interactive
-- Chrome: video CAN'T be playbed without user. 

Tested on Windows phone:
-- IE: can't be launched. 

  */
  var v = document.getElementById("vjs1");
  v.src = "video1.mp4";
  console.log("test weinre log");
  v.load();
  v.addEventListener("loadeddata",function(){
  	console.log("loadstart");
  	v.play();
  });
  
  v.addEventListener("loaded",function(){
  	console.log("emptied");
  	//v.play();
  });

}