module.exports = {
	entry: ["regenerator-runtime/runtime.js", "<your enter js file>"],

	module: {

	  rules: [
		{
		  test: /\.js$/,
		  exclude: /node_modules/,
		  use: {
			loader: "babel-loader"
		  }
		},
		{
			test: /\.css$/i,
			use: ["style-loader", "css-loader"],
		  }
	  ]
	}
  };