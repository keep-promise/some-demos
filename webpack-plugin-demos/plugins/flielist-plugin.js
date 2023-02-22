class FileListPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('FileListPlugin', (compilation, callback) => {
      console.info(compilation)
      let filelist = 'In this build: \n\n';
      for (var filename in compilation.assets) {
        filelist += '- ' + filename + '\n';
        compilation.assets['filelist.md'] = {
          source: () => filelist,
          size: () => filelist.length,
        }
        callback()
      }
    })
  }
}
module.exports = FileListPlugin;
