import { Box, Flex } from "@chakra-ui/react";
import GridSizeSelector from "../GridSizeSelector";
import ProjectSelector from "../ProjectSelector";
import PromptFilter from "../PromptFilter";
import PromptInput from "../prompt/PromptInput";
import Prompts from "../prompt/Prompts";
import Logo from "../prompt/common/Logo";
import PromptOptions from "../prompt/options/PromptOptions";
import PromptRefImages from "../prompt/ref-images/PromptRefImages";

const Dashboard = () => {
  return (
    <>
      <Box pos="fixed" px={8} py={6} top={0} left={0} right={0} zIndex={10}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Flex alignItems="center">
            <Box mr={8}>
              <Logo size="small" />
            </Box>
            <ProjectSelector />
          </Flex>
          <GridSizeSelector />
          <PromptFilter />
        </Box>
      </Box>

      <Box style={{ overflow: "auto", width: "100vw", height: "100vh" }}>
        <Prompts />
      </Box>
      <PromptRefImages />
      <PromptInput />
      <PromptOptions />
    </>
  );
};

export default Dashboard;
