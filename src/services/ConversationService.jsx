import { store } from "../store/index.jsx";
import { lambdaClient, apiClient } from "./ApiService.jsx";

const createConversation = async () => {
  // Crea la nuova conversazione lato server
  const res = await lambdaClient.post("/conversation");
  if (!res?.data?.conversationid)
    throw new Error("Failed to create conversation");

  console.log("Created new conversation=", res.data);

  const actions = store.getActions();

  // Aggiunge la nuova conversazione in cima alla lista
  actions.chat.setConversations([
    {
      conversationId: res.data.conversationid,
      title: undefined,
      date: new Date(),
    },
    ...store.getState().chat.conversations,
  ]);

  // Imposta l'ID della conversazione come attiva
  actions.chat.setConversationId(res.data.conversationid);

  return res.data;
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
  return await apiClient.post(`/give_feedback`, {
    runid: runid,
    feedback: feedback,
  });
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
    const actions = store.getActions();
    actions.chat.setConversations(res.data.conversations);
  } catch (error) {
    console.error("fetchAllConversations", error);
  }
};

//fetchAllConversations();

const openConversation = async (conversationId) => {
  try {
    store.getActions().chat.setConversationId(conversationId);
    store.getActions().chat.setLoading(true);
    store.getActions().chat.setMessages([]);
    const conversation = await getConversation(conversationId);
    if (!conversation) {
      store.getActions().chat.setLoading(false);
      return;
    }
    store.getActions().chat.setMessages(conversation.messages);
  } catch (error) {
    console.error(error);
  } finally {
    store.getActions().chat.setLoading(false);
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
};
