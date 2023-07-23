import { useToast } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { Image, PopulatedPrompt, Project } from "./backend/utils/db";
import { IpcMessage } from "./ipcHandler";
import { imagesAtom, projectsAtom, promptsAtom, signInAtom } from "./jotai";

export const sendIpcMessage = (message: IpcMessage) => {
  window.api.send("message", message);
};

export const initListener = () => {
  const [, setPrompts] = useAtom(promptsAtom);
  const [, setImages] = useAtom(imagesAtom);
  const [, setProjects] = useAtom(projectsAtom);
  const [signIn, setSignIn] = useAtom(signInAtom);
  const toast = useToast();

  const eventHandler = (e: IpcMessage) => {
    console.log(e);
    switch (e.type) {
      case "PROMPTS":
        return setPrompts(
          new Map<string, PopulatedPrompt>(e.data.map((p) => [p.id, p]))
        );
      case "IMAGES":
        return setImages(new Map<string, Image>(e.data.map((p) => [p.id, p])));
      case "PROJECTS":
        return setProjects(
          new Map<string, Project>(e.data.map((p) => [p.id, p]))
        );
      case "PROMPT_UPDATE":
        return setPrompts((p) => {
          p.set(e.data.id, e.data);
          return new Map(p);
        });
      case "PROMPT_DELETED":
        return setPrompts((p) => {
          p.delete(e.data.id);
          return new Map(p);
        });
      case "SIGNIN_STATUS":
        return setSignIn({ signedIn: e.data, loading: false });
      case "LOG":
        if (e.data.level === "ERROR") return console.error(e.data);
        if (e.data.level === "WARN") return console.warn(e.data);
        if (e.data.level === "INFO") return console.log(e.data);
        if (e.data.level === "DEBUG") return console.debug(e.data);

        return console.log(e.data);
      case "ERROR":
        return toast({
          title: "Error",
          description: e.data,
          status: "error",
          duration: 9000,
          isClosable: true,
          position: "top",
        });
    }
  };

  useEffect(() => {
    const removeListener = window.api.receive("message", (e: IpcMessage) =>
      eventHandler(e)
    );

    return () => {
      if (removeListener) removeListener();
    };
  }, []);

  useEffect(() => {
    if (!signIn.signedIn) sendIpcMessage({ type: "GET_SIGNIN_STATUS" });
    if (signIn.signedIn) {
      sendIpcMessage({ type: "GET_PROMPTS" });
      sendIpcMessage({ type: "GET_PROJECTS" });
    }
  }, [signIn.signedIn]);
};
