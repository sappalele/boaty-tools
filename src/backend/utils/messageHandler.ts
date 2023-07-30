import {
  addRefImagesPrompt,
  deletePromptAndImages,
  developPrompt,
  recoverBrokenPrompts,
  runBatchPrompt,
  runPrompt,
  upscalePrompt,
  variatePrompt,
} from "../services/promptService";
import {
  PopulatedPrompt,
  Project,
  getAllImages,
  getAllProjects,
  getAllPrompts,
  populatePrompt,
  upsertProject,
  upsertPrompt,
} from "./db";
import { logger } from "./logger";
import {
  checkAppVersion,
  getSignInStatusFromDiscord,
  signInToDiscord,
} from "./puppeteer";

export type DevelopAction =
  | "VARY_STRONG"
  | "VARY_SUBTLE"
  | "ZOOM_OUT_2X"
  | "ZOOM_OUT_1.5X"
  | "ZOOM_OUT_CUSTOM"
  | "PAN_LEFT"
  | "PAN_RIGHT"
  | "PAN_UP"
  | "PAN_DOWN";

export type Message =
  | { type: "PROMPT"; data: PopulatedPrompt }
  | { type: "BATCH_PROMPT"; data: PopulatedPrompt[] }
  | { type: "UPDATE_PROMPT"; data: PopulatedPrompt }
  | { type: "ADD_REF_IMAGES"; data: string[] }
  | { type: "ADD_PROJECT"; data: Project }
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
  | { type: "DELETE_PROMPT"; data: { id: string } }
  | { type: "GET_PROMPTS" }
  | { type: "GET_IMAGES" }
  | { type: "GET_PROJECTS" }
  | { type: "GET_SIGNIN_STATUS" }
  | { type: "CHECK_VERSION"; data: string }
  | { type: "SIGN_IN" };

export const handleMessage = (message: Message) => {
  logger.log("message received", message);

  switch (message.type) {
    case "CHECK_VERSION":
      checkAppVersion(message.data).then((versionMatch) => {
        if (!versionMatch) {
          process.parentPort.postMessage({
            type: "NEW_VERSION",
          });
        }
      });
      break;
    case "PROMPT":
      runPrompt(message.data);
      break;
    case "BATCH_PROMPT":
      runBatchPrompt(message.data);
      break;
    case "UPSCALE_PROMPT":
      upscalePrompt(message.data.id, message.data.index);
      break;
    case "VARIATE_PROMPT":
      variatePrompt(message.data.id, message.data.index);
      break;
    case "DEVELOP_PROMPT":
      developPrompt(
        message.data.id,
        message.data.action,
        message.data.customZoom
      );
      break;
    case "UPDATE_PROMPT":
      upsertPrompt({
        ...message.data,
        parentPrompt: message.data.parentPrompt?.id,
        images: message.data.images?.map((i) => i.id),
        refImages: message.data.refImages?.map((i) => i.id),
      }).then((updatedPrompt) => {
        populatePrompt(updatedPrompt).then((populatedPrompt) => {
          process.parentPort.postMessage({
            type: "PROMPT_UPDATE",
            data: populatedPrompt,
          });
        });
      });

      break;
    case "DELETE_PROMPT":
      deletePromptAndImages(message.data.id).then(() => {
        process.parentPort.postMessage({
          type: "PROMPT_DELETED",
          data: { id: message.data.id },
        });
      });
      break;
    case "GET_PROMPTS":
      getAllPrompts().then((allPrompts) => {
        Promise.all(allPrompts.map((p) => populatePrompt(p))).then(
          (allPopulatedPrompts) => {
            process.parentPort.postMessage({
              type: "PROMPTS",
              data: allPopulatedPrompts,
            });
          }
        );
      });
      break;
    case "GET_IMAGES":
      getAllImages().then((allImages) => {
        process.parentPort.postMessage({
          type: "IMAGES",
          data: allImages.map((i) => i._data),
        });
      });
      break;
    case "GET_PROJECTS":
      getAllProjects().then((allProjects) => {
        process.parentPort.postMessage({
          type: "PROJECTS",
          data: allProjects.map((p) => p._data),
        });
      });
      break;
    case "GET_SIGNIN_STATUS":
      getSignInStatusFromDiscord().then((status) => {
        if (status) recoverBrokenPrompts();

        process.parentPort.postMessage({
          type: "SIGNIN_STATUS",
          data: status,
        });
      });
      break;
    case "SIGN_IN":
      signInToDiscord().then(() =>
        getSignInStatusFromDiscord().then((status) => {
          if (status) recoverBrokenPrompts();

          process.parentPort.postMessage({
            type: "SIGNIN_STATUS",
            data: status,
          });
        })
      );
      break;
    case "ADD_REF_IMAGES":
      addRefImagesPrompt(message.data).then(() => {
        getAllImages().then((allImages) => {
          process.parentPort.postMessage({
            type: "IMAGES",
            data: allImages.map((i) => i._data),
          });
        });
      });
      break;
    case "ADD_PROJECT":
      upsertProject(message.data).then(() => {
        getAllProjects().then((allProjects) => {
          process.parentPort.postMessage({
            type: "PROJECTS",
            data: allProjects.map((p) => p._data),
          });
        });
      });
      break;
    default:
      logger.error("Invalid message type:", message);
      break;
  }
};
