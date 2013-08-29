function load() {
   var ul = jQuery('#vlist li');
   var vlist = [];
   for (var i = 0; i < ul.length; i++) {
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
   $("#update").click(function() {
      console.log('call me');
      var data = {
         vid: $("#vid").text(),
         type: $('#vtype').text()
      }
      console.dir(data);
      $.ajax({
         type: "PUT",
         url: "#",
         contentType: "application/json",
         data: JSON.stringify(data)
      });

   });
};