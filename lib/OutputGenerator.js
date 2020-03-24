const FileProcessor = require('./FileProcessor');
const { sanitizeFolderName } = require('./Utils');

class OutputGenerator {
  constructor(depGraph, config) {
    this.depGraph = depGraph;
    this.config = config;
  }

  generateOutputFolder() {
    const { pluginFolderConfig } = this.config;
    let filesChanged = 0;

    Object.entries(pluginFolderConfig).forEach(pair => {
      const key = pair[0];
      let folderName;
      let files = [];

      // key -> fileType or folde
      // value -> folder or array of filetypes
      if (key.startsWith('.')) {
        const fileType = key;
        folderName = pair[1];
        files = this.depGraph.getFilesByType(fileType);
      } else {
        folderName = key;
        const fileTypes = pair[1];

        fileTypes.forEach(fileType => {
          const filteredFiles = this.depGraph.getFilesByType(fileType);
          files.push(...filteredFiles);
        });
      }

      filesChanged += this.processFiles(files, sanitizeFolderName(folderName));
    });

    // If entry file has changed
    if (filesChanged === 0) {
      const entryAs = new FileProcessor(
        this.depGraph.entryAssetPath,
        '',
        this.depGraph,
        this.config
      );

      entryAs.updateDependecies();
    }
  }

  processFiles(files, folderName) {
    let filesChanged = 0;

    files.forEach(file => {
      const fileProcessor = new FileProcessor(
        file,
        folderName,
        this.depGraph,
        this.config
      );

      fileProcessor.processFile();

      if (fileProcessor.hasChanged) filesChanged += 1;
    });

    return filesChanged;
  }
}

module.exports = OutputGenerator;
