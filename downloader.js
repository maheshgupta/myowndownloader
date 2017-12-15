const YoutubeMp3Downloader = require("youtube-mp3-downloader");
Downloader = function (ffmpegpath = "/usr/bin/ffmpeg", dest = "") {

    var self = this;

    //Configure YoutubeMp3Downloader with your settings
    self.YD = new YoutubeMp3Downloader({
        "ffmpegPath": ffmpegpath,        // Where is the FFmpeg binary located?
        "outputPath": dest,    // Where should the downloaded and encoded files be stored?
        "youtubeVideoQuality": "highest",       // What video quality should be used?
        "queueParallelism": 2,                  // How many parallel downloads/encodes should be started?
        "progressTimeout": 2000                 // How long should be the interval of the progress reports
    });

    self.callbacks = [];
    self.onProgressCallbacks = [];
    self.track = {};

    self.YD.on("finished", function (error, data) {
        if (self.callbacks[data.videoId]) {
            self.callbacks[data.videoId](error, data);
        } else {
            console.log("Error: No callback for videoId!");
        }

    });

    self.YD.on("error", function (error, data) {
        console.log(JSON.stringify(data))
        console.error(error + " on videoId " + data.videoId);
        if (self.callbacks[data.videoId]) {
            self.callbacks[data.videoId](error, data);
        } else {
            console.log("Error: No callback for videoId!");
        }
    });

    self.YD.on('progress', progress => {
        if (self.onProgressCallbacks[self.track.videoId]) {
            self.onProgressCallbacks[self.track.videoId](progress)
        }
    })
};

Downloader.prototype.getMP3 = function (track, onStart = () => { }, onProgress = () => { }, callback = () => { }) {

    var self = this;
    self.track = track;
    // Register callback
    self.callbacks[track.videoId] = callback;
    self.onProgressCallbacks[track.videoId] = onProgress
    // Trigger download
    console.log("Track : " + JSON.stringify(track, null, ' '))
    onStart()
    console.log("Please wait...")
    self.YD.download(track.videoId, track.name);

};

module.exports = Downloader;