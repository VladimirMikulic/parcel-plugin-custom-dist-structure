const FileProcessor = require('./FileProcessor');
const { sanitizeFolderName } = require('./Utils');

class OutputGenerator {
  constructor(depGraph, config) {
    this.depGraph = depGraph;
    this.config = config;
  }

  generateOutputFolder() {
    const { pluginFolderConfig } = this.config;

    Object.entries(pluginFolderConfig).forEach(pair => {
      const key = pair[0];
      let folderName;
      let files = [];

      // key -> fileType or folde
      // value ->folder or array of filetypes
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

      this.processFiles(files, sanitizeFolderName(folderName));
    });
  }

  processFiles(files, folderName) {
    files.forEach(file => {
      const fileProcessor = new FileProcessor(
        file,
        folderName,
        this.depGraph,
        this.config
      );

      fileProcessor.processFile();
    });
  }
}

module.exports = OutputGenerator;
