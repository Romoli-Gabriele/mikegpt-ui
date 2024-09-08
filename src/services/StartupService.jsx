import { store } from "../store";
import { ConversationService } from "./ConversationService";
import { WorkspaceService } from "./WorkspaceService";

const postAuthFlow = async (user) => {
  if (!user) return;
  // Richiede al server la lista delle workspace
  WorkspaceService.getWorkspacesDetails().then((workspaces) => {
    store.getActions().chat.setWorkspaces(workspaces);
    store.getActions().chat.setWorkspaceLoaded(true);
    // Verifica che l'utente sia in una workspace valida
    workspaceAndFoldersCheck(workspaces);

    // Carica la lista delle conversazioni
    ConversationService.fetchAndloadConversations().then(() => {
      console.log("Loaded conversations");
    });
  });
};

const workspaceAndFoldersCheck = async (workspaces) => {
  // Carica l'ID della workspace corrente
  const currentWorkspaceId = await store
    .getActions()
    .chat.loadCurrentWorkspaceId();
  // Carica l'ID della cartella corrente
  const currentFolderId = await store.getActions().chat.loadCurrentFolderId();

  // Se non c'è una workspace corrente
  // o se la workspace corrente non esiste più
  // => seleziona nuovo workspace
  if (
    !currentWorkspaceId ||
    !workspaces.find((w) => String(w.id) === String(currentWorkspaceId))
  ) {
    // Se esiste almeno una workspace, seleziona la prima
    if (workspaces.length > 0) {
      console.log("Workspace not found: Selecting first workspace");
      store.getActions().chat.saveCurrentWorkspaceId(workspaces[0].id);
    } else {
      // Se non ci sono workspace create, crea una workspace
      const newWorkspace = await WorkspaceService.createWorkspace(
        "Default Workspace"
      );
      store.getActions().chat.saveCurrentWorkspaceId(newWorkspace.id);
      console.log("Created new default workspace");
    }
  }

  // Se la cartella selezionata non esiste piu
  // o non è più presente nella workspace corrente
  // => deseleziona la cartella
  if (
    !!currentFolderId &&
    !workspaces
      .find((w) => String(w.id) === String(currentWorkspaceId))
      ?.folders.find((f) => String(f.id) === String(currentFolderId))
  ) {
    store.getActions().chat.saveCurrentFolderId(null);
  }

  console.log(
    "Loaded selected workspace",
    store.getState().chat.currentWorkspaceId
  );
};

export const StartupService = { postAuthFlow };
