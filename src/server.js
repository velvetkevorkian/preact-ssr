const express = require('express')
const compression = require('compression')
import render from 'preact-render-to-string'
import { html } from 'htm/preact' // use the provided preact binding
import PreactApp from './components/PreactApp'

const app = express() // create the express app
app.use(compression()) // use gzip for all requests

const body = render(html`
  <h1>Hello from Preact</h1>
  <div id="root">
    <${PreactApp} />
  </div>
`)

// some basic html to show
const layout =`
  <!DOCTYPE html>
  <html>
    <body>
      ${body}
      <script type="module" src="client.js" async></script>
    </body>
  </html>
`

app.get('/', (request, response) => { // listen for requests to the root path
  response.send(layout) // send the HTML string
})

app.get('/client.js', (request, response) => {
  response.sendFile('client.js', {
    root: './build',
  })
})

app.listen(3000) // listen for requests on port 3000
