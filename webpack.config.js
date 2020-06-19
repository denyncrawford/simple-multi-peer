const path = require("path");
const Dotenv = require("dotenv-webpack");

module.exports = {
  entry: "./test/main.js",
  output: {
    path: path.resolve(__dirname, "test"),
    filename: "bundle.js",
  },
  plugins: [
    new Dotenv
  ]
};