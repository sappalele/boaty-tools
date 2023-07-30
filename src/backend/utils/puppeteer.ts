import chromePaths from "chrome-paths";
import { randomUUID } from "crypto";
import puppeteer, { Browser, ElementHandle, Page } from "puppeteer";
import { RxDocument } from "rxdb";
import {
  LocalStorageItem,
  PopulatedPrompt,
  Prompt,
  PromptType,
  addToLocalStorage,
  getLocalStorage,
  getPrompt,
  getPromptByStatusPromptType,
  getUpscaledPrompt,
  getUrl,
  populatePrompt,
  upsertImage,
  upsertUrl,
} from "./db";
import { pollUntil, wait } from "./helpers";
import { saveImagesFromUrls } from "./image";
import { logger } from "./logger";
import { DevelopAction } from "./messageHandler";

let headlessBrowser: Browser | null = null;
let headedBrowser: Browser | null = null;

export const getSignInStatusFromDiscord = async () => {
  const { page } = await initPuppeteer(true);
  await page.goto("https://discord.com/");
  await addLocalStorage(page);
  await page.goto("https://discord.com/login");
  await page.waitForNetworkIdle();

  const status = !page.url().includes("login");
  logger.log(page.url());
  logger.log(status);

  await page.close();

  return status;
};

export const signInToDiscord = async () => {
  const currentLocalStorage = await getLocalStorage();

  if (currentLocalStorage.length === 0) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await bypassLocalStorageOverride(page);

    await page.goto("https://discord.com/login");
    await page.waitForNavigation();
    await page.waitForSelector('[role="treeitem"]');

    // store local storage in db
    const localStorageData = await page.evaluate(() => {
      const localStorageValues = [] as LocalStorageItem[];

      // Retrieve all keys in the localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) as string;
        const value = localStorage.getItem(key) as string;
        localStorageValues.push({ key, value });
      }

      return localStorageValues;
    });

    await addToLocalStorage(localStorageData);
    await page.close();
    await browser.close();
  }
};

export const promptWatcher = async (
  updater: (prompt: Prompt) => Promise<RxDocument<Prompt>>
) => {
  const { page } = await initPuppeteer(true);
  await goToBotChannel(page);

  // mutation observer on chat list
  const listSelector = '[data-list-id="chat-messages"]';
  const list = await page.waitForSelector(listSelector);

  if (!list) {
    throw new Error("Could not find chat list");
  }

  await page.exposeFunction(
    "listObserver",
    async (addedNodes: any, removedNodes: any) => {
      console.log("addedNode", addedNodes);
      console.log("removedNode", removedNodes);

      addedNodes.forEach(async (addedNode) => {
        const elementId = `#${addedNode[0]}`;
        const textContent = addedNode[1] as string;
        const spanArray = addedNode[3] as string[];
        let promptString = stripUrls(addedNode[2] as string).trim();
        promptString = promptString?.split("--")?.at(0).trim();

        let type: PromptType = "INITIAL";

        if (
          !!spanArray.find((s) => s.startsWith("Making variations")) ||
          !!spanArray.find((s) => s.startsWith("- Variations"))
        ) {
          type = "VARIATION";
        }

        if (promptString === "No text prompts!") promptString = "";

        if (addedNode[0].startsWith("chat-messages")) {
          // attach a mutation observer to the new element
          logger.log("new chat message: ", promptString);

          if (textContent.includes("Upscaling image")) {
            // no op, wait for completion
            return;
          }

          if (textContent.includes("Waiting to start")) {
            await watchAndLockPrompt(
              page,
              promptString,
              elementId,
              type,
              updater
            );
            return;
          }

          if (textContent.includes("Action needed to continue")) {
            return process.parentPort.postMessage({
              type: "ERROR",
              data: "One or more prompts need attention, check Discord for more info",
            });
          }

          if (
            textContent.includes("already requested an upscale for this image")
          ) {
            return process.parentPort.postMessage({
              type: "ERROR",
              data:
                "Upscale already requested for image with prompt: " +
                promptString,
            });
          }

          if (
            textContent.includes("Image #") &&
            (textContent.includes("Vary (Strong)Vary (Subtle)") ||
              textContent.includes("Zoom Out 2xZoom Out 1.5"))
          ) {
            // most likely a completed upscale prompt
            const imageIndex = spanArray
              .find((s) => s.startsWith("#"))
              .replace("#", "")
              .replace(" ", "");
            await handleUpscaleCompleted(
              page,
              promptString,
              elementId,
              +imageIndex,
              updater
            );

            return;
          }

          if (textContent.includes("U1U2U3U4")) {
            const completed = await handleCompletedPrompt(
              page,
              promptString,
              elementId,
              type,
              updater,
              spanArray
            );

            if (completed)
              await clickReactionAndCompleteJob(page, completed._data, updater);

            return;
          }
        }
      });
    }
  );

  await page.evaluate(
    ([listSelector]) => {
      const target = document.querySelector(listSelector);
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          (window as any).listObserver(
            Array.from(mutation.addedNodes).map((n) => [
              (n as any).id,
              n.textContent,
              (n as Element).querySelector("strong")?.textContent,
              Array.from((n as Element).querySelectorAll("span"))?.map(
                (s) => s.textContent
              ),
            ]),
            Array.from(mutation.removedNodes).map((n) => [
              (n as any).id,
              n.textContent,
              (n as Element).querySelector("strong")?.textContent,
              Array.from((n as Element).querySelectorAll("span"))?.map(
                (s) => s.textContent
              ),
            ])
          );
        }
      });
      observer.observe(target, {
        childList: true,
      });
    },
    [listSelector]
  );
  logger.log("watching for prompts");
};

const handleUpscaleCompleted = async (
  page: Page,
  promptString: string,
  elementId: string,
  upscaleIndex: number,
  updater: (prompt: Prompt) => Promise<RxDocument<Prompt>>
) => {
  logger.log("handleUpscaleCompleted", promptString, elementId, upscaleIndex);
  const prompt = await getUpscaledPrompt(promptString, "WAITING", upscaleIndex);

  if (!prompt) {
    logger.error("Upscale prompt not found", promptString);
    return;
  }

  const el = await page.$(elementId);

  const imageUrls = await el?.evaluate((e) => {
    const imageElements = e.querySelectorAll('[data-role="img"]');
    const imageUrls = [] as string[];

    imageElements.forEach((img) => {
      const url = img.getAttribute("href");
      if (url) {
        imageUrls.push(url);
      }
    });

    return imageUrls;
  });

  const images = await saveImagesFromUrls(prompt.prompt, imageUrls);

  const savedImages = await Promise.all(
    images.map(async (i) => {
      const savedImage = await upsertImage({
        id: randomUUID().toString(),
        url: i.url,
        path: i.path,
        height: i.height,
        width: i.width,
        created: new Date().getTime(),
      });

      return savedImage;
    })
  );

  await updater({
    ...prompt._data,
    status: "COMPLETED",
    elementId,
    images: savedImages.map((i) => i.id),
  });
};

const handleCompletedPrompt = async (
  page: Page,
  promptString: string,
  elementId: string,
  type: PromptType,
  updater: (prompt: Prompt) => Promise<RxDocument<Prompt>>,
  spanArray: string[]
) => {
  logger.log("handleCompletedPrompt", promptString, elementId, type);
  let prompt = await getPromptByStatusPromptType("RUNNING", promptString, type);

  if (!prompt) {
    // fallback and try to find waiting prompt
    prompt = await getPromptByStatusPromptType("WAITING", promptString, type);
  }

  if (!prompt) {
    logger.error("Prompt not found", promptString);
    return;
  }

  const el = await page.$(elementId);
  const img = await el?.evaluate((e) =>
    e.querySelector('[data-role="img"]')?.getAttribute("href")
  );
  const jobId = extractIdFromUrl(img);

  return await updater({
    ...prompt._data,
    status: "GETTING_SEED",
    jobId,
    elementId,
    type: spanArray.find((s) => s.startsWith("- Pan"))
      ? "PAN"
      : prompt._data.type,
  });
};

const watchAndLockPrompt = async (
  page: Page,
  promptString: string,
  elementId: string,
  type: PromptType,
  updater: (prompt: Prompt) => Promise<RxDocument<Prompt>>
) => {
  logger.log("watchAndLockPrompt", promptString, elementId, type);
  const prompt = await getPromptByStatusPromptType(
    "WAITING",
    promptString,
    type
  );

  if (!prompt) {
    logger.error("Prompt not found", promptString);
    return;
  }

  let currentPrompt = await updater({
    ...prompt._data,
    status: "RUNNING",
    elementId,
  });

  await pollUntil(
    async () => {
      const el = await page.$(elementId);

      if (!el) return true;

      const previewUrl = await el?.evaluate((e) =>
        e.querySelector('[data-role="img"]')?.getAttribute("href")
      );

      if (currentPrompt.previewUrl != previewUrl) {
        const prompt = await getPrompt(currentPrompt.id);

        if (prompt.status !== "COMPLETED")
          currentPrompt = await updater({
            ...currentPrompt._data,
            status: "RUNNING",
            images: [
              (
                await upsertImage({
                  id: currentPrompt.id,
                  url: previewUrl,
                  path: "",
                  created: new Date().getTime(),
                })
              ).id,
            ],
          });
      }
    },
    10000,
    600_000
  );
};

const clickReactionAndCompleteJob = async (
  page: Page,
  prompt: Prompt,
  updater: (prompt: Prompt) => Promise<RxDocument<Prompt>>
) => {
  const { elementId, jobId } = prompt;

  logger.log("clickReaction", elementId);
  let reactionGotten = false;

  const clickReaction = async (targetElement: ElementHandle) => {
    if (!targetElement) {
      logger.error("Could not find element for reaction", elementId);
      return false;
    }

    const hasReaction = await targetElement?.evaluate((e) =>
      e.querySelector('[class*="reactionInner"]')
    );

    if (hasReaction) {
      logger.log("reaction found", elementId);
      return true;
    } else {
      logger.log("reaction not found", elementId);
    }

    try {
      await targetElement.hover();
      const reactionButton = await targetElement.$(
        '[aria-label="Add Reaction"]'
      );
      await reactionButton?.click();

      await page.type(
        'input[aria-controls*="emoji-picker-grid"]',
        ":envelope:"
      );
      await page.keyboard.press("Enter");

      return true;
    } catch (error) {
      logger.log("error setting reaction", error);
      return false;
    }
  };

  await pollUntil(
    async () => {
      reactionGotten = await clickReaction(await page.$(elementId));
      return reactionGotten;
    },
    5000,
    60000
  );

  if (!reactionGotten) {
    logger.error("Could not get reaction", elementId);
    return;
  }

  let seedMessageId = "";

  await pollUntil(
    async () => {
      seedMessageId = await page.evaluate((jobId) => {
        const elements = document.querySelectorAll(
          '[class*="messageListItem"]'
        );
        const res = Array.prototype.filter.call(elements, function (element) {
          return RegExp(jobId).test(element.textContent);
        });

        if (res.length === 0) return null;

        return "#" + res[0].id;
      }, jobId);

      console.log("seedMessageId", seedMessageId);

      if (!seedMessageId) {
        logger.error("Could not find element for job id", jobId);
        return false;
      }

      logger.debug("seedMessageId", seedMessageId);
      return true;
    },
    5000,
    60000
  );

  if (seedMessageId)
    await extractSeedAndImages(page, prompt, seedMessageId, updater);
};

const extractSeedAndImages = async (
  page: Page,
  prompt: Prompt,
  elementId: string,
  updater: (prompt: Prompt) => Promise<RxDocument<Prompt>>
) => {
  const el = await page.$(elementId);
  const textContent = await el?.evaluate((e) => e.textContent);

  logger.log("extracting seed and images", prompt.jobId);

  const seed = +extractSeedFromMessage(textContent as string);
  const imageUrls = await el?.evaluate((e) => {
    const imageElements = e.querySelectorAll('[data-role="img"]');
    const imageUrls = [] as string[];

    imageElements.forEach((img) => {
      const url = img.getAttribute("href");
      if (url) {
        imageUrls.push(url);
      }
    });

    return imageUrls;
  });

  const jobId = extractIdFromUrl(imageUrls.at(0));

  if (!prompt) {
    logger.error("Prompt not found for extracting seed found", jobId);
    return;
  }

  const images = await saveImagesFromUrls(prompt.prompt, imageUrls);

  const savedImages = await Promise.all(
    images.map(async (i) => {
      const savedImage = await upsertImage({
        id: randomUUID().toString(),
        url: i.url,
        path: i.path,
        height: i.height,
        width: i.width,
        created: new Date().getTime(),
      });

      return savedImage;
    })
  );

  await updater({
    ...prompt,
    status: "COMPLETED",
    seed,
    jobId,
    images: savedImages.map((i) => i.id),
  });
};

export const promptBot = async (
  prompt: Prompt,
  updater: (prompt: Prompt) => Promise<RxDocument<Prompt>>
) => {
  try {
    const populatedPrompt = await populatePrompt(prompt as any);
    console.time("setup");
    const { page } = await initPuppeteer(true);
    await goToBotChannel(page);
    console.timeEnd("setup");

    await page.waitForSelector('div[data-slate-node="element"]');
    await page.click('div[data-slate-node="element"]');
    await page.keyboard.press("Tab");

    await page.keyboard.type("/imagine");
    await wait(1000);
    await page.keyboard.press("Enter");
    await wait(1000);
    await page.keyboard.type(constructPrompt(populatedPrompt));
    await wait(500);
    await page.keyboard.press("Enter");
    await wait(500);

    await page.close();
  } catch (error) {
    logger.error("Error occurred while running prompt", error);
    await updater({
      ...prompt,
      status: "FAILED",
    });
  }
};

export const upscalePromptBot = async (
  prompt: Prompt,
  imageIndex: number,
  updater: (prompt: Prompt) => Promise<RxDocument<Prompt>>
) => {
  const { page } = await initPuppeteer(true);
  await goToBotChannel(page);
  const msgElement = await findMessage(page, prompt.elementId);

  const btn = await msgElement.$(`button ::-p-text(U${imageIndex + 1})`);
  await btn.click();

  await page.close();
};

export const variatePromptBot = async (
  prompt: Prompt,
  imageIndex: number,
  updater: (prompt: Prompt) => Promise<RxDocument<Prompt>>
) => {
  const { page } = await initPuppeteer(true);
  await goToBotChannel(page);
  const msgElement = await findMessage(page, prompt.elementId);

  const btn = await msgElement.$(`button ::-p-text(V${imageIndex + 1})`);
  await btn.click();

  await page.close();
};

export const developPromptBot = async (
  prompt: Prompt,
  action: DevelopAction,
  customZoom = 0
) => {
  const { page } = await initPuppeteer(true);
  await goToBotChannel(page);
  const msgElement = await findMessage(page, prompt.elementId);

  let btn: ElementHandle<Element>;

  switch (action) {
    case "VARY_STRONG":
      btn = await msgElement.$(`button ::-p-text(Vary (Strong))`);
      break;
    case "VARY_SUBTLE":
      btn = await msgElement.$(`button ::-p-text(Vary (Subtle))`);
      break;
    case "ZOOM_OUT_2X":
      btn = await msgElement.$(`button ::-p-text(Zoom Out 2x)`);
      break;
    case "ZOOM_OUT_1.5X":
      btn = await msgElement.$(`button ::-p-text(Zoom Out 1.5x)`);
      break;
    case "ZOOM_OUT_CUSTOM": {
      btn = await msgElement.$(`button ::-p-text(Custom Zoom)`);
      await btn.click();

      const textarea = await page.waitForSelector(
        '[class*="focusLock"] textarea'
      );
      await textarea.click({ clickCount: 3 });
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("Backspace");
      await page.keyboard.type(customZoom.toString());

      await page.click('[type="submit"');
      return;
    }
    case "PAN_LEFT":
      btn = await msgElement.$(`[data-name="⬅️"]`);
      break;
    case "PAN_RIGHT":
      btn = await msgElement.$(`[data-name="➡️"]`);
      break;
    case "PAN_UP":
      btn = await msgElement.$(`[data-name="⬆️"]`);
      break;
    case "PAN_DOWN":
      btn = await msgElement.$(`[data-name="⬇️"]`);
      break;
  }

  await btn.click();
  await page.close();
};

export const addRefImagesToChannel = async (filePaths: string[]) => {
  const { page } = await initPuppeteer(true);
  await goToBotChannel(page);
  await page.waitForSelector('div[data-slate-node="element"]');

  const fileInput = await page.$("input.file-input");

  if (!fileInput) {
    throw new Error("Could not find file input");
  }

  await fileInput.uploadFile(...filePaths);

  await page.waitForNetworkIdle();
  await wait(3000);

  await page.click('div[data-slate-node="element"]');
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");

  await page.waitForNetworkIdle();

  const parentSelector =
    '[data-list-item-id*="chat-messages"]:not([class*="mentioned"])';
  const elements = await page.$$(parentSelector);
  const lastElementHandle = elements[elements.length - 1];

  const imageUrls = await lastElementHandle.evaluate((e) =>
    Array.from(e.querySelectorAll('[data-role="img"]')).map((el) =>
      el.getAttribute("href")
    )
  );

  const images = await saveImagesFromUrls("ref images", imageUrls);

  await Promise.all(
    images.map(async (i) => {
      const savedImage = await upsertImage({
        id: randomUUID().toString(),
        url: i.url,
        path: i.path,
        height: i.height,
        width: i.width,
        created: new Date().getTime(),
        type: "REF",
      });

      return savedImage;
    })
  );

  await page.close();
};

export const recoverBrokenPrompt = async (
  prompt: Prompt,
  updater: (prompt: Prompt) => Promise<RxDocument<Prompt>>
) => {
  const { page } = await initPuppeteer(true);
  await goToBotChannel(page);

  await findMessage(page, prompt.elementId);
  await clickReactionAndCompleteJob(page, prompt, updater);
};

const goToBotChannel = async (page: Page) => {
  // hela den här metoden är medvetet skriven så att den är långsam

  await page.goto("https://discord.com/");
  await addLocalStorage(page);

  const botUrl = await getUrl("bot");

  if (botUrl) {
    await page.goto(botUrl);
    await wait(3000);
    return;
  }

  await page.goto("https://discord.com/channels/@me");
  await wait(3000);

  let element: ElementHandle<Element> | null = null;

  try {
    element = await page.waitForSelector(
      ":scope >>> ::-p-text(Midjourney Bot)",
      { timeout: 5000 }
    );
  } catch (error) {
    logger.error(
      "Error occurred while navigating to bot channel, the chat is probably not initialized yet"
    );

    process.parentPort.postMessage({
      type: "ERROR",
      data: "Could not find bot channel! Initialize a DM chat with the Midjourney bot first.",
    });

    return;
  }

  await element.click();
  await wait(3000);
  await page.waitForSelector('div[data-slate-node="element"]');
  await wait(3000);

  const currentUrl = page.url();
  await upsertUrl("bot", currentUrl);
};

export const checkAppVersion = async (version: string) => {
  const { page } = await initPuppeteer(true);

  await page.goto("https://github.com/sappalele/boaty-tools/releases");

  const versionFromPage = await page.evaluate(() => {
    return document.querySelectorAll(
      'a[href*="/sappalele/boaty-tools/releases/tag"]'
    )[0].textContent;
  });

  await page.close();

  return versionFromPage === version;
};

const addLocalStorage = async (page: Page) => {
  const entries = await getLocalStorage();

  await page.evaluate((e) => {
    e.forEach(({ key, value }) => {
      localStorage.setItem(key, value);
    });
  }, entries);
};

const bypassLocalStorageOverride = (page: Page) =>
  page.evaluateOnNewDocument(() => {
    // Preserve localStorage as separate var to keep it before any overrides
    const __ls = localStorage;

    // Restrict closure overrides to break global context reference to localStorage
    Object.defineProperty(window, "localStorage", {
      writable: false,
      configurable: false,
      value: __ls,
    });
  });

const initPuppeteer = async (headless: boolean) => {
  logger.log("initiliazing puppeteer " + headless ? "headless" : "headed");

  if (headless) {
    if (!headlessBrowser || !headlessBrowser.isConnected)
      headlessBrowser = await puppeteer.launch({
        executablePath: chromePaths.chrome,
        headless: "new",
      });

    const page = await headlessBrowser.newPage();
    await bypassLocalStorageOverride(page);
    await page.setViewport({ width: 1366, height: 768 });

    return { browser: headlessBrowser, page };
  }

  if (!headless) {
    if (!headedBrowser || !headedBrowser.isConnected)
      headedBrowser = await puppeteer.launch({
        executablePath: chromePaths.chrome,
        headless: false,
      });

    const page = await headedBrowser.newPage();
    await bypassLocalStorageOverride(page);
    await page.setViewport({ width: 1366, height: 768 });

    return { browser: headedBrowser, page };
  }
};

const extractIdFromUrl = (url: string): string | null => {
  const parts = url.split("_");
  const match = parts[parts.length - 1];
  logger.log("match", match);
  return match ? match.replace(".png", "").replace(".webp", "") : null;
};

const extractSeedFromMessage = (text: string): string | null => {
  const regex = /seed (\d+)/;
  const match = text.match(regex);
  logger.log(match);

  return match ? match[1] : null;
};

const findMessage = async (page: Page, elementId: string) => {
  let element = await page.$(elementId);
  if (element) {
    logger.log("found element", elementId);
    return element;
  }

  logger.log("could not find element, scrolling to top");

  await pollUntil(
    async () => {
      await page.evaluate(() => {
        const scroller = document.querySelector(
          '[class*="me"][class*="scrollerBase"][data-jump-section="global"]'
        );

        if (!scroller) throw new Error("Could not find scroller");

        scroller.scroll(0, 0);
      });

      await page.waitForNetworkIdle();

      element = await page.$(elementId);
      if (element) return true;

      return false;
    },
    1000,
    60000
  );

  if (!element)
    throw new Error("Could not find element after scrolling to top");

  return element;
};

const stripUrls = (text: string): string => {
  const pattern = new RegExp(/(https?:\/\/[^\s]+)/g);
  logger.log(pattern.exec(text));
  return text ? text.replace(pattern, "") : "";
};

const constructPrompt = (prompt: PopulatedPrompt) => {
  let res = prompt.prompt;

  if (prompt.options?.seed) {
    res += ` --seed ${prompt.options?.seed}`;
  }

  if (prompt.options?.tile) {
    res += ` --tile`;
  }

  if (prompt.options?.aspectRatio) {
    res += ` --ar ${prompt.options.aspectRatio}`;
  }

  if (prompt.options?.chaos) {
    res += ` --chaos ${prompt.options.chaos}`;
  }

  if (prompt.options?.no) {
    res += ` --no ${prompt.options.no}`;
  }

  if (prompt.options?.quality) {
    res += ` --quality ${prompt.options.quality}`;
  }

  if (prompt.options?.stylize) {
    res += ` --stylize ${prompt.options.stylize}`;
  }

  if (prompt.options?.stop) {
    res += ` --stop ${prompt.options.stop}`;
  }

  if (prompt.options?.version) {
    res += prompt.options.version.startsWith("niji")
      ? ` --${prompt.options.version}`
      : ` --v ${prompt.options.version}`;
  }

  if (prompt.options?.weird) {
    res += ` --weird ${prompt.options.weird}`;
  }

  if (prompt.refImages?.length) {
    res = `${prompt.refImages.map((i) => i.url).join(" ")} ${res}`;
  }

  logger.log("constructed prompt", res);

  return res;
};
