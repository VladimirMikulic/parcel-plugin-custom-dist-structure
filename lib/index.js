const CWD = process.cwd();
const path = require('path');
const glob = require('glob');

const parcelDir = path.join(CWD, 'node_modules', 'parcel-bundler', 'src');
const HMRServerPath = glob.sync(path.join(parcelDir, '*HMRServer.js'))[0];

const HMRServer = require(HMRServerPath);
const Config = require('./Config');
const DependencyGraph = require('./DependencyGraph');
const OutputGenerator = require('./OutputGenerator');
const { isEmptyObject, uncaughtErrorHandler } = require('./Utils');

process
  .on('uncaughtException', uncaughtErrorHandler)
  .on('unhandledRejection', uncaughtErrorHandler);

module.exports = async bundler => {
  const config = new Config(bundler);
  const { mode, runInDevelopment, pluginFolderConfig } = config;

  // If the configuration object is not specified
  if (isEmptyObject(pluginFolderConfig)) return;

  // If the plugin is disabled in development mode
  if (mode === 'development' && !runInDevelopment) return;

  // If the plugin is enabled in development mode
  if (mode === 'development' && runInDevelopment) {
    // Initialize the HMR server that we can use for page refresh
    bundler.hmr = new HMRServer();
    await bundler.hmr.start(bundler.options);
  }

  bundler.on('bundled', bundle => {
    const graph = new DependencyGraph(bundle);
    const outputGenerator = new OutputGenerator(graph, config);

    outputGenerator.generateOutputFolder();

    if (mode === 'development') {
      process.env.firstRun = false;

      try {
        // Reload the page after each build (The plugin doesn't play nice with HMR)
        // https://github.com/VladimirMikulic/parcel-plugin-custom-dist-structure/issues/9
        bundler.hmr.broadcast({
          type: 'reload'
        });
      } catch (error) {
        /**
         * Sometimes, WebSocket is busy and throws an error.
         * It usually occurs, when the plugin and Parcel emit the page refresh signal
         * at the same time. We can ignore it because page will refresh anyways.
         */
      }
    }
  });
};
