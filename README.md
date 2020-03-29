# parcel-plugin-custom-dist-structure

![Version](https://img.shields.io/badge/dynamic/json?color=blue&label=version&query=version&url=https%3A%2F%2Fraw.githubusercontent.com%2FVladimirMikulic%2Fparcel-plugin-custom-dist-structure%2Fmaster%2Fpackage.json)
![Downloads](https://img.shields.io/npm/dm/parcel-plugin-custom-dist-structure)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](#)
[![Twitter: VladoDev](https://img.shields.io/twitter/follow/VladoDev.svg?style=social)](https://twitter.com/VladoDev)

> 🚀 Parcel plugin that allows you to specify a custom dist structure.

## :package: Installation

```shell
# Installs the plugin and saves it as a development dependency
npm i parcel-plugin-custom-dist-structure --save-dev
```

## :cloud: Usage

After you've installed the plugin, you'll need to specify configuration for it in `package.json`.

The plugin configuration is very simple, but also very flexible.

It will generate the structure you specify in the configuration object while also handle all your imports (css, images, js...) which makes it suitable for all use cases, from simple websites all the way to complex React/Angular/Vue projects.

Example configuration object in `package.json`:

```jsonc
"customDistStructure": {
  "config": {
    // Output JS files to dist/js folder
    ".js": "js",
    // Output JPG and PNG files to dist/images folder
    "images": [
      ".jpg",
      ".png"
    ],
    // General idea
    ".fileExtension": "folder/in/dist",
    "folder/in/dist": [ ".file", ".extensions" ]
  },
  "options": {
    // Enable plugin in development mode (default: false)
    "development": true
  }
}
```

## :sparkles: Run tests

The plugin uses [Jest](https://jestjs.io/) for running tests.

Jest will execute all `.test.js` files in the `test` folder.

```sh
npm test
```

## :man: Author

**Vladimir Mikulic**

- Twitter: [@VladoDev](https://twitter.com/VladoDev)
- Github: [@VladimirMikulic](https://github.com/VladimirMikulic)
- LinkedIn: [@vladimirmikulic](https://www.linkedin.com/in/vladimir-mikulic/)

## :handshake: Contributing

Contributions, issues and feature requests are welcome!

## :pencil: License

This project is licensed under [MIT](https://opensource.org/licenses/MIT) license.

## :man_astronaut: Show your support

Give a ⭐️ if this project helped you!
