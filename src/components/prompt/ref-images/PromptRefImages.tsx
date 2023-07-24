import { Box, Button, Checkbox } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { TbTrash } from "react-icons/tb";
import { sendIpcMessage } from "../../../backend-listener";
import { currentPromptAtom, imagesAtom } from "../../../jotai";
import AddRefImageButton from "./AddRefImageButton";

const Wrapper = styled(Box)`
  background: #21344563;
  backdrop-filter: blur(6px);
`;

const PromptRefImages = () => {
  const [prompt, setPrompt] = useAtom(currentPromptAtom);
  const [images] = useAtom(imagesAtom);

  useEffect(() => {
    if (prompt.showImages) {
      setPrompt((p) => ({ ...p, showOptions: false }));

      sendIpcMessage({ type: "GET_IMAGES" });
    }
  }, [prompt.showImages]);

  const arr = Array.from(images).sort((a, b) => {
    return b[1].created - a[1].created;
  });

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
              <Box
                p={8}
                display="flex"
                flexWrap="wrap"
                justifyContent="center"
                w="full"
                overflow="auto"
                maxH="100%"
              >
                {arr.map((i) => (
                  <Button
                    h="full"
                    w="full"
                    maxW="180px"
                    maxH="180px"
                    variant="unstyled"
                    key={i[0]}
                    style={
                      prompt.refImages?.find((r) => r.id === i[0])
                        ? {
                            filter: "brightness(1.2)",
                          }
                        : undefined
                    }
                    _hover={{ filter: "brightness(0.7)" }}
                    onClick={() => {
                      if (prompt.refImages?.find((r) => r.id === i[0])) {
                        setPrompt((p) => ({
                          ...p,
                          refImages: p.refImages.filter((r) => r.id !== i[0]),
                        }));
                      } else {
                        setPrompt((p) => ({
                          ...p,
                          refImages: [...p.refImages, i[1]],
                        }));
                      }
                    }}
                  >
                    <Box
                      transition={"all 0.5s"}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      w="full"
                      h="full"
                      pos="relative"
                    >
                      <Box pos="absolute" right={4} bottom={4}>
                        <Checkbox
                          pointerEvents="none"
                          size="lg"
                          colorScheme="blackAlpha"
                          bg="blackAlpha.800"
                          color="white"
                          isChecked={
                            !!prompt.refImages?.find((r) => r.id === i[0])
                          }
                        ></Checkbox>
                      </Box>
                      <Box
                        as="img"
                        src={i[1].url}
                        w="full"
                        h="full"
                        objectFit="contain"
                        maxW="180px"
                        maxH="180px"
                      />
                    </Box>
                  </Button>
                ))}
                <Box mt={16} pos="absolute" bottom={8}>
                  <AddRefImageButton />
                  <Button
                    leftIcon={<TbTrash />}
                    colorScheme="blackAlpha"
                    bg="blackAlpha.800"
                    onClick={() => setPrompt((p) => ({ ...p, refImages: [] }))}
                  >
                    Clear all
                  </Button>
                </Box>
              </Box>
            </Wrapper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default PromptRefImages;
