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

    fileDependeciesPaths.forEach(depPath => {
      // fileDepPath = this.depGraph.getNodeData(fileDepPath);
      let fileDepPath = getFileNameFromPath(depPath);
      fileDepPath = glob.sync(`**/*${fileDepPath}`, {
        cwd: outDir,
        absolute: true
      })[0];

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

    // If the file that is not in the graph was provided (like .DS_Store)
    if (!this.depGraph.hasNode(oldFilePath)) return;
    const fileDependantsPaths = this.depGraph.dependantsOf(oldFilePath);

    fileDependantsPaths.forEach(depPath => {
      const fileDependantPath = this.depGraph.getNodeData(depPath);
      const oldFileName = getFileNameFromPath(oldFilePath);

      const oldDependantPath = toUnixPath(`${publicURL}${oldFileName}`);
      const newDependantPath = toUnixPath(
        `${publicURL}${folderName}/${oldFileName}`
      );

      // Don't update the path in the entry file because it already contains a valid link
      if (
        process.env.firstRun === 'false' &&
        this.depGraph.entryAssetPaths.includes(fileDependantPath)
      ) {
        return;
      }

      // When the map file is processed in the development mode (user specified ".map": "folder")
      // It will wrongly update it's path in the dependant file (it collides)
      // Example wrong path that we get -> i.e. ../maps/maps/style.2kj52.css.map
      if (process.env.firstRun === 'false' && isMapFile(oldFilePath)) {
        // if (!fs.existsSync(fileDependantPath)) return;
        // const fileDependantContent = fs.readFileSync(fileDependantPath);
        // if (fileDependantContent.includes(newDependantPath)) return;
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
