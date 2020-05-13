const fs = require('fs');
const path = require('path');
const glob = require('glob');
const {
  createFolderSync,
  replaceInFileSync,
  isMapFile,
  getFileNameFromPath,
  moveFileSync,
  toUnixPath
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

    // If the file that is not in the graph was provided (like .DS_Store)
    if (!this.depGraph.hasNode(oldFilePath)) return;
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

    // If the file that is not in the graph was provided (like .DS_Store)
    if (!this.depGraph.hasNode(oldFilePath)) return;
    const fileDependeciesPaths = this.depGraph.dependenciesOf(oldFilePath);

    for (const depPath of fileDependeciesPaths) {
      // fileDepPath = this.depGraph.getNodeData(fileDepPath);
      let fileDepPath = getFileNameFromPath(depPath);
      fileDepPath = glob.sync(`**/*${fileDepPath}`, {
        cwd: outDir,
        absolute: true
      })[0];

      // Sometimes on MacOS these result in undefined
      if (!fileDepPath || !folderPath) continue;

      const oldDepPath = toUnixPath(
        `${publicURL}${path.relative(outDir, fileDepPath)}`
      );
      let newDepPath = toUnixPath(path.relative(folderPath, fileDepPath));

      // If the publicURL is not "./", then it is the absolute url
      // ("/" or custom absolute url like "/static/")
      if (publicURL !== '') {
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
          if (fileContent.includes(newDepPath)) continue;
        }

        const p = publicURL !== '' ? oldDepPath : newDepPath;

        replaceInFileSync(
          newFilePath,
          `${publicURL}${getFileNameFromPath(oldDepPath)}`,
          p
        );
        continue;
      }

      replaceInFileSync(newFilePath, oldDepPath, newDepPath);
    }
  }

  updateDependants() {
    const { publicURL } = this.config;
    const { oldFilePath, folderName } = this;

    // Don't update dependants file links after the first run (development mode)
    if (process.env.firstRun === 'false') return;

    // If the file that is not in the graph was provided (like .DS_Store)
    if (!this.depGraph.hasNode(oldFilePath)) return;
    const fileDependantsPaths = this.depGraph.dependantsOf(oldFilePath);

    for (const depPath of fileDependantsPaths) {
      const fileDependantPath = this.depGraph.getNodeData(depPath);
      const oldFileName = getFileNameFromPath(oldFilePath);

      const oldDependantPath = toUnixPath(`${publicURL}${oldFileName}`);
      const newDependantPath = toUnixPath(
        `${publicURL}${folderName}/${oldFileName}`
      );

      replaceInFileSync(fileDependantPath, oldDependantPath, newDependantPath);
    }
  }

  get newFilePath() {
    return path.join(this.folderPath, this.fileName);
  }

  get folderPath() {
    return path.join(this.config.outDir, this.folderName);
  }
}

module.exports = FileProcessor;
