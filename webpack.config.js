const path = require("path");

module.exports = {
  entry: "./test/main.js",
  output: {
    path: path.resolve(__dirname, "test"),
    filename: "bundle.js",
  },
};