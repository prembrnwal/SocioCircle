import { create } from 'zustand';
import type { ChatMessage } from '../types';

interface ChatState {
  activeSessionId: number | null;
  messages: Record<number, ChatMessage[]>;
  isConnected: boolean;
  setActiveSession: (sessionId: number | null) => void;
  addMessage: (sessionId: number, message: ChatMessage) => void;
  setMessages: (sessionId: number, messages: ChatMessage[]) => void;
  setConnected: (connected: boolean) => void;
  clearMessages: (sessionId: number) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeSessionId: null,
  messages: {},
  isConnected: false,
  setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),
  addMessage: (sessionId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [sessionId]: [...(state.messages[sessionId] || []), message],
      },
    })),
  setMessages: (sessionId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [sessionId]: messages,
      },
    })),
  setConnected: (connected) => set({ isConnected: connected }),
  clearMessages: (sessionId) =>
    set((state) => {
      const newMessages = { ...state.messages };
      delete newMessages[sessionId];
      return { messages: newMessages };
    }),
}));
