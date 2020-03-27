// Generate a production bundle
const path = require('path');
const Bundler = require('parcel-bundler');
const OutputCustomizer = require('../../lib/index');

const CWD = process.cwd();
let publicUrl = './';
let outDir = 'dist';

if (process.argv.length > 2) {
  publicUrl = process.argv[2].split('=')[1];
  outDir = process.argv[3].split('=')[1];
}

(async function() {
  const entryFile = path.join(CWD, 'test', 'example-src', 'index.html');

  const bundler = new Bundler(entryFile, {
    publicUrl,
    watch: false,
    sourceMaps: true,
    outDir
  });

  await OutputCustomizer(bundler);

  const bundle = await bundler.bundle();
})();
