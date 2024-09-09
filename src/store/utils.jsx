import { store } from ".";

export const clearStore = () => {
  // Svuota lo store
  store.getActions().chat.reset();
  store.persist.clear();
  store.persist.flush();
};
