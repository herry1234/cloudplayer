var express = require('express');
var app = module.exports = express();
var qq = require('./qq.js');
var videos = require('../videos');


app.get("/qq", function(req, res) { //root dir
  videos.findAll(function(error, vds) {
    console.dir(vds);
    res.render('index', {
      title: 'Video List',
      cat: "youku",
      videos: vds
    });
  });
});

app.get('/qq/:id', function(req, res) {
  console.log("request id ", req.param("id"));
  console.log("request cat ", req.params.cat);
  videos.findById(req.param('id'), function(err, v) {
    if (err) {
      console.err(err);
    } else {
      console.dir(v);
      res.render('player', v);
    }
  });
});

app.put('/qq/:id', function(req, res) {
  console.log("request id ", req.param("id"));
  console.log("request cat ", req.params.cat);
  if (req.param('type') != "mp4") {
    console.log(req.param('type'));
    res.send("Only MP4 supported now");
    return;
  };
  qq.fetchUrl({
    vid: req.param('vid'),
    vtype: "mp4"
  }, function(err, data) {
    if (err) {
      console.err('error');
      res.send("ERR");
    } else {
      videos.update(req.param('id'), data,function(err, v) {
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
app.delete('/qq/:id', function(req, res) {
  videos.delete(req.param('id'), function(err, data) {
    if (err) {
      console.error("Error on del");
    } else {
      console.dir(data);
      res.redirect('/');
    }
  })
});

app.post('/qq/add', function(req, res) {
  console.log("posting");
  console.dir(req.body);
  if (req.param('type') != "mp4") {
    console.log(req.param('type'));
    res.send("Only MP4 supported now");
    return;
  };
  console.log(req.param('vid'));
  console.log(req.param('type'));
  console.log(req.param('vcat'));
  qq.fetchUrl({
    vid: req.param('vid'),
    vtype: req.param('type')
  }, function(err, data) {
    if (err) {
      console.err('error');
      res.send("ERR");
    } else {
      videos.add(data, function(error, docs) {
        res.send(docs[0]);
      });

    }

  })

});