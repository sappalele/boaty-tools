import { Box } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { currentPromptAtom } from "../../../jotai";
import { StyledText } from "../common/CommonStyles";
import CustomSlider from "../common/CustomSlider";

const Chaos = () => {
  const [prompt, setPrompt] = useAtom(currentPromptAtom);

  return (
    <Box pos="relative" mt={4}>
      <StyledText mb={2}>Chaos</StyledText>
      <Box px={4}>
        <CustomSlider
          value={prompt.options.chaos}
          onChange={(val) =>
            setPrompt((p) => ({ ...p, options: { ...p.options, chaos: val } }))
          }
        />
      </Box>
    </Box>
  );
};

export default Chaos;
