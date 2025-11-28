// components/logic/useMessageHistory.ts
import { useCallback } from "react";
import { useStreamingAvatarContext, MessageSender } from "./context";

export const useMessageHistory = () => {
  const { messages, setMessages } = useStreamingAvatarContext();

  const addMessage = useCallback(
    (sender: MessageSender, content: string) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), sender, content },
      ]);
    },
    [setMessages]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  return {
    messages,
    addMessage,
    clearMessages,
  };
};
