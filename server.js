var host = "0.0.0.0";
var port = 1337;
var express = require("express");
var app = express();

var youku = require('./youku.js');


app.set('view engine', 'ejs');
//app.use(app.router); //use both root and other routes below
app.configure(function() {
  app.use(express.static(__dirname + '/public/'));
  //Middleware
  //this middle ware moved to get() to avoid global useage. 
  // app.use(foo({
  //   footest: "test"
  // }));
});

app.get("/", function(request, response) { //root dir
  response.send("Hello!!");
});
app.get('/youku/:id', youku.foo, function(req, res) {
  var data = req.video;
  console.dir(data);
  //data.layout = false; 
  res.render(data.type, data);
});



app.listen(port, host);