var host = "0.0.0.0";
var port = process.env.PORT || 4000;
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

app.post('/video/add*', function(req, res) {
  console.log("posting");
  console.dir(req.body);
  if (req.param('type') != "mp4") {
    console.log(req.param('type'));
    res.send("Only MP4 supported now");
    return;
  };
  console.log(req.param('vid'));
  console.log(req.param('type'));
  youku.fetchUrl({
    vid: req.param('vid'),
    vtype: req.param('type')
  }, function(err, data) {
    if (err) {
      console.err('error');
      res.send("ERR");
    } else {
      videoProvider.add(data, function(error, docs) {
        res.send(docs[0]);
      });

    }

  })

});
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
app.put('/youku/:id', function(req, res) {
  console.log("request id ", req.param("id"));
  if (req.param('type') != "mp4") {
    console.log(req.param('type'));
    res.send("Only MP4 supported now");
    return;
  };
  youku.fetchUrl({
    vid: req.param('vid'),
    vtype: "mp4"
  }, function(err, data) {
    if (err) {
      console.err('error');
      res.send("ERR");
    } else {
      videoProvider.update(req.param('id'), data,function(err, v) {
        if (err) {
          console.err(err);
        } else {
          console.dir(v);
          res.render('player', v);
        }
      });
    }

  })

});
app.delete('/youku/:id', function(req, res) {
  videoProvider.delete(req.param('id'), function(err, data) {
    if (err) {
      console.error("Error on del");
    } else {
      console.dir(data);
      res.redirect('/');
    }
  })
});
var videoProvider = new VideoProvider('ds039778.mongolab.com', 39778);
app.listen(port, host);
