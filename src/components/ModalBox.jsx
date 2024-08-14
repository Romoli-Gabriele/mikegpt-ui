import { styled } from "@mui/material/styles";

export const ModalBox = styled("div")(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  backgroundColor: theme.palette.background.paper,
  borderWidth: 1,
  borderColor: "var(--box-shadow-color)",
  borderStyle: "solid",
  boxShadow: theme.shadows[1],
  padding: theme.spacing(2, 4, 3),
  borderRadius: theme.shape.borderRadius,
}));
