const express = require('express')
const compression = require('compression')

const app = express() // create the express app
app.use(compression()) // use gzip for all requests

// some basic html to show
const layout =`
  <!DOCTYPE html>
  <html>
    <body>
      <h1>Hello!!!</h1>
    </body>
  </html>
`

app.get('/', (request, response) => { // listen for requests to the root path
  response.send(layout) // send the HTML string
})

app.listen(3000) // listen for requests on port 3000
