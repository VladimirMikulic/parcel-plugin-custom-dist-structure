const DepGraph = require('dependency-graph').DepGraph;
const { isProjectJSCodeFile } = require('./Utils');

class DependencyGraph extends DepGraph {
  constructor(bundle) {
    super();
    this.bundle = bundle;

    this.buildDependencyGraph();
  }

  buildDependencyGraph() {
    const entryAssets = this.entryAssets;

    for (const entryAsset of entryAssets) {
      const entryAssetPath = entryAsset.parentBundle.name;

      this.addNode(entryAssetPath);
      this.buildDepAssets(entryAsset, entryAssetPath);

      this.bundle.childBundles.forEach(asset => {
        this.buildAssetDependecies(asset);
      });
    }
  }

  // All files (assets) go trough this function
  buildAssetDependecies(asset) {
    const assetName = asset.name;
    const parentBundle = asset.parentBundle.name;

    this.addNode(assetName);

    if (assetName.endsWith('.css') || assetName.endsWith('.js')) {
      const assetDeps = Array.from(asset.assets);
      assetDeps.forEach(assetDep => this.buildDepAssets(assetDep, assetName));
    }

    // React, Vue...
    // Handle imports from Javascript files
    if (isProjectJSCodeFile(assetName)) {
      this.buildJSAssetDependecies(asset.entryAsset, assetName);
    }

    // Html link to other html file (<a href="index.html">)
    if (asset.type === 'html') {
      this.buildDepAssets(asset.entryAsset, assetName);
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

  // Handles entry files imports (.depAssets property)
  buildDepAssets(asset, dependant) {
    const dependencyAssets = Array.from(asset.depAssets);

    for (const dep of dependencyAssets) {
      const dependency = dep[1];
      const dependencyName = dependency.parentBundle.name;

      this.addNode(dependencyName);

      if (dependencyName !== dependant) {
        this.addDependency(dependant, dependencyName);
      } /* else {
        This can cause stack overflow, see #8
        this.buildDepAssets(dependency, dependant);
      } */
    }
  }

  // Handles JS dist file imports only, but if needed, can be refactored
  // to handle other dist file imports as well (.assets property)
  buildJSAssetDependecies(asset, assetName) {
    const assetType = asset.type;

    // Dependency files (Raw Assets) of the <asset>
    const depAssets = Array.from(asset.parentBundle.assets).filter(
      depAsset => depAsset.type !== assetType
    );

    for (const depAsset of depAssets) {
      const depAssetName = depAsset.parentBundle.name;

      this.addNode(depAssetName);
      this.addDependency(assetName, depAssetName);
    }
  }

  // @override
  // original dependantsOf() would throw an error if we had a dependency cycle
  // Classic example would be 2 html files linking to each other and using the same stylesheet/js
  dependantsOf(file) {
    return this.incomingEdges[file];
  }

  dependenciesOf(file) {
    return this.outgoingEdges[file];
  }

  getFilesByType(fileType) {
    return Object.values(this.nodes).reduce((files, filePath) => {
      if (filePath.endsWith(`${fileType}`)) {
        files.push(filePath);
      }

      return files;
    }, []);
  }

  get entryAssets() {
    const assets = [];

    // If there is only one entry asset
    if (this.bundle.entryAsset) {
      assets.push(this.bundle.entryAsset);
    } else {
      // If we have multiple entry assets
      const bundles = Array.from(this.bundle.childBundles);
      bundles.forEach(bundle => {
        assets.push(bundle.entryAsset);
      });
    }

    return assets;
  }

  get entryAssetPaths() {
    return this.entryAssets.map(asset => asset.parentBundle.name);
  }
}

module.exports = DependencyGraph;
