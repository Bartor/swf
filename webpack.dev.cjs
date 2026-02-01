const path = require('path');

module.exports = {
  mode: 'development',
  watch: true,
  watchOptions: {
    ignored: /node_modules/,
  },
  devtool: 'source-map',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          compilerOptions: {
            declaration: true,
            outDir: 'dist',
            sourceMap: true,
          },
        },
      },
    ],
  },
  experiments: {
    outputModule: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'module',
    },
    globalObject: 'this',
    clean: false,
  },
};
