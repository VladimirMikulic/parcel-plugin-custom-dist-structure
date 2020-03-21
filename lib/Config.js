const { getPluginConfiguration } = require('./Utils');

class Config {
  constructor(bundler) {
    let { production, outDir, publicURL, rootDir } = bundler.options;

    if (publicURL === './') {
      publicURL = '';
    }

    Object.assign(this, {
      outDir,
      rootDir,
      publicURL,
      production,
      mode: process.env.NODE_ENV,
      _pluginConfig: getPluginConfiguration()
    });
  }

  get pluginFolderConfig() {
    return this._pluginConfig.config || {};
  }

  get pluginOptions() {
    return this._pluginConfig.options || {};
  }

  get runInDevelopment() {
    return this.pluginOptions.development && !this.production;
  }
}

module.exports = Config;
