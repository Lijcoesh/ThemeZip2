import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ThemeProvider } from "@mui/material/styles";
import App from "./App";
import { globalStyles } from "./theme/globalStyles";
import { muiTheme } from "./theme/muiTheme";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <GlobalStyles styles={globalStyles} />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
