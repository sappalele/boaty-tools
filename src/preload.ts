// Expose protected methods that allow the renderer process to use

import { contextBridge, ipcRenderer } from "electron";
const validSendChannel = ["message"];
const validReceiveChannel = ["message"];

// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  send: (channel: string, data: any) => {
    // whitelist channels
    if (validSendChannel.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel: string, func: (arg0: any) => void) => {
    if (validReceiveChannel.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args: [any]) => {
        func(...args);
      });
    }
  },
});
