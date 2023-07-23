import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { FC } from "react";
import { LuCopy } from "react-icons/lu";
import { MdLoop } from "react-icons/md";
import { PiDotsThreeOutlineFill } from "react-icons/pi";
import { RiSeedlingFill } from "react-icons/ri";
import { TbExternalLink, TbListDetails, TbTrash } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { sendIpcMessage } from "../../backend-listener";
import { PopulatedPrompt } from "../../backend/utils/db";
import { defaultOptions } from "../../jotai";
import { usePrompt } from "../../usePrompt";

const PromptControls: FC<{ prompt: PopulatedPrompt }> = ({ prompt }) => {
  const nav = useNavigate();
  const { setPrompt, sendPrompt } = usePrompt(prompt);

  return (
    <Box pos="absolute" top={0} right={0} zIndex={2}>
      <Menu>
        <MenuButton borderRadius={0} as={Button}>
          <PiDotsThreeOutlineFill />
        </MenuButton>
        <MenuList>
          {prompt.jobId && (
            <MenuItem
              icon={<TbExternalLink />}
              onClick={() => {
                sendIpcMessage({
                  type: "OPEN_EXTERNAL_URL",
                  data: `https://midjourney.com/app/jobs/${prompt.jobId}`,
                });
              }}
            >
              Web
            </MenuItem>
          )}
          <MenuItem
            icon={<TbListDetails />}
            onClick={() => {
              nav("/home/details/" + prompt.id);
            }}
          >
            Details
          </MenuItem>
          <MenuItem icon={<MdLoop />} onClick={sendPrompt}>
            Re-run
          </MenuItem>
          <MenuItem
            icon={<LuCopy />}
            onClick={() => {
              setPrompt({
                prompt: prompt.prompt,
                options: { ...defaultOptions, ...prompt.options },
                refImages: prompt.refImages || [],
              });
            }}
          >
            Copy
          </MenuItem>
          {prompt.seed && (
            <MenuItem
              icon={<RiSeedlingFill />}
              onClick={() => {
                setPrompt((p) => ({
                  ...p,
                  options: { ...p.options, seed: prompt.seed },
                }));
              }}
            >
              Use seed
            </MenuItem>
          )}
          <MenuItem
            color="red.500"
            icon={<TbTrash />}
            onClick={() => {
              sendIpcMessage({
                type: "DELETE_PROMPT",
                data: { id: prompt.id },
              });
            }}
          >
            Delete
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
};

export default PromptControls;
