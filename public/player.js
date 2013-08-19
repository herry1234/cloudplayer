function load() {
   var ul = jQuery('#vlist li');
   var vlist = [];
   for(var i=0; i < ul.length; i++) {
      vlist.push(ul[i].innerText);
   }
   console.dir(vlist);
   var index = 0;
   videojs("my_video").ready(function() {
      console.log("ready");
      var myPlayer = this;
      myPlayer.on("ended", function() {
         console.log("ended");
         index++;
         if (vlist[index]) {
            myPlayer.src({
               type: "video/mp4",
               src: vlist[index]
            });
         } else {
            myPlayer.dispose();
         }
      });
   });
}