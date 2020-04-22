const express = require('express')
const compression = require('compression')
const fs = require('fs')
import render from 'preact-render-to-string'
import { html } from 'htm/preact' // use the provided preact binding
import PreactApp from './components/PreactApp'

const app = express() // create the express app
app.use(compression()) // use gzip for all requests

const jsonFromFile = path => {
  try {
    return JSON.parse(fs.readFileSync(path))
  } catch(err) {
    console.warn(`Error parsing object from JSON:`, err)
    return {}
  }
}

// parse the manifests generated by Webpack
const assets = {
  client: jsonFromFile('./build/manifest-client.json'),
  legacy: jsonFromFile('./build/manifest-legacy.json'),
}

const clientScriptTag = assets.client['client.js']
  ? `<script type="module" src="/public/${assets.client['client.js']}" async></script>`
  : ''

const legacyScriptTag = assets.legacy['client.js']
  ? `<script nomodule src="/public/${assets.legacy['client.js']}" async></script>`
  : ''

const clientStyleTag = assets.client['client.css']
  ? `<link rel="stylesheet" href="/public/${assets.client['client.css']}" />`
  : ''

const body = render(html`
  <h1>Hello from Preact</h1>
  <div id="root">
    <${PreactApp} />
  </div>
`)

// some basic html to show, including the script from our manifest
// and the fallback script for browsers that don't support ES Modules
const layout =`
  <!DOCTYPE html>
  <html>
    <head>
      ${clientStyleTag}
    </head>
    <body>
      ${body}
      ${clientScriptTag}
      ${legacyScriptTag}
    </body>
  </html>
`

app.get('/', (request, response) => { // listen for requests to the root path
  response.send(layout) // send the HTML string
})

// serve everything in ./build/public as static files
app.use('/public', express.static('./build/public'))

app.listen(3000) // listen for requests on port 3000
