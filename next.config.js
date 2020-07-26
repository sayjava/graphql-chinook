const withImages = require("next-images");

module.exports = withImages({
  outDir: "dist",
  exportTrailingSlash: true,
  exportPathMap: async () => {
    return {
      "/": {
        page: "/"
      },
    };
  },
  webpack(config, {
    isServer
  }) {
    const rules = [{
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto"
    }];

    config.module.rules.push(...rules);

    if (!isServer) {
      config.node = {
        fs: "empty"
      };
    }

    return config;
  }
});