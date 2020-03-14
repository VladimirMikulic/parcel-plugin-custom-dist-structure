const { getPluginConfiguration } = require('./Utils');

class Config {
  constructor(bundler) {
    let { production, outDir, publicURL, rootDir } = bundler.options;

    if (publicURL === './') {
      publicURL = '';
    }

    Object.assign(this, {
      production,
      outDir,
      publicURL,
      rootDir
    });

    this.pluginConfig = getPluginConfiguration();
  }

  get pluginFolderConfig() {
    return this.pluginConfig.config;
  }

  get pluginOptions() {
    const config = this.pluginConfig;
    const options = config.options || {};

    return options;
  }

  get runInDevelopment() {
    return this.pluginOptions.development && !this.production;
  }
}

module.exports = Config;
