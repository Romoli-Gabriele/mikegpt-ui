import * as React from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Divider, IconButton } from "@mui/material";
import {
  SettingsOutlined,
  ModeEdit,
  Delete,
  CancelOutlined,
} from "@mui/icons-material";
import { ModalBox } from "./ModalBox";
import { PoliciesLinks } from "./Footer";

export const SettingsModal = () => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <IconButton
        onClick={handleOpen}
        sx={{
          backgroundColor: "var(--support-background-color)",
          color: "var(--support-text-color)",
          width: "2rem",
          height: "2rem",
          borderRadius: "50%",
          alignSelf: "center",
        }}
      >
        <SettingsOutlined fontSize="small" />
      </IconButton>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <ModalBox>
          <Typography id="modal-modal-title" variant="h5" component="h1">
            Settings
          </Typography>

          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 2, width: "100%" }}
            startIcon={<ModeEdit />}
          >
            Change Password
          </Button>

          <Button
            variant="outlined"
            color="error"
            sx={{ mt: 2, width: "100%" }}
            startIcon={<CancelOutlined />}
          >
            Cancel Subscription
          </Button>

          <Button
            variant="contained"
            color="error"
            sx={{ mt: 2, width: "100%" }}
            startIcon={<Delete />}
          >
            Delete Account
          </Button>
          <Divider sx={{ mt: 3, mb: 3 }} />
          <PoliciesLinks />
        </ModalBox>
      </Modal>
    </div>
  );
};
