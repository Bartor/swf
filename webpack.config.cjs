const path = require('path');
const NpmDtsPlugin = require('npm-dts-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          compilerOptions: {
            declaration: false,
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
    filename: 'swf.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'module',
    },
    globalObject: 'this',
    clean: true,
  },
  plugins: [
    new NpmDtsPlugin({
      output: path.resolve(__dirname, 'dist/swf.d.ts'),
      logLevel: 'warn',
    }),
  ],
};
