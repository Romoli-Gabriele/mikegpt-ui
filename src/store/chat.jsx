import { action } from "easy-peasy";

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

  conversations: [
    {
      conversationId: "1",
      title: "Fake uno",
      date: new Date(),
    },
    {
      conversationId: "2",
      title: "Fake due",
      date: (function () {
        const d = new Date();
        d.setDate(new Date().getDate() - 1);
        return d;
      })(),
    },
    {
      conversationId: "3",
      title: "Fake 3",
      date: (function () {
        const d = new Date();
        d.setDate(new Date().getDate() - 3);
        return d;
      })(),
    },
    {
      conversationId: "4",
      title: "Fake 4",
      date: (function () {
        const d = new Date();
        d.setDate(new Date().getDate() - 10);
        return d;
      })(),
    },
  ],
  setConversations: action((state, payload) => {
    state.conversations = payload;
  }),

  workspaces: [],
  setWorkspaces: action((state, payload) => {
    state.workspaces = payload;
  }),
};
