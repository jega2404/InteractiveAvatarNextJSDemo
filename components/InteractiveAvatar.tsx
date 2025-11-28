"use client";

import {
  AvatarQuality,
  StreamingEvents,
  StartAvatarRequest,
} from "@heygen/streaming-avatar";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";

import { StreamingAvatarSessionState } from "./logic/context";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";

import { Button } from "./Button";
import { AvatarConfig } from "./AvatarConfig";
import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { AvatarControls } from "./AvatarSession/AvatarControls";
import { LoadingIcon } from "./Icons";
import { MessageHistory } from "./AvatarSession/MessageHistory";

import { AVATARS } from "@/app/lib/constants";

declare global {
  interface Window {
    _avatarInstance: any;
  }
}

const DEFAULT_CONFIG: StartAvatarRequest = {
  avatarName: AVATARS[0].avatar_id,
  quality: AvatarQuality.High,
};

export default function InteractiveAvatar() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();

  const mediaStream = useRef<HTMLVideoElement>(null);
  const [config, setConfig] = useState<StartAvatarRequest>(DEFAULT_CONFIG);

  const avatarSpeak = async (englishText: string) => {
    try {
      const translateRes = await fetch("/api/translate", {
        method: "POST",
        body: JSON.stringify({ text: englishText }),
      });

      const { text: arabicText } = await translateRes.json();

      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        body: JSON.stringify({ text: arabicText }),
      });

      const { audio } = await ttsRes.json();

      if (window._avatarInstance) {
        window._avatarInstance.playAudio?.(audio);
      }
    } catch {}
  };

  const startSession = useMemoizedFn(async () => {
    try {
      const avatar = initAvatar();
      window._avatarInstance = avatar;
      avatar.on(StreamingEvents.STREAM_READY, () => {});
      await startAvatar(config);
    } catch {}
  });

  useUnmount(() => {
    stopAvatar().catch(() => {});
  });

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => mediaStream.current?.play();
    }
  }, [stream]);

  const renderMainContent = () => {
    switch (sessionState) {
      case StreamingAvatarSessionState.INACTIVE:
        return <AvatarConfig config={config} onConfigChange={setConfig} />;
      case StreamingAvatarSessionState.CONNECTED:
        return <AvatarVideo ref={mediaStream} />;
      default:
        return <LoadingIcon />;
    }
  };

  const renderControls = () => {
    switch (sessionState) {
      case StreamingAvatarSessionState.CONNECTED:
        return (
          <div className="flex flex-col gap-4">
            <Button onClick={() => avatarSpeak("Hello, how can I help you?")}>
              Test Arabic Voice
            </Button>

            <AvatarControls />
          </div>
        );
      case StreamingAvatarSessionState.INACTIVE:
        return <Button onClick={startSession}>Start Avatar</Button>;
      default:
        return <LoadingIcon />;
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col rounded-xl bg-zinc-900 overflow-hidden">
        <div className="relative w-full aspect-video">{renderMainContent()}</div>
        <div className="p-4 border-t border-zinc-700">{renderControls()}</div>
      </div>

      {sessionState === StreamingAvatarSessionState.CONNECTED && <MessageHistory />}
    </div>
  );
}
