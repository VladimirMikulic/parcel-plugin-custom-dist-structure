const path = require('path');
const Bundler = require('parcel-bundler');
const OutputCustomizer = require('../lib/index');
const DependencyGraph = require('../lib/DependencyGraph');

let bundle;

describe('DependencyGraph', () => {
  beforeAll(async done => {
    const entryFile = path.join(__dirname, 'example-src/index.html');
    const bundler = new Bundler(entryFile, {
      publicUrl: './',
      logLevel: 0,
      watch: false
    });

    await OutputCustomizer(bundler);

    bundle = await bundler.bundle();
    done();
  });

  it('tests that all files are present in dependency graph', () => {
    const depGraph = new DependencyGraph(bundle);
    const entryAssetName = depGraph.bundle.name;

    expect(entryAssetName).toBe(
      '/home/vlado/Desktop/BACKUP/parcel-plugin-custom-dist-structure/dist/index.html'
    );

    const nodes = Object.keys(depGraph.nodes);
    const entryAssetDependecies = depGraph.dependenciesOf(entryAssetName);

    expect(nodes.length).toBe(entryAssetDependecies.length + 1);
  });
});
