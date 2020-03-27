// Start parcel in development mode and load the plugin
// Use locally when you are trying out new changes to the lib
const path = require('path');
const Bundler = require('parcel-bundler');
const OutputCustomizer = require('../../lib/index');

const CWD = process.cwd();

(async function() {
  const entryFile = path.join(CWD, 'test', 'example-src', 'index.html');

  const bundler = new Bundler(entryFile, {
    publicUrl: './',
    watch: true,
    sourceMaps: true,
    outDir: 'dist'
  });

  await OutputCustomizer(bundler);
  const bundle = await bundler.bundle();
})();
