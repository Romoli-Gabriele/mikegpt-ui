import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";

export const NoMarginTypography = styled(Typography)(({ theme }) => ({
  margin: "0 !important",
  padding: "0 !important",
}));
