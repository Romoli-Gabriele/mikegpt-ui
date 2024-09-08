import { createStore, persist } from "easy-peasy";
import { chatModel } from "./chat";

const model = {
  chat: persist(chatModel),
};

export const store = createStore(model);
