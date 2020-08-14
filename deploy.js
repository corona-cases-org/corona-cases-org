let fs = require('fs-extra')
let path = require('path')
let cliProgress = require('cli-progress')
let broccoli = require('broccoli')
let TreeSync = require('tree-sync')
let firebaseTools = require('firebase-tools')
let rimrafSync = require('rimraf').sync
let fetch = require('node-fetch')
let locations = require('./locations')
let redirects = require('./redirects')


// == Redirects ==

firebaseRedirects = redirects
  .filter(([src, dest]) => dest != null)
  .map(([src, dest]) => ({
    source: src,
    destination: dest,
    type: 301,
  }))

firebaseRedirects.push({
  source: '/charts/:location*',
  destination: '/:location',
  type: 301
})


// == Paths to download from the web server ==

let routedPaths = [
  '/',
  '/li',
  '/sitemap.xml',
]

for (let prefix of ['', '/li']) {
  for (let path of locations.pathComponentsByIndex.map(locations.pathComponentsToPath)) {
    for (let suffix of ['', '.json']) {
      routedPaths.push(prefix + path + suffix)
    }
  }
}


async function deploy() {
  let deployDir = fs.mkdtempSync('deploy.tmp-')
  try {
    process.env.NODE_ENV = 'production'

    let firebaseConfig = {
      hosting: {
        public: '.',
        cleanUrls: true,
        ignore: [
          'firebase.json',
          '**/.*',
        ],
        headers: [
          {
            source: '**',
            headers: [
              {
                key: 'Cache-Control',
                value: 'max-age=60, must-revalidate',
              }
            ]
          },
          {
            source: '/404.html',
            headers: [
              {
                key: 'Cache-Control',
                value: 'no-cache',
              }
            ]
          },
        ],
        redirects: firebaseRedirects,
      }
    }

    fs.copySync('public', deployDir)

    const { Ignitor } = require('@adonisjs/ignitor')
    let server = new Ignitor(require('@adonisjs/fold'))
      .appRoot(__dirname)
    try {
      await server.fireHttpServer()
      let bar = new cliProgress.SingleBar({
        format: ' {bar} {percentage}% | ETA: {eta}s | {path}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        etaBuffer: 500,
        clearOnComplete: true,
        fps: 60,
      })
      bar.start(routedPaths.length, null, { path: '' })

      for (let [i, routedPath] of routedPaths.entries()) {
        bar.update(i, {
          path: routedPath
        })
        let res = await fetch(`http://localhost:3333${routedPath}`, { redirect: 'manual' })
        if (!res.ok) {
          throw new Error(`Non-200 HTTP response on http://localhost:3333${routedPath}`)
        }
        let text = await res.text()
        let outputPath = `${deployDir}${routedPath}`
        if (outputPath.match(/\/$/)) {
          outputPath += 'index.html'
        } else if (path.extname(routedPath) === '') {
          outputPath += '.html'
        }
        fs.mkdirSync(path.dirname(outputPath), { recursive: true })
        fs.writeFileSync(outputPath, text)
      }
      bar.stop()
    } finally {
      server._fold.ioc.use('Adonis/Src/Server').close()
    }

    let builder = new broccoli.Builder(require('./Brocfile'))
    try {
      await builder.build()
      await new TreeSync(builder.outputPath, `${deployDir}/assets`).sync()
    } finally {
      await builder.cleanup()
    }

    fs.copySync('.firebaserc', `${deployDir}/.firebaserc`)
    fs.writeFileSync(`${deployDir}/firebase.json`, JSON.stringify(firebaseConfig))
    await firebaseTools.deploy({
      project: "default",
      cwd: deployDir,
    })
    console.log('Successfully deployed to Firebase')
  } finally {
    rimrafSync(deployDir)
  }
}

deploy().catch((err) => {
  console.error(err)
  process.exit(1)
})
