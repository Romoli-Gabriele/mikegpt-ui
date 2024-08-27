import { createStore } from "easy-peasy";
import { chatModel } from "./chat";

const model = {
  chat: chatModel,
};

export const store = createStore(model);
