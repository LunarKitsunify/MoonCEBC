// webpack.config.js
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  mode: 'production',
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
      // CSS обработка отключена — ты сам подключаешь <link>
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  target: ['web'],
};
