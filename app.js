const cheerio = require('cheerio')
const path = require('path')
const process = require('process')
const got = require('got');
const ProgressBar = require('ascii-progress');
const fs = require('fs');
const inquirer = require('inquirer');

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

function init() {
    let url = getUrl();
    // console.log("Please Wait...")
    downloadPage(url).then(data => {
        const Dollar = cheerio.load(data)
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
        downloadFiles(urls)
    }).catch(err => {
        console.log("Error : " + err)
    })
}

async function downloadPage(url) {
    let progressBar;
    // console.log("Url : " + url)
    // const response = await got(url).on('downloadProgress', progress => {
    //     if (progress.percent == 0) {
    //         progressBar = new ProgressBar({
    //             schema: ':bar :percent',
    //             total: parseInt(progress.total, 10),
    //             clean: true
    //         })
    //     } else {
    //         progressBar.tick(progress.transferred)
    //     }
    // })
    const response = await got(url)
    return response.body
}



function isValidMP3(url) {
    const filename = path.basename(url)
    const extn = path.extname(filename)
    // console.log(`Extn : ${extn}, Filename : ${filename}`)
    return extn.toLocaleLowerCase() === ".mp3"
}

function downloadFiles(urls) {

    getFinalUrls(urls).then(data => {
        const destination = getDestination();
        data.map(each => {
            const filename = each.filename
            const url = each.url;
            const dest = destination + "/" + filename
            let progressBar;
            let prevTick = 0;
            let color = `percent.${getColor()}`
            // console.log("Downloading : " + color);
            got.stream(url).on('downloadProgress', progress => {
                if (progress.percent == 0) {
                    progressBar = new ProgressBar({
                        schema: ':bar :' + color + ' :name :transferred / :size',
                    })
                } else {
                    let ticks = Math.round((progress.transferred * 100) / progress.total)
                    if (ticks !== prevTick) {
                        progressBar.tick({
                            name: filename,
                            transferred: progress.transferred,
                            size: progress.total
                        });
                        prevTick = ticks;
                    }
                }
            }).pipe(fs.createWriteStream(dest))
            if (progressBar) progressBar.clear()
        })
    }).catch(err => {
        console.log("Err : " + err)
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

function getColor() {
    const index = Math.floor(Math.random() * colors.length, colors.length)
    return colors[index];
}

function getUrl() {
    const args = process.argv
    console.log(JSON.stringify(args))
    const destArg = args.filter(arg => {
        return arg.startsWith("--url=")
    })

    if (destArg && destArg.length !== 0) {
        return destArg.toString().replace("--url=", "")
        // return destArg.toString().split('=')[1]
    } else {
        throw ("No url given..")
    }
}


function getFinalUrls(urls = []) {
    const urlMap = urls.map(url => {
        return {
            url: url,
            filename: path.basename(url)
        }
    })

    const choices = urlMap.map(url => {
        return { name: url.filename, checked: true }
    })
    const isDownloadFinal = 'isDownloadFinal';
    const nameFileNames = 'nameFileNames';
    const listThemAll = 'listThemAll';
    const choicesQuestion = [
        {
            type: 'checkbox', name: nameFileNames,
            message: 'Here is the list, select from them',
            choices: choices
        }
    ]

    return new Promise((resolve, reject) => {
        urlMap.forEach((url, index) => {
            console.log(`${index} - ${url.filename}`)
        })

        inquirer.prompt({
            type: 'confirm',
            name: isDownloadFinal,
            message: 'Download all the files, or any modifications before downloading?'
        }).then(answers => {
            let isDownloadFinalValue = answers[isDownloadFinal]
            if (isDownloadFinalValue === false) {
                resolve(urlMap)
            } else {
                return inquirer.prompt({
                    type: 'confirm',
                    name: 'listThemAll',
                    message: 'Do you want to list them all?'
                })
            }
            resolve(urlMap)
        }).then(answers => {
            const listThemAllValue = answers[listThemAll]
            if (listThemAllValue) {
                return inquirer.prompt(choicesQuestion)
            } else {
                resolve([])
            }
        }).then(answers => {

            const selectedList = answers[nameFileNames]
            const finals = urlMap.filter((value) => {
                return selectedList.indexOf(value.filename) >= 0
            })
            resolve(finals)
        }).catch(err => reject(err))

    })

}


function _getFinalUrls(urls = []) {
    const urlMap = urls.map(url => {
        return {
            url: url,
            filename: path.basename(url)
        }
    })

    const choices = urlMap.map(url => {
        return { name: url.filename, checked: true }
    })
    const nameFileNames = 'nameFileNames'

    const choicesQuestion = [
        {
            type: 'checkbox', name: nameFileNames,
            message: 'Here is the list, select from them',
            choices: choices
        }
    ]

    return Promise((resolve, reject) => {
        urlMap.forEach((url, index) => {
            console.log(`${index} - ${url.filename}`)
        })
        inquirer.prompt({
            type: 'confirm',
            name: 'isDownloadFinal',
            message: 'Download all the files, or any modifications before downloading?'
        }).then(answers => {
            console.log("Ansers :" + JSON.stringify(answers, null, ' '))
            const isDownloadFinal = answers["isDownloadFinal"]
            if (!isDownloadFinal) {
                console.log("Yes Downloading is final :)")
                resolve(urlMap)
            } else {
                return inquirer.prompt({
                    type: 'confirm',
                    name: 'listThemAll',
                    message: 'Do you want to list them all?'
                })
            }
        }).then(answers => {
            if (answers) {
                const listThemAll = answers['listThemAll']
                if (listThemAll) {
                    inquirer.prompt(choicesQuestion)
                } else {
                    console.log("Downloing all :)")
                }
            }
        }).then(answers => {
            if (answers) {
                urlMap = urlMap.filter(value => {
                    return answers.includes(value.filename)
                })
                resolve(urlMap)
            } else {
                resolve(urlMap)
            }
        }).catch(err => reject(err))
    })
}


init()
