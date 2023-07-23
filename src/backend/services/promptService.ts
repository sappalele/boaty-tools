import { randomUUID } from "crypto";
import {
  PopulatedPrompt,
  Prompt,
  PromptType,
  getPrompt,
  getPromptsByStatus,
  populatePrompt,
  upsertImage,
  upsertPrompt,
} from "../utils/db";
import { logger } from "../utils/logger";
import { DevelopAction } from "../utils/messageHandler";
import {
  addRefImagesToChannel,
  developPromptBot,
  promptBot,
  promptWatcher,
  recoverBrokenPrompt,
  upscalePromptBot,
  variatePromptBot,
} from "../utils/puppeteer";

let promptWatcherRunning = false;

export const waitForPrompts = async (updater = updateAndSendPrompt) => {
  if (promptWatcherRunning) {
    logger.log("prompt watcher already running");
    return;
  }

  promptWatcherRunning = true;
  try {
    logger.log("starting prompt watcher");
    await promptWatcher(updater);
  } catch (error) {
    // recover watcher
    logger.log("recovering watcher", error);
    promptWatcherRunning = false;
    await waitForPrompts(updater);
  }
};

export const updateAndSendPrompt = async (
  prompt: Prompt,
  updateModified = true
) => {
  const updatedPrompt = await upsertPrompt({
    ...prompt,
    modified: updateModified ? new Date().getTime() : prompt.modified,
  } as any);

  process.parentPort.postMessage({
    type: "PROMPT_UPDATE",
    data: await populatePrompt(updatedPrompt),
  });

  return updatedPrompt;
};

export const runPrompt = async (
  prompt: PopulatedPrompt,
  updater = updateAndSendPrompt
) => {
  logger.log("prompt received", prompt);
  const promptId = randomUUID().toString();
  const newPrompt = await updateAndSendPrompt({
    type: "INITIAL",
    id: promptId,
    created: new Date().getTime(),
    status: "WAITING",
    prompt: prompt.prompt,
    options: prompt.options,
    refImages: prompt.refImages.map((i) => i.id),
    project: prompt.project,
  });

  await waitForPrompts(updater);
  await promptBot(newPrompt, updater);
};

export const upscalePrompt = async (
  promptId: string,
  imageIndex: number,
  updater = updateAndSendPrompt
) => {
  logger.log("upscale received", promptId, imageIndex);
  const initial = await getPrompt(promptId);
  const initialPopulated = await populatePrompt(initial);
  const upscalePromptId = randomUUID().toString();
  const newPrompt = await updater({
    type: "UPSCALED",
    id: upscalePromptId,
    created: new Date().getTime(),
    status: "WAITING",
    prompt: initial.prompt,
    seed: initial.seed,
    elementId: initial.elementId,
    parentPrompt: initial.id,
    upscaleIndex: imageIndex + 1,
    project: initial.project,
  });

  logger.log("new prompt", newPrompt);

  await waitForPrompts();
  await upsertImage({ ...initialPopulated.images[imageIndex], upscaled: true });
  await upscalePromptBot(newPrompt, imageIndex, updater);
};

export const variatePrompt = async (
  promptId: string,
  imageIndex: number,
  updater = updateAndSendPrompt
) => {
  logger.log("variate received", promptId, imageIndex);

  const initial = await getPrompt(promptId);
  const variatePromptId = randomUUID().toString();

  const newPrompt = await updater({
    type: "VARIATION",
    id: variatePromptId,
    created: new Date().getTime(),
    status: "WAITING",
    prompt: initial.prompt,
    seed: initial.seed,
    elementId: initial.elementId,
    parentPrompt: initial.id,
    project: initial.project,
  });

  await waitForPrompts();
  await variatePromptBot(newPrompt, imageIndex, updater);
};

export const developPrompt = async (
  promptId: string,
  action: DevelopAction,
  customZoom?: number,
  updater = updateAndSendPrompt
) => {
  logger.log("develop received", promptId, action, customZoom);

  const initial = await getPrompt(promptId);
  const developPromptId = randomUUID().toString();
  let type: PromptType = "INITIAL";

  if (action.startsWith("VARY")) {
    type = "VARIATION";
  }

  const newPrompt = await updater({
    type,
    id: developPromptId,
    created: new Date().getTime(),
    status: "WAITING",
    prompt: initial.prompt,
    elementId: initial.elementId,
    parentPrompt: initial.id,
    project: initial.project,
  });

  await waitForPrompts();
  await developPromptBot(newPrompt, action, customZoom);
};

export const addRefImagesPrompt = async (filePaths: string[]) => {
  await addRefImagesToChannel(filePaths);
};

export const recoverBrokenPrompts = async () => {
  const brokenPrompts = await getPromptsByStatus("GETTING_SEED");

  if (brokenPrompts.length === 0) {
    return;
  }

  logger.log("recovering broken prompts", brokenPrompts);

  for (const prompt of brokenPrompts) {
    await recoverBrokenPrompt(prompt._data, updateAndSendPrompt);
  }
};
