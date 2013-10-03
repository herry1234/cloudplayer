var express = require('express');
var app = module.exports = express();
var videos = require('../videos');
var youku = require('../youku');
var qq = require('../qq');
var sohu = require('../sohu');

app.get("/:cat", function(req, res) { //root dir
  videos.findAll({vCat: req.params.cat},function(error, vds) {
    //console.dir(vds);
    res.render('index', {
      title: 'Video List',
      cat: req.params.cat,
      videos: vds
    });
  });
});

app.get('/:cat/:id', function(req, res) {
  // console.log("request id ", req.param("id"));
  // console.log("request cat ", req.params.cat);
  videos.findById(req.param('id'), function(err, v) {
    if (err) {
      console.err(err);
    } else {
      console.dir(v);
      res.render('player', v);
    }
  });
});

app.put('/:cat/:id', function(req, res) {
  if (req.param('type') != "mp4") {
    console.log(req.param('type'));
    res.send("Only MP4 supported now");
    return;
  };
  fetchUrl(req.params.cat,{
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
app.delete('/:cat/:id', function(req, res) {
  videos.delete(req.param('id'), function(err, data) {
    if (err) {
      console.error("Error on del");
    } else {
      console.dir(data);
      res.redirect('/');
    }
  })
});

app.post('/:cat/add', function(req, res) {
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
  fetchUrl(req.params.cat,{
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
var fetchUrl = function(cat,data,fn) {
  switch(cat) {
    case "youku" :
    youku.fetchUrl(data,fn);
    break;
    case "qq" :
    qq.fetchUrl(data,fn);
    break;
    case "sohu" :
    sohu.fetchUrl(data,fn);
    break;
    default:
    console.log("wrong cat");
  }
}