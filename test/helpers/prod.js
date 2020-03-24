// Generate a production bundle
const path = require('path');
const Bundler = require('parcel-bundler');
const OutputCustomizer = require('../../lib/index');

const CWD = process.cwd();

(async function() {
  const entryFile = path.join(CWD, 'test', 'example-src', 'index.html');

  const bundler = new Bundler(entryFile, {
    publicUrl: './',
    watch: false,
    sourceMaps: true,
    outDir: 'dist'
  });

  await OutputCustomizer(bundler);

  const bundle = await bundler.bundle();
})();
