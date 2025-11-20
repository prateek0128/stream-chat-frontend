// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@": "./", // now "@/context/appContext" works
          },
        },
      ],
      // "expo-router/babel",
      // if you use react-native-reanimated, keep its plugin LAST:
      // "react-native-reanimated/plugin",
    ],
  };
};
