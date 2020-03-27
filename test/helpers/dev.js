// Start parcel in development mode and load the plugin
const path = require('path');
const Bundler = require('parcel-bundler');
const { execSync } = require('child_process');
const { readFileSync, writeFileSync } = require('./utils');
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
    watch: true,
    sourceMaps: true,
    outDir
  });

  await OutputCustomizer(bundler);

  bundler.on('buildEnd', modifySourceFiles);

  function modifySourceFiles() {
    // Detach the listener to avoid infinite loop of changes and rebuilds
    bundler.off('buildEnd', modifySourceFiles);

    const DSstoreFilePath = `${CWD}/${outDir}/.DS_Store`;
    const anotherFilePath = `${CWD}/${outDir}/css/file.txt`;

    const htmlFilePath = `${CWD}/test/example-src/index.html`;
    const cssFilePath = `${CWD}/test/example-src/css/style.css`;

    let htmlFileContent = readFileSync(htmlFilePath);
    let cssFileContent = readFileSync(cssFilePath);

    htmlFileContent += '<a>Check this out</a>';
    cssFileContent += 'p { color: red; }';

    // DS_Store file goes to the root
    writeFileSync(DSstoreFilePath, 'I want to cause some errors :)');
    // "anotherFile" goes to the subdirectory
    writeFileSync(anotherFilePath, "I'll try to cause them too!");

    writeFileSync(htmlFilePath, htmlFileContent);
    writeFileSync(cssFilePath, cssFileContent);

    // Wait 1 second for parcel to recompile the new changes
    setTimeout(async () => {
      await bundler.bundle();

      // Undo the changes made to the source files
      execSync(`git checkout -- ${htmlFilePath}`);
      execSync(`git checkout -- ${cssFilePath}`);

      process.exit(0);
    }, 1000);
  }

  const bundle = await bundler.bundle();
})();
