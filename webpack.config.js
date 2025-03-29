const path = require('path');

module.exports = {
  mode: 'production', // ← сюда!
  entry: './MoonCEBC.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    module: true,
  },
  experiments: {
    outputModule: true,
  },
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.(png|jpg|jpeg|gif)$/i, type: 'asset/resource' },
    ],
  },
  target: ['web'],
};
