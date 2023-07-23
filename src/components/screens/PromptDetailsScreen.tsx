import { Box, Button, Image, SimpleGrid } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { DateTime } from "luxon";
import { AiOutlineClockCircle } from "react-icons/ai";
import { HiMiniWrench } from "react-icons/hi2";
import { IoMdImages } from "react-icons/io";
import { RiSeedlingFill } from "react-icons/ri";
import { useNavigate, useParams } from "react-router-dom";
import { promptsAtom } from "../../jotai";
import { StyledText } from "../prompt/common/CommonStyles";

const DetailsControls = () => {
  const nav = useNavigate();
  return (
    <Box
      pos="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={11}
      bg="linear-gradient(50deg, #2d465cb0, #21344563)"
      backdropBlur="6px"
    >
      <Box px={8}>
        <Button
          my={8}
          colorScheme="whiteAlpha"
          leftIcon={<IoMdImages color="white" />}
          onClick={() => nav("/home")}
        >
          Back to gallery
        </Button>
      </Box>
    </Box>
  );
};

const PromptDetailsScreen = () => {
  const [prompts] = useAtom(promptsAtom);
  const params = useParams<{ promptId: string }>();
  const prompt = prompts.get(params.promptId);

  if (!prompt) return <>Prompt not found!</>;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{
            opacity: 0,
            width: "100vw",
            height: "100vh",
            overflow: "auto",
          }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box w="full" bg="blackAlpha.600">
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              w="full"
              flexDir="column"
              px={8}
              py={12}
            >
              <StyledText>{prompt.prompt}</StyledText>
              <SimpleGrid mt={8} color="white" columns={2} spacing={6}>
                <Box display="flex" alignItems="center">
                  <Box mr={4}>
                    <AiOutlineClockCircle />
                  </Box>
                  Created
                </Box>
                <Box>
                  {DateTime.fromMillis(prompt.created).toLocaleString(
                    DateTime.DATETIME_SHORT
                  )}
                </Box>
                <Box display="flex" alignItems="center">
                  <Box mr={4}>
                    <AiOutlineClockCircle />
                  </Box>
                  Modified
                </Box>
                <Box>
                  {DateTime.fromMillis(prompt.modified).toLocaleString(
                    DateTime.DATETIME_SHORT
                  )}
                </Box>
                <Box display="flex" alignItems="center">
                  <Box mr={4}>
                    <HiMiniWrench />
                  </Box>
                  Job id
                </Box>
                <Box>{prompt.jobId}</Box>
                <Box display="flex" alignItems="center">
                  <Box mr={4}>
                    <RiSeedlingFill />
                  </Box>
                  Seed
                </Box>
                <Box>{prompt.seed}</Box>
                <Box display="flex" alignItems="center">
                  Status
                </Box>
                <Box>{prompt.status}</Box>
              </SimpleGrid>
            </Box>
            <Box
              display="flex"
              flexWrap="wrap"
              justifyContent="center"
              w="full"
              pb={32}
            >
              {prompt.images?.map((image) => (
                <Box key={image.url || image.path} w="50%">
                  <Image src={image.url || image.path} alt="image" />
                </Box>
              ))}
            </Box>
          </Box>
        </motion.div>
      </AnimatePresence>
      <DetailsControls />
    </>
  );
};

export default PromptDetailsScreen;
