import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { isEqual } from "lodash";
import { Image, PopulatedPrompt, Project } from "./backend/utils/db";

export const defaultOptions = {
  aspectRatio: "1:1",
  chaos: 0,
  no: "",
  quality: 1,
  seed: undefined,
  stylize: 100,
  stop: 100,
  tile: false,
  version: undefined,
  weird: 0,
};

export const promptsAtom = atomWithStorage(
  "prompts",
  new Map<string, PopulatedPrompt>()
);
export const promptFilterAtom = atomWithStorage("promptFilter", {
  search: "",
  favorites: false,
  zoom: 1,
});
export const refImagesFilterAtom = atomWithStorage("refImagesFilter", {
  search: "",
  favorites: false,
  onlyAdded: false,
});
export const projectsAtom = atomWithStorage(
  "projects",
  new Map<string, Project>()
);
export const currentProjectAtom = atomWithStorage<Project>(
  "project",
  undefined
);
export const imagesAtom = atomWithStorage("images", new Map<string, Image>());
export const signInAtom = atomWithStorage("signin", {
  signedIn: false,
  loading: true,
});
export const versionAtom = atom({
  newAvailable: false,
});
export const currentPromptAtom = atom<{
  prompt: string;
  showOptions?: boolean;
  showImages?: boolean;
  refImages?: Image[];
  options?: {
    aspectRatio?: string;
    chaos?: number;
    no?: string;
    quality?: number;
    seed?: number;
    stylize?: number;
    stop?: number;
    tile?: boolean;
    version?: string;
    weird?: number;
  };
}>({
  prompt: "",
  options: defaultOptions,
  showOptions: false,
  refImages: [],
});

export const initialOptionsAtom = atom((get) =>
  isEqual(get(currentPromptAtom).options, defaultOptions)
);
