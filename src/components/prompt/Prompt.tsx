import {
  Badge,
  Box,
  Spinner,
  Text,
  keyframes,
  useDisclosure,
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue } from "jotai";
import { FC, useRef } from "react";
import { GiChewedSkull } from "react-icons/gi";
import { RiSeedlingFill, RiZzzFill } from "react-icons/ri";
import { useHoverDirty } from "react-use";
import { PopulatedPrompt, Prompt } from "../../backend/utils/db";
import { promptFilterAtom } from "../../jotai";
import DevelopPromptControls from "./DevelopPromptControls";
import LikePromptButton from "./LikePromptButton";
import PromptControls from "./PromptControls";
import PromptImages from "./PromptImages";

const bgAnimations = keyframes`
0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
`;

const Wrapper = styled(Box)<{
  status: "WAITING" | "RUNNING" | "COMPLETED" | "FAILED";
}>`
  background: linear-gradient(50deg, #2d465cb0, #21344563);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  transition: all 0.5s;

  ${({ status }) =>
    status === "WAITING" &&
    css`
      background: linear-gradient(50deg, #626262b0, #ffffff63);
    `}
  ${({ status }) =>
    status === "RUNNING" &&
    css`
      transition: unset;
      background: linear-gradient(
        -45deg,
        #ee7752b0,
        #e73c7eb0,
        #23a6d563,
        #23d5ab63
      );
      background-size: 400% 400%;
      animation: ${bgAnimations} 15s ease infinite;
    `}
  ${({ status }) =>
    status === "FAILED" &&
    css`
      background: linear-gradient(50deg, #5c2d2db0, #45212163);
    `}
`;

const ToolTip: FC<{ prompt: PopulatedPrompt }> = ({ prompt }) => (
  <Box
    bg="blackAlpha.600"
    display="flex"
    justifyContent="center"
    alignItems="center"
    w="full"
    px={8}
    py={12}
    pos="relative"
  >
    {prompt.refImages?.length > 0 && (
      <Badge colorScheme="purple" mr={2}>
        {prompt.refImages.length === 1
          ? `1 image`
          : `${prompt.refImages.length} images`}
      </Badge>
    )}
    <Text color="white">{prompt.prompt}</Text>
  </Box>
);

const Prompt: FC<{ prompt: PopulatedPrompt }> = ({ prompt }) => {
  const ref = useRef<HTMLDivElement>(null);
  const hover = useHoverDirty(ref);
  const filters = useAtomValue(promptFilterAtom);
  const zoomDisclose = useDisclosure();

  return (
    <Wrapper
      {...({ status: prompt.status } as any)}
      w={filters.zoom === 2.5 ? "full" : `${400 * filters.zoom}px`}
      h={filters.zoom === 2.5 ? "auto" : `${400 * filters.zoom}px`}
      minW={filters.zoom === 2.5 ? "400px" : undefined}
      minH={filters.zoom === 2.5 ? "400px" : undefined}
      ref={ref}
      pos="relative"
    >
      {prompt.status !== "COMPLETED" && (
        <Box
          zIndex={2}
          pos="absolute"
          top={0}
          left={0}
          bg="blackAlpha.800"
          display="flex"
          justifyContent="center"
          alignItems="center"
          p={4}
        >
          {prompt.status === "WAITING" && <RiZzzFill color="white" />}
          {prompt.status === "FAILED" && <GiChewedSkull color="white" />}
          {prompt.status === "RUNNING" && <Spinner color="white" />}
          {prompt.status === "GETTING_SEED" && <RiSeedlingFill color="white" />}
        </Box>
      )}
      <>
        <PromptImages prompt={prompt} hover={hover} />
        <LikePromptButton prompt={prompt} />
        <AnimatePresence>
          {(hover || zoomDisclose.isOpen) && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <DevelopPromptControls
                  prompt={prompt}
                  zoomDisclose={zoomDisclose}
                />
                <PromptControls prompt={prompt} />
              </motion.div>
              <motion.div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                }}
                initial={{ opacity: 0, bottom: -200 }}
                animate={{ opacity: 1, bottom: 0 }}
                exit={{ opacity: 0, bottom: -200 }}
                transition={{ duration: 0.5 }}
              >
                <ToolTip prompt={prompt} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
      {!prompt.images?.length && (
        <Box
          h="full"
          display="flex"
          justifyContent="center"
          w="full"
          alignItems="center"
          p={4}
        >
          {prompt.refImages?.length > 0 && (
            <Badge colorScheme="purple" mr={2}>
              {prompt.refImages.length === 1
                ? `1 image`
                : `${prompt.refImages.length} images`}
            </Badge>
          )}
          <Text color="white">{prompt.prompt}</Text>
        </Box>
      )}
    </Wrapper>
  );
};

export default Prompt;
