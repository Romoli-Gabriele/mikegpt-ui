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

const fetchWorkspacesDetails = async () => {
  try {
    const res = await apiClient.get(`/list_workspaces_with_details`);
    return res?.data?.data || [];
  } catch (error) {
    console.error("list_workspaces_with_details", error);
    return [];
  }
};

/**
 * Formatta una cartella restituita dal server per renderla
 * compatibile con il formato salvato nello store
 * @param {*} folder
 * @returns
 */
const formatFolder = (f) => {
  return {
    id: f.id,
    name: f.name,
    created_at: f.created_at,
    chatSessions: [], // Vengono caricate in seguito
  };
};

/**
 * Formatta una workspace restituita dal sever per renderla
 * compatibile con il formato salavto nello store
 * @param {*} workspace
 */
const formatWorkspace = (workspace) => {
  return {
    ...workspace,
    folders: workspace.folders.map(formatFolder),
    chatSessions:
      workspace.chatSessions?.map((session) => ({
        ...session,
        // aggiunge il folder_id di default
        folderId: -1,
      })) || [],
  };
};

/**
 * Carica le workspace dal server e le salva nello store formattandole correttamente
 * Non salve le sessioni di chat, che verranno caricate in seguito
 * @returns
 */
const loadWorkspaces = async () => {
  const _workspaces = await fetchWorkspacesDetails();
  // Formatta le workspace
  const workspaces = _workspaces.map(formatWorkspace);

  const actions = store.getActions();
  actions.chat.setWorkspaces(workspaces);
  actions.chat.setWorkspaceLoaded(true);

  return workspaces;
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
  const newData = await WorkspaceService.fetchWorkspacesDetails();

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

  return newWorkspace;
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
  const workspaces = await fetchWorkspacesDetails();
  const updatedWorkspace = workspaces.find((x) => x.id === workspaceId);
  actions.chat.setWorkspaces([
    ...workspaces.filter((x) => x.id !== workspaceId),
    updatedWorkspace,
  ]);
  return updatedWorkspace;
};

/**
 * Restituisce il folderId salavato nello store
 * Ma controlla anche che questo sia effettivamente nella workspace corrente
 * (per evitare bug)
 * Restituisce -1 se non è possibile recuperare il folderId o non esiste
 */
const checkAndGetCurrentFolderId = () => {
  const state = store.getState().chat;
  const currentFolderId = state.currentFolderId;
  const currentWorkspace = state.currentWorkspaceId;
  const workspaces = state.workspaces;
  const currentWorkspaceObj = workspaces.find(
    (x) => String(x.id) === String(currentWorkspace)
  );
  if (!currentWorkspaceObj) return -1;
  if (
    !currentFolderId ||
    !currentWorkspaceObj.folders.find(
      (x) => String(x.id) === String(currentFolderId)
    )
  ) {
    return -1;
  } else return currentFolderId || -1;
};

const fetchFoldersAPI = async (workspaceId) => {
  try {
    const res = await apiClient.get(`/list_folders`, { workspaceId });
    return res?.data?.data || [];
  } catch (error) {
    console.error("list_folders", error);
    return [];
  }
};

/**
 * Crea una nuova cartella in una workspace
 * @param {*} workspaceId
 * @param {*} name
 * @returns L'id della nuova cartella
 */
const createFolder = async (workspaceId, name) => {
  // CREATE FOLDER
  const formattedName = name.trim();
  const res = await createFolderAPI(workspaceId, formattedName);

  if (!res) throw new Error("Error creating folder");

  const foldersRes = await fetchFoldersAPI(workspaceId);
  if (!foldersRes || !Array.isArray(foldersRes))
    throw new Error("Error fetching folders");

  // Cerca la nuova cartella appena creata
  // potrebbero essreci più cartelle con lo stesso nome
  // quindi cerca quella con la data di creazione più recente
  const newFolder = foldersRes
    .filter((x) => x.name === formattedName)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

  if (!newFolder) throw new Error("New created Folder not returned");

  const folder = formatFolder(newFolder);

  store.getActions().chat.addFolder({
    workspaceId,
    folder,
  });

  return newFolder.id;
};

export const WorkspaceService = {
  createWorkspace,
  createFolder,
  renameWorkspace,
  renameFolder,
  fetchWorkspacesDetails,
  deleteFolder,
  deleteWorkspace,
  loadWorkspaces,
  checkAndGetCurrentFolderId,
};
