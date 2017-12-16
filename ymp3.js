const path = require('path')
const ProgressBar = require('ascii-progress');
const YoutubeMp3Downloader = require("youtube-mp3-downloader");
const Downloader = require('./downloader');
const fs = require('fs');
const ffmpegPath = '/usr/local/bin/ffmpeg';
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


let prevTick;
let urls = [
    'https://www.youtube.com/watch?v=k_KD8Tzh2-A',
    'https://www.youtube.com/watch?v=TdPE0sxdd1I',
    'https://www.youtube.com/watch?v=Q0zgq5Uec78'
]

urls.forEach((url, index) => {
    let id = getID(url)
    let destination = getDestination()
    let progressBar;
    const dl = new Downloader(ffmpegPath, getDestination())
    let color = `percent.${getColor()}`;

    dl.getMP3(
        { videoId: id, name: id },
        () => {
            //schema: ':bar :' + color + ' :name :transferred / :size :speed kbps',
            progressBar = new ProgressBar({
                schema: ':bar :' + color + ' :name  :speed kbps',
            })
        },
        progress => {
            // console.log(JSON.stringify(progress, null, ' '))
            let ticks = Math.round((progress.progress.transferred * 100) / progress.progress.length)
            if (ticks !== prevTick) {
                progressBar.update(ticks / 100, {
                    name: progress.videoId,
                    // transferred: progress.progress.transferred,
                    // size: progress.progress.length,
                    speed: Math.round((progress.progress.speed / 1000))
                });
                prevTick = ticks;
            }
        },
        (error, data) => {
            if (error) { console.log("Error :" + err) }
            else {
                let source = data.file;
                let target = destination + "/" + data.videoTitle
                target = target.replace(/\s+/g, '') + ".mp3";
                fs.rename(source, target, err => {
                    if (err) {
                        console.log(`Failed renaming ${target} - ${err}`)
                    }
                })
            }
        }
    )
})





function getID(url) {
    return path.basename(url).replace("watch?v=", "")
}



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




