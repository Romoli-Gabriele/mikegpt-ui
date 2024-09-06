import { store } from "../store";
import { WorkspaceService } from "./WorkspaceService";

const postAuthFlow = async (user) => {
  // Carica le workspace salvate nello storange nello store
  store.getActions().chat.loadCurrentWorkspaceId();
  // Richiede al server la lista delle workspace
  WorkspaceService.getWorkspacesDetails().then((workspaces) => {
    store.getActions().chat.setWorkspaces(workspaces);
    store.getActions().chat.setWorkspaceLoaded(true);
    console.log("workspaces", workspaces);
  });
};

export const StartupService = { postAuthFlow };
