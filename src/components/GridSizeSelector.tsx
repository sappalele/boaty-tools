import { Box } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { AiOutlineZoomIn } from "react-icons/ai";
import { promptFilterAtom } from "../jotai";
import CustomSlider from "./prompt/common/CustomSlider";

const GridSizeSelector = () => {
  const [promptFilter, setPromptFilter] = useAtom(promptFilterAtom);

  return (
    <Box w="400px" display="flex" mt={-4}>
      <CustomSlider
        value={promptFilter.zoom}
        max={2.5}
        min={0.7}
        step={0.1}
        thumbNode={<AiOutlineZoomIn />}
        onChange={(val) => setPromptFilter((p) => ({ ...p, zoom: val }))}
      />
    </Box>
  );
};

export default GridSizeSelector;
