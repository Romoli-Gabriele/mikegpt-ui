import * as React from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import {
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  TextField,
} from "@mui/material";
import {
  ChevronLeft,
  AddOutlined,
  SpaceDashboardOutlined,
  DeleteForeverOutlined,
  FolderOutlined,
} from "@mui/icons-material";
import { ModalBox } from "./ModalBox";
import PropTypes from "prop-types";
import { useTheme } from "@emotion/react";
import { store } from "../store";

const data = [
  "Workspace1",
  "Workspace",
  "Workspace",
  "Workspace",
  "Workspace",
  "Workspace",
];

export const WorkspaceModal = ({ open, setOpen }) => {
  const theme = useTheme();
  const [screen, setScreen] = React.useState("main");
  const [name, setName] = React.useState("");
  const [selectedWorkspace, setSelectedWorkspace] = React.useState(undefined);

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const createWorkspace = () => {
    // CREATE WORKSPACE
    // TODO: Implement
    // IMPOSTA COME DEFAULT
    // TODO: Implement

    store.getActions().chat.setSelectedFolderId(undefined);
  };

  const reset = () => {
    setScreen("main");
    setName("");
  };

  const renderTitle = () => {
    let title = "";
    let backButton = screen !== "main";

    if (screen === "main") title = "Workspaces";
    else if (screen === "create-workspace") title = "New workspace";
    else if (screen === "selected-workspace") title = "Selected workspace";

    return (
      <Stack direction="row" sx={{ mb: 2 }} alignItems="center">
        {backButton && (
          <IconButton>
            <ChevronLeft onClick={reset} />
          </IconButton>
        )}
        <Typography id="modal-modal-title" variant="h5" component="h1">
          {title}
        </Typography>
      </Stack>
    );
  };

  const renderContent = () => {
    if (screen === "main")
      return (
        <>
          <List
            sx={{
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {data.map((x) => {
              return (
                <ListItem
                  key={x}
                  onClick={() => {
                    setScreen("selected-workspace");
                    setSelectedWorkspace(x);
                  }}
                >
                  <ListItemButton
                    sx={{ borderRadius: theme.shape.borderRadius + "px" }}
                  >
                    <ListItemIcon>
                      <SpaceDashboardOutlined />
                    </ListItemIcon>
                    <ListItemText primary="Folder 1" />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          {data.length === 0 && (
            <Typography variant="body2" sx={{ mt: 2, mb: 2 }} align="center">
              You don't have any workspaces yet
            </Typography>
          )}

          <Button
            onClick={() => setScreen("create-workspace")}
            variant="outlined"
            color="primary"
            sx={{ mt: 2, width: "100%" }}
            startIcon={<AddOutlined />}
          >
            Create new workspace
          </Button>
        </>
      );
    if (screen === "create-workspace")
      return (
        <Stack sx={{ pt: 2, pb: 4 }}>
          <TextField
            value={name}
            onChange={(e) => setName(e.target.value)}
            label="Workspace name"
            variant="outlined"
            sx={{ width: "100%", mb: 2 }}
          />
          <Button
            disabled={name.length === 0}
            variant="outlined"
            color="primary"
            sx={{ mt: 2, width: "100%" }}
            endIcon={<AddOutlined />}
            onClick={createWorkspace}
          >
            Create
          </Button>
        </Stack>
      );
    else if (screen === "selected-workspace")
      return (
        <Stack>
          <List
            sx={{
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {["folder1", "folder2"].map((x) => {
              return (
                <ListItem key={x}>
                  <ListItemIcon>
                    <FolderOutlined />
                  </ListItemIcon>
                  <ListItemText primary={x} />
                  <IconButton>
                    <DeleteForeverOutlined color="error" />
                  </IconButton>
                </ListItem>
              );
            })}
          </List>
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 2, width: "100%" }}
          >
            Utilizza workspace
          </Button>
          <Button
            variant="outlined"
            color="error"
            sx={{ mt: 2, width: "100%" }}
            endIcon={<DeleteForeverOutlined />}
          >
            Elimina workspace
          </Button>
        </Stack>
      );
    else return null;
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <ModalBox>
          {renderTitle()}
          {renderContent()}
        </ModalBox>
      </Modal>
    </div>
  );
};

WorkspaceModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};
