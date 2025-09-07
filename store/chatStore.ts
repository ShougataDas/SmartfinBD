import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChatMessage, MessageType, User, FinancialProfile } from "@/types";
import { ChatService } from "@/services/chatService";

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
}

interface ChatActions {
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  sendMessage: (
    text: string,
    user?: User,
    financialProfile?: FinancialProfile
  ) => Promise<void>;
  clearMessages: () => void;
  setTyping: (isTyping: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  clearError: () => void;
}

type ChatStore = ChatState & ChatActions;

const initialState: ChatState = {
  messages: [],
  isTyping: false,
  isLoading: false,
  error: null,
  conversationId: null,
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addMessage: (messageData: Omit<ChatMessage, "id" | "timestamp">) => {
        const newMessage: ChatMessage = {
          ...messageData,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
        };

        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },

      sendMessage: async (
        text: string,
        user?: User,
        financialProfile?: FinancialProfile
      ) => {
        const { addMessage, setTyping, setLoading } = get();

        // Add user message
        addMessage({
          userId: user?._id || "current_user",
          text,
          content: text,
          isUser: true,
          type: MessageType.Text,
        });

        // Set typing indicator
        setTyping(true);
        setLoading(true);
        set({ error: null });

        try {
          // Get AI response using ChatService
          const response = await ChatService.sendMessage(
            text,
            get().messages,
            user,
            financialProfile
          );

          if (response.success) {
            // Add AI message
            addMessage({
              userId: "ai_assistant",
              text: ChatService.formatMessage(response.message),
              content: ChatService.formatMessage(response.message),
              isUser: false,
              type: MessageType.Text,
            });
          } else {
            throw new Error(response.error || "Failed to get AI response");
          }
        } catch (error) {
          console.error("Chat error:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to get AI response",
          });

          // Add error message
          addMessage({
            userId: "ai_assistant",
            text: "দুঃখিত, আমি এই মুহূর্তে আপনার প্রশ্নের উত্তর দিতে পারছি না। অনুগ্রহ করে পরে আবার চেষ্টা করুন। 🙏",
            content:
              "দুঃখিত, আমি এই মুহূর্তে আপনার প্রশ্নের উত্তর দিতে পারছি না। অনুগ্রহ করে পরে আবার চেষ্টা করুন। 🙏",
            isUser: false,
            type: MessageType.Text,
          });
        } finally {
          setTyping(false);
          setLoading(false);
        }
      },

      clearMessages: () => {
        set({ messages: [] });
      },

      setTyping: (isTyping: boolean) => {
        set({ isTyping });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        messages: state.messages.slice(-50), // Keep only last 50 messages
        conversationId: state.conversationId,
      }),
    }
  )
);
