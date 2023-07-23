import { Box, Button, Input } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { promptFilterAtom } from "../jotai";

const PromptFilter = () => {
  const [promptFilter, setPromptFilter] = useAtom(promptFilterAtom);

  return (
    <Box display="flex">
      <Input
        bg="blackAlpha.800"
        color="white"
        value={promptFilter.search}
        placeholder="Search"
        w="400px"
        onChange={(e) =>
          setPromptFilter((p) => ({
            ...p,
            search: e.target.value,
          }))
        }
      ></Input>
      <Button
        ml={4}
        colorScheme="blackAlpha"
        bg="blackAlpha.800"
        transition="all 0.5s"
        _hover={{ color: "#e53e3e" }}
        onClick={() =>
          setPromptFilter((p) => ({
            ...p,
            favorites: !p.favorites,
          }))
        }
      >
        {promptFilter.favorites ? (
          <AiFillHeart color="#e53e3e" />
        ) : (
          <AiOutlineHeart />
        )}
      </Button>
    </Box>
  );
};

export default PromptFilter;
