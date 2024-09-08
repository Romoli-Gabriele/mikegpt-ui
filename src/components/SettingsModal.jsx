import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Divider } from "@mui/material";
import { ModeEdit, CancelOutlined } from "@mui/icons-material";
import { ModalBox } from "./ModalBox";
import { PoliciesLinks } from "./Footer";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {useAuth} from "../hooks/useAuth.jsx";
import {unsubscribeStripe} from "../services/StripeService.jsx";
import {router} from "../App.jsx";

export const SettingsModal = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const handleClose = () => setOpen(false);
  const { user, logout } = useAuth();
  const unsubscribe = () => {

    //TODO aggiungere subscriptionId a user
    //user.subscriptionId = "sub_1PwrQqJ7S8yxZLrWheVDgXh5"
    if(user.subscriptionId)
      unsubscribeStripe(user.subscriptionId).then(
        () => {
            console.log("Unsubscribed");
            user.subscriptionId = null;
            logout()
        }
    )
    else {
      console.log("No subscriptionId found");
      router.navigate("/products");
    }
  }
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
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
            onClick={() => {
              navigate("/edit-password");
            }}
          >
            Change Password
          </Button>

          <Button
            variant="outlined"
            color="error"
            sx={{ mt: 2, width: "100%" }}
            startIcon={<CancelOutlined />}
            onClick={unsubscribe}
          >
            Cancel Subscription
          </Button>

          {/* <Button
            variant="contained"
            color="error"
            sx={{ mt: 2, width: "100%" }}
            startIcon={<Delete />}
          >
            Delete Account
          </Button> */}
          <Divider sx={{ mt: 3, mb: 3 }} />
          <PoliciesLinks />
        </ModalBox>
      </Modal>
    </div>
  );
};

SettingsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};
