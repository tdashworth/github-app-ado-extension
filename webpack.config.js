const path = require('path');
const fs = require('fs')

const entries = fs.readdirSync(path.join(__dirname, 'tasks'))
  .filter(x => x != '_Template')
  .reduce((prev, cur) => { 
    prev[cur] = `./tasks/${cur}/index.ts`;
    return prev;
  }, {})

module.exports = {
  entry: entries,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name]/index.js',
    path: __dirname + '/tasks/'
  },
  target: 'node10',
};