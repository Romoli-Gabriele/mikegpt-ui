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
  CircularProgress,
  ListItemText,
  Stack,
  TextField,
  Box,
} from "@mui/material";
import {
  ChevronLeft,
  AddOutlined,
  SpaceDashboardOutlined,
  DeleteForeverOutlined,
  FolderOutlined,
  EditOutlined,
  CheckOutlined,
} from "@mui/icons-material";
import { ModalBox } from "./ModalBox";
import PropTypes from "prop-types";
import { useTheme } from "@emotion/react";
import { WorkspaceService } from "../services/WorkspaceService";
import { useStoreState, useStoreActions } from "easy-peasy";
import { useSnackbar } from "notistack";
import { store } from "../store";

export const WorkspaceModal = ({ open, setOpen }) => {
  const theme = useTheme();
  const [screen, setScreen] = React.useState("main");
  const [name, setName] = React.useState("");
  const [selectedWorkspace, setSelectedWorkspace] = React.useState(undefined);
  const { enqueueSnackbar } = useSnackbar();
  const workspaces = useStoreState((s) => s.chat.workspaces);
  const workspaceLoaded = useStoreState((s) => s.chat.workspaceLoaded);
  const saveCurrentWorkspaceId = useStoreActions(
    (s) => s.chat.saveCurrentWorkspaceId
  );
  const currentWorkspaceId = useStoreState((s) => s.chat.currentWorkspaceId);

  const sortedWorkspaces = React.useMemo(() => {
    if (!currentWorkspaceId) return workspaces;
    if (!workspaces || workspaces?.length === 0) return [];
    else {
      const currentWorkspace = workspaces.find(
        (x) => x.id === currentWorkspaceId
      );
      if (!currentWorkspace) return workspaces;
      const otherWorkspaces = workspaces.filter(
        (x) => x.id !== currentWorkspaceId
      );
      return [currentWorkspace, ...otherWorkspaces];
    }
  }, [workspaces, currentWorkspaceId]);

  const canDelete = React.useMemo(() => {
    if (!workspaceLoaded) return false;
    else if (workspaces.length < 2) return false;
    else return true;
  }, [workspaces, workspaceLoaded]);

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const handleWorkspaceRenameButtonClick = async () => {
    try {
      let newName = prompt("Enter new workspace name", selectedWorkspace.name);
      newName = newName?.trim();
      if (!newName || newName.length === 0) {
        enqueueSnackbar("Name cannot be empty", { variant: "error" });
        return;
      }
      const updatedWorkspace = await WorkspaceService.renameWorkspace(
        selectedWorkspace.id,
        newName
      );
      setSelectedWorkspace(updatedWorkspace);
      enqueueSnackbar("Workspace renamed", { variant: "success" });
    } catch (e) {
      enqueueSnackbar("Error renaming workspace", { variant: "error" });
    }
  };

  const deleteWorkspace = async (workspaceId) => {
    try {
      await WorkspaceService.deleteWorkspace(workspaceId);
      enqueueSnackbar("Workspace deleted", { variant: "success" });
      reset();
    } catch (e) {
      enqueueSnackbar("Error deleting workspace", { variant: "error" });
    }
  };

  const renameFolder = (folderId, oldName) => async () => {
    try {
      let newName = prompt("Enter new folder name", oldName);
      newName = newName?.trim();
      if (!newName || newName.length === 0) {
        enqueueSnackbar("Name cannot be empty", { variant: "error" });
        return;
      }

      const updatedWorkspace = await WorkspaceService.renameFolder(
        selectedWorkspace.id,
        folderId,
        newName
      );

      if (!updatedWorkspace) throw new Error("Error renaming folder");
      setSelectedWorkspace(updatedWorkspace);
      enqueueSnackbar("Folder renamed", { variant: "success" });
    } catch (e) {
      enqueueSnackbar("Error renaming folder", { variant: "error" });
    }
  };

  const deleteFolder = (folderId) => async () => {
    try {
      const updatedWorkspace = await WorkspaceService.deleteFolder(
        folderId,
        selectedWorkspace.id
      );
      if (!updatedWorkspace) throw new Error("Error deleting folder");
      setSelectedWorkspace(updatedWorkspace);
      enqueueSnackbar("Folder deleted", { variant: "success" });
    } catch (e) {
      enqueueSnackbar("Error deleting folder", { variant: "error" });
    }
  };

  const createWorkspace = async () => {
    try {
      await WorkspaceService.createWorkspace(name);
      handleClose();
      enqueueSnackbar("Workspace created", { variant: "success" });
    } catch (e) {
      enqueueSnackbar("Error creating workspace", { variant: "error" });
      console.error(e);
    }
  };

  /**
   * Resetta il form
   */
  const reset = () => {
    setName("");
    setSelectedWorkspace(undefined);
    setScreen("main");
  };

  const renderTitle = () => {
    let title = "";
    let backButton = screen !== "main";

    if (screen === "main") title = "Workspaces";
    else if (screen === "create-workspace") title = "New workspace";
    else if (screen === "selected-workspace")
      title = selectedWorkspace?.name || "Unnamed Workspace";

    return (
      <Stack direction="row" sx={{ mb: 2 }} alignItems="center">
        {backButton && (
          <IconButton>
            <ChevronLeft onClick={reset} />
          </IconButton>
        )}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
          }}
        >
          <Typography id="modal-modal-title" variant="h5" component="h1">
            {title}
          </Typography>
        </Box>
        {screen === "selected-workspace" && (
          <IconButton onClick={handleWorkspaceRenameButtonClick}>
            <EditOutlined color="action" />
          </IconButton>
        )}
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
            {workspaces.length === 0 && !workspaceLoaded && (
              <CircularProgress
                size="1.5rem"
                sx={{
                  display: "block",
                  margin: "auto",
                  mt: 2,
                  mb: 2,
                }}
              />
            )}
            {sortedWorkspaces.map((x) => {
              let isSelected = x.id === currentWorkspaceId;

              return (
                <ListItem
                  key={x.id + ""}
                  onClick={() => {
                    setScreen("selected-workspace");
                    setSelectedWorkspace(x);
                  }}
                >
                  <ListItemButton
                    sx={{ borderRadius: theme.shape.borderRadius + "px" }}
                  >
                    <ListItemIcon>
                      {
                        isSelected ? (
                          <CheckOutlined color="primary" />
                        ) : (
                          <SpaceDashboardOutlined />
                        ) // Dashboard
                      }
                    </ListItemIcon>
                    <ListItemText primary={x?.name} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          {workspaceLoaded && workspaces.length === 0 && (
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
            {selectedWorkspace?.folders?.map((x) => {
              return (
                <ListItem key={x?.id + ""}>
                  <ListItemIcon>
                    <FolderOutlined />
                  </ListItemIcon>
                  <ListItemText primary={x?.name || "Unnamed Folder"} />
                  <IconButton onClick={renameFolder(x.id, x.name)}>
                    <EditOutlined color="action" />
                  </IconButton>
                  <IconButton onClick={deleteFolder(x.id)}>
                    <DeleteForeverOutlined color="action" />
                  </IconButton>
                </ListItem>
              );
            })}
          </List>
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 2, width: "100%" }}
            onClick={() => {
              saveCurrentWorkspaceId(selectedWorkspace.id);
              handleClose();
            }}
          >
            Use workspace
          </Button>
          {canDelete && (
            <Button
              variant="outlined"
              color="error"
              sx={{ mt: 2, width: "100%" }}
              endIcon={<DeleteForeverOutlined />}
              onClick={() => deleteWorkspace(selectedWorkspace.id)}
            >
              Delete workspace
            </Button>
          )}
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
