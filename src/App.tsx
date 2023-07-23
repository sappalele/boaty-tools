import { ChakraProvider, extendBaseTheme } from "@chakra-ui/react";
import "@fontsource/lilita-one";
import "@fontsource/quicksand";
import { createRoot } from "react-dom/client";
import Main from "./Main";
import "./index.scss";

const container = document.getElementById("root");
const root = createRoot(container);

const theme = extendBaseTheme({
  styles: {
    global: {
      "html, body, #root": {
        minHeight: "100%",
        minWidth: "100%",
        height: "100%",
        width: "100%",
        background: "linear-gradient(45deg, #2D465C,#213445)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 0,
      },
      "h1, h2, h3, h4, h5, h6": {
        fontFamily: "'Lilita One', sans-serif",
      },
      body: {
        fontFamily: "'Quicksand', sans-serif",
        fontWeight: 500,
        fontSize: "1.2rem",
      },
    },
  },
});

root.render(
  <ChakraProvider>
    <Main />
  </ChakraProvider>
);
