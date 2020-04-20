const nodeExternals = require('webpack-node-externals')

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'

const server = {
  target: 'node',
  mode,
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
  mode,
  entry: {
    client: './src/client.js',
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/build/public'
  },
}

module.exports = [server, client]
