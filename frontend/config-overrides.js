module.exports = function override(config) {
  config.resolve.fallback = {
    url: require.resolve("url/"),
    util: require.resolve("util/"),
    path: require.resolve("path-browserify")
  };
  return config;
};