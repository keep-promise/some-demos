const path = require('path')
const FileListPlugin = require('./plugins/filelist-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new FileListPlugin()
  ]
}
