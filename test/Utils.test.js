const Utils = require('../lib/Utils');

describe('Utils.js', () => {
  it('tests getFileNameFromPath()', () => {
    const { getFileNameFromPath } = Utils;

    expect(getFileNameFromPath('/src/index.html')).toBe('index.html');
    expect(getFileNameFromPath('C:\\src\\index.html')).toBe('index.html');
  });

  it('tests isProjectJSCodeFile()', () => {
    const { isProjectJSCodeFile } = Utils;

    expect(isProjectJSCodeFile('script.js')).toBe(true);
    expect(isProjectJSCodeFile('style.js')).toBe(false);
    expect(isProjectJSCodeFile('script.js.map')).toBe(false);
  });

  it('tests isMapFile()', () => {
    const { isMapFile } = Utils;

    expect(isMapFile('script.js.map')).toBe(true);
    expect(isMapFile('script.map.js')).toBe(false);
  });

  it('tests isStyleJSFile()', () => {
    const { isStyleJSFile } = Utils;

    expect(isStyleJSFile('style.js')).toBe(true);
  });

  it('tests sanitizeFolderName()', () => {
    const { sanitizeFolderName } = Utils;

    expect(sanitizeFolderName('/js')).toBe('js');
    expect(sanitizeFolderName('css/')).toBe('css');
    expect(sanitizeFolderName('/images/')).toBe('images');
    expect(sanitizeFolderName('assets/js/')).toBe('assets/js');
  });
});
