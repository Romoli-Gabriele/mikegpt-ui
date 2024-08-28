import * as React from "react";
import { Stack, Typography, Grid, Paper } from "@mui/material";
import mike_logo from "../assets/mike_logo.png";
import { useAuth } from "../hooks/useAuth";
import styled from "@emotion/styled";
import ElectricBolt from "@mui/icons-material/Bolt";
import TOOLS from "../services/TOOLS.json";
import { NoMarginTypography } from "./utils";
import { useMediaQuery, useTheme } from "@mui/material";

const SuggestionCard = styled(Paper)(({ theme }) => ({
  padding: "1rem",
  width: "100%",
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  height: "100%",
  minHeight: "8rem",
  marginBottom: "2rem",
  "&:hover": {
    cursor: "pointer",
    boxShadow: theme.shadows[3],
    backgroundColor: theme.palette.action.hover,
  },
}));

export const EmptyChatView = ({ onToolPress = (tool) => {} }) => {
  const { user } = useAuth();

  const suggestedItems = React.useMemo(() => {
    // Prende i primi 6 elementi. Se ce ne sono meno, aggiunge elementi vuoti
    const items = TOOLS.slice(0, 6);
    return items;
  }, []);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));
  //const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));

  const GRID_SPACING_ROW = isSmallScreen
    ? "1rem"
    : isMediumScreen
    ? "1.5rem"
    : "2rem";
  const GRID_SPACING_COL = isSmallScreen
    ? "4rem"
    : isMediumScreen
    ? "6rem"
    : "8rem";

  const renderSuggestionCard = (item, index) => {
    return (
      <Grid item xs={12} sm={6} md={4} key={index}>
        <SuggestionCard onClick={() => onToolPress(item)}>
          {item ? (
            <Stack>
              <Typography variant="h7" fontWeight={"bold"}>
                {item.name}
              </Typography>
              <Typography color={"textSecondary"} variant="subtitle2">
                {item.subTitle}
              </Typography>
            </Stack>
          ) : (
            <Stack
              justifyContent={"center"}
              alignItems={"center"}
              style={{ height: "100%" }}
            >
              <Typography variant="h6">...</Typography>
            </Stack>
          )}
        </SuggestionCard>
      </Grid>
    );
  };

  return (
    //add margin bottom to the stack
    <Stack
      marginBottom={"5rem"}
      direction={"column"}
      justifyContent={"space-around"}
      spacing={1}
      sx={{ width: "100%", maxHeight: "110%",  overflowY: "auto", padding: "1rem" }}
    >
      <div>
        <NoMarginTypography variant={"h5"} fontWeight="bold">
          {user
            ? `Hello, ${user.given_name ?? ""} ${user.family_name ?? ""}`
            : "Welcome to Mike Chat"}
        </NoMarginTypography>

        <NoMarginTypography variant={"h5"} color={"textSecondary"}>
          How can I help you today?
        </NoMarginTypography>
      </div>
      <div>
        <Stack
          direction={"row"}
          alignItems={"center"}
          spacing={1}
          sx={{ width: "100%", marginBottom: "1rem" }}
        >
          <ElectricBolt style={{ color: "var(--support-text-color)" }} />
          <NoMarginTypography
            variant={"h7"}
            fontWeight={"bold"}
            style={{ color: "var(--support-text-color)" }}
          >
            Suggested
          </NoMarginTypography>
        </Stack>

        <Grid
          container
          rowSpacing={GRID_SPACING_ROW}
          columnSpacing={GRID_SPACING_COL}
          style={{
            marginLeft: "-" + GRID_SPACING_COL,
          }}
        >
          {suggestedItems.map((item, index) =>
            renderSuggestionCard(item, index)
          )}
        </Grid>
      </div>
    </Stack>
  );
};
