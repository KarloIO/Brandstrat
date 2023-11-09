// next.config.js
module.exports = {
  experimental: {
    webpackBuildWorker: true
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(txt|jpg|gif|svg|eot|ttf|woff|woffmpogg|wav)$/,
      use: {
        loader: 'file-loader',
        options: {
          outputPath: 'static',
        },
      },
    });
    return config;
  },
}