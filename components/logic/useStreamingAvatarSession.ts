import StreamingAvatar, {
  StartAvatarRequest,
  StreamingEvents,
  TaskMode,
  TaskType,
} from "@heygen/streaming-avatar";
import { useCallback } from "react";

import {
  StreamingAvatarSessionState,
  useStreamingAvatarContext,
} from "./context";
import { useVoiceChat } from "./useVoiceChat";
import { useMessageHistory } from "./useMessageHistory";

import { askFaq } from "@/app/api/utils/askFaq";

// ------------------- GOOGLE TRANSLATE -------------------
async function translateToArabic(text: string): Promise<string> {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const projectId = process.env.GOOGLE_PROJECT_ID;

    const url = `https://translation.googleapis.com/v3/projects/${projectId}:translateText`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        contents: [text],
        targetLanguageCode: "ar",
        sourceLanguageCode: "en",
      }),
    });

    const data = await response.json();

    return data?.translations?.[0]?.translatedText || text;
  } catch {
    return text;
  }
}

// ---------------------- MAIN HOOK ----------------------
export const useStreamingAvatarSession = () => {
  const {
    avatarRef,
    basePath,
    sessionState,
    setSessionState,
    stream,
    setStream,
    setIsListening,
    setIsUserTalking,
    setIsAvatarTalking,
    setConnectionQuality,
    handleUserTalkingMessage,
    handleStreamingTalkingMessage,
    handleEndMessage,
    clearMessages,
  } = useStreamingAvatarContext();

  const { stopVoiceChat } = useVoiceChat();

  useMessageHistory();

  // ------------------- INIT AVATAR -------------------
  const init = useCallback(() => {
    const token = process.env.NEXT_PUBLIC_HEYGEN_API_KEY;

    if (!token) throw new Error("HeyGen key missing");

    avatarRef.current = new StreamingAvatar({ token, basePath });

    // Fallback functions — return Promise<void> to match SDK signature
    (avatarRef.current as any).startVoiceChat = async () => {
      console.warn("⚠ startVoiceChat not provided by SDK (fallback)");
      setIsListening(true);
      return Promise.resolve();
    };

    (avatarRef.current as any).startTextChat = async () => {
      console.warn("⚠ startTextChat not provided by SDK (fallback)");
      return Promise.resolve();
    };

    (avatarRef.current as any).start = async (config: StartAvatarRequest) => {
      console.warn("⚠ start() not provided by SDK (fallback)");
      return Promise.resolve();
    };

    (avatarRef.current as any).stop = async () => {
      console.warn("⚠ stop() not provided by SDK (fallback)");
      return Promise.resolve();
    };

    if (typeof window !== "undefined") {
      window._avatarInstance = avatarRef.current;
    }

    return avatarRef.current;
  }, [avatarRef, basePath, setIsListening]);

  // ------------------- HANDLE STREAM -------------------
  const handleStream = useCallback(
    ({ detail }: { detail: MediaStream }) => {
      setStream(detail);
      setSessionState(StreamingAvatarSessionState.CONNECTED);
    },
    [setStream, setSessionState],
  );

  // ------------------- STOP SESSION -------------------
  const stop = useCallback(async () => {
    try {
      avatarRef.current?.off(StreamingEvents.STREAM_READY, handleStream);
      avatarRef.current?.off(StreamingEvents.STREAM_DISCONNECTED, stop);
    } catch {}

    clearMessages();
    stopVoiceChat();

    setIsListening(false);
    setIsUserTalking(false);
    setIsAvatarTalking(false);

    await (avatarRef.current as any)?.stop();

    setStream(null);
    setSessionState(StreamingAvatarSessionState.INACTIVE);
  }, [
    avatarRef,
    clearMessages,
    handleStream,
    setIsAvatarTalking,
    setIsListening,
    setIsUserTalking,
    setSessionState,
    setStream,
    stopVoiceChat,
  ]);

  // ------------------- START AVATAR -------------------
  const start = useCallback(
    async (config: StartAvatarRequest) => {
      if (sessionState !== StreamingAvatarSessionState.INACTIVE) {
        throw new Error("Session already active");
      }

      if (!avatarRef.current) init();
      const avatar = avatarRef.current!;

      setSessionState(StreamingAvatarSessionState.CONNECTING);

      avatar.on(StreamingEvents.STREAM_READY, handleStream);
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, stop);

      avatar.on(StreamingEvents.CONNECTION_QUALITY_CHANGED, ({ detail }) =>
        setConnectionQuality(detail),
      );

      avatar.on(StreamingEvents.USER_START, () => setIsUserTalking(true));
      avatar.on(StreamingEvents.USER_STOP, () => setIsUserTalking(false));

      avatar.on(StreamingEvents.AVATAR_START_TALKING, () =>
        setIsAvatarTalking(true),
      );
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () =>
        setIsAvatarTalking(false),
      );

      avatar.on(StreamingEvents.USER_TALKING_MESSAGE, handleUserTalkingMessage);
      avatar.on(
        StreamingEvents.AVATAR_TALKING_MESSAGE,
        handleStreamingTalkingMessage,
      );

      avatar.on(StreamingEvents.USER_END_MESSAGE, async (event) => {
        const english = event.detail?.text?.trim() || "";
        if (!english) return;

        const englishAns = await askFaq(english);
        const arabicAns = await translateToArabic(englishAns);

        await avatar.speak({
          text: arabicAns,
          taskType: TaskType.TALK,
          taskMode: TaskMode.ASYNC,
        });
      });

      avatar.on(StreamingEvents.AVATAR_END_MESSAGE, () => handleEndMessage?.());

      await (avatar as any).start(config);

      return avatar;
    },
    [
      sessionState,
      avatarRef,
      init,
      handleStream,
      stop,
      setConnectionQuality,
      setIsUserTalking,
      setIsAvatarTalking,
      handleUserTalkingMessage,
      handleStreamingTalkingMessage,
      handleEndMessage,
    ],
  );

  return {
    avatarRef,
    sessionState,
    stream,
    initAvatar: init,
    startAvatar: start,
    stopAvatar: stop,
  };
};
