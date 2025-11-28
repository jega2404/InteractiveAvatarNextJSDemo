import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";
import React from "react";

import { useStreamingAvatarSession } from "../logic/useStreamingAvatarSession";
import { useInterrupt } from "../logic/useInterrupt";
import { Button } from "../Button";

import { AudioInput } from "./AudioInput";
import { TextInput } from "./TextInput";

export const AvatarControls: React.FC = () => {
  const { avatarRef } = useStreamingAvatarSession();
  const { interrupt } = useInterrupt();

  // Determine if voice chat is active
  const isVoiceChatActive = !!avatarRef.current?.stopListening;
  const isVoiceChatLoading = false; // You can update with actual loading state if available

  const startVoiceChat = async () => {
    if (avatarRef.current?.startVoiceChat) {
      await avatarRef.current.startVoiceChat({ isInputAudioMuted: false });
    }
  };

  const stopVoiceChat = async () => {
    if (avatarRef.current?.closeVoiceChat) {
      await avatarRef.current.closeVoiceChat();
    }
  };

  return (
    <div className="flex flex-col gap-3 relative w-full items-center">
      <ToggleGroup
        className={`bg-zinc-700 rounded-lg p-1 ${isVoiceChatLoading ? "opacity-50" : ""}`}
        disabled={isVoiceChatLoading}
        type="single"
        value={isVoiceChatActive || isVoiceChatLoading ? "voice" : "text"}
        onValueChange={(value) => {
          if (value === "voice" && !isVoiceChatActive && !isVoiceChatLoading) {
            startVoiceChat();
          } else if (value === "text" && isVoiceChatActive && !isVoiceChatLoading) {
            stopVoiceChat();
          }
        }}
      >
        <ToggleGroupItem
          className="data-[state=on]:bg-zinc-800 rounded-lg p-2 text-sm w-[90px] text-center"
          value="voice"
        >
          Voice Chat
        </ToggleGroupItem>
        <ToggleGroupItem
          className="data-[state=on]:bg-zinc-800 rounded-lg p-2 text-sm w-[90px] text-center"
          value="text"
        >
          Text Chat
        </ToggleGroupItem>
      </ToggleGroup>

      {isVoiceChatActive || isVoiceChatLoading ? <AudioInput /> : <TextInput />}

      <div className="absolute top-[-70px] right-3">
        <Button className="!bg-zinc-700 !text-white" onClick={interrupt}>
          Interrupt
        </Button>
      </div>
    </div>
  );
};
