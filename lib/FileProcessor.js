const path = require('path');
const fs = require('fs');
const {
  createFolderSync,
  replaceInFileSync,
  isMapFile,
  getFileNameFromPath,
  moveFileSync,
  isStyleJSFile
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
      this.updateNodeModulesPathInFile();
    }

    if (isStyleJSFile(oldFilePath)) {
      this.updateNodeModulesPathInFile();
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

  updateNodeModulesPathInFile() {
    const { rootDir } = this.config;
    const { newFilePath, folderPath } = this;

    const CWD = process.cwd();
    const nodeModulesPath = path.join(CWD, 'node_modules');

    const oldNodeModulesPath = path.relative(rootDir, nodeModulesPath);
    const newNodeModulesPath = path.relative(folderPath, nodeModulesPath);

    replaceInFileSync(newFilePath, oldNodeModulesPath, newNodeModulesPath);
  }

  updateDependecies() {
    const { publicURL, outDir } = this.config;
    const { oldFilePath, newFilePath, folderPath } = this;
    const fileDependeciesPaths = this.depGraph.dependenciesOf(oldFilePath);

    fileDependeciesPaths.forEach(fileDepPath => {
      fileDepPath = this.depGraph.getNodeData(fileDepPath);

      const oldDepPath = `${publicURL}${path.relative(outDir, fileDepPath)}`;
      let newDepPath = path.relative(folderPath, fileDepPath);

      if (publicURL === '/') {
        // Remove ../
        newDepPath = newDepPath.replace(/\.\.\//g, '');
        newDepPath = `${publicURL}${newDepPath}`;
      }

      replaceInFileSync(newFilePath, oldDepPath, newDepPath);
    });
  }

  updateDependants() {
    const { oldFilePath, folderName } = this;
    const { publicURL } = this.config;
    const fileDependantsPaths = this.depGraph.dependantsOf(oldFilePath);

    fileDependantsPaths.forEach(fileDependantPath => {
      fileDependantPath = this.depGraph.getNodeData(fileDependantPath);
      const oldFileName = getFileNameFromPath(oldFilePath);

      const oldDependantPath = `${publicURL}${oldFileName}`;
      const newDependantPath = `${publicURL}${folderName}/${oldFileName}`;

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
