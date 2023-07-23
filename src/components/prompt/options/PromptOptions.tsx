import { Box, Button } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { TbTrash } from "react-icons/tb";
import { currentPromptAtom, defaultOptions } from "../../../jotai";
import AspectRatio from "./AspectRatio";
import Chaos from "./Chaos";
import No from "./No";
import Quality from "./Quality";
import Seed from "./Seed";
import Stop from "./Stop";
import Stylize from "./Stylize";
import Tile from "./Tile";
import Version from "./Version";
import Weird from "./Weird";

const Wrapper = styled(Box)`
  background: #21344563;
  backdrop-filter: blur(6px);
`;

const PromptOptions = () => {
  const [prompt, setPrompt] = useAtom(currentPromptAtom);

  useEffect(() => {
    if (prompt.showOptions) {
      setPrompt((p) => ({ ...p, showImages: false }));
    }
  }, [prompt.showOptions]);

  return (
    <Box
      pos="fixed"
      pointerEvents={prompt.showOptions ? "all" : "none"}
      bottom={100}
      top={0}
      right={0}
      zIndex={11}
      w="500px"
    >
      <AnimatePresence>
        {prompt.showOptions && (
          <motion.div
            initial={{ x: 500, width: "500px", height: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: 500 }}
            transition={{ duration: 0.5 }}
          >
            <Wrapper w="full" h="full">
              <Box
                py={8}
                px={12}
                display="flex"
                justifyContent="center"
                flexDirection="column"
              >
                <Version />
                <AspectRatio />
                <Quality />
                <No />
                <Seed />
                <Stop />
                <Stylize />
                <Chaos />
                <Weird />
                <Tile />

                <Button
                  mt={16}
                  leftIcon={<TbTrash />}
                  colorScheme="blackAlpha"
                  onClick={() =>
                    setPrompt((p) => ({ ...p, options: defaultOptions }))
                  }
                >
                  Clear all
                </Button>
              </Box>
            </Wrapper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default PromptOptions;
