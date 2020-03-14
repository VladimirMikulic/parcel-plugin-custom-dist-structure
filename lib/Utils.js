const fs = require('fs');
const path = require('path');
const moveFile = require('move-file');
const escapeRegex = require('regex-escape');
const replaceInFile = require('replace-in-file');

function getPluginConfiguration() {
  const CWD = process.cwd();
  const packageJSONPath = path.join(CWD, 'package.json');

  let data = fs.readFileSync(packageJSONPath, { encoding: 'utf8' });
  data = JSON.parse(data);

  return data.customDistStructure || {};
}

function getFileNameFromPath(filePath) {
  return filePath
    .split('/')
    .slice(-1)
    .join('');
}

function createFolderSync(folderPath) {
  fs.mkdirSync(folderPath, {
    recursive: true
  });
}

function moveFileSync(filePath, destinationFolder) {
  const fileName = getFileNameFromPath(filePath);
  const newFilePath = path.join(destinationFolder, fileName);
  moveFile.sync(filePath, newFilePath);

  return newFilePath;
}

function replaceInFileSync(files, stringToReplace, newString) {
  const regexPattern = escapeRegex(stringToReplace);

  const result = replaceInFile.sync({
    files,
    from: new RegExp(regexPattern, 'g'),
    to: newString
  });

  return result;
}

function isProjectJSCodeFile(file) {
  const fileName = getFileNameFromPath(file);
  return fileName.endsWith('.js') && fileName.startsWith('script');
}

function isMapFile(file) {
  const fileName = getFileNameFromPath(file);
  return fileName.endsWith('.map');
}

function isStyleJSFile(file) {
  const fileName = getFileNameFromPath(file);
  return fileName.startsWith('style') && fileName.endsWith('.js');
}

function sanitizeFolderName(folderName) {
  let sanitizedFolderName = folderName;

  if (sanitizedFolderName.startsWith('/')) {
    sanitizedFolderName = sanitizedFolderName.replace('/', '');
  }

  if (sanitizedFolderName.endsWith('/')) {
    // Match the ending /
    const regexp = /\/$/;
    sanitizedFolderName = sanitizedFolderName.replace(regexp, '');
  }

  return sanitizedFolderName;
}

const isEmptyObject = obj => Object.keys(obj).length === 0;

module.exports = {
  getPluginConfiguration,
  getFileNameFromPath,
  createFolderSync,
  moveFileSync,
  replaceInFileSync,
  isProjectJSCodeFile,
  isMapFile,
  isStyleJSFile,
  sanitizeFolderName,
  isEmptyObject
};
