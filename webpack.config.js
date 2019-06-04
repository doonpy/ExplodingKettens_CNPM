const path = require('path');

module.exports = {
  entry: './src/mositure.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public/javascripts')
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.css$/,
        include: /node_modules/,
        use: ['style-loader', 'css-loader']
      },
    ]
  }
};