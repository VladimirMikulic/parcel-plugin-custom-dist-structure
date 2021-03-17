const path = require('path');
const glob = require('glob');

const Bundler = require('parcel-bundler');
const OutputCustomizer = require('../lib/index');
const DependencyGraph = require('../lib/DependencyGraph');

let bundle, depGraph;
const CWD = process.cwd();

// Bundling without cached changes (.cache folder) takes time
jest.setTimeout(20000);

describe('DependencyGraph', () => {
  beforeAll(async done => {
    const entryFile = path.join(__dirname, 'example-src', 'index.html');
    const bundler = new Bundler(entryFile, {
      publicUrl: './',
      logLevel: 0,
      watch: false
    });

    await OutputCustomizer(bundler);

    bundle = await bundler.bundle();
    depGraph = new DependencyGraph(bundle);
    done();
  });

  it('tests that all dependencies are connected to their dependants accordingly', () => {
    const outDir = path.join(CWD, 'dist');
    const depGraphFiles = depGraph.outgoingEdges;

    const jsFile = path.normalize(glob.sync(`${outDir}/js/*.js`)[0].replace('js/', ''));
    const cssFile = path.normalize(glob.sync(`${outDir}/css/*.css`)[0].replace('css/', ''));
    const entryFile = path.join(outDir, 'index.html');

    expect(depGraphFiles[jsFile].length).toBe(2);
    expect(depGraphFiles[cssFile].length).toBe(2);
    expect(depGraphFiles[entryFile].length).toBe(4);
  });
});
