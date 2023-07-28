import { Box } from "@chakra-ui/react";
import { useAtom, useAtomValue } from "jotai";
import { useWindowSize } from "react-use";
import {
  currentPromptAtom,
  imagesAtom,
  refImagesFilterAtom,
} from "../../../jotai";

const RefImagesList = () => {
  const [images] = useAtom(imagesAtom);
  const [prompt, setPrompt] = useAtom(currentPromptAtom);
  const windowSize = useWindowSize();
  const filter = useAtomValue(refImagesFilterAtom);

  const arr = Array.from(images)
    .filter(
      (i) =>
        !(i[1].url.endsWith("webp") && i[1].type !== "REF") &&
        (!filter.search || i[1].path.includes(filter.search)) &&
        (!filter.favorites || i[1].favorite) &&
        (!filter.onlyAdded || i[1].type === "REF")
    )
    .sort((a, b) => {
      return b[1].created - a[1].created;
    });

  return (
    <Box mb="100px">
      {/* <List
        width={1000}
        height={windowSize.height - 100}
        rowHeight={200}
        rowCount={Math.ceil(arr.length / 5)}
        overscanRowCount={3}
        style={{ paddingBottom: "110px" }}
        rowRenderer={({ index, key, style }) => (
          <Box
            key={key}
            overflow="hidden"
            display="flex"
            justifyContent="center"
            style={style}
          >
            {arr.slice(index * 5, (index + 1) * 5).map(([id, image]) => (
              <Button
                h="full"
                w="full"
                maxW="200px"
                maxH="200px"
                variant="unstyled"
                key={id}
                style={
                  prompt.refImages?.find((r) => r.id === id)
                    ? {
                        filter: "brightness(1.2)",
                      }
                    : undefined
                }
                _hover={{ filter: "brightness(0.7)" }}
                onClick={() => {
                  if (prompt.refImages?.find((r) => r.id === id)) {
                    setPrompt((p) => ({
                      ...p,
                      refImages: p.refImages.filter((r) => r.id !== id),
                    }));
                  } else {
                    setPrompt((p) => ({
                      ...p,
                      refImages: [...p.refImages, image],
                    }));
                  }
                }}
              >
                <Box
                  transition={"all 0.5s"}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  w="full"
                  h="full"
                  pos="relative"
                >
                  <Box pos="absolute" right={4} bottom={4}>
                    <Checkbox
                      pointerEvents="none"
                      size="lg"
                      colorScheme="blackAlpha"
                      bg="blackAlpha.800"
                      color="white"
                      isChecked={!!prompt.refImages?.find((r) => r.id === id)}
                    ></Checkbox>
                  </Box>
                  <Box
                    as="img"
                    src={image.url}
                    w="full"
                    h="full"
                    objectFit="contain"
                    maxW="200px"
                    maxH="200px"
                  />
                </Box>
              </Button>
            ))}
          </Box>
        )}
      /> */}
    </Box>
  );
};

export default RefImagesList;
