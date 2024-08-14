import createTheme from "@mui/material/styles/createTheme";
import { responsiveFontSizes } from "@mui/material";
import { itIT } from "@mui/material/locale";

// A custom theme for this app
const theme = responsiveFontSizes(
  createTheme(
    {
      palette: {
        black: { main: "#1a1a1a" },
        primary: { main: "#2596be" },
        background: {
          backgroundHighlightColor: "#f5f5f5",
          foregroundontainerColor: "#ffffff",
        },
        text: {
          main: "#333333",
          primary: "#1a1a1a",
          secondary: "#cccccc",
        },
      },
      typography: {
        color: "#333333",
      },
      components: {
        MuiDrawer: {
          styleOverrides: {
            paper: {
              boxShadow: "none",
              border: "none",
            },
          },
        },
      },

      shape: {
        borderRadius: 25,
      },
      shadows: {
        0: "none",
        1: "0px 1px 2px rgba(0, 0, 0, 0.03)",
      },
    },
    itIT
  )
);

export default theme;
