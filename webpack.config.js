const nodeExternals = require('webpack-node-externals')

const server = {
  target: 'node',
  mode: 'development',
  externals: [nodeExternals()],
  entry: {
    server: './src/server.js'
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/build'
  }
}

const client = {
  mode: 'development',
  entry: {
    client: './src/client.js',
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/build'
  }
}

module.exports = [server, client]
