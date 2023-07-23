import { BrowserWindow, UtilityProcess, app, utilityProcess } from "electron";
import { handleIpcMessages } from "./ipcHandler";
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const UTILITY_PROCESS_MODULE_PATH: string;

let utilityWorker: UtilityProcess;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createUtilityWorker = (mainWindow: BrowserWindow) => {
  if (utilityWorker) utilityWorker.kill();

  utilityWorker = utilityProcess.fork(UTILITY_PROCESS_MODULE_PATH, [
    app.getPath("userData"),
  ]);

  utilityWorker.on("spawn", () => console.log("spawned new utilityProcess"));
  utilityWorker.on("exit", (code) =>
    // recover utilityProcess on exit
    {
      console.log("utilityProcess exited with code", code);
      mainWindow.webContents.send("message", {
        type: "ERROR",
        data: "UtilityProcess exited with code " + code + ". Restarting...",
      });
      if (code === 101) {
        console.log("restarting utilityProcess");
        createUtilityWorker(mainWindow);
      }
    }
  );

  utilityWorker.on("message", (data) => {
    mainWindow.webContents.send("message", data);
  });

  handleIpcMessages(utilityWorker);
};

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.maximize();
  mainWindow.show();

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  createUtilityWorker(mainWindow);

  // Open the DevTools.
  if (isDev()) mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const isDev = () => {
  return process.env["WEBPACK_SERVE"] === "true";
};