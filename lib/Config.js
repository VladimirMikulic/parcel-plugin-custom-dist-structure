const { getPluginConfiguration } = require('./Utils');

class Config {
  constructor(bundler) {
    this.bundler = bundler;
    let { production, outDir, publicURL, rootDir } = bundler.options;

    if (publicURL === './') {
      publicURL = '';
    }

    Object.assign(this, {
      outDir,
      rootDir,
      publicURL,
      production,
      _pluginConfig: getPluginConfiguration()
    });
  }

  get mode() {
    if (this.bundler.options.production) {
      return 'production';
    }
    return 'development';
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
