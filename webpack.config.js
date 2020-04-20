const nodeExternals = require('webpack-node-externals')

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'

const babelOptions = {
  test: /\.js$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      plugins: [
        ['htm', { import: 'preact' }]
      ],
    },
  },
}

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
  },
  module: {
    rules: [
      babelOptions,
    ],
  },
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
  module: {
    rules: [
      babelOptions,
    ],
  },
}

module.exports = [server, client]
