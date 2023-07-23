import { Box, Input, Select } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { useState } from "react";
import { currentPromptAtom } from "../../../jotai";
import { StyledText } from "../common/CommonStyles";

const AspectRatio = () => {
  const [showCustom, setShowCustom] = useState<boolean>(false);
  const [prompt, setPrompt] = useAtom(currentPromptAtom);

  return (
    <Box pos="relative" mt={4}>
      <StyledText mb={2}>Aspect ratio</StyledText>
      <Select
        bg="blackAlpha.800"
        color="white"
        value={prompt.options.aspectRatio}
        onChange={(e) => {
          if (e.target.value === "custom" && !showCustom) {
            setShowCustom(true);
          }
          if (e.target.value !== "custom" && showCustom) {
            setShowCustom(false);
          }

          setPrompt((p) => ({
            ...p,
            options: { ...p.options, aspectRatio: e.target.value },
          }));
        }}
      >
        <option value="1:1">1:1</option>
        <option value="4:3">4:3</option>
        <option value="16:9">16:9</option>
        <option value="3:2">3:2</option>
        <option value="5:4">5:4</option>
        <option value="21:9">21:9</option>
        <option value="custom">custom</option>
      </Select>
      {showCustom && (
        <Input
          bg="blackAlpha.800"
          value={prompt.options.aspectRatio}
          color="white"
          onChange={(e) =>
            setPrompt((p) => ({
              ...p,
              options: { ...p.options, aspectRatio: e.target.value },
            }))
          }
        ></Input>
      )}
    </Box>
  );
};

export default AspectRatio;
