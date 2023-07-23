import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  Heading,
  Image,
  Text,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { TbBrandDiscordFilled } from "react-icons/tb";
import { sendIpcMessage } from "../../backend-listener";
import { signInAtom } from "../../jotai";
import GrowyBall from "../prompt/common/GrowyBall";

const StartDialog = () => {
  const [signIn] = useAtom(signInAtom);

  const signInToDiscord = () => {
    sendIpcMessage({ type: "SIGN_IN" });
  };

  if (signIn.loading) return <GrowyBall />;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ width: 0, height: 0, opacity: 0, scale: 0 }}
        animate={{ width: 600, height: 660, opacity: 1, scale: 1 }}
        exit={{ width: 0, height: 0, opacity: 0, scale: 0 }}
        transition={{ duration: 0.5 }}
        style={{ overflow: "hidden" }}
      >
        {/* TODO: add the svg asset instead */}
        <Center w="full" flexDir="column">
          <Image
            src="https://images2.imgbox.com/16/4c/QM7WW5l7_o.png"
            h={64}
            w="auto"
          />
          <Heading px={8} fontSize="5xl" mt={4}>
            Welcome!
          </Heading>
        </Center>
        <Box p={8}>
          To begin using <strong>boaty tools</strong>, you first need to sign in
          to discord. This tool will act as you on discord in order to post
          messages to the Midjourney bot.
        </Box>
        <Box mb={8} px={8}>
          <Alert status="warning">
            <AlertIcon />
            <Text>
              Use this tool at your own risk, usage of this tool may not be in
              compliance with Discord's/Midjourney Terms of Service.
            </Text>
          </Alert>
        </Box>
        <Box px={8} pb={8} w="full">
          <Button
            w="full"
            bg="#5865F2"
            _hover={{ bg: "#5865F2F0" }}
            color="white"
            size="lg"
            onClick={signInToDiscord}
            rightIcon={<TbBrandDiscordFilled size="1.5rem" />}
          >
            Sign in to discord
          </Button>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};

export default StartDialog;
