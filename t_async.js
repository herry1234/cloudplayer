var async = require('async');
var MyFoo = {

   tasks : ["abc", "efg", "4" , "6", "7", "10","11"],
   results : [],
   exec : function() {
      var myself = this;
      async.eachLimit(this.tasks, 1,foo.bind(MyFoo), function(err){
         //This callback will only be called when all tasks been called success or callback with error.  
         //Condition 1: foo call callback cb()
         //Condition 2: foo call callback cb(err) 
         //if no cb() was called, it means something wrong, will never call this callback. 
         if(err) console.log(err);
         console.log("All Done");
         for(var i = 0;i < myself.results.length; i++) {
            console.log(myself.results[i]); 
         }
      });

   }

};
function foo(item, cb) {
   console.log("running item #" + item);
   //if(item == "11" ) return;
   if(item == "6" ) {
      cb(" in the middle");
   } else {
      this.results.push(item);
      cb();
   }
   console.log(this.item);
   //cb("ERROR");
   console.log("end of foo");
};


MyFoo.exec();
