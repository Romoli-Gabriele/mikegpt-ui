import * as React from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import {
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
} from "@mui/material";
import {
  Delete,
  FolderOutlined,
  ChevronLeft,
  AddOutlined,
  RemoveOutlined,
} from "@mui/icons-material";
import { ModalBox } from "./ModalBox";
import PropTypes from "prop-types";
import { useTheme } from "@emotion/react";
import { store } from "../store";

const data = [];

export const ChatModal = ({
  open,
  setOpen,
  title: chatTitle,
  conversationId,
}) => {
  const theme = useTheme();
  const [screen, setScreen] = React.useState("main");
  const [folderName, setFolderName] = React.useState("");

  const folder = undefined;

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const deleteChat = () => {
    // ELIMINA LA CHAT
    // TODO: implementare

    // RIMUOVI DALLO STORE
    store
      .getActions()
      .chat.setConversations(
        store
          .getState()
          .chat.conversations.filter((x) => x.conversationId !== conversationId)
      );

    // CHIUDI IL MODAL
    handleClose();
  };

  const createFolder = () => {
    // CREA LA CARTELLA
    // TODO: implementare
    // AGGIUNGI LA CHAT ALLA CARTELLA
    addToFolder("folderId");
  };

  const addToFolder = (folderId) => {
    // AGGIUNGI LA CHAT ALLA CARTELLA
    // TODO: implementare
    // CHIUDI IL MODAL
    handleClose();
  };

  const openFolderSelection = () => {
    setScreen("select-folder");
  };

  const reset = () => {
    setScreen("main");
    setFolderName("");
  };

  const renderTitle = () => {
    let title = "";
    let backButton = screen !== "main";

    if (screen === "main") title = chatTitle || "Untitled chat";
    else if (screen === "select-folder") title = "Select a folder";
    else if (screen === "create-folder") title = "Create a folder";

    return (
      <Stack
        direction="row"
        sx={{
          mb: 2,
        }}
        alignItems="center"
      >
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
          {/** Aggiungi la chat a una cartella */}
          {folder ? (
            <Button
              onClick={openFolderSelection}
              variant="outlined"
              color="warning"
              sx={{ mt: 2, width: "100%" }}
              startIcon={<RemoveOutlined />}
            >
              Remove from folder {folder.name}
            </Button>
          ) : (
            <Button
              onClick={openFolderSelection}
              variant="outlined"
              color="primary"
              sx={{ mt: 2, width: "100%" }}
              startIcon={<FolderOutlined />}
            >
              Add to a folder
            </Button>
          )}
          {/** Elimina la chat */}
          <Button
            variant="outlined"
            color="error"
            sx={{ mt: 2, width: "100%" }}
            startIcon={<Delete />}
            onClick={deleteChat}
          >
            Delete chat
          </Button>
        </>
      );

    if (screen === "select-folder")
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
                <ListItemButton
                  key={x}
                  onClick={() => {
                    addToFolder(x.id);
                  }}
                  sx={{
                    borderRadius: theme.shape.borderRadius + "px",
                  }}
                >
                  <ListItemIcon>
                    <FolderOutlined />
                  </ListItemIcon>
                  <ListItemText primary="Folder 1" />
                </ListItemButton>
              );
            })}
          </List>

          {data.length === 0 && (
            <Typography variant="body2" sx={{ mt: 2, mb: 2 }} align="center">
              You don't have any folders yet
            </Typography>
          )}

          <Button
            onClick={() => setScreen("create-folder")}
            variant="outlined"
            color="primary"
            sx={{ mt: 2, width: "100%" }}
            startIcon={<AddOutlined />}
          >
            New folder
          </Button>
        </>
      );
    if (screen === "create-folder")
      return (
        <Stack sx={{ pt: 2, pb: 4 }}>
          <TextField
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            label="Folder name"
            variant="outlined"
            sx={{ width: "100%", mb: 2 }}
          />
          <Button
            disabled={folderName.length === 0}
            variant="outlined"
            color="primary"
            sx={{ mt: 2, width: "100%" }}
            endIcon={<AddOutlined />}
            onClick={createFolder}
          >
            Create
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

ChatModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};
