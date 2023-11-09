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

    // Agregar esta regla para excluir langchain de la minificación
    config.optimization.minimizer[0].options.terserOptions.exclude = /node_modules\/langchain/;

    return config;
  },
}