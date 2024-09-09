import { store } from "../store";
import { ConversationService } from "./ConversationService";
import { WorkspaceService } from "./WorkspaceService";
import {router} from "../App.jsx";

/**
 * Funzione di inizializzazione post-autenticazione
 * @param {*} user
 * @returns
 */
const postAuthFlow = async (user) => {
  if (!user) return;
  try {
    // Richiede al server la lista delle workspace
    const workspaces = await WorkspaceService.loadWorkspaces();
    // Verifica che l'utente sia in una workspace valida
    const { currentWorkspaceId } = await loadAndCheckCurrentWorkspace(
      workspaces
    );
    // Carica le conversazioni della workspace corrente
    await ConversationService.fetchAndLoadWorkspaceConversations(
      currentWorkspaceId
    );
  } catch (error) {
    console.error("Error in postAuthFlow", error);
  }

    // Controllo se l'utente ha un abbonamento attivo
    console.log("Checking user subscription", user.subscriptionId);
    if(!user.subscriptionId && router.location.pathname !== "/products") {
        console.log("User has no subscription");
        router.navigate("/products");
    }
};

/**
 * Carica dallo storage in memoria la workspace corrente e la cartella corrente
 * Se non esiste un workspace corrente o se c'è un problema con la workspace corrente
 * la seleziona automaticamente una nuova o ne crea una di default
 * @param {*} workspaces
 */
const loadAndCheckCurrentWorkspace = async (workspaces) => {
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

  return {
    currentWorkspaceId: store.getState().chat.currentWorkspaceId,
  };
};

export const StartupService = { postAuthFlow };
