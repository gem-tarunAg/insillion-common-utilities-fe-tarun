module.exports = {
  output: {
    chunkLoadingGlobal: 'headerAppWebpackJsonp',
    filename: 'common-utility.js',
  },
  optimization: {
    runtimeChunk: false,
    splitChunks: false,
  },
};