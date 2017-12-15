const cheerio = require('cheerio')
const download = require('download');
const path = require('path')
const process = require('process')
const ProgressBar = require('progress');
const fs = require('fs');
const request = require('request');
const progress = require('request-progress');
// const url = 'http://english.srichaganti.net/DownloadAll.aspx?dl=SundaraKanda2009.aspx';
// const url = "http://english.srichaganti.net/VasaviMathaVaibhavamuCHN2015.aspx"

function init() {
    let url = getUrl();
    download(url).then(data => {
        const Dollar = cheerio.load(data)
        // const downloadLinks = Dollar(".downloadLinks");
        const downloadLinks = Dollar("a");
        const keys = Object.keys(downloadLinks)
        const urls = []
        keys.forEach(key => {
            const item = downloadLinks[key]
            try {
                if (isValidMP3(item.attribs.href)) {
                    urls.push(item.attribs.href)
                }
            } catch (ex) { }
        })
        // downloadFiles(urls)
    }).catch(err => {
        console.error("Download failed.... : " + err)
    })

}

function isValidMP3(url) {
    const filename = path.basename(url)
    const extn = path.extname(filename)
    // console.log(`Extn : ${extn}, Filename : ${filename}`)
    return extn.toLocaleLowerCase() === ".mp3"
}

function downloadFiles(urls) {
    const destination = getDestination();
    Promise.all(urls.map(url => {
        const filename = path.basename(url)
        console.log(`Downloading file - ${filename}`)
        return download(url, destination).then(() => {
            console.log("Downloading complete for " + filename)
        }).catch(err => { console.error("Download failed for " + err) })
    })).then(() => {
        console.log("Download complete to folder : " + destination)
    }).catch(err => {
        console.error("Error while downloading : " + err)
    })
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


function getUrl() {
    const args = process.argv
    const destArg = args.filter(arg => {
        return arg.startsWith("--url=")
    })

    if (destArg && destArg.length !== 0) {
        return destArg.toString().split('=')[1]
    } else {
        throw ("No url given..")
    }
}

function getMp3Urls(data) {
    const Dollar = cheerio.load(data)
    // const downloadLinks = Dollar(".downloadLinks");
    const downloadLinks = Dollar("a");
    console.log("Data is :" + data)
    const keys = Object.keys(downloadLinks)
    const urls = []
    keys.forEach(key => {
        const item = downloadLinks[key]
        try {
            if (isValidMP3(item.attribs.href)) {
                urls.push(item.attribs.href)
            }
        } catch (ex) { }
    })
    return urls;
}


// init()
const url = "http://english.srichaganti.net/VasaviMathaVaibhavamuCHN2015.aspx";//getUrl()
httpDownload(url)
// .then(body => {
//     const urls = getMp3Urls(body)

//     urls.forEach(url => {
//         console.log("Url : " + url)
//     })
// }).catch(err => {
//     console.log("Error while retrving the http body : " + err)
// })

function httpDownload(url) {
    request(url, {}, (err, response, req) => {
        if (err) {
            console.log("Some Error")
        } else {
            console.log(response.body)
        }
    })
}

function _httpDownload(url) {
    return new Promise((resolve, reject) => {
        let response = ""
        const http = require('http');// url.startsWith("https") ? require('https') : require('http');
        const request = http.request(url, (res) => {
            var len = parseInt(res.headers['content-length'], 10);
            console.log("Length of the data : " + len);
            var bar = new ProgressBar('  downloading [:bar] :rate/bps :percent :etas', {
                complete: '=',
                incomplete: ' ',
                width: 20,
                total: len
            });

            res.on('data', chunk => {
                bar.tick(chunk.length);
                response = response + chunk;
            })

            res.on('end', () => {
                resolve(response)
            })
        }).on('error', err => {
            reject(err)
        })
        request.end()
    })
}
