import { Box } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { sendIpcMessage } from "../../../backend-listener";
import { currentPromptAtom } from "../../../jotai";
import RefImagesControls from "./RefImagesControls";
import RefImagesList from "./RefImagesList";

const Wrapper = styled(Box)`
  background: #21344563;
  backdrop-filter: blur(6px);
`;

const PromptRefImages = () => {
  const [prompt, setPrompt] = useAtom(currentPromptAtom);

  useEffect(() => {
    if (prompt.showImages) {
      setPrompt((p) => ({ ...p, showOptions: false }));

      sendIpcMessage({ type: "GET_IMAGES" });
    }
  }, [prompt.showImages]);

  return (
    <Box
      pos="fixed"
      pointerEvents={prompt.showImages ? "all" : "none"}
      bottom={100}
      top={0}
      left={0}
      zIndex={11}
      w="1000px"
    >
      <AnimatePresence>
        {prompt.showImages && (
          <motion.div
            initial={{ x: -1000, width: "1000px", height: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: -1000 }}
            transition={{ duration: 0.5 }}
          >
            <Wrapper w="full" h="full" pos="relative">
              <Box w="full" maxH="100%" display="flex" justifyContent="center">
                <RefImagesList />
                <RefImagesControls />
              </Box>
            </Wrapper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default PromptRefImages;
