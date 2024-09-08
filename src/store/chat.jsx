import { action, thunk } from "easy-peasy";
import { DEFAULT_CHAT_NAME } from "../config";
import { act } from "react";

const CURRENT_WORKSPACE_STORAGE_KEY = "CURRENT_WORKSPACE_STORAGE";
const CURRENT_FOLDER_STORAGE_KEY = "CURRENT_FOLDER_STORAGE";

export const chatModel = {
  messages: [],
  addMessage: action((state, payload) => {
    state.messages.push(payload);
  }),
  setMessages: action((state, payload) => {
    state.messages = payload;
  }),
  conversationId: null,
  setConversationId: action((state, payload) => {
    state.conversationId = payload;
  }),

  loading: false,
  setLoading: action((state, payload) => {
    state.loading = payload;
  }),

  currentWorkspaceId: null,
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

  currentFolderId: null,
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

  selectedFolderId: null,
  setSelectedFolderId: action((state, payload) => {
    state.selectedFolderId = payload;
  }),

  workspaces: [],
  setWorkspaces: action((state, payload) => {
    state.workspaces = payload;
  }),
  workspaceLoaded: false,
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
      console.log("moveConversationToFolder", {
        conversationId,
        workspaceId,
        folderId,
        newFolderId,
      });

      // Prima trova la conversazione
      const foundCounversation = actions.getConversation({
        conversationId,
        workspaceId,
        folderId,
      });

      if (!foundCounversation) return;

      console.log("moveConversationToFolder", {
        foundCounversation,
      });

      // Elimina la conversazione dalla vecchia cartella
      actions.removeConversation({
        conversationId,
        workspaceId,
        folderId,
      });

      console.log("moveConversationToFolder", "removeConversation");

      // Aggiunge la conversazione alla nuova cartella
      actions.addConversation({
        workspaceId,
        folderId: newFolderId,
        conversation: foundCounversation,
      });

      console.log("moveConversationToFolder", "addConversation");
    }
  ),
};
