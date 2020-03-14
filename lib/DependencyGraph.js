const DepGraph = require('dependency-graph').DepGraph;
const { isProjectJSCodeFile } = require('./Utils');

class DependencyGraph extends DepGraph {
  constructor(bundle) {
    super();
    this.bundle = bundle;

    this.buildDependencyGraph();
  }

  buildDependencyGraph() {
    const entryAssetPath = this.entryAssetPath;

    this.addNode(entryAssetPath);
    this.buildDependencyAssets(this.bundle.entryAsset, entryAssetPath);

    this.bundle.childBundles.forEach(asset => {
      this.buildAssetDependecies(asset);
    });
  }

  buildAssetDependecies(asset) {
    const assetName = asset.name;
    const parentBundle = asset.parentBundle.name;

    this.addNode(assetName);

    // React, Vue...
    // Handle imports from Javascript files
    if (isProjectJSCodeFile(assetName)) {
      this.buildDependencyAssets(asset.entryAsset, assetName);
    }

    if (this.hasNode(parentBundle)) {
      this.addDependency(parentBundle, assetName);
    }

    if (asset.childBundles) {
      asset.childBundles.forEach(childAsset => {
        this.buildAssetDependecies(childAsset);
      });
    }
  }

  buildDependencyAssets(asset, dependant) {
    const dependencyAssets = Array.from(asset.depAssets);

    dependencyAssets.forEach(dependency => {
      dependency = dependency[1];
      const dependencyName = dependency.parentBundle.name;

      this.addNode(dependencyName);

      if (dependencyName !== dependant) {
        this.addDependency(dependant, dependencyName);
      } else {
        this.buildDependencyAssets(dependency, dependant);
      }
    });
  }

  getFilesByType(fileType) {
    return Object.values(this.nodes).reduce((files, filePath) => {
      if (filePath.endsWith(`${fileType}`)) {
        files.push(filePath);
      }

      return files;
    }, []);
  }

  get entryAssetPath() {
    return this.bundle.entryAsset.parentBundle.name;
  }
}

module.exports = DependencyGraph;
