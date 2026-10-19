// O expo-sqlite no navegador (tecla `w`) roda o SQLite como WebAssembly;
// o Metro precisa servir arquivos .wasm. No Android/iOS isso nao e usado.
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("wasm");

module.exports = config;
