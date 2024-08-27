import React from "react";
import ReactDOM from "react-dom/client";
import { router } from "./App.jsx";
import { RouterProvider } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import "./index.css";
import theme from "./theme";
import { SnackbarProvider } from "notistack";
import { StoreProvider } from "easy-peasy";
import { store } from "./store/index.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StoreProvider store={store}>
        <SnackbarProvider>
          <RouterProvider router={router} />
        </SnackbarProvider>
      </StoreProvider>
    </ThemeProvider>
  </React.StrictMode>
);
