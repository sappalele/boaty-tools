import { Box, Input } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { currentPromptAtom } from "../../../jotai";
import { StyledText } from "../common/CommonStyles";

const No = () => {
  const [prompt, setPrompt] = useAtom(currentPromptAtom);

  return (
    <Box pos="relative" mt={4}>
      <StyledText mb={2}>No (comma separated)</StyledText>
      <Input
        bg="blackAlpha.800"
        color="white"
        value={prompt.options.no}
        onChange={(e) =>
          setPrompt((p) => ({
            ...p,
            options: { ...p.options, no: e.target.value },
          }))
        }
      ></Input>
    </Box>
  );
};

export default No;
