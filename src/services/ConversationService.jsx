import {lambdaClient, apiClient} from "./ApiService.jsx";

const addConversation = async () => {
    return await lambdaClient.post('/conversation')
}

const getConversation = async (conversationId) => {
    return await lambdaClient.get(`/conversation/${conversationId}`)
}

const sendMessage = async (conversationId, message, debugAB = null) => {
    return await apiClient.post(`/`, {
        question: message,
        conversationid: conversationId,
        ... (debugAB ? { debugAB: debugAB } : {})
    })
}

const sendFeedback = async (runid, feedback) => {
    return await apiClient.post(`/give_feedback`, {
        runid: runid,
        feedback: feedback
    })
}

const getFileUploadUrl = async (file_name) => {
    return await lambdaClient.post(`/document/upload`, {
        file_name: file_name,
    })
}

const processFile = async (file_name, file_title, file_date) => {
    return await lambdaClient.post(`/document/process`, {
        file_name: file_name,
        file_title: file_title,
        file_date: file_date,
    })
}

export const ConversationService = {
    addConversation,
    getConversation,
    sendMessage,
    sendFeedback,
    getFileUploadUrl,
    processFile
}
