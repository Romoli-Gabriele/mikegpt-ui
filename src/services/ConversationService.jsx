import { DEFAULT_CHAT_NAME } from "../config.jsx";
import { store } from "../store/index.jsx";
import { lambdaClient, apiClient } from "./ApiService.jsx";
import { tryToConvertToArrayHelper } from "./utils.jsx";
import { WorkspaceService } from "./WorkspaceService.jsx";

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

const getConversation = async (conversationId) => {
  return await lambdaClient.get(`/conversation/${conversationId}`);
};

const queryHealth = async () => {
  try {
    const x = await apiClient.get(`/health`);
    console.log("Health:", x.data.message);
  } catch (error) {
    console.error("queryHealth", error);
  }
};
queryHealth();

const sendMessage = async (
  conversationId,
  message,
  kwargs = {},
  debugAB = null
) => {
  try {
    const data = await apiClient.post(`/query`, {
      question: message,
      //   kwargs: kwargs,
      conversationid: conversationId,
      ...(debugAB ? { debugAB: debugAB } : {}),
    });
    return data.data;
  } catch (error) {
    console.error("sendMessage", error);
  }
};

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

const openNewConversation = () => {
  store.getActions().chat.setMessages([]);
  store.getActions().chat.setConversationId(null);
  store.getActions().chat.setLoading(false); // potrebbe essere in corso un caricamentonella vecchia conversazione
};

const fetchConversationById = async (conversationId) => {
  return {
    conversationId: conversationId,
    messages: [],
  };
};

const fetchAllConversations = async () => {
  try {
    console.log("fetchAllConversations");
    const res = await lambdaClient.get("/list_chat_sessions");
    if (!res?.data?.conversations)
      throw new Error("Failed to fetch conversations");

    console.log("fetchAllConversations", res.data);
    // const actions = store.getActions();
    // actions.chat.setConversations(res.data.conversations);
  } catch (error) {
    console.error("fetchAllConversations", error);
  }
};

//fetchAllConversations();

const openConversation = async (conversationId) => {
  try {
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
    console.log("fetched conversation", messages);
    store.getActions().chat.setMessages(messages);
  } catch (error) {
    console.error(error);
  } finally {
    store.getActions().chat.setLoading(false);
  }
};

const formatMessage = (message) => {
  return {
    data: {
      content: message.message,
      documents: tryToConvertToArrayHelper(message.docs),
      runid: message.runid,
    },
    type: message.type,
  };
};

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
 *  Richiede al server e carica nello store tutte le conversazioni
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

const deleteConversation = async (conversationId) => {
  console.log("deleteConversation", conversationId);
  try {
    const res = await apiClient.post(`/delete_chat_session`, {
      chatSessionId: conversationId,
    });

    if (res.status !== 200) return false;

    // Rimuove la conversazione dallo store
    store.getActions().chat.removeConversation({
      conversationId: conversationId,
      workspaceId: store.getState().chat.currentWorkspaceId,
      folderId: WorkspaceService.checkAndGetCurrentFolderId(),
    });
  } catch (error) {
    console.error("deleteConversation", error);
    return false;
  }
};

export const ConversationService = {
  createConversation,
  getConversation,
  sendMessage,
  sendFeedback,
  getFileUploadUrl,
  processFile,
  openNewConversation,
  fetchConversationById,
  openConversation,
  fetchAndLoadWorkspaceConversations,
  deleteConversation,
};
