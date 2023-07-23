import {
  Box,
  Button,
  ButtonGroup,
  FocusLock,
  Input,
  Popover,
  PopoverArrow,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Tooltip,
  UseDisclosureReturn,
} from "@chakra-ui/react";
import React, { useState } from "react";
import {
  AiOutlineFileImage,
  AiOutlineQuestion,
  AiOutlineZoomOut,
} from "react-icons/ai";
import { ImMagicWand } from "react-icons/im";
import { TbCircleFilled, TbCircleHalf2 } from "react-icons/tb";
import {
  TiArrowDownThick,
  TiArrowLeftThick,
  TiArrowRightThick,
  TiArrowUpThick,
} from "react-icons/ti";
import { sendIpcMessage } from "../../backend-listener";
import { PopulatedPrompt } from "../../backend/utils/db";
import { StyledText } from "./common/CommonStyles";

interface DevelopPromptControlsProps {
  prompt: PopulatedPrompt;
  zoomDisclose: UseDisclosureReturn;
}

const DevelopPromptControls: React.FC<DevelopPromptControlsProps> = ({
  prompt,
  zoomDisclose,
}) => {
  const [customZoom, setCustomZoom] = useState("1.25");
  const { onOpen, onClose, isOpen } = zoomDisclose;
  const sendCustom = () => {
    sendIpcMessage({
      type: "DEVELOP_PROMPT",
      data: {
        id: prompt.id,
        action: "ZOOM_OUT_CUSTOM",
        customZoom: +customZoom,
      },
    });
    onClose();
  };

  if (prompt.type !== "UPSCALED") return null;

  return (
    <Box
      pos="absolute"
      top={0}
      left={0}
      zIndex={2}
      display="flex"
      flexDir="column"
    >
      <ButtonGroup isAttached>
        <Tooltip label="Zoom out 2X">
          <Button
            borderRadius={0}
            onClick={() => {
              sendIpcMessage({
                type: "DEVELOP_PROMPT",
                data: { id: prompt.id, action: "ZOOM_OUT_2X" },
              });
            }}
          >
            <Box mr={2}>
              <AiOutlineZoomOut />
            </Box>
            2x
          </Button>
        </Tooltip>
        <Tooltip label="Zoom out 1.5X">
          <Button
            borderRadius={0}
            onClick={() => {
              sendIpcMessage({
                type: "DEVELOP_PROMPT",
                data: { id: prompt.id, action: "ZOOM_OUT_1.5X" },
              });
            }}
          >
            <Box mr={2}>
              <AiOutlineZoomOut />
            </Box>
            1.5x
          </Button>
        </Tooltip>

        <Popover
          isOpen={isOpen}
          onOpen={onOpen}
          onClose={onClose}
          placement="bottom-start"
          closeOnBlur={false}
          colorScheme="blackAlpha"
        >
          <PopoverTrigger>
            <Tooltip label="Zoom out custom">
              <Button borderRadius={0}>
                <Box mr={2}>
                  <AiOutlineZoomOut />
                </Box>
                <AiOutlineQuestion />
              </Button>
            </Tooltip>
          </PopoverTrigger>
          <Portal>
            <PopoverContent p={8} bg="#21344563" backdropFilter="blur(6px)">
              <FocusLock persistentFocus={false}>
                <PopoverArrow bg="#21344563" backdropFilter="blur(6px)" />
                <PopoverCloseButton color="white" />
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendCustom();
                  }}
                >
                  <StyledText mb={2}>Zoom</StyledText>
                  <Input
                    mb={4}
                    bg="blackAlpha.800"
                    color="white"
                    value={customZoom}
                    onChange={(e) => setCustomZoom(e.target.value)}
                  ></Input>
                  <Button
                    w="full"
                    colorScheme="green"
                    type="submit"
                    isDisabled={!customZoom}
                  >
                    Send
                  </Button>
                </form>
              </FocusLock>
            </PopoverContent>
          </Portal>
        </Popover>
      </ButtonGroup>
      <ButtonGroup isAttached>
        <Tooltip label="Pan left">
          <Button
            borderRadius={0}
            onClick={() => {
              sendIpcMessage({
                type: "DEVELOP_PROMPT",
                data: { id: prompt.id, action: "PAN_LEFT" },
              });
            }}
          >
            <TiArrowLeftThick />
          </Button>
        </Tooltip>
        <Tooltip label="Pan right">
          <Button
            borderRadius={0}
            onClick={() => {
              sendIpcMessage({
                type: "DEVELOP_PROMPT",
                data: { id: prompt.id, action: "PAN_RIGHT" },
              });
            }}
          >
            <TiArrowRightThick />
          </Button>
        </Tooltip>
        <Tooltip label="Pan up">
          <Button
            borderRadius={0}
            onClick={() => {
              sendIpcMessage({
                type: "DEVELOP_PROMPT",
                data: { id: prompt.id, action: "PAN_UP" },
              });
            }}
          >
            <TiArrowUpThick />
          </Button>
        </Tooltip>
        <Tooltip label="Pan down">
          <Button
            borderRadius={0}
            onClick={() => {
              sendIpcMessage({
                type: "DEVELOP_PROMPT",
                data: { id: prompt.id, action: "PAN_DOWN" },
              });
            }}
          >
            <TiArrowDownThick />
          </Button>
        </Tooltip>
      </ButtonGroup>
      <ButtonGroup isAttached>
        <Tooltip label="Vary strong">
          <Button
            borderRadius={0}
            onClick={() => {
              sendIpcMessage({
                type: "DEVELOP_PROMPT",
                data: { id: prompt.id, action: "VARY_STRONG" },
              });
            }}
          >
            <Box mr={2}>
              <ImMagicWand />
            </Box>
            <TbCircleFilled />
          </Button>
        </Tooltip>
        <Tooltip label="Vary subtle">
          <Button
            borderRadius={0}
            onClick={() => {
              sendIpcMessage({
                type: "DEVELOP_PROMPT",
                data: { id: prompt.id, action: "VARY_SUBTLE" },
              });
            }}
          >
            <Box mr={2}>
              <ImMagicWand />
            </Box>
            <TbCircleHalf2 />
          </Button>
        </Tooltip>
      </ButtonGroup>
      {prompt.images?.at(0).path && (
        <ButtonGroup isAttached>
          <Tooltip label="Open">
            <Button
              borderRadius={0}
              onClick={() => {
                sendIpcMessage({
                  type: "OPEN_EXTERNAL_FILE",
                  data: prompt.images?.at(0).path,
                });
              }}
            >
              <AiOutlineFileImage />
            </Button>
          </Tooltip>
        </ButtonGroup>
      )}
    </Box>
  );
};

export default DevelopPromptControls;
