const nodeExternals = require('webpack-node-externals')
const ManifestPlugin = require('webpack-manifest-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

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

const output = {
  // hash the filename in production only
  filename: isProduction ? '[name]-[contenthash].js' : '[name].js',
  path: __dirname + '/build/public'
}

const manifestPluginOptions = {
  fileName: '../manifest.json',
  seed: {},
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
      serverBabelConfig,
      {
        test: /\.css$/i,
        use: [
          {
            loader: 'css-loader',
            options: {
              // use CSS modules
              modules: true,
              // but only return the classnames when we import a CSS file.
              // This is required to make the server build work the same as the client
              // without the extra MiniCssExtractPlugin loader
              onlyLocals: true,
            },
          },
        ],
      },
    ],
  },
}

const client = {
  mode,
  entry: {
    client: './src/client.js',
  },
  output,
  module: {
    rules: [
      clientBabelConfig,
      {
        test: /\.css$/i,
        use: [
          // extract CSS to a file
          { loader: MiniCssExtractPlugin.loader },
          {
            // return a map of CSS module classnames when we import a CSS file
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      // extract CSS to this file
      filename: isProduction ? '[name]-[contenthash].css' : '[name].css',
    }),
    // generate a manifest for our server to refer to
    new ManifestPlugin(manifestPluginOptions),
  ],
}

const legacy = {
  mode,
  entry: {
    legacy: './src/client.js',
  },
  output,
  module: {
    rules: [
      legacyBabelConfig,
      { // we're not doing anything with the CSS here, but it stops the import from blowing up
        test: /\.css$/i,
        use: [
          {
            loader: 'css-loader',
            options: {
              modules: true,
              onlyLocals: true,
            }
          },
        ],
      },
    ],
  },
  plugins: [
    // generate a manifest for our server to refer to
    new ManifestPlugin(manifestPluginOptions),
  ],
}

module.exports = [
  server,
  client,
  legacy,
]
