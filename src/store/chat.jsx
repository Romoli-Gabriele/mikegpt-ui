import { action, thunk } from "easy-peasy";

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

  conversations: [],
  setConversations: action((state, payload) => {
    state.conversations = payload;
  }),

  currentWorkspaceId: null,
  setCurrentWorkspaceId: action((state, payload) => {
    state.currentWorkspaceId = payload;
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
};
