import * as React from "react";
import { Stack, Typography, Grid, Paper } from "@mui/material";
import mike_logo from "../assets/mike_logo.png";
import { useAuth } from "../hooks/useAuth";
import styled from "@emotion/styled";
import ElectricBolt from "@mui/icons-material/Bolt";
import TOOLS from "../services/TOOLS.json";
import { NoMarginTypography } from "./utils";

const GRID_SPACING_ROW = "2rem";
const GRID_SPACING_COL = "8rem";

const SuggestionCard = styled(Paper)(({ theme }) => ({
  padding: "2rem",
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  height: "100%",
  minHeight: "8rem",
  "&:hover": {
    cursor: "pointer",
    boxShadow: theme.shadows[3],
    backgroundColor: theme.palette.action.hover,
  },
}));

export const EmptyChatView = () => {
  const { user } = useAuth();

  const suggestedItems = React.useMemo(() => {
    // Prende i primi 6 elementi. Se ce ne sono meno, aggiunge elementi vuoti
    const items = TOOLS.slice(0, 6);
    return items;
  }, []);

  const renderSuggestionCard = (item, index) => {
    return (
      <Grid item xs={12} sm={6} md={4} key={index}>
        <SuggestionCard>
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
    <Stack
      direction={"column"}
      justifyContent={"space-around"}
      spacing={2}
      sx={{ width: "100%", height: "100%" }}
    >
      <div>
        <img
          src={mike_logo}
          style={{
            resizeMode: "contain",
            width: "6rem",
            paddingBottom: "1rem",
          }}
        />
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
          sx={{ width: "100%" }}
          mb={2}
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
