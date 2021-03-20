const path = require('path');
const { readFileSync, getFilesFromDist } = require('./helpers/utils');

const CWD = process.cwd();

module.exports = ({ outDir, publicURL }) => () => {
  const distFolder = path.join(CWD, outDir);
  let fileLinks;

  beforeAll(() => {
    fileLinks = getFileLinks(distFolder, publicURL);
    Object.assign(global, getFilesFromDist(distFolder));
  });

  it('tests that links in HTML (entryFile) to other files are correct', () => {
    const { entryFileLinks: links } = fileLinks;
    const entryFileContent = readFileSync(`${distFolder}/index.html`);

    links.forEach(link => expect(entryFileContent.includes(link)).toBe(true));
  });

  it('tests that links in CSS file to other files are correct', () => {
    const { cssFileLinks: links } = fileLinks;
    const cssFileContent = readFileSync(`${distFolder}/css/${cssFile}`);

    links.forEach(link => expect(cssFileContent.includes(link)).toBe(true));
  });

  it('tests that links in JS file to other files are correct', () => {
    const { jsFileLinks: links } = fileLinks;
    const jsFileContent = readFileSync(`${distFolder}/js/${jsFile}`);

    links.forEach(link => expect(jsFileContent.includes(link)).toBe(true));
  });

  it('tests that the sourceRoot property has a correct path to the source directory as a value', () => {
    const jsMapFilePath = path.join(distFolder, 'maps', jsMapFile);
    const jsMapFileContent = JSON.parse(readFileSync(jsMapFilePath));

    const cssMapFilePath = path.join(distFolder, 'maps', cssMapFile);
    const cssMapFileContent = JSON.parse(readFileSync(cssMapFilePath));

    const relativePathToSrcDir = '../../../test/example-src';

    expect(jsMapFileContent.sourceRoot).toBe(relativePathToSrcDir);
    expect(cssMapFileContent.sourceRoot).toBe(relativePathToSrcDir);
  });
};

function getFileLinks(distFolder, publicURL) {
  const files = getFilesFromDist(distFolder);
  let fileLinks;

  // Relative public URL
  if (publicURL === './') {
    fileLinks = relativeFileLinks(files);
  } else {
    // Absolute public URL (either / or custom one like /static/ -> Django)
    fileLinks = absoluteFileLinks(files, publicURL);
  }

  return fileLinks;
}

let relativeFileLinks = files => {
  const { jsFile, cssFile, jsMapFile, cssMapFile, jpgFile, svgFile } = files;

  return {
    entryFileLinks: [
      `src="js/${jsFile}"`,
      `href="css/${cssFile}"`,
      `src="images/${svgFile}"`,
      `src="images/${jpgFile}"`
    ],
    cssFileLinks: [
      `url('../images/${svgFile}')`,
      `sourceMappingURL=../maps/${cssMapFile}`
    ],
    jsFileLinks: [
      `"../images/${svgFile}"`,
      `sourceMappingURL=../maps/${jsMapFile}`
    ]
  };
};

let absoluteFileLinks = (files, publicURL) => {
  const { jsFile, cssFile, jsMapFile, cssMapFile, jpgFile, svgFile } = files;

  return {
    entryFileLinks: [
      `src="${publicURL}js/${jsFile}"`,
      `href="${publicURL}css/${cssFile}"`,
      `src="${publicURL}images/${svgFile}"`,
      `src="${publicURL}images/${jpgFile}"`
    ],
    cssFileLinks: [
      `url('${publicURL}images/${svgFile}')`,
      `sourceMappingURL=${publicURL}maps/${cssMapFile}`
    ],
    jsFileLinks: [
      `"${publicURL}images/${svgFile}"`,
      `sourceMappingURL=${publicURL}maps/${jsMapFile}`
    ]
  };
};
