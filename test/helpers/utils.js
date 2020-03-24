const fs = require('fs');

exports.getFilesFromFolder = (folderPath, fileType = '') => {
  return fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter(item => !item.isDirectory())
    .filter(item => item.name.endsWith(fileType))
    .map(item => item.name);
};

exports.readFileSync = filePath => {
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
    jsMapFile: this.getFilesFromFolder(`${distFolder}`, '.js.map')[0],
    cssFile: this.getFilesFromFolder(`${distFolder}/css`)[0],
    cssMapFile: this.getFilesFromFolder(`${distFolder}`, '.css.map')[0],
    svgFile: images[0],
    jpgFile: images[1]
  };
};
