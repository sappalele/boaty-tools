/* eslint-disable import/no-named-as-default */
import { Box, Input, Text, WrapItem } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { motion } from "framer-motion";

export const FloatingDialog = styled(Box)`
  background: linear-gradient(180deg, #fff, #f3f3f3);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  border-radius: 50px;
  transition: all 1s ease-in-out;
  max-width: 60000px;
  max-height: 60000px;
`;

export const FloatingInput = styled(Input)`
  background: linear-gradient(180deg, #2d465c, #213445) !important;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  border-radius: 50px !important;
  transition: all 1s ease-in-out;
  box-sizing: border-box;
  width: 100% !important;
  color: #fff;
  text-align: center;
  border-color: #ffffff22 !important;

  &:placeholder {
    color: #fff;
  }
`;

export const StyledText = styled(Text)`
  font-weight: 400;
  color: #fff;
  filter: drop-shadow(1px 1px 3px black);
`;

export const MotionBox = motion(Box);
export const MotionWrapItem = motion(WrapItem);
