const fs = require('fs');
const path = require('path');
const indexTests = require('./index-tests');
const { execSync } = require('child_process');

const CWD = process.cwd();
const testsBaseDir = 'dist-test';

const devTestFilePath = path.join(CWD, 'test', 'helpers', 'dev.js');
const prodTestFilePath = path.join(CWD, 'test', 'helpers', 'prod.js');

const bundleConfigs = [
  {
    outDir: `${testsBaseDir}/dev1`,
    publicURL: './',
    genBundleFile: devTestFilePath
  },
  {
    outDir: `${testsBaseDir}/dev2`,
    publicURL: '/',
    genBundleFile: devTestFilePath
  },
  {
    outDir: `${testsBaseDir}/dev3`,
    publicURL: '/static/',
    genBundleFile: devTestFilePath
  },
  {
    outDir: `${testsBaseDir}/prod1`,
    publicURL: './',
    genBundleFile: prodTestFilePath
  },
  {
    outDir: `${testsBaseDir}/prod2`,
    publicURL: '/',
    genBundleFile: prodTestFilePath
  },
  {
    outDir: `${testsBaseDir}/prod3`,
    publicURL: '/static/',
    genBundleFile: prodTestFilePath
  }
];

// Bundling without cached changes (.cache folder) takes time
jest.setTimeout(30000);

// Creates base folder for test folders
if (!fs.existsSync(testsBaseDir)) fs.mkdirSync(testsBaseDir);

// Generates test folders
for (const { outDir, publicURL, genBundleFile } of bundleConfigs) {
  execSync(
    `node ${genBundleFile} --public-url=${publicURL} --out-dir=${outDir}`
  );
}

// Tests file links in files from each folder
for (const conf of bundleConfigs) {
  const mode = conf.outDir.includes('prod') ? 'production' : 'development';

  describe(
    `Test file links in ${mode} mode with ${conf.publicURL} as a publicURL`,
    indexTests(conf)
  );
}
