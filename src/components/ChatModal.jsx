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
  EditOutlined,
} from "@mui/icons-material";
import { ModalBox } from "./ModalBox";
import PropTypes from "prop-types";
import { useTheme } from "@emotion/react";
import { store } from "../store";
import { ConversationService } from "../services/ConversationService";
import { useSnackbar } from "notistack";
import { useStoreState } from "easy-peasy";
import { WorkspaceService } from "../services/WorkspaceService";

export const ChatModal = ({ open, setOpen, chat }) => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [screen, setScreen] = React.useState("main");
  const [folderName, setFolderName] = React.useState("");
  const [folder, setFolder] = React.useState(null);
  const workspaces = useStoreState((state) => state.chat.workspaces);
  const currentWorkspaceId = useStoreState(
    (state) => state.chat.currentWorkspaceId
  );
  const chatTitle = chat.name;
  const conversationId = chat.id;

  const folders = React.useMemo(() => {
    const currentWorkspace = workspaces.find(
      (x) => String(x.id) === String(currentWorkspaceId)
    );
    return currentWorkspace?.folders || [];
  }, [workspaces, currentWorkspaceId]);

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  React.useEffect(() => {
    // Carica la cartella in cui si trova la chat
    if (!chat.folderId || chat.folderId === -1) {
      setFolder(null);
    } else {
      const currentWorkspace = workspaces.find(
        (x) => String(x.id) === String(currentWorkspaceId)
      );
      const folder = currentWorkspace.folders.find(
        (x) => String(x.id) === String(chat.folderId)
      );
      if (folder) setFolder(folder);
    }
  }, [chat, workspaces, currentWorkspaceId]);

  const renameChat = async () => {
    let newName = prompt("Enter the new chat name", chatTitle);
    newName = newName?.trim();
    if (!newName || newName === chatTitle || newName.length === 0) return;
    const res = ConversationService.renameConversation(
      conversationId,
      newName,
      store.getState().chat.currentWorkspaceId,
      chat.folderId || -1
    );
    if (res) {
      enqueueSnackbar("Chat renamed", { variant: "success" });
    } else {
      enqueueSnackbar("An error occurred", { variant: "error" });
    }
  };

  const deleteChat = async () => {
    try {
      // ELIMINA LA CHAT
      await ConversationService.deleteConversation(conversationId);

      enqueueSnackbar("Chat deleted", { variant: "success" });

      // CHIUDI IL MODAL
      handleClose();
    } catch (e) {
      enqueueSnackbar("An error occurred", { variant: "error" });
    }
  };

  const createFolder = async () => {
    try {
      // CREA LA CARTELLA
      const id = await WorkspaceService.createFolder(
        currentWorkspaceId,
        folderName
      );
      if (!id) throw new Error("Error creating folder");
      // AGGIUNGI LA CHAT ALLA CARTELLA
      addToFolder(id);
    } catch (e) {
      enqueueSnackbar("An error occurred", { variant: "error" });
    }
  };

  const addToFolder = (newFolderId) => {
    // AGGIUNGI LA CHAT ALLA CARTELLA
    ConversationService.addConversationToFolder(
      conversationId,
      currentWorkspaceId,
      typeof chat.folderId === "number" ? chat.folderId : -1,
      newFolderId
    );
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
          <IconButton onClick={reset}>
            <ChevronLeft />
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
              onClick={() => addToFolder(-1)}
              variant="outlined"
              color="warning"
              sx={{ mt: 2, width: "100%" }}
              startIcon={<RemoveOutlined />}
            >
              Remove from '{folder.name}'
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

          <Button
            onClick={renameChat}
            variant="outlined"
            color="primary"
            sx={{ mt: 2, width: "100%" }}
            startIcon={<EditOutlined />}
          >
            Rename chat
          </Button>

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
            {folders.map((x) => {
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
                  <ListItemText primary={x.name} />
                </ListItemButton>
              );
            })}
          </List>

          {folders.length === 0 && (
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
