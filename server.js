var host = "0.0.0.0";
var port = 4000;
var express = require("express");
var app = express();
var youku = require('./youku.js');
var VideoProvider = require('./database').VideoProvider;

app.set('view engine', 'ejs');

app.configure(function() {
  app.use(express.static(__dirname + '/public/'));
  //parsing the post body to object.
  app.use(express.bodyParser());
  app.use(app.router); //use both root and other routes below
  //Middleware
  //this middle ware moved to get() to avoid global useage. 
  // app.use(foo({
  //   footest: "test"
  // }));
});

app.get("/", function(req, res) { //root dir
  videoProvider.findAll(function(error, vds) {
    console.dir(vds);
    res.render('index', {
      title: 'Video List',
      cat: "youku",
      videos: vds
    });
  });
});
app.get('/video/new', function(req, res) {
  res.render('new', {
    data: "nothing"
  })
});

// app.post('/video/new', function(req, res) {
//   videoProvider.add({
//     title: req.param('title'),
//     name: req.param('name'),
//     data: req.param('vlist')
//   }, function(error, docs) {
//     res.redirect('/')
//   });
// });

app.post('/video/add*', function(req, res) {
  console.log("posting");
  console.dir(req.body);
  if(req.param('type') != "mp4") {
    console.log(req.param('type'));
    res.send("NO Good");
    return;
  };
  console.log(req.param('vid'));
  console.log(req.param('type'));
  youku.init(req.param('vid'), req.param('type')).fetchUrl(function(err, data) {
    if (err) {
      console.err('error');
      res.send("ERR");
    } else {
      videoProvider.add({
        title: data.vTitle,
        name: data.vTitle,
        data: data.vList
      }, function(error, docs) {
        res.render('player', docs[0]);
      });

    }

  })

});
// app.get('/youku/:id', youku.foo, function(req, res) {
//   var data = req.video;
//   console.dir(data);
//   //data.layout = false; 
//   res.render(data.type, data);
// });
app.get('/youku/:id', function(req, res) {
  console.log("request id ", req.param("id"));
  videoProvider.findById(req.param('id'), function(err, v) {
    if (err) {
      console.err(err);
    } else {
      console.dir(v);
      res.render('player', v);
    }
  });
});
app.delete('/youku/:id', function(req, res) {
  videoProvider.delete(req.param('id'), function(err, data) {
    if (err) {
      console.error("Error on del");
    } else {
      console.dir(data);
      res.redirect('/youku/');
    }
  })
});
var videoProvider = new VideoProvider(process.env.MONGO_TV_HOST, process.env.MONGO_TV_PORT);
app.listen(port, host);