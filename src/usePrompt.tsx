import { useAtom, useAtomValue } from "jotai";
import { sendIpcMessage } from "./backend-listener";
import { PopulatedPrompt, PropmptOptions } from "./backend/utils/db";
import { currentProjectAtom, currentPromptAtom, defaultOptions } from "./jotai";

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
  const prompt = outerPrompt || innerPrompt;

  const sendPrompt = () => {
    const diff = getOptionsDifference(prompt.options);
    document.querySelector("#prompts-container")?.scrollTo(0, 0);

    sendIpcMessage({
      type: "PROMPT",
      data: {
        prompt: prompt.prompt,
        options: diff,
        refImages: prompt.refImages || [],
        project: project?.id,
      },
    });

    setPrompt((p) => ({ ...p, prompt: "" }));
  };

  return { prompt, setPrompt, sendPrompt };
};
