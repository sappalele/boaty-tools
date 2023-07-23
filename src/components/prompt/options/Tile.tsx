import { Box, Checkbox } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { currentPromptAtom } from "../../../jotai";
import { StyledText } from "../common/CommonStyles";

const Tile = () => {
  const [prompt, setPrompt] = useAtom(currentPromptAtom);

  return (
    <Box pos="relative" mt={4}>
      <StyledText mb={2}>Tile</StyledText>
      <Checkbox
        size="lg"
        colorScheme="blackAlpha"
        bg="blackAlpha.800"
        color="white"
        isChecked={prompt.options.tile}
        onChange={(e) =>
          setPrompt((p) => ({
            ...p,
            options: { ...p.options, tile: e.target.checked },
          }))
        }
      ></Checkbox>
    </Box>
  );
};

export default Tile;
