module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'], // if using Expo
      // or: ['module:metro-react-native-babel-preset'], // if plain React Native CLI
  
      plugins: [
        ["module:react-native-dotenv", {
          moduleName: "@env",
          path: ".env",
        }]
      ]
    };
  };
  