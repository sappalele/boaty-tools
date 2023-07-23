import { Box } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { currentPromptAtom } from "../../../jotai";
import { StyledText } from "../common/CommonStyles";
import CustomSlider from "../common/CustomSlider";

const Stop = () => {
  const [prompt, setPrompt] = useAtom(currentPromptAtom);

  return (
    <Box pos="relative" mt={4}>
      <StyledText mb={2}>Stop</StyledText>
      <Box px={4}>
        <CustomSlider
          max={100}
          min={10}
          step={10}
          value={prompt.options.stop}
          onChange={(val) =>
            setPrompt((p) => ({
              ...p,
              options: { ...p.options, stop: val },
            }))
          }
        />
      </Box>
    </Box>
  );
};

export default Stop;
