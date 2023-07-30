import { logger } from "./logger";

export const wait = (milliseconds: number) =>
  new Promise((r) => setTimeout(r, milliseconds + Math.random() * 1000));

export const pollUntil = async (
  predicate: () => boolean | Promise<boolean>,
  pollInterval: number,
  timeout: number
) => {
  const startTime = Date.now();
  let res = false;

  while (Date.now() - startTime < timeout && !res) {
    res = await predicate();

    if (res) {
      return true;
    }

    await wait(pollInterval);
  }

  logger.error("Condition not met within the specified timeout.");
  return false;
};
