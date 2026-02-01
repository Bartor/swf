const path = require('path');
const NpmDtsPlugin = require('npm-dts-webpack-plugin');

module.exports = {
  mode: 'production', // Enables built-in optimizations/minification
  devtool: false, // No source maps in prod (or use 'source-map' if you want them)
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          compilerOptions: {
            declaration: false, // Handled by the plugin below
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
    clean: true, // Clean the folder before a fresh build
  },
  plugins: [
    new NpmDtsPlugin({
      output: path.resolve(__dirname, 'dist/index.d.ts'),
      logLevel: 'warn',
    }),
  ],
};
