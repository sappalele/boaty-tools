import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";
import type { ForgeConfig } from "@electron-forge/shared-types";
import path from "path";
import UtilityProcessPlugin from "./utility.plugin";
import { mainConfig } from "./webpack.main.config";
import { rendererConfig } from "./webpack.renderer.config";
import { utilityConfig } from "./webpack.utility.config";

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: path.join(__dirname, "/src/assets/icon"),
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        iconUrl: "https://images2.imgbox.com/16/4c/QM7WW5l7_o.png",
        setupIcon: path.join(__dirname, "/src/assets/icon.ico"),
      },
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        options: {
          icon: path.join(__dirname, "/src/assets/icon.png"),
        },
      },
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        icon: path.join(__dirname, "/src/assets/icon.icns"),
      },
    },
  ],
  plugins: [
    new UtilityProcessPlugin(utilityConfig),
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      devContentSecurityPolicy: "connect-src 'self' * 'unsafe-eval'",
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: "./src/index.html",
            js: "./src/App.tsx",
            name: "main_window",
            preload: {
              js: "./src/preload.ts",
            },
          },
        ],
      },
    }),
  ],
};

export default config;
