const path = require('path')
const ProgressBar = require('ascii-progress');
const YoutubeMp3Downloader = require("youtube-mp3-downloader");
const Downloader = require('./downloader');
// const dest = getDestination()
const ffmpegPath = '/usr/bin/ffmpeg';
const colors = ['red',
    'cyan',
    'blue',
    'grey',
    'white',
    'black',
    'green',
    'yellow',
    'magenta',
    'brightRed',
    'brightBlue',
    'brightCyan',
    'brightWhite',
    'brightBlack',
    'brightGreen',
    'brightYellow',
    'brightMagenta'];

// youtubeToMp3('https://www.youtube.com/watch?v=XQlesAM8vjo', dest)
// youtubeToMp3('https://www.youtube.com/watch?v=pJ8cS_FNaUo', dest)

const dl = new Downloader(ffmpegPath, getDestination())
let progressBar;
let prevTick;
let color = `percent.${getColor()}`

dl.getMP3(
    { videoId: "Vhd6Kc4TZls", name: "Cold Funk - Funkorama.mp3" },
    () => {
        progressBar = new ProgressBar({
            schema: ':bar :' + color + ' :name :transferred / :size',
        })

    },
    progress => {
        // console.log("Progress : " + JSON.stringify(progress))

        let ticks = Math.round((progress.progress.transferred * 100) / progress.progress.length)
        console.log(ticks)
        if (ticks !== prevTick) {
            progressBar.update(ticks, {
                name: progress.videoId,
                transferred: progress.progress.transferred,
                size: progress.progress.length
            });
            prevTick = ticks;
        }
    },
    (error, data) => {
        if (error) { console.log("Error :" + err) }
        else { console.log(JSON.stringify(data)) }
    }
)





// function youtubeToMp3(url, dest) {

//     const YD = new YoutubeMp3Downloader({
//         "ffmpegPath": ffmpegPath,        // Where is the FFmpeg binary located?
//         "outputPath": dest,    // Where should the downloaded and encoded files be stored?
//         "youtubeVideoQuality": "highest",       // What video quality should be used?
//         "queueParallelism": 2,                  // How many parallel downloads/encodes should be started?
//         "progressTimeout": 2000                 // How long should be the interval of the progress reports
//     });

//     let progressBar;
//     let prevTick = 0;
//     let color = `percent.${getColor()}`

//     //Download video and save as MP3 file

//     const id = path.basename(url).replace('watch?v=', "")
//     console.log("ID : " + id)

//     YD.on("finished", function (err, data) {
//         console.log(JSON.stringify(data));
//     });

//     YD.on("error", function (error) {
//         console.log("Some error while donwloading : " + error)
//     });

//     YD.on("progress", function (progress) {
//         console.log("Here1")
//         if (progressBar == undefined) {
//             progressBar = new ProgressBar({
//                 schema: ':bar :' + color + ' :name :transferred / :size',
//             })
//             console.log("Here2")
//         }
//         console.log("Here3")

//         let ticks = Math.round((progress.transferred * 100) / progress.length)
//         if (ticks !== prevTick) {
//             progressBar.tick({
//                 name: progress.videoId,
//                 transferred: progress.transferred,
//                 size: progress.length
//             });
//             prevTick = ticks;
//         }
//     });
//     YD.download(id);

// }

function getColor() {
    const index = Math.floor(Math.random() * colors.length, colors.length)
    return colors[index];
}

function getDestination() {
    const args = process.argv
    const destArg = args.filter(arg => {
        return arg.startsWith("--dest=")
    })

    if (destArg && destArg.length !== 0) {
        return destArg.toString().split('=')[1]
    } else {
        throw ("No destination given..")
    }
}




