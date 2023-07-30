import { Box, Button, ButtonGroup, Image, Tooltip } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue } from "jotai";
import React from "react";
import { AiOutlineFileImage } from "react-icons/ai";
import { ImMagicWand } from "react-icons/im";
import { MdPhotoSizeSelectLarge } from "react-icons/md";
import { sendIpcMessage } from "../../backend-listener";
import { PopulatedPrompt } from "../../backend/utils/db";
import { promptFilterAtom } from "../../jotai";

interface PromptImagesProps {
  prompt: PopulatedPrompt;
  hover?: boolean;
}

const PromptImages: React.FC<PromptImagesProps> = ({ prompt, hover }) => {
  const filters = useAtomValue(promptFilterAtom);

  if (!prompt.images || prompt.images.length === 0) return null;

  return (
    <Box
      overflow="hidden"
      display="flex"
      flexWrap="wrap"
      w={filters.zoom === 2.5 ? "full" : `${400 * filters.zoom}px`}
      h={filters.zoom === 2.5 ? "auto" : `${400 * filters.zoom}px`}
    >
      {prompt.images?.map((image, i) => (
        <Box
          key={image.url}
          pos="relative"
          w={prompt.images?.length === 4 ? "50%" : "100%"}
          h={prompt.images?.length === 4 ? "50%" : "100%"}
        >
          <Image
            src={image.url || image.path}
            alt="image"
            w={image.height > image.width ? "full" : "auto"}
            h={image.width > image.height ? "full" : "auto"}
            objectFit="contain"
            maxW="100%"
            maxH="100%"
          />
          <AnimatePresence>
            {hover && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {prompt.status === "COMPLETED" && (
                  <>
                    <ButtonGroup
                      isAttached
                      pos="absolute"
                      w="full"
                      top={0}
                      right={0}
                      zIndex={1}
                    >
                      {(prompt.type === "INITIAL" ||
                        prompt.type === "VARIATION" ||
                        prompt.type === "PAN") && (
                        <>
                          <Tooltip label="Upscale">
                            <Button
                              borderRadius={0}
                              isDisabled={image.upscaled}
                              bg={image.upscaled ? "green.100" : undefined}
                              _disabled={{ opacity: 1, cursor: "not-allowed" }}
                              onClick={() => {
                                sendIpcMessage({
                                  type: "UPSCALE_PROMPT",
                                  data: { id: prompt.id, index: i },
                                });
                              }}
                            >
                              <MdPhotoSizeSelectLarge />
                            </Button>
                          </Tooltip>
                          <Tooltip label="Vary">
                            <Button
                              borderRadius={0}
                              onClick={() => {
                                sendIpcMessage({
                                  type: "VARIATE_PROMPT",
                                  data: { id: prompt.id, index: i },
                                });
                              }}
                            >
                              <ImMagicWand />
                            </Button>
                          </Tooltip>
                          {image.path && (
                            <Tooltip label="Open">
                              <Button
                                borderRadius={0}
                                onClick={() => {
                                  sendIpcMessage({
                                    type: "OPEN_EXTERNAL_FILE",
                                    data: image.path,
                                  });
                                }}
                              >
                                <AiOutlineFileImage />
                              </Button>
                            </Tooltip>
                          )}
                        </>
                      )}
                    </ButtonGroup>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      ))}
    </Box>
  );
};

export default PromptImages;
