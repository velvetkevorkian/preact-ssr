const nodeExternals = require('webpack-node-externals')
const ManifestPlugin = require('webpack-manifest-plugin')

const isProduction = process.env.NODE_ENV === 'production'
const mode = isProduction ? 'production' : 'development'

const babelConfig = ({targets}) => ({
  test: /\.js$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      plugins: [
        ['htm', { import: 'preact' }]
      ],
      presets: [
        ['@babel/preset-env', { targets }]
      ],
      cacheDirectory: true,
    },
  },
})

const serverBabelConfig = babelConfig({
  targets: { node: 'current' }
})
const clientBabelConfig = babelConfig({
  targets: { esmodules: true }
})
const legacyBabelConfig = babelConfig({
  targets: {
    browsers: [
      '> 1%',
      'last 2 versions',
      'Firefox ESR',
    ],
  },
})

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
      serverBabelConfig,
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
      clientBabelConfig,
    ],
  },
  plugins: [
    // generate a manifest for our server to refer to
    new ManifestPlugin({
      fileName: '../manifest-client.json',
    }),
  ],
}

const legacy = {
  mode,
  entry: {
    client: './src/client.js',
  },
  output: {
    // hash the filename in production only
    filename: isProduction ? '[name]-legacy-[contenthash].js' : '[name]-legacy.js',
    path: __dirname + '/build/public'
  },
  module: {
    rules: [
      legacyBabelConfig,
    ],
  },
  plugins: [
    // generate a manifest for our server to refer to
    new ManifestPlugin({
      fileName: '../manifest-legacy.json',
    }),
  ],
}

module.exports = [server, client, legacy]
