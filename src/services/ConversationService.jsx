import { store } from "../store/index.jsx";
import { lambdaClient, apiClient } from "./ApiService.jsx";

const addConversation = async () => {
  return await lambdaClient.post("/conversation");
};

const getConversation = async (conversationId) => {
  return await lambdaClient.get(`/conversation/${conversationId}`);
};

const sendMessage = async (
  conversationId,
  message,
  kwargs = {},
  debugAB = null
) => {
  return await apiClient.post(`/`, {
    question: message,
    kwargs: kwargs,
    conversationid: conversationId,
    ...(debugAB ? { debugAB: debugAB } : {}),
  });
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

const createNewConversation = () => {
  if (store.getState().chat.messages?.length > 0) {
    store.getActions().chat.setMessages([]);
    store.getActions().chat.setConversationId(null);
    store.getActions().chat.setLoading(false); // potrebbe essere in corso un caricamentonella vecchia conversazione
  }
};

export const ConversationService = {
  addConversation,
  getConversation,
  sendMessage,
  sendFeedback,
  getFileUploadUrl,
  processFile,
  createNewConversation,
};
