// next.config.js
module.exports = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(txt|jpg|gif|svg|eot|ttf|woff|woff2|mp3|ogg|wav)$/,
      use: {
        loader: 'file-loader',
        options: {
          outputPath: 'static',
        },
      },
    });
    return config;
  },
  experimental: {
    serverActions: true,
  }
};
