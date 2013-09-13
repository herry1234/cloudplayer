var host = process.env.IP || "0.0.0.0";
var port = process.env.PORT || 4000;
var express = require("express");
var app = express();

var router = require('./lib/router');
app.set('view engine', 'ejs');

app.configure(function() {
  
  //parsing the post body to object.
  app.use(express.static(__dirname + '/public/'));
  app.use(express.bodyParser());
  app.use(app.router); //use both root and other routes below
  app.use(router);
  
});

app.get('/video/new', function(req, res) {
  res.render('new', {
    data: "nothing"
  })
});

app.listen(port, host);
