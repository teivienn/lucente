const path = require('path')
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')
const { withLucenteMetro } = require('lucente/metro')

const monorepoRoot = path.resolve(__dirname, '../..')

const config = {
  watchFolders: [monorepoRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(monorepoRoot, 'node_modules'),
    ],
  },
}

module.exports = withLucenteMetro(mergeConfig(getDefaultConfig(__dirname), config))
