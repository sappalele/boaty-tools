import { UtilityProcess, app, ipcMain, shell } from "electron";
import { Image, PopulatedPrompt, Project } from "./backend/utils/db";
import { DevelopAction } from "./backend/utils/messageHandler";

export type IpcMessage =
  | { type: "PROMPT"; data: PopulatedPrompt }
  | { type: "UPDATE_PROMPT"; data: PopulatedPrompt }
  | { type: "UPSCALE_PROMPT"; data: { id: string; index: number } }
  | { type: "VARIATE_PROMPT"; data: { id: string; index: number } }
  | {
      type: "DEVELOP_PROMPT";
      data: {
        id: string;
        action: DevelopAction;
        customZoom?: number;
      };
    }
  | { type: "GET_PROMPTS" }
  | { type: "GET_IMAGES" }
  | { type: "GET_PROJECTS" }
  | { type: "ADD_PROJECT"; data: Project }
  | { type: "GET_SIGNIN_STATUS" }
  | { type: "SIGN_IN" }
  | { type: "PROMPT_UPDATE"; data: PopulatedPrompt }
  | { type: "DELETE_PROMPT"; data: { id: string } }
  | { type: "PROMPT_DELETED"; data: { id: string } }
  | { type: "PROMPTS"; data: PopulatedPrompt[] }
  | { type: "IMAGES"; data: Image[] }
  | { type: "PROJECTS"; data: Project[] }
  | { type: "SIGNIN_STATUS"; data: boolean }
  | { type: "ADD_REF_IMAGES"; data: string[] }
  | { type: "OPEN_EXTERNAL_URL"; data: string }
  | { type: "OPEN_EXTERNAL_FILE"; data: string }
  | { type: "ERROR"; data: string }
  | { type: "CHECK_VERSION" }
  | { type: "NEW_VERSION" }
  | {
      type: "LOG";
      data: {
        level: "INFO" | "ERROR" | "WARN" | "DEBUG";
        message: string;
      };
    };

export const handleIpcMessages = (utilityWorker: UtilityProcess) => {
  //const { port1, port2 } = new MessageChannelMain();

  ipcMain.on("message", (event, message) => {
    if (message.type === "OPEN_EXTERNAL_URL") {
      return shell.openExternal(message.data);
    }

    if (message.type === "OPEN_EXTERNAL_FILE") {
      return shell.openPath(message.data);
    }

    if (message.type === "CHECK_VERSION") {
      return utilityWorker.postMessage({
        type: message.type,
        data: app.getVersion(),
      });
    }

    return utilityWorker.postMessage({
      type: message.type,
      data: message.data,
    });
  });
};
