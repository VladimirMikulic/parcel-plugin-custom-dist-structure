const fs = require('fs');
const path = require('path');

exports.getFilesFromFolder = (folderPath, fileType = '') => {
  return fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter(item => !item.isDirectory())
    .filter(item => item.name.endsWith(fileType))
    .map(item => item.name);
};

exports.readFileSync = filePath => {
  if (!fs.existsSync(filePath)) return '';
  const data = fs.readFileSync(filePath, 'utf8');
  return data;
};

exports.writeFileSync = (filePath, data) => {
  fs.writeFileSync(filePath, data);
};

exports.getFilesFromDist = distFolder => {
  const images = this.getFilesFromFolder(`${distFolder}/images`);
  return {
    jsFile: this.getFilesFromFolder(`${distFolder}/js`)[0],
    jsMapFile: this.getFilesFromFolder(`${distFolder}/maps`, '.js.map')[0],
    cssFile: this.getFilesFromFolder(`${distFolder}/css`, '.css')[0],
    cssMapFile: this.getFilesFromFolder(`${distFolder}/maps`, '.css.map')[0],
    svgFile: images[0],
    jpgFile: images[1]
  };
};
