import {
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from "@chakra-ui/react";
import React from "react";

interface SliderProps {
  value: number;
  onChange: (val: number) => void;
  max?: number;
  min?: number;
  step?: number;
  thumbNode?: React.ReactNode;
}

const CustomSlider: React.FC<SliderProps> = ({
  value,
  onChange,
  min,
  max,
  step,
  thumbNode,
}) => {
  return (
    <>
      <Slider value={value} onChange={onChange} max={max} step={step} min={min}>
        <SliderTrack mt={2} h={2} bg="blackAlpha.600">
          <SliderFilledTrack bg="white" />
        </SliderTrack>
        <SliderThumb
          mt={2}
          bg="blackAlpha.800"
          h={6}
          w="auto"
          p={3}
          color="white"
        >
          {thumbNode || value}
        </SliderThumb>
      </Slider>
    </>
  );
};

export default CustomSlider;
