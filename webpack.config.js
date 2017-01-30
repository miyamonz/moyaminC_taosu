module.exports = {
    entry: "./src/main.js",
    output: {
        path: __dirname +"/dst",
        filename: "bundle.js"
    },
  devServer: {
    contentBase: "./",
    inline:true,
    hot: true
  }
}

