import { useAtom, useAtomValue } from "jotai";
import { sendIpcMessage } from "./backend-listener";
import { PopulatedPrompt, PropmptOptions } from "./backend/utils/db";
import {
  PromptState,
  currentProjectAtom,
  currentPromptAtom,
  defaultOptions,
} from "./jotai";

function getOptionsDifference(obj1: PropmptOptions): Partial<PropmptOptions> {
  const difference: Partial<PropmptOptions> = {};

  if (!obj1) return difference;

  for (const key of Object.keys(defaultOptions)) {
    if (obj1[key] && obj1[key] !== defaultOptions[key]) {
      difference[key] = obj1[key];
    }
  }

  return difference;
}

export const usePrompt = (outerPrompt?: PopulatedPrompt) => {
  const [innerPrompt, setPrompt] = useAtom(currentPromptAtom);
  const project = useAtomValue(currentProjectAtom);
  const prompt = (outerPrompt || innerPrompt) as PromptState;

  const sendPrompt = () => {
    const diff = getOptionsDifference(prompt.options);
    document.querySelector("#prompts-container")?.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    if (prompt.batchMode)
      sendIpcMessage({
        type: "BATCH_PROMPT",
        //split on newline
        data: prompt.prompt.split(/\r?\n/).map((p) => ({
          prompt: p.trim().replace(/(\r\n|\n|\r)/gm, ""),
          options: diff,
          refImages: prompt.refImages || [],
          project: project?.id,
        })),
      });
    else
      sendIpcMessage({
        type: "PROMPT",
        data: {
          // trim newlines
          prompt: prompt.prompt.trim().replace(/(\r\n|\n|\r)/gm, ""),
          options: diff,
          refImages: prompt.refImages || [],
          project: project?.id,
        },
      });

    setPrompt((p) => ({ ...p, prompt: "" }));
  };

  return { prompt: prompt as PromptState, setPrompt, sendPrompt };
};
