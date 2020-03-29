const path = require('path');
const FileProcessor = require('./FileProcessor');
const {
  sanitizeFolderName,
  getFilesFromFolder,
  isMapFile
} = require('./Utils');

class OutputGenerator {
  constructor(depGraph, config) {
    this.depGraph = depGraph;
    this.config = config;
  }

  generateOutputFolder() {
    const { mode } = this.config;
    const groupedFilesWithFolder = this.getGroupedFilesWithFolders();

    for (const { files, folder } of groupedFilesWithFolder) {
      this.processFiles(files, folder);
    }

    if (mode === 'development') {
      this.updateFilesInRootDependecies();
    }
  }

  processFiles(files, folderName) {
    for (const file of files) {
      const fileProcessor = new FileProcessor(
        file,
        folderName,
        this.depGraph,
        this.config
      );

      fileProcessor.processFile();
    }
  }

  /**
   * Files in the root of the dist folder get overriden each time the user modifies
   * them in the source folder and Parcel compiles the changes (development mode)
   * Unfortunately, we can't know which file was updated so we simply update the dependency
   * paths for all of them.
   */
  updateFilesInRootDependecies() {
    const { outDir } = this.config;

    const filesInRootDist = getFilesFromFolder(outDir)
      .filter(file => !isMapFile(file))
      .map(file => path.join(outDir, file));

    for (const file of filesInRootDist) {
      const fileProcessor = new FileProcessor(
        file,
        '',
        this.depGraph,
        this.config
      );

      fileProcessor.updateDependecies();
    }
  }

  /**
   * Returns an array of objects where each object has
   * "files" property -> an array of files
   * "folder" property -> in which folder files should go
   */
  getGroupedFilesWithFolders() {
    const { pluginFolderConfig } = this.config;

    return Object.entries(pluginFolderConfig).map(pair => {
      const key = pair[0];
      let folderName;
      let files = [];

      // key -> fileType or folder
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

      return {
        files,
        folder: sanitizeFolderName(folderName)
      };
    });
  }
}

module.exports = OutputGenerator;
