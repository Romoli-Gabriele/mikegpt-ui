import { store } from "../store/index.jsx";
import { apiClient } from "./ApiService.jsx";

const createWorkspaceAPI = async (name = "Unnamed workspace") => {
  try {
    const res = await apiClient.post(`/create_workspace`, { name });
    return res.status === 200;
  } catch (error) {
    console.error("createWorkspace", error);
    return false;
  }
};

const createFolderAPI = async (workspaceId, name = "Unnamed folder") => {
  try {
    const res = await apiClient.post(`/create_folder`, { name, workspaceId });
    return res.status === 200;
  } catch (error) {
    console.error("createFolder", error);
    return false;
  }
};

export const renameFolderAPI = async (folderId, name) => {
  try {
    const res = await apiClient.post(`/rename_folder`, { name, folderId });
    return res.status === 200;
  } catch (error) {
    console.error("renameFolder", error);
    return false;
  }
};

export const renameWorkspaceAPI = async (workspaceId, name) => {
  try {
    const res = await apiClient.post(`/rename_workspace`, {
      name,
      workspaceId,
    });
    return res.status === 200;
  } catch (error) {
    console.error("renameWorkspace", error);
    return false;
  }
};

const renameWorkspace = async (workspaceId, name) => {
  const res = await renameWorkspaceAPI(workspaceId, name);

  if (!res) throw new Error("Error renaming workspace");

  // MODIFICA LO STORE
  const actions = store.getActions();
  const workspaces = store.getState().chat.workspaces;
  let updatedWorkspace = workspaces.find(
    (x) => String(x.id) === String(workspaceId)
  );
  updatedWorkspace = { ...updatedWorkspace, name };

  actions.chat.setWorkspaces([
    ...workspaces.filter((x) => String(x.id) !== String(workspaceId)),
    updatedWorkspace,
  ]);

  return updatedWorkspace;
};

const renameFolder = async (workspaceId, folderId, name) => {
  const res = await renameFolderAPI(folderId, name);

  if (!res) throw new Error("Error renaming folder");

  // MODIFICA LO STORE
  const actions = store.getActions();
  const workspaces = store.getState().chat.workspaces;
  let updatedWorkspace = workspaces.find(
    (x) => String(x.id) === String(workspaceId)
  );
  const updatedFolders = updatedWorkspace?.folders?.map((x) =>
    String(x.id) === String(folderId) ? { ...x, name } : x
  );
  updatedWorkspace = { ...updatedWorkspace, folders: updatedFolders };

  actions.chat.setWorkspaces([
    ...workspaces.filter((x) => String(x.id) !== String(workspaceId)),
    updatedWorkspace,
  ]);

  return updatedWorkspace;
};

const getWorkspacesDetails = async () => {
  try {
    const res = await apiClient.get(`/list_workspaces_with_details`);
    return res?.data?.data || [];
  } catch (error) {
    console.error("list_workspaces_with_details", error);
    return [];
  }
};

const deleteWorkspaceAPI = async (workspaceId) => {
  try {
    const res = await apiClient.post(`/delete_workspace`, { workspaceId });

    return res.status === 200;
  } catch (error) {
    console.error("WorkspaceService delete workspace error");
    return false;
  }
};

const deleteFolderAPI = async (folderId) => {
  try {
    const res = await apiClient.post(`/delete_folder`, { folderId });
    return res.status === 200;
  } catch (error) {
    console.error("deleteFolder", error);
    return false;
  }
};

const createWorkspace = async (name = "Unnamed workspace") => {
  // CREATE WORKSPACE
  const formattedName = name.trim();
  const res = await createWorkspaceAPI(formattedName);
  if (!res) throw new Error("Error creating workspace");

  // CARICA NUOVAMENTE LA LISTA WORKSPACES
  const newData = await WorkspaceService.getWorkspacesDetails();

  const actions = store.getActions();

  // PRELEVA LA WORKSPACE APPENA CREATA

  let newWorkspace;
  // Inizia a cercare dal fondo della lista (è più probabile che la workspace appena creata sia l'ultima) la workspace con lo stesso nome
  for (let i = newData.length - 1; i >= 0; i--) {
    if (newData[i]?.name === formattedName) {
      newWorkspace = newData[i];
      break;
    }
  }
  if (!newWorkspace) throw new Error("New created Workspace not returned");

  // AGGIORNA LO STORE CON LA NUOVA WORKSPACE
  const newWorkspaces = [...store.getState().chat.workspaces, newWorkspace];
  actions.chat.setWorkspaces(newWorkspaces);

  // IMPOSTA COME DEFAULT
  actions.chat.setCurrentWorkspaceId(newWorkspace.id);
};

const deleteWorkspace = async (workspaceId) => {
  // DELETE WORKSPACE
  const res = await deleteWorkspaceAPI(workspaceId);
  if (!res) throw new Error("Error deleting workspace");
  // RIMUOVI LA WORKSPACE DALLO STORE
  const actions = store.getActions();
  const filteredWorkspaces = store
    .getState()
    .chat.workspaces.filter((x) => x.id !== workspaceId);
  actions.chat.setWorkspaces(filteredWorkspaces);

  // SE LA WORKSPACE ERA QUELLA DI DEFAULT NE SELEZIONA UN'ALTRA A CASO
  if (
    String(store.getState().chat.currentWorkspaceId) === String(workspaceId)
  ) {
    if (filteredWorkspaces.length > 0)
      actions.chat.saveCurrentWorkspaceId(filteredWorkspaces[0].id);
    else actions.chat.saveCurrentWorkspaceId(null);
  }
};

const deleteFolder = async (folderId, workspaceId) => {
  // DELETE FOLDER
  const res = await deleteFolderAPI(folderId);
  if (!res) throw new Error("Error deleting folder");
  // AGGIORNA IL WORKSPACE
  const actions = store.getActions();
  const workspaces = await getWorkspacesDetails();
  const updatedWorkspace = workspaces.find((x) => x.id === workspaceId);
  actions.chat.setWorkspaces([
    ...workspaces.filter((x) => x.id !== workspaceId),
    updatedWorkspace,
  ]);
  return updatedWorkspace;
};

export const WorkspaceService = {
  createWorkspace,
  createFolder: createFolderAPI,
  renameWorkspace,
  renameFolder,
  getWorkspacesDetails,
  deleteFolder,
  deleteWorkspace,
};
