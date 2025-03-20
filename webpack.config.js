const path = require("path");

module.exports = {
  entry: "./src/MyComponent.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "my-web-component.js",
    library: "MyWebComponent",
    libraryTarget: "umd", // Możesz zmienić na "var" jeśli chcesz globalną zmienną
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-react"],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
};
