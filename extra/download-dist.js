console.log('Downloading dist')
const https = require('https')
const tar = require('tar')

const packageJSON = require('../package.json')
const fs = require('fs')
const version = '1.14.0-beta.0'

const filename = 'dist.tar.gz'

const url = `https://github.com/louislam/uptime-kuma/releases/download/${version}/${filename}`
download(url)

function download (url) {
  console.log(url)

  https.get(url, (response) => {
    if (response.statusCode === 200) {
      console.log('Extracting dist...')

      if (fs.existsSync('./dist')) {
        if (fs.existsSync('./dist-backup')) {
          fs.rmdirSync('./dist-backup', {
            recursive: true
          })
        }

        fs.renameSync('./dist', './dist-backup')
      }

      const tarStream = tar.x({
        cwd: './'
      })

      tarStream.on('close', () => {
        if (fs.existsSync('./dist-backup')) {
          fs.rmdirSync('./dist-backup', {
            recursive: true
          })
        }
        console.log('Done')
      })

      tarStream.on('error', () => {
        if (fs.existsSync('./dist-backup')) {
          fs.renameSync('./dist-backup', './dist')
        }
        console.error('Error from tarStream')
      })

      response.pipe(tarStream)
    } else if (response.statusCode === 302) {
      download(response.headers.location)
    } else {
      console.log('dist not found')
    }
  })
}
