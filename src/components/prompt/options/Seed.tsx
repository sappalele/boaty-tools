import { Box, Input } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { currentPromptAtom } from "../../../jotai";
import { StyledText } from "../common/CommonStyles";

const Seed = () => {
  const [prompt, setPrompt] = useAtom(currentPromptAtom);

  return (
    <Box pos="relative" mt={4}>
      <StyledText mb={2}>Seed</StyledText>
      <Input
        bg="blackAlpha.800"
        color="white"
        value={prompt.options.seed}
        onChange={(e) =>
          setPrompt((p) => ({
            ...p,
            options: { ...p.options, seed: +e.target.value },
          }))
        }
      ></Input>
    </Box>
  );
};

export default Seed;
