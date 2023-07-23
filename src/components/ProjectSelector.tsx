import {
  Box,
  Button,
  FocusLock,
  Input,
  Popover,
  PopoverArrow,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Select,
  useDisclosure,
} from "@chakra-ui/react";
import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";
import { AiFillFolderAdd } from "react-icons/ai";
import { v4 as uuidv4 } from "uuid";
import { sendIpcMessage } from "../backend-listener";
import { currentProjectAtom, projectsAtom, promptsAtom } from "../jotai";
import { StyledText } from "./prompt/common/CommonStyles";

const ProjectSelector = () => {
  const [prompts] = useAtom(promptsAtom);
  const [newProject, setNewProject] = useState({
    name: "",
  });
  const projects = useAtomValue(projectsAtom);
  const [project, setProject] = useAtom(currentProjectAtom);
  const { onOpen, onClose, isOpen } = useDisclosure();
  const promptsArr = Array.from(prompts).map((p) => p[1]);

  const onSubmit = () => {
    if (!newProject.name.trim()) return;

    const proj = { ...newProject, id: uuidv4(), created: new Date().getTime() };

    sendIpcMessage({
      type: "ADD_PROJECT",
      data: proj,
    });

    setNewProject({
      name: "",
    });

    (setProject as any)(proj);

    onClose();
  };

  return (
    <Box display="flex">
      <Select
        w={200}
        bg="blackAlpha.800"
        color="white"
        value={project?.id}
        onChange={(e) => {
          if (!e.target.value) {
            (setProject as any)(undefined);
            return;
          }

          (setProject as any)(
            Array.from(projects).find((p) => p[0] === e.target.value)[1]
          );
        }}
      >
        <option value="">No project</option>
        {Array.from(projects).map(([id, project]) => (
          <option key={id} value={id}>
            {`${project.name} (${
              promptsArr.filter((p) => p.project === project.id).length
            })`}
          </option>
        ))}
      </Select>
      <Popover
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        placement="bottom-start"
        closeOnBlur={false}
        colorScheme="blackAlpha"
      >
        <PopoverTrigger>
          <Button
            leftIcon={<AiFillFolderAdd />}
            colorScheme="blackAlpha"
            bg="blackAlpha.800"
            color="white"
            ml={4}
          >
            New project
          </Button>
        </PopoverTrigger>
        <Portal>
          <PopoverContent p={8} bg="#21344563" backdropFilter="blur(6px)">
            <FocusLock persistentFocus={false}>
              <PopoverArrow bg="#21344563" backdropFilter="blur(6px)" />
              <PopoverCloseButton color="white" />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmit();
                }}
              >
                <StyledText mb={2}>Name</StyledText>
                <Input
                  mb={4}
                  bg="blackAlpha.800"
                  color="white"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject((p) => ({ ...p, name: e.target.value }))
                  }
                ></Input>
                <Button
                  w="full"
                  colorScheme="green"
                  type="submit"
                  isDisabled={!newProject.name.trim()}
                >
                  Create
                </Button>
              </form>
            </FocusLock>
          </PopoverContent>
        </Portal>
      </Popover>
    </Box>
  );
};

export default ProjectSelector;
