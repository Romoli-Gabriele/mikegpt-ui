import { action, thunk } from "easy-peasy";
import { DEFAULT_CHAT_NAME } from "../config";
import { act } from "react";

const CURRENT_WORKSPACE_STORAGE_KEY = "CURRENT_WORKSPACE_STORAGE";
const CURRENT_FOLDER_STORAGE_KEY = "CURRENT_FOLDER_STORAGE";

const initialState = {
  messages: [],
  conversationId: null,
  loading: false,
  currentWorkspaceId: null,
  currentFolderId: null,
  selectedFolderId: null,
  workspaces: [],
  workspaceLoaded: false,
};

export const chatModel = {
  ...initialState,

  addMessage: action((state, payload) => {
    state.messages.push(payload);
  }),
  setMessages: action((state, payload) => {
    state.messages = payload;
  }),

  setConversationId: action((state, payload) => {
    state.conversationId = payload;
  }),

  setLoading: action((state, payload) => {
    state.loading = payload;
  }),

  setCurrentWorkspaceId: action((state, payload) => {
    state.currentWorkspaceId = payload;
    state.currentFolderId = null;
  }),
  loadCurrentWorkspaceId: thunk(async (state) => {
    let currentWorkspaceId = window.localStorage.getItem(
      CURRENT_WORKSPACE_STORAGE_KEY
    );

    currentWorkspaceId = isNaN(Number(currentWorkspaceId))
      ? null
      : Number(currentWorkspaceId);

    state.setCurrentWorkspaceId(currentWorkspaceId);
    return currentWorkspaceId;
  }),
  saveCurrentWorkspaceId: thunk((state, payload) => {
    window.localStorage.setItem(CURRENT_WORKSPACE_STORAGE_KEY, "" + payload);
    state.setCurrentWorkspaceId(payload);
  }),

  setCurrentFolderId: action((state, payload) => {
    state.currentFolderId = payload;
  }),
  loadCurrentFolderId: thunk(async (state) => {
    let currentFolderId = localStorage.getItem(CURRENT_FOLDER_STORAGE_KEY);
    currentFolderId = isNaN(Number(currentFolderId))
      ? null
      : Number(currentFolderId);
    state.setCurrentFolderId(currentFolderId);
    return currentFolderId;
  }),
  saveCurrentFolderId: thunk((state, payload) => {
    localStorage.setItem(CURRENT_FOLDER_STORAGE_KEY, payload + "");
    state.setCurrentFolderId(payload);
  }),

  setSelectedFolderId: action((state, payload) => {
    state.selectedFolderId = payload;
  }),

  setWorkspaces: action((state, payload) => {
    state.workspaces = payload;
  }),

  setWorkspaceLoaded: action((state, payload) => {
    state.workspaceLoaded = payload;
  }),

  addNewConversation: thunk(
    (
      actions,
      { conversationId, workspaceId, folderId, name = DEFAULT_CHAT_NAME }
    ) => {
      actions.addConversation({
        conversation: {
          id: conversationId,
          name,
          created_at: new Date().toISOString(),
          folderId: typeof folderId === "number" ? folderId : -1,
        },
        workspaceId,
        folderId,
      });
    }
  ),

  addConversation: action((state, { conversation, workspaceId, folderId }) => {
    state.workspaces = state.workspaces.map((workspace) => {
      if (String(workspace.id) === String(workspaceId)) {
        if (typeof folderId !== "number" || folderId == -1) {
          // Aggiunge la nuova conversazione in cima alla lista tre
          // le sessioni senza folder
          return {
            ...workspace,
            chatSessions: [...workspace.chatSessions, conversation],
          };
        } else {
          // Cerca la cartella e aggiunge la conversazione
          return {
            ...workspace,
            folders: workspace.folders.map((folder) => {
              if (String(folder.id) === String(folderId)) {
                return {
                  ...folder,
                  chatSessions: [...folder.chatSessions, conversation],
                };
              } else return folder;
            }),
          };
        }
      } else return workspace;
    });
  }),

  removeConversation: action(
    (state, { conversationId, workspaceId, folderId }) => {
      state.workspaces = state.workspaces.map((workspace) => {
        if (String(workspace.id) === String(workspaceId)) {
          if (typeof folderId !== "number" || folderId == -1) {
            return {
              ...workspace,
              chatSessions: workspace.chatSessions.filter(
                (x) => String(x.id) !== String(conversationId)
              ),
            };
          } else {
            return {
              ...workspace,
              folders: workspace.folders.map((folder) => {
                if (String(folder.id) === String(folderId)) {
                  return {
                    ...folder,
                    chatSessions: folder.chatSessions.filter(
                      (x) => String(x.id) !== String(conversationId)
                    ),
                  };
                } else return folder;
              }),
            };
          }
        } else return workspace;
      });
    }
  ),

  modifyConversation: action(
    (state, { conversationId, workspaceId, folderId, edits }) => {
      state.workspaces = state.workspaces.map((workspace) => {
        if (String(workspace.id) === String(workspaceId)) {
          if (typeof folderId !== "number" || folderId == -1) {
            return {
              ...workspace,
              chatSessions: workspace.chatSessions.map((x) => {
                if (String(x.id) === String(conversationId)) {
                  return { ...x, ...edits };
                } else return x;
              }),
            };
          } else {
            return {
              ...workspace,
              folders: workspace.folders.map((folder) => {
                if (String(folder.id) === String(folderId)) {
                  return {
                    ...folder,
                    chatSessions: folder.chatSessions.map((x) => {
                      if (String(x.id) === String(conversationId)) {
                        return { ...x, ...edits };
                      } else return x;
                    }),
                  };
                } else return folder;
              }),
            };
          }
        } else return workspace;
      });
    }
  ),

  getConversation: thunk(
    (actions, { conversationId, workspaceId, folderId }, { getStoreState }) => {
      let foundCounversation;
      const workspaces = getStoreState().chat.workspaces;
      const workspace = workspaces.find(
        (x) => String(x.id) === String(workspaceId)
      );

      if (typeof folderId !== "number" || folderId == -1) {
        foundCounversation = workspace.chatSessions.find(
          (x) => String(x.id) === String(conversationId)
        );
      } else {
        const folder = workspace.folders.find(
          (x) => String(x.id) === String(folderId)
        );
        if (folder) {
          foundCounversation = folder.chatSessions.find(
            (x) => String(x.id) === String(conversationId)
          );
        }
      }
      return foundCounversation;
    }
  ),

  moveConversationToFolder: thunk(
    (actions, { conversationId, workspaceId, folderId, newFolderId }) => {
      // Prima trova la conversazione
      const foundCounversation = actions.getConversation({
        conversationId,
        workspaceId,
        folderId,
      });
      if (!foundCounversation) return;
      // Elimina la conversazione dalla vecchia cartella
      actions.removeConversation({
        conversationId,
        workspaceId,
        folderId,
      });
      // Aggiunge la conversazione alla nuova cartella
      actions.addConversation({
        workspaceId,
        folderId: newFolderId,
        conversation: foundCounversation,
      });
      // Modifica la conversazione per aggiornare il folderId
      actions.modifyConversation({
        conversationId,
        workspaceId,
        folderId: newFolderId,
        edits: { folderId: newFolderId },
      });
    }
  ),

  removeFolder: action((state, { workspaceId, folderId }) => {
    state.workspaces = state.workspaces.map((workspace) => {
      if (String(workspace.id) === String(workspaceId)) {
        return {
          ...workspace,
          folders: workspace.folders.filter(
            (x) => String(x.id) !== String(folderId)
          ),
        };
      } else return workspace;
    });
  }),

  addFolder: action((state, { workspaceId, folder }) => {
    state.workspaces = state.workspaces.map((workspace) => {
      if (String(workspace.id) === String(workspaceId)) {
        return {
          ...workspace,
          folders: [...workspace.folders, folder],
        };
      } else return workspace;
    });
  }),

  reset: action(() => ({ ...initialState })),
};
