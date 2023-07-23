import { Box, Select } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { currentPromptAtom } from "../../../jotai";
import { StyledText } from "../common/CommonStyles";

const Quality = () => {
  const [prompt, setPrompt] = useAtom(currentPromptAtom);

  return (
    <Box pos="relative" mt={4}>
      <StyledText mb={2}>Quality</StyledText>
      <Select
        bg="blackAlpha.800"
        color="white"
        value={prompt.options.quality}
        onChange={(e) => {
          setPrompt((p) => ({
            ...p,
            options: { ...p.options, quality: +e.target.value },
          }));
        }}
      >
        <option value="1">1</option>
        <option value="0.5">0.5</option>
        <option value="0.25">0.25</option>
      </Select>
    </Box>
  );
};

export default Quality;
