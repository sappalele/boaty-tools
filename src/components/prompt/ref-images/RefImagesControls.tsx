import { Box, Button, Checkbox, Input } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { TbTrash } from "react-icons/tb";
import { currentPromptAtom, refImagesFilterAtom } from "../../../jotai";
import AddRefImageButton from "./AddRefImageButton";

const RefImagesControls = () => {
  const [, setPrompt] = useAtom(currentPromptAtom);
  const [filter, setFilter] = useAtom(refImagesFilterAtom);

  return (
    <Box
      pos="absolute"
      p={8}
      bottom={0}
      left={0}
      right={0}
      bg="#21344563"
      backdropFilter="blur(6px)"
      display="flex"
      justifyContent="center"
    >
      <AddRefImageButton />
      <Button
        mr={4}
        leftIcon={<TbTrash />}
        colorScheme="blackAlpha"
        bg="blackAlpha.800"
        onClick={() => setPrompt((p) => ({ ...p, refImages: [] }))}
      >
        Clear all
      </Button>
      <Input
        mr={4}
        bg="blackAlpha.800"
        color="white"
        value={filter.search}
        placeholder="Search"
        w="400px"
        onChange={(e) =>
          setFilter((p) => ({
            ...p,
            search: e.target.value,
          }))
        }
      ></Input>
      <Button
        mr={4}
        colorScheme="blackAlpha"
        bg="blackAlpha.800"
        transition="all 0.5s"
        _hover={{ color: "#e53e3e" }}
        onClick={() =>
          setFilter((p) => ({
            ...p,
            favorites: !p.favorites,
          }))
        }
      >
        {filter.favorites ? (
          <AiFillHeart color="#e53e3e" />
        ) : (
          <AiOutlineHeart />
        )}
      </Button>
      <Checkbox
        px={4}
        fontSize="md"
        borderRadius={4}
        colorScheme="blackAlpha"
        bg="blackAlpha.800"
        color="white"
        isChecked={filter.onlyAdded}
        onChange={(e) =>
          setFilter((p) => ({
            ...p,
            onlyAdded: e.target.checked,
          }))
        }
      >
        Uploaded
      </Checkbox>
    </Box>
  );
};

export default RefImagesControls;
