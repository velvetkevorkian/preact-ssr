const nodeExternals = require('webpack-node-externals')
const ManifestPlugin = require('webpack-manifest-plugin')

const isProduction = process.env.NODE_ENV === 'production'
const mode = isProduction ? 'production' : 'development'

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
    // hash the filename in production only
    filename: isProduction ? '[name]-[contenthash].js' : '[name].js',
    path: __dirname + '/build/public'
  },
  module: {
    rules: [
      babelOptions,
    ],
  },
  plugins: [
    // generate a manifest for our server to refer to
    new ManifestPlugin({
      fileName: '../manifest-client.json',
    }),
  ],
}

module.exports = [server, client]
