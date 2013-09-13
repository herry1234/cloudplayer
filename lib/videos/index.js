//index.js
var VideoProvider = require('./database').VideoProvider;
var videoProvider = new VideoProvider('ds039778.mongolab.com', 39778);
var videos = module.exports = videoProvider;