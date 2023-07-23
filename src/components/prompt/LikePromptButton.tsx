import { Box, Button } from "@chakra-ui/react";
import { FC } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { sendIpcMessage } from "../../backend-listener";
import { PopulatedPrompt } from "../../backend/utils/db";

const LikePromptButton: FC<{ prompt: PopulatedPrompt }> = ({ prompt }) => {
  const onClick = () => {
    sendIpcMessage({
      type: "UPDATE_PROMPT",
      data: {
        ...prompt,
        favorite: !prompt.favorite,
      },
    });
  };

  return (
    <>
      <Box pos="absolute" bottom={2} right={2} zIndex={2}>
        <Button
          variant="unstyled"
          p={0}
          transition="all 0.5s"
          _hover={{ color: "#e53e3e" }}
          onClick={onClick}
        >
          {prompt.favorite ? (
            <AiFillHeart size="2rem" color="#e53e3e" />
          ) : (
            <AiOutlineHeart size="2rem" />
          )}
        </Button>
      </Box>
    </>
  );
};

export default LikePromptButton;
