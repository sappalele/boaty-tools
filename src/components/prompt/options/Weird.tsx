import { Box } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { currentPromptAtom } from "../../../jotai";
import { StyledText } from "../common/CommonStyles";
import CustomSlider from "../common/CustomSlider";

const Weird = () => {
  const [prompt, setPrompt] = useAtom(currentPromptAtom);

  return (
    <Box pos="relative" mt={4}>
      <StyledText mb={2}>Weird</StyledText>
      <Box px={4}>
        <CustomSlider
          value={prompt.options.weird}
          max={3000}
          onChange={(val) =>
            setPrompt((p) => ({ ...p, options: { ...p.options, weird: val } }))
          }
        />
      </Box>
    </Box>
  );
};

export default Weird;
