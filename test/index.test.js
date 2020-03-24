const path = require('path');
const indexTests = require('./index-tests');
const { execSync } = require('child_process');

const CWD = process.cwd();
let devTestFilePath = path.join(CWD, 'test', 'helpers', 'dev.js');
let prodTestFilePath = path.join(CWD, 'test', 'helpers', 'prod.js');

// Configs for test dist directories
const devConfig1 = { outDir: 'dist-test-dev1', publicURL: './' };
const devConfig2 = { outDir: 'dist-test-dev2', publicURL: '/' };

const prodConfig1 = { outDir: 'dist-test-prod1', publicURL: './' };
const prodConfig2 = { outDir: 'dist-test-prod2', publicURL: '/' };

// Create test dist directories
execSync(
  `node ${prodTestFilePath} --public-url=${prodConfig1.publicURL} --out-dir=${prodConfig1.outDir}`
);

execSync(
  `node ${prodTestFilePath} --public-url=${prodConfig2.publicURL} --out-dir=${prodConfig2.outDir}`
);

execSync(
  `node ${devTestFilePath} --public-url=${devConfig1.publicURL} --out-dir=${devConfig1.outDir}`
);
execSync(
  `node ${devTestFilePath} --public-url=${devConfig2.publicURL} --out-dir=${devConfig2.outDir}`
);

// Test it!
describe(
  'Test file links in production mode with ./ as a publicURL',
  indexTests(prodConfig1)
);

describe(
  'Test file links in production mode with / as a publicURL',
  indexTests(prodConfig2)
);

describe(
  'Test file links in development mode with ./ as a publicURL',
  indexTests(devConfig1)
);

describe(
  'Test file links in development mode with / as a publicURL',
  indexTests(devConfig2)
);
