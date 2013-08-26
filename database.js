//http://blog.ijasoneverett.com/2013/03/a-sample-app-with-node-js-express-and-mongodb-part-1/
var mongo = require('mongodb'),
  Server = mongo.Server,
  Db = mongo.Db,
  BSON = mongo.BSONPure,
  //BSON = mongo.BSON; ??
  ObjectID = mongo.ObjectID; //?

var VideoProvider = function(host, port) {
  var myself = this;
  this.db = new Db(process.env.MONGO_TV_DB, new Server(host, port, {
    safe: false
  }, {
    auto_reconnect: true
  }, {}));
  this.db.open(function(err,database) {
    	if (!err) {
		console.log("db  opened !");
		database.authenticate(process.env.MONGO_TV_USER, process.env.MONGO_TV_PSW, function(authErr, success) {
			if (!authErr) {
				myself.db = database;
			}
		});
	};
  });
};


VideoProvider.prototype.getCollection = function(callback) {
  this.db.collection('video', function(error, video_collection) {
    if (error) {
      callback(error);
    } else {
      callback(null, video_collection);
    }
  });
};

//find all
VideoProvider.prototype.findAll = function(callback) {
  this.getCollection(function(error, video_collection) {
    if (error) callback(error)
    else {
      video_collection.find().toArray(function(error, results) {
        if (error) callback(error)
        else callback(null, results)
      });
    }
  });
};
//find by ID:
VideoProvider.prototype.findById = function(id, callback) {
  this.getCollection(function(error, video_collection) {
    if (error) callback(error)
    else {
      video_collection.findOne({
        '_id': new BSON.ObjectID(id)
        //'_id': video_collection.db.bson_serializer.ObjectID.createFromHexString(id)
      }, function(err, item) {

        if (err) {
          console.err(err);
          callback(error);
        } else callback(null, item);
      });
    }
  });
};
VideoProvider.prototype.delete = function(id, callback) {
  this.getCollection(function(error, video_collection) {
    if (error) callback(error);
    else {
      video_collection.remove({
          _id: new BSON.ObjectID(id)
        },
        function(error, v) {
          if (error) callback(error);
          else callback(null, v)
        });
    }
  });
};
//save new one
VideoProvider.prototype.add = function(videos, callback) {
  this.getCollection(function(error, video_collection) {
    if (error) callback(error)
    else {
      if (typeof(videos.length) == "undefined")
        videos = [videos];

      for (var i = 0; i < videos.length; i++) {
        videos[i].created_at = new Date();
      }
      //insert multiple items at one time. 
      video_collection.insert(videos, function() {
        callback(null, videos);
      });
    }
  });
};

//save new one
VideoProvider.prototype.update = function(id, video, callback) {
  this.getCollection(function(error, video_collection) {
    if (error) callback(error)
    else {
      video_collection.update({
          '_id': new BSON.ObjectID(id)
        }, video,
        function(err, result) {
          if (err) {
            console.log('error changing : ' + id);
          } else {
            callback(null, video);
          }

        });
    }
  });
};

exports.VideoProvider = VideoProvider;