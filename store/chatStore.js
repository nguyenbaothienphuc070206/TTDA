import { create } from "zustand";

export const useChatStore = create((set) => ({
  messages: [],
  setMessages: (messages) => set({ messages: Array.isArray(messages) ? messages : [] }),
  pushMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  clearMessages: () => set({ messages: [] }),
}));
