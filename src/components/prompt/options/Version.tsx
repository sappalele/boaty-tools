import { Box, Select } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { currentPromptAtom } from "../../../jotai";
import { StyledText } from "../common/CommonStyles";

const Version = () => {
  const [prompt, setPrompt] = useAtom(currentPromptAtom);

  return (
    <Box pos="relative">
      <StyledText mb={2}>Version</StyledText>
      <Select
        bg="blackAlpha.800"
        color="white"
        value={prompt.options.version}
        onChange={(e) => {
          setPrompt((p) => ({
            ...p,
            options: { ...p.options, version: e.target.value },
          }));
        }}
      >
        <option value="">Latest</option>
        <option value="5.2 --style raw">5.2 Raw</option>
        <option value="5.2">5.2</option>
        <option value="5.1 --style raw">5.1 Raw</option>
        <option value="5.1">5.1</option>
        <option value="5">5</option>
        <option value="4">4</option>
        <option value="niji 5">Niji 5</option>
        <option value="niji 5 --style cute">Niji 5 Cute</option>
        <option value="niji 5 --style expressive">Niji 5 Expressive</option>
        <option value="niji 5 --style original">Niji 5 Original</option>
        <option value="niji 5 --style scenic">Niji 5 Scenic</option>
      </Select>
    </Box>
  );
};

export default Version;
