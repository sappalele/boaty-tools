import { Box, Center } from "@chakra-ui/react";
import { useAtom, useAtomValue } from "jotai";
import { currentProjectAtom, promptFilterAtom, promptsAtom } from "../../jotai";
import Prompt from "./Prompt";
import { MotionBox, MotionWrapItem, StyledText } from "./common/CommonStyles";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.5,
    },
  },
};

const item = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

const Prompts = () => {
  const [prompts] = useAtom(promptsAtom);
  const project = useAtomValue(currentProjectAtom);
  const filters = useAtomValue(promptFilterAtom);

  const arr = Array.from(prompts)
    .filter(
      (p) =>
        (!project || p[1].project === project?.id) &&
        (!filters.favorites || p[1].favorite) &&
        (!filters.search || p[1].prompt.includes(filters.search))
    )
    .sort((a, b) => {
      return b[1].modified - a[1].modified;
    });

  if (arr.length === 0)
    return (
      <Box
        w="full"
        h="full"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <StyledText>
          No prompts yet! Try imagnining something using the input below.
        </StyledText>
      </Box>
    );

  return (
    <Center w="full" id="prompts-container">
      <MotionBox
        display="flex"
        flexWrap="wrap"
        justifyContent="center"
        w="full"
        py={32}
        margin="auto"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {arr.map(([id, prompt]) => (
          <MotionWrapItem key={id} overflow="hidden" variant={item}>
            <Prompt prompt={prompt} />
          </MotionWrapItem>
        ))}
      </MotionBox>
    </Center>
  );
};

export default Prompts;
