const fs = require('fs');
const path = require('path');
const moveFile = require('move-file');
const escapeRegex = require('regex-escape');
const replaceInFile = require('replace-in-file');

exports.getPluginConfiguration = () => {
  const CWD = process.cwd();
  const packageJSONPath = path.join(CWD, 'package.json');

  let data = fs.readFileSync(packageJSONPath);
  data = JSON.parse(data);

  return data.customDistStructure || {};
};

exports.getFileNameFromPath = (filePath, pathSeparator = path.sep) => {
  return filePath.split(pathSeparator).slice(-1).join('');
};

exports.createFolderSync = folderPath => {
  fs.mkdirSync(folderPath, {
    recursive: true
  });
};

exports.moveFileSync = (filePath, destinationFolder) => {
  const fileName = this.getFileNameFromPath(filePath);
  const newFilePath = path.join(destinationFolder, fileName);
  moveFile.sync(filePath, newFilePath);

  return newFilePath;
};

exports.replaceInFileSync = (files, stringToReplace, newString) => {
  const regexPattern = escapeRegex(stringToReplace);

  const result = replaceInFile.sync({
    files,
    from: new RegExp(regexPattern, 'g'),
    to: newString
  });

  return result;
};

exports.isProjectJSCodeFile = file => {
  const fileName = this.getFileNameFromPath(file);
  return fileName.endsWith('.js') && fileName.startsWith('script');
};

exports.isMapFile = file => {
  const fileName = this.getFileNameFromPath(file);
  return fileName.endsWith('.map');
};

exports.isStyleJSFile = file => {
  const fileName = this.getFileNameFromPath(file);
  return fileName.startsWith('style') && fileName.endsWith('.js');
};

exports.sanitizeFolderName = folderName => {
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
};

exports.getFilesFromFolder = (folderPath, fileType = '') => {
  return fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter(item => !item.isDirectory())
    .filter(item => item.name.endsWith(fileType))
    .map(item => item.name);
};

exports.isEmptyObject = obj => Object.keys(obj).length === 0;

exports.uncaughtErrorHandler = error => {
  const message = `
  \b\x1b[33mOh, snap!
  \bThe plugin "parcel-plugin-custom-dist-structure" has encountered an error. ⚠️
  \b\x1b[37m\n We apologize for inconvinience. 💖\n
  \b\x1b[31m${error.stack}
  \x1b[37m\n Please report this issue 🐛 on Github.
  \n\x1b[37m https://github.com/VladimirMikulic/parcel-plugin-custom-dist-structure/issues/new
    `;

  console.log(message);
};
