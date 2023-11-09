// next.config.js
module.exports = {
  experimental: {
    webpackBuildWorker: true
  },
  swcMinify: false,
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

    config.module.rules.push({
      test: /node_modules\/langchain/,
      resolve: {
        fullySpecified: false,
      },
    });

    // Verificar si el minimizador existe antes de intentar acceder a sus opciones
    if (config.optimization && config.optimization.minimizer && config.optimization.minimizer[0]) {
      config.optimization.minimizer[0].options.terserOptions.exclude = /node_modules\/langchain/;
    }

    return config;
  },
}