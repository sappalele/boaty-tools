import path from "path";
import { Configuration } from "webpack";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeExternals = require("webpack-node-externals");

const modulePath = path.resolve(__dirname, "dist_utility/utility_process");

export const utilityConfig: Configuration = {
  entry: "./src/backend/index.ts",
  target: "node",
  module: {
    rules: [
      {
        test: /\.ts?$/,
        exclude: /(node_modules|\.webpack)/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
          },
        },
      },
      {
        test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
        parser: { amd: false },
        use: {
          loader: "@vercel/webpack-asset-relocator-loader",
          options: {
            outputAssetBase: "native_modules",
          },
        },
      },
    ],
  },
  output: {
    path: modulePath,
    filename: "index.js",
  },
  resolve: {
    extensions: [".ts"],
  },
  externals: nodeExternals(),
  // TODO: find a way to infer this based on whether we run electron-forge start
  // or package.
  mode: "development",
};
