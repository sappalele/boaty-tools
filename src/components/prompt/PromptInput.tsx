import { Box, Button, Text } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue } from "jotai";
import { ImGithub, ImMagicWand } from "react-icons/im";
import { sendIpcMessage } from "../../backend-listener";
import { versionAtom } from "../../jotai";
import { usePrompt } from "../../usePrompt";
import PromptOptionsButton from "./options/PromptOptionsButton";
import RefImagesButton from "./ref-images/RefImagesButton";

const Wrapper = styled(Box)`
  background: #21344563;
  backdrop-filter: blur(6px);
`;

const PromptInput = () => {
  const { sendPrompt, prompt, setPrompt } = usePrompt();
  const { newAvailable } = useAtomValue(versionAtom);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!prompt.prompt && prompt.refImages?.length < 2) return;

        sendPrompt();
      }}
    >
      <Wrapper pos="fixed" bottom={0} left={0} right={0} zIndex={11}>
        <Box
          display="flex"
          justifyContent="space-around"
          alignItems="center"
          pos="relative"
        >
          {newAvailable && (
            <Box
              pos="absolute"
              right={4}
              top="-40px"
              display="flex"
              alignItems="center"
            >
              <Button
                w="full"
                colorScheme="green"
                borderBottomEndRadius={0}
                borderBottomStartRadius={0}
                onClick={() =>
                  sendIpcMessage({
                    type: "OPEN_EXTERNAL_URL",
                    data: "https://github.com/sappalele/boaty-tools/releases",
                  })
                }
              >
                <Text mr={4}> New version available</Text> <ImGithub />
              </Button>
            </Box>
          )}
          <RefImagesButton />
          <Box pos="relative">
            <Box
              px={8}
              transition="all 0.5s"
              pr={prompt.prompt || prompt.refImages?.length > 1 ? "122px" : 8}
              resize="none"
              w="800px"
              h="100px"
              bgColor="blackAlpha.800"
              as="input"
              display="flex"
              justifyContent="center"
              alignItems="center"
              color="white"
              textAlign="center"
              placeholder="Imagine something! Enter your prompt here 🤖"
              onChange={(e: React.ChangeEvent<any>) =>
                setPrompt((p) => ({ ...p, prompt: e.target.value }))
              }
              value={prompt.prompt}
              _placeholder={{ color: "white" }}
              _focusVisible={{ outline: "none" }}
            />
            <AnimatePresence>
              {(prompt.prompt || prompt.refImages?.length > 1) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Button
                    borderRadius={0}
                    pos="absolute"
                    right={0}
                    top={0}
                    p={0}
                    zIndex={4}
                    h="100px"
                    w="100px"
                    colorScheme="green"
                    onClick={sendPrompt}
                  >
                    <ImMagicWand size="2rem" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
          <PromptOptionsButton />
        </Box>
      </Wrapper>
    </form>
  );
};

export default PromptInput;
