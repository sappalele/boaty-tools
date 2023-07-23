import { Image } from "@chakra-ui/react";
import { FC } from "react";
import { sendIpcMessage } from "../backend-listener";

const Logo: FC<{ size?: "small" | "big" }> = ({ size = "big" }) => {
  return (
    <Image
      src="https://images2.imgbox.com/16/4c/QM7WW5l7_o.png"
      h={size === "big" ? 64 : 16}
      w="auto"
      cursor="pointer"
      onClick={() => {
        sendIpcMessage({
          type: "OPEN_EXTERNAL_URL",
          data: "https://github.com/sappalele/boaty-tools",
        });
      }}
    />
  );
};

export default Logo;
