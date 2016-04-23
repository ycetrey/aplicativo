cordova.define("com.phonegap.plugins.videoplayer.VideoPlayer", function(require, exports, module) {


	var exec = require("cordova/exec");

	function VideoPlayer() {
		this.url = null;
	}

	VideoPlayer.prototype.play = function(url) {
		exec(null, null, "VideoPlayer", "playVideo", [url]);
	};

	var videoPlayer = new VideoPlayer();
	module.exports = videoPlayer;


});
