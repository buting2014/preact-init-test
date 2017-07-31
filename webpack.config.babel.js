import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import autoprefixer from 'autoprefixer';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import OfflinePlugin from 'offline-plugin';
import path from 'path';
import px2rem from 'postcss-px2rem';
const ENV = process.env.NODE_ENV || 'development';

const CSS_MAPS = ENV!=='production';
const svgSpriteDirs = [
  require.resolve('antd-mobile').replace(/warn\.js$/, ''), // antd-mobile 内置svg
  //path.resolve(__dirname, 'src/my-project-svg-foler'),  // 业务代码本地私有 svg 存放目录
];

module.exports = {
  context: path.resolve(__dirname, "src"),
  entry: './index.js',

  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: '/',
    filename: 'bundle.js'
  },

  resolve: {
    mainFiles: ["index.web","index"],
    extensions: ['.jsx', '.js', '.json', '.less',
      '.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.ts', '.tsx', '.react.js'],
    modules: [
      path.resolve(__dirname, "src/lib"),
      path.resolve(__dirname, "node_modules"),
      'node_modules'
    ],
    alias: {
      components: path.resolve(__dirname, "src/components"),    // used for tests
      style: path.resolve(__dirname, "src/style"),
      'react': 'preact-compat',
      'react-dom': 'preact-compat'
    },
    modules: ['app', 'node_modules', path.join(__dirname, '../node_modules')],
    mainFields: [
      'browser',
      'jsnext:main',
      'main'
    ]
  },

  module: {
    rules: [
      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        include: svgSpriteDirs
      },
      {
        test: /\.jsx?$/,
        exclude: path.resolve(__dirname, 'src'),
        enforce: 'pre',
        use: 'source-map-loader'
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        // Transform our own .(less|css) files with PostCSS and CSS-modules
        test: /\.(less|css)$/,
        include: [path.resolve(__dirname, 'src/components')],
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: { modules: false, sourceMap: CSS_MAPS, importLoaders: 1 }
            },
            {
              loader: `postcss-loader`,
              options: {
                sourceMap: CSS_MAPS,
                plugins: () => {
                  return [autoprefixer({ browsers: ['> 1%', 'ie >= 9', 'iOS >= 6', 'Android >= 2.1'] }),
                          px2rem({remUnit: 75})]
                }
              }
            },
            {
              loader: 'less-loader',
              options: { sourceMap: CSS_MAPS }
            }
          ]
        })
      },
      {
        test: /\.(less|css)$/,
        exclude: [path.resolve(__dirname, 'src/components')],
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: { sourceMap: CSS_MAPS, importLoaders: 1 }
            },
            {
              loader: `postcss-loader`,
              options: {
                sourceMap: CSS_MAPS,
                plugins: () => {
                  return [autoprefixer({ browsers: [ 'last 2 versions' ]})]
                }
              }
            },
            {
              loader: 'less-loader',
              options: { sourceMap: CSS_MAPS }
            }
          ]
        })
      },
      {
        test: /\.json$/,
        use: 'json-loader'
      },
      {
        test: /\.(xml|html|txt|md)$/,
        use: 'raw-loader'
      },
      {
        test: /\.(woff2?|ttf|eot|jpe?g|png|gif)(\?.*)?$/i,
        exclude: [/\.less$/,/\.svg$/],
        use: ENV==='production' ? 'file-loader' : 'url-loader'
      }
    ]
  },
  plugins: ([
    // new webpack.IgnorePlugin(/\.\/locale$/),
    new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(en|ko|ja|zh-cn)$/),
    new webpack.NoEmitOnErrorsPlugin(),
    new ExtractTextPlugin({
      filename: 'style.css',
      allChunks: true,
      disable: ENV !== 'production'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(ENV)
    }),
    new HtmlWebpackPlugin({
      template: './index.ejs',
      minify: { collapseWhitespace: true }
    }),
    new CopyWebpackPlugin([
      { from: './manifest.json', to: './' },
      { from: './favicon.ico', to: './' }
    ])
  ]).concat(ENV==='production' ? [
    new webpack.optimize.UglifyJsPlugin({
      output: {
        comments: false
      },
      compress: {
        unsafe_comps: true,
        properties: true,
        keep_fargs: false,
        pure_getters: true,
        collapse_vars: true,
        unsafe: true,
        warnings: false,
        screw_ie8: true,
        sequences: true,
        dead_code: true,
        drop_debugger: true,
        comparisons: true,
        conditionals: true,
        evaluate: true,
        booleans: true,
        loops: true,
        unused: true,
        hoist_funs: true,
        if_return: true,
        join_vars: true,
        cascade: true,
        drop_console: true
      }
    }),

    new OfflinePlugin({
      relativePaths: false,
      AppCache: false,
      excludes: ['_redirects'],
      ServiceWorker: {
        events: true
      },
      cacheMaps: [
        {
          match: /.*/,
          to: '/',
          requestTypes: ['navigate']
        }
      ],
      publicPath: '/'
    })
  ] : []),

  stats: { colors: true },

  node: {
    global: true,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
    setImmediate: false
  },

  devtool: ENV==='production' ? 'source-map' : 'cheap-module-eval-source-map',

  devServer: {
    port: process.env.PORT || 8082,
    host: 'localhost',
    publicPath: '/',
    contentBase: './src',
    historyApiFallback: true,
    open: true,
    proxy: {
      // OPTIONAL: proxy configuration:
      // '/optional-prefix/**': { // path pattern to rewrite
      //   target: 'http://target-host.com',
      //   pathRewrite: path => path.replace(/^\/[^\/]+\//, '')   // strip first path segment
      // }
    }
  }
};
