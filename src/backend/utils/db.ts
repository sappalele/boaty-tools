import fs from "fs/promises";
import lfsa from "lokijs/src/loki-fs-structured-adapter.js";
import path from "path";
import { RxDocument, addRxPlugin, createRxDatabase } from "rxdb";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { getRxStorageLoki } from "rxdb/plugins/storage-lokijs";
import { logger } from "./logger";
addRxPlugin(RxDBDevModePlugin);

export interface LocalStorageItem {
  key: string;
  value: string;
}

export type PromptStatus =
  | "WAITING"
  | "RUNNING"
  | "GETTING_SEED"
  | "COMPLETED"
  | "FAILED";

export type PromptType = "INITIAL" | "UPSCALED" | "VARIATION" | "PAN";
export type Project = {
  id: string;
  name: string;
  created: number;
};

export type PropmptOptions = {
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

export interface Prompt {
  id?: string;
  status?: PromptStatus;
  type?: PromptType;
  prompt?: string;
  created?: number;
  modified?: number;
  jobId?: string;
  elementId?: string;
  seed?: number;
  previewUrl?: string;
  upscaleIndex?: number;
  parentPrompt?: string;
  images?: string[];
  refImages?: string[];
  options?: PropmptOptions;
  favorite?: boolean;
  project?: string;
  tags?: string[];
}

export interface PopulatedPrompt
  extends Omit<Prompt, "images" | "parentPrompt" | "refImages"> {
  parentPrompt?: Prompt;
  images?: Image[];
  refImages?: Image[];
}

export interface Image {
  id: string;
  path: string;
  url: string;
  created: number;
  upscaled?: boolean;
  index?: number;
  width?: number;
  height?: number;
  favorite?: boolean;
  type?: "REF" | "PROMPT";
  parentPrompt?: string;
  project?: string;
}

let db: any = undefined;

export const collections = {
  localstorage: {
    schema: {
      title: "localstorage schema",
      version: 0,
      type: "object",
      primaryKey: "key",
      properties: {
        key: {
          type: "string",
          primary: true,
          maxLength: 3000,
        },
        value: {
          type: "string",
        },
      },
    },
  },
  image: {
    schema: {
      title: "image schema",
      version: 0,
      type: "object",
      primaryKey: "id",
      properties: {
        id: {
          type: "string",
          primary: true,
          maxLength: 3000,
        },
        path: {
          type: "string",
        },
        url: {
          type: "string",
        },
        index: {
          type: "number",
        },
        width: {
          type: "number",
        },
        height: {
          type: "number",
        },
        upscaled: {
          type: "boolean",
        },
        created: {
          type: "number",
        },
        favorite: {
          type: "boolean",
        },
        type: {
          type: "string",
        },
        parentPrompt: {
          type: "string",
        },
        project: {
          type: "string",
        },
      },
    },
  },
  prompt: {
    schema: {
      title: "prompts schema",
      version: 0,
      type: "object",
      primaryKey: "id",
      properties: {
        id: {
          type: "string",
          primary: true,
          maxLength: 36,
        },
        prompt: {
          type: "string",
        },
        type: {
          type: "string",
        },
        created: {
          type: "number",
        },
        modified: {
          type: "number",
        },
        jobId: {
          type: "string",
        },
        elementId: {
          type: "string",
        },
        previewUrl: {
          type: "string",
        },
        status: {
          type: "string",
        },
        seed: {
          type: "number",
        },
        upscaleIndex: {
          type: "number",
        },
        parentPrompt: {
          ref: "prompt",
          type: "string",
        },
        favorite: {
          type: "boolean",
        },
        project: {
          type: "string",
        },
        tags: {
          type: "array",
          items: {
            type: "string",
          },
        },
        refImages: {
          type: "array",
          ref: "image",
          items: {
            type: "string",
          },
        },
        options: {
          type: "object",
          properties: {
            aspectRatio: {
              type: "string",
            },
            chaos: {
              type: "number",
            },
            no: {
              type: "string",
            },
            quality: {
              type: "number",
            },
            seed: {
              type: "number",
            },
            stylize: {
              type: "number",
            },
            stop: {
              type: "number",
            },
            tile: {
              type: "boolean",
            },
            version: {
              type: "string",
            },
            weird: {
              type: "number",
            },
          },
        },
        images: {
          type: "array",
          ref: "image",
          items: {
            type: "string",
          },
        },
      },
    },
  },
  urls: {
    schema: {
      title: "urls schema",
      version: 0,
      type: "object",
      primaryKey: "key",
      properties: {
        key: {
          type: "string",
          primary: true,
          maxLength: 255,
        },
        value: {
          type: "string",
        },
      },
    },
  },
  project: {
    schema: {
      title: "project schema",
      version: 0,
      type: "object",
      primaryKey: "id",
      properties: {
        id: {
          type: "string",
          primary: true,
          maxLength: 36,
        },
        name: {
          type: "string",
        },
        description: {
          type: "string",
        },
        created: {
          type: "number",
        },
      },
    },
  },
};

export const initDB = async () => {
  logger.log("initializing db");

  if (db) {
    logger.log("db already initialized");
    return;
  }

  const dbName = process.argv.at(2)
    ? path.join(process.argv.at(2), "db")
    : "db";

  logger.log(process.argv);
  logger.log("db not initialized, using path:", process.argv[2]);

  // make db files exisit before initializing
  // this is needed for lokijs in combination with electron
  new Array(Object.keys(collections).length + 1)
    .fill("")
    .forEach(async (o, i) => {
      const dbFile = await fs.open(`${dbName}.db.${i}`, "a");
      await dbFile.close();
    });

  db = await createRxDatabase({
    name: dbName,
    storage: getRxStorageLoki({
      //adapter: new lfsa(app.getPath("userData"))
      adapter: new lfsa(),
    }),
  });

  await db.addCollections(collections);

  logger.log("db initialized");
};

export const addToLocalStorage = async (keyValuePairs: LocalStorageItem[]) => {
  const localStorage = db.collections.localstorage;

  await localStorage.bulkInsert(keyValuePairs);
};

export const getLocalStorage = async () => {
  const localStorage = db.collections.localstorage;

  const localStorageItems = await localStorage.find().exec();

  return localStorageItems as RxDocument<LocalStorageItem>[];
};

export const upsertUrl = async (key: string, value: string) => {
  const urls = db.collections.urls;

  await urls.upsert({ key, value });
};

export const getUrl = async (key: string) => {
  const urls = db.collections.urls;

  const url = await urls
    .findOne({
      selector: {
        key: {
          $eq: key,
        },
      },
    })
    .exec();

  return url?.value;
};

export const upsertPrompt = async (prompt: Prompt) => {
  const prompts = db.collections.prompt;

  const upserted = await prompts.upsert(prompt);
  return upserted as RxDocument<Prompt>;
};

export const getPrompt = async (id: string) => {
  const prompts = db.collections.prompt;

  const prompt = await prompts
    .findOne({
      selector: {
        id: {
          $eq: id,
        },
      },
    })
    .exec();

  return prompt as RxDocument<Prompt>;
};

export const deletePrompt = async (id: string) => {
  const prompts = db.collections.prompt;

  const prompt = await prompts.findOne({
    selector: {
      id: {
        $eq: id,
      },
    },
  });

  await prompt.remove();
};

export const getPromptByStatusPromptType = async (
  status: PromptStatus,
  promptString: string = undefined,
  type: PromptType = undefined
) => {
  const prompts = db.collections.prompt;
  const args = {
    selector: {
      status: {
        $eq: status,
      },
    },
  };

  if (type) {
    args.selector["type"] = {
      $eq: type,
    };
  }

  if (promptString) {
    args.selector["prompt"] = {
      $eq: promptString,
    };
  }

  const prompt = (await prompts.findOne(args).exec()) as RxDocument<Prompt>;

  return prompt;
};

export const getPromptsByStatus = async (status: PromptStatus) => {
  const prompts = db.collections.prompt;
  const args = {
    selector: {
      status: {
        $eq: status,
      },
    },
  };

  const res = (await prompts.find(args).exec()) as RxDocument<Prompt>[];

  return res;
};

export const getUpscaledPrompt = async (
  promptString: string,
  status: PromptStatus,
  upscaleIndex: number
) => {
  const prompts = db.collections.prompt;

  const prompt = await prompts
    .findOne({
      selector: {
        prompt: {
          $eq: promptString,
        },
        status: {
          $eq: status,
        },
        upscaleIndex: {
          $eq: upscaleIndex,
        },
        type: {
          $eq: "UPSCALED",
        },
      },
    })
    .exec();

  return prompt as RxDocument<Prompt>;
};

export const getAllPrompts = async () => {
  const prompts = db.collections.prompt;
  const allPrompts = (await prompts.find().exec()) as RxDocument<Prompt>[];

  return allPrompts.map((p) => p);
};

export const getAllImages = async () => {
  const images = db.collections.image;
  const allImages = (await images.find().exec()) as RxDocument<Image>[];

  return allImages.map((p) => p);
};

export const getNonCompletedPrompts = async (since: Date) => {
  const prompts = db.collections.prompt;

  const allPrompts = (await prompts
    .find({
      selector: {
        status: {
          $ne: "COMPLETED",
        },
        created: {
          $gte: since.getTime(),
        },
      },
    })
    .exec()) as RxDocument<Prompt>[];

  return allPrompts;
};

export const upsertImage = async (image: Image) => {
  const images = db.collections.image;

  return await images.upsert(image);
};

export const getImage = async (id: string) => {
  const images = db.collections.image;

  return await images.findOne({ selector: { id: { $eq: id } } }).exec();
};

export const populatePrompt = async (prompt: RxDocument<Prompt>) => {
  const refImages = await prompt.populate("refImages");
  const parentPrompt = await prompt.populate("parentPrompt");
  const images = await prompt.populate("images");

  const res = {
    ...prompt._data,
    refImages: refImages?.map((i) => i._data),
    parentPrompt: parentPrompt?._data,
    images: images?.map((i) => i._data),
  };

  return res as PopulatedPrompt;
};

export const getPromptByJobId = async (jobId: string) => {
  const prompts = db.collections.prompt;

  const prompt = await prompts
    .findOne({
      selector: {
        jobId: {
          $eq: jobId,
        },
      },
    })
    .exec();

  return prompt as RxDocument<Prompt>;
};

export const getAllProjects = async () => {
  const projects = db.collections.project;

  const allProjects = (await projects.find().exec()) as RxDocument<Project>[];

  return allProjects;
};

export const upsertProject = async (project: Project) => {
  const projects = db.collections.project;

  return await projects.upsert(project);
};
