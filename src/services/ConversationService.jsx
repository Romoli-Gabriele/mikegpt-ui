import { DEFAULT_CHAT_NAME } from "../config.jsx";
import { store } from "../store/index.jsx";
import { lambdaClient, apiClient } from "./ApiService.jsx";
import { tryToConvertToArrayHelper } from "./utils.jsx";
import { WorkspaceService } from "./WorkspaceService.jsx";

/**
 * Crea una nuova conversazione, una nuova session chat e l'aggiunge alla lista delle conversazioni
 * della workspace corrente nello store
 * @returns
 */
const createConversation = async () => {
  // Preleva l'ID del workspace corrente
  const workspaceId = store.getState().chat.currentWorkspaceId;
  if (!workspaceId) throw new Error("No workspace selected");
  const folderId = WorkspaceService.checkAndGetCurrentFolderId();

  // Crea la nuova conversazione
  const conversationRes = await lambdaClient.post("/conversation");
  if (!conversationRes?.data?.conversationid)
    throw new Error("Failed to create conversation");

  const conversationId = conversationRes.data.conversationid;

  // Crea la nuova sessione di chat
  const sessionRes = await apiClient.post("/create_chat_session", {
    name: DEFAULT_CHAT_NAME,
    conversationId: conversationId,
    workspaceId: Number(workspaceId),
    folderId,
  });

  if (sessionRes?.status !== 200)
    throw new Error("Failed to create chat session");

  console.log(
    "Created new session in workspace=",
    workspaceId,
    ", folder=",
    folderId
  );

  // Aggiunge la nuova conversazione in cima alla lista
  const actions = store.getActions();
  actions.chat.addNewConversation({
    conversationId: conversationId,
    workspaceId: workspaceId,
    folderId: folderId,
    name: DEFAULT_CHAT_NAME,
  });

  // Imposta l'ID della conversazione come attiva
  actions.chat.setConversationId(conversationId);

  return conversationId;
};

/**
 * Richiede al server lambda i dettagli di una conversazione
 * @param {*} conversationId
 * @returns
 */
const getConversation = async (conversationId) => {
  return await lambdaClient.get(`/conversation/${conversationId}`);
};

/**
 * Verifica la connessione con il server
 */
const queryHealth = async () => {
  try {
    const x = await apiClient.get(`/health`);
    console.log("Health:", x.data.message);
  } catch (error) {
    console.error("queryHealth", error);
  }
};

/**
 * Invia un messaggio al server e attende la sua risposta
 * @param {*} conversationId
 * @param {*} message
 * @param {*} kwargs
 * @param {*} functionName
 * @param {*} modifyChatRunId
 * @param {*} debugAB
 * @returns
 */

const sendMessage = async (
  conversationId,
  message,
  kwargs = {},
  functionName = "query",
  modifyChatRunId,
  debugAB = null
) => {
  try {
    const data = await apiClient.post(`/query`, {
      question: message,
      kwargs: kwargs,
      conversationid: conversationId,
      functionName: functionName,
      ...(modifyChatRunId ? { modifyChatRunId: modifyChatRunId } : {}),
      ...(debugAB ? { debugAB: debugAB } : {}),
    });
    return data.data;
  } catch (error) {
    console.error("sendMessage", error);
  }
};

/**
 * Invia al server un feedback per una conversazione e aggiorna lo store
 * @param {*} runid
 * @param {*} feedback
 * @returns
 */
const sendFeedback = async (runid, feedback) => {
  // Aggiorna lo store
  const updatedMessages = [...(store.getState().chat.messages || [])].map(
    (x) => {
      if (x.data.runid === runid) {
        console.log("Feedback u", x);
        x.feedback = feedback;
      }
      return x;
    }
  );
  store.getActions().chat.setMessages(updatedMessages);

  // Invia il feedback al server
  try {
    const res = await apiClient.post(`/give_feedback`, {
      runid: runid,
      feedback: feedback,
    });

    if (res.status !== 200) {
      console.error("Failed to send feedback");
      return false;
    }

    return true;
  } catch (error) {
    console.error("sendFeedback", error);
    return false;
  }
};

const getFileUploadUrl = async (file_name) => {
  return await lambdaClient.post(`/document/upload`, {
    file_name: file_name,
  });
};

const processFile = async (file_name, file_title, file_date) => {
  return await lambdaClient.post(`/document/process`, {
    file_name: file_name,
    file_title: file_title,
    file_date: file_date,
  });
};

/**
 * Apre una nuova conversazione, aggiorna lo store e resetta i messaggi
 */
const openNewConversation = () => {
  store.getActions().chat.setMessages([]);
  store.getActions().chat.setConversationId(null);
  store.getActions().chat.setLoading(false); // potrebbe essere in corso un caricamentonella vecchia conversazione
};

/**
 * Apre una nuova conversazione
 * Richiede al server i messaggi della conversazione e li carica nello store
 * @param {*} conversationId
 * @returns
 */
const openConversation = async (conversationId) => {
  try {
    if (store.getState().chat.conversationId === conversationId) return;

    console.log("loading conversation", conversationId);
    store.getActions().chat.setConversationId(conversationId);
    store.getActions().chat.setLoading(true);
    store.getActions().chat.setMessages([]);
    const res = await apiClient.get(`/list_chats?session_id=${conversationId}`);
    if (!res || !res.data) {
      store.getActions().chat.setLoading(false);
      return;
    }

    const messages = res.data.data?.map(formatMessage) || [];

    //Ordina i messaggi per data:i più recenti in fondo
    messages.sort((a, b) => {
      return new Date(a.created_at) - new Date(b.created_at);
    });

    store.getActions().chat.setMessages(messages);
    console.log("fetched conversation", messages);
  } catch (error) {
    console.error(error);
  } finally {
    store.getActions().chat.setLoading(false);
  }
};

/**
 * Formatta un messaggio ricevuto dal server nel formato atteso dallo store
 * @param {*} message
 * @returns
 */
const formatMessage = (message) => {
  return {
    data: {
      content: message.message,
      documents: tryToConvertToArrayHelper(message.docs),
      runid: message.runid,
    },
    type: message.type,
    created_at: message.created_at,
  };
};

/**
 * Richiede al server la lista delle sessioni di chat di una cartella
 * @param {*} folderId
 * @returns
 */
const fetchChatSessions = async (folderId = -1) => {
  try {
    // Prendiamo le sessioni degli ultimi 30 giorni
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    // format date string to YYY-MM-DD
    startDate = startDate.toISOString().split("T")[0];

    const res = await apiClient.get(
      "/list_chat_sessions?folder_id=" + folderId + "&start_date=" + startDate
    );
    if (!res?.data?.data) throw new Error("Failed to fetch conversations");
    return res.data.data;
  } catch (error) {
    console.error("fetchAllConversations", error);
    return [];
  }
};

/**
 * Richiede al server e carica nello store tutte le conversazioni
 * delle cartelle della workspace specifica
 * (le conversazioni fuori dalle cartelle sono già state restituite
 * nella workspace stessa)
 * @param {*} workspaceId
 * @returns
 */
const fetchAndLoadWorkspaceConversations = async (workspaceId) => {
  console.log("loading conversations for workspace", workspaceId);
  const workspaces = store.getState().chat.workspaces;
  const currentWorkspace = workspaces.find(
    (x) => String(x.id) === String(workspaceId)
  );
  if (!currentWorkspace) {
    console.warn("Current Workspace not found during conversations fetch");
    return;
  }

  // Esegue il fetch delle conversazioni per ogni cartella
  const folder_session_dic = {};
  for (const folder of currentWorkspace.folders || []) {
    try {
      const sessions = await fetchChatSessions(folder.id);
      folder_session_dic[String(folder.id)] =
        sessions?.map((x) => ({
          ...x,
          folderId: Number(folder.id),
        })) || [];
    } catch (error) {
      console.error("fetchAndloadConversations", error);
      continue;
    }
  }

  // Aggiorna lo store
  const updatedWorkspaces = workspaces.map((x) => {
    if (String(x.id) === String(workspaceId)) {
      return {
        ...x,
        folders: x.folders.map((f) => ({
          ...f,
          chatSessions: folder_session_dic[String(f.id)] || [],
        })),
      };
    }
    return x;
  });
  store.getActions().chat.setWorkspaces(updatedWorkspaces);
};

/**
 * Elimina una conversazione e la rimuove dallo store
 * @param {*} conversationId
 * @returns
 */
const deleteConversation = async (conversationId) => {
  try {
    const res = await apiClient.post(`/delete_chat_session`, {
      conversationId: conversationId,
    });

    if (res.status !== 200) return false;

    // Rimuove la conversazione dallo store
    store.getActions().chat.removeConversation({
      conversationId: conversationId,
      workspaceId: store.getState().chat.currentWorkspaceId,
      folderId: WorkspaceService.checkAndGetCurrentFolderId(),
    });
    // Se la conversazione eliminata è quella attualmente aperta, la chiude
    if (store.getState().chat.conversationId === conversationId) {
      openNewConversation();
    }
  } catch (error) {
    console.error("deleteConversation", error);
    return false;
  }
};

/**
 * Rinomina una conversazione
 * @param {*} conversationId
 * @param {*} newName
 * @param {*} workspaceId
 * @param {*} folderId
 * @returns
 */
const renameConversation = async (
  conversationId,
  newName,
  workspaceId,
  folderId
) => {
  try {
    const res = await apiClient.post(`/rename_chat_session`, {
      conversationId: conversationId,
      chatSessionId: conversationId,
      name: newName,
    });

    // Aggiorna lo store
    store.getActions().chat.modifyConversation({
      conversationId: conversationId,
      workspaceId: workspaceId,
      folderId: folderId,
      edits: { name: newName },
    });
  } catch (error) {
    console.error("renameConversation", error);
    return false;
  }
};

/**
 * Aggiunge o rimuove una conversazione da una cartella
 * @param {*} conversationId
 * @param {*} workspaceId
 * @param {*} folderId
 * @param {*} newFolderId
 * @returns
 */
const addConversationToFolder = async (
  conversationId,
  workspaceId,
  folderId,
  newFolderId
) => {
  if (folderId === newFolderId) return;
  let res;
  if (newFolderId === -1) {
    res = await apiClient.post(`/remove_chat_session_from_folder`, {
      conversationId: conversationId,
    });
  } else {
    res = await apiClient.post(`/add_chat_session_to_folder`, {
      conversationId: conversationId,
      destFolderId: newFolderId,
    });
  }

  if (res.status !== 200) {
    console.error("addConversationToFolder", res.data);
    return;
  }

  // Aggiorna lo store
  store.getActions().chat.moveConversationToFolder({
    conversationId,
    workspaceId,
    folderId,
    newFolderId,
  });
};

export const ConversationService = {
  addConversationToFolder,
  createConversation,
  getConversation,
  sendMessage,
  sendFeedback,
  getFileUploadUrl,
  processFile,
  openNewConversation,
  openConversation,
  fetchAndLoadWorkspaceConversations,
  deleteConversation,
  renameConversation,
  queryHealth,
};
