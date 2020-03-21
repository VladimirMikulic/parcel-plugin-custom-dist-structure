const Config = require('./Config');
const { isEmptyObject } = require('./Utils');
const DependencyGraph = require('./DependencyGraph');
const OutputGenerator = require('./OutputGenerator');

module.exports = bundler => {
  const config = new Config(bundler);
  const { mode, runInDevelopment, pluginFolderConfig } = config;

  if (isEmptyObject(pluginFolderConfig)) return;
  if (mode === 'development' && !runInDevelopment) return;

  bundler.on('bundled', bundle => {
    const graph = new DependencyGraph(bundle);
    const outputGenerator = new OutputGenerator(graph, config);

    outputGenerator.generateOutputFolder();
  });
};
