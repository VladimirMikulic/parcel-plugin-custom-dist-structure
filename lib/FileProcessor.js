const path = require('path');
const fs = require('fs');
const glob = require('glob');
const {
  createFolderSync,
  replaceInFileSync,
  isMapFile,
  getFileNameFromPath,
  moveFileSync
} = require('./Utils');

class FileProcessor {
  constructor(filePath, folderName, depGraph, config) {
    this.fileName = getFileNameFromPath(filePath);
    this.oldFilePath = filePath;
    this.folderName = folderName;
    this.depGraph = depGraph;
    this.config = config;
  }

  processFile() {
    const { oldFilePath, newFilePath, folderPath } = this;

    if (!fs.existsSync(oldFilePath)) return;

    createFolderSync(folderPath);
    moveFileSync(oldFilePath, folderPath);

    if (isMapFile(oldFilePath)) {
      this.updateSourceRootPathInFile();
    }

    this.updateDependecies();
    this.updateDependants();

    this.depGraph.setNodeData(oldFilePath, newFilePath);
  }

  updateSourceRootPathInFile() {
    const { outDir, rootDir } = this.config;
    const { newFilePath, folderPath } = this;

    const oldSourceRootPath = path.relative(outDir, rootDir);
    const newSourceRootPath = path.relative(folderPath, rootDir);

    replaceInFileSync(newFilePath, oldSourceRootPath, newSourceRootPath);
  }

  updateDependecies() {
    const { publicURL, outDir } = this.config;
    const { oldFilePath, newFilePath, folderPath } = this;
    const fileDependeciesPaths = this.depGraph.dependenciesOf(oldFilePath);

    fileDependeciesPaths.forEach(depPath => {
      // fileDepPath = this.depGraph.getNodeData(fileDepPath);
      let fileDepPath = getFileNameFromPath(depPath);
      fileDepPath = glob.sync(`**/*${fileDepPath}`, {
        cwd: outDir,
        absolute: true
      })[0];

      const oldDepPath = `${publicURL}${path.relative(outDir, fileDepPath)}`;
      let newDepPath = path.relative(folderPath, fileDepPath);

      if (publicURL === '/') {
        // Remove ../ from the path
        newDepPath = newDepPath.replace(/\.\.\//g, '');
        newDepPath = `${publicURL}${newDepPath}`;
      }

      // Update the path to the dependency in newly generated file
      if (process.env.firstRun === 'false') {
        // For the files in the root of the dist folder...
        if (folderPath === outDir) {
          const fileContent = fs.readFileSync(newFilePath);
          // If we have a match, it means that we already have
          // a valid link and we shouldn't update it
          if (fileContent.includes(newDepPath)) return;
        }

        replaceInFileSync(
          newFilePath,
          `${publicURL}${getFileNameFromPath(oldDepPath)}`,
          newDepPath
        );
        return;
      }

      replaceInFileSync(newFilePath, oldDepPath, newDepPath);
    });
  }

  updateDependants() {
    const { oldFilePath, folderName } = this;
    const { publicURL } = this.config;
    const fileDependantsPaths = this.depGraph.dependantsOf(oldFilePath);

    fileDependantsPaths.forEach(depPath => {
      const fileDependantPath = this.depGraph.getNodeData(depPath);
      const oldFileName = getFileNameFromPath(oldFilePath);

      const oldDependantPath = `${publicURL}${oldFileName}`;
      const newDependantPath = `${publicURL}${folderName}/${oldFileName}`;

      // Don't update the path in the entry file because it already contains a valid link
      if (
        process.env.firstRun === 'false' &&
        fileDependantPath === this.depGraph.entryAssetPath
      ) {
        return;
      }

      // When the map file is processed in the development mode (user specified ".map": "folder")
      // It will wrongly update it's path in the dependant file (it collides)
      // Example wrong path that we get -> i.e. ../maps/maps/style.2kj52.css.map
      if (process.env.firstRun === 'false' && isMapFile(oldFilePath)) {
        return;
      }

      replaceInFileSync(fileDependantPath, oldDependantPath, newDependantPath);
    });
  }

  get newFilePath() {
    return path.join(this.folderPath, this.fileName);
  }

  get folderPath() {
    return path.join(this.config.outDir, this.folderName);
  }
}

module.exports = FileProcessor;
