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
    const { pluginFolderConfig, outDir, mode } = this.config;

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

      this.processFiles(files, sanitizeFolderName(folderName));
    });

    if (mode === 'production') return;

    /**
     * Files in the root of the dist folder get overriden each time the user modifies
     * them in the source folder and Parcel compiles the changes (development mode)
     * Unfortunately, we can't know which file was updated so we simply update the dependency
     * paths for all of them. This hits performance a bit on slower machines.
     */
    const filesInRootDist = getFilesFromFolder(outDir)
      .filter(file => !isMapFile(file))
      .map(file => `${outDir}/${file}`);

    filesInRootDist.forEach(file => {
      const fileProcessor = new FileProcessor(
        file,
        '',
        this.depGraph,
        this.config
      );

      fileProcessor.updateDependecies();
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
