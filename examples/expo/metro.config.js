const { getDefaultConfig } = require('expo/metro-config')
const { withLucenteMetro } = require('lucente/metro')

module.exports = withLucenteMetro(getDefaultConfig(__dirname))
