import { Box } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { currentPromptAtom } from "../../../jotai";
import { StyledText } from "../common/CommonStyles";
import CustomSlider from "../common/CustomSlider";

const Stylize = () => {
  const [prompt, setPrompt] = useAtom(currentPromptAtom);

  return (
    <Box pos="relative" mt={4}>
      <StyledText mb={2}>Stylize</StyledText>
      <Box px={4}>
        <CustomSlider
          max={1000}
          value={prompt.options.stylize}
          onChange={(val) =>
            setPrompt((p) => ({
              ...p,
              options: { ...p.options, stylize: val },
            }))
          }
        />
      </Box>
    </Box>
  );
};

export default Stylize;
