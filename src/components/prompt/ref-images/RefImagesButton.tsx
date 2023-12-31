import { Box, Button } from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { IoMdImages } from "react-icons/io";
import { LiaTimesSolid } from "react-icons/lia";
import { currentPromptAtom } from "../../../jotai";
import { MotionBox } from "../common/CommonStyles";

const RefImagesButton = () => {
  const [{ showImages, refImages }, setPrompt] = useAtom(currentPromptAtom);

  return (
    <Box pos="relative">
      <AnimatePresence>
        {refImages?.length > 0 && (
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
            color="white"
            display="flex"
            justifyContent="center"
            alignItems="center"
            fontSize="xs"
            zIndex={1}
          >
            {refImages.length}
          </MotionBox>
        )}
      </AnimatePresence>
      <Button
        colorScheme="blackAlpha"
        leftIcon={showImages ? <LiaTimesSolid /> : <IoMdImages />}
        onClick={() =>
          setPrompt((p) => ({
            ...p,
            showImages: !p.showImages,
          }))
        }
      >
        Images
      </Button>
    </Box>
  );
};

export default RefImagesButton;
