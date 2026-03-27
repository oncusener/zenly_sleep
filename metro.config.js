const { getDefaultConfig } = require('expo/metro-config');

// __currentDir yerine projenin kök dizinini temsil eden __dirname kullanılır
const config = getDefaultConfig(__dirname);

// Desteklenen ses formatlarını listeye ekliyoruz
config.resolver.assetExts.push(
    'flac',
    'wav',
    'ogg',
    'mp3',
    'm4a'
);

module.exports = config;