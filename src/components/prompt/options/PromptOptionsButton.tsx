import { Box, Button } from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";
import { useAtom, useAtomValue } from "jotai";
import { IoOptions } from "react-icons/io5";
import { LiaTimesSolid } from "react-icons/lia";
import { currentPromptAtom, initialOptionsAtom } from "../../../jotai";
import { MotionBox } from "../common/CommonStyles";

const PromptOptionsButton = () => {
  const [{ showOptions }, setPrompt] = useAtom(currentPromptAtom);
  const initialOptions = useAtomValue(initialOptionsAtom);

  return (
    <Box pos="relative">
      <AnimatePresence>
        {!initialOptions && (
          <MotionBox
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            pos="absolute"
            top="-7px"
            right="-7px"
            bg="red.500"
            borderRadius="50%"
            w="15px"
            h="15px"
            zIndex={1}
          />
        )}
      </AnimatePresence>
      <Button
        colorScheme="blackAlpha"
        leftIcon={showOptions ? <LiaTimesSolid /> : <IoOptions />}
        onClick={() =>
          setPrompt((p) => ({
            ...p,
            showOptions: !p.showOptions,
          }))
        }
      >
        Options
      </Button>
    </Box>
  );
};

export default PromptOptionsButton;
