var async = require('async');

var tasks = ["abc", "efg", "4" , "6", "7", "10","11"];
	async.eachLimit(tasks, 1,foo, function(err){
		if(err) console.log(err);
		console.log("All Done");
	});
	
	function foo(item, cb) {
		
		console.log("running item #" + item);
		//if(item == "abc" ) return;
		cb("ERROR");
		//cb();
		console.log("end of foo");
	}