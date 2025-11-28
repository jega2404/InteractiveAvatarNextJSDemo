import React, { useMemo, useState } from "react";
import {
  AvatarQuality,
  ElevenLabsModel,
  STTProvider,
  VoiceEmotion,
  StartAvatarRequest,
  VoiceChatTransport,
} from "@heygen/streaming-avatar";

import { Input } from "../Input";
import { Select } from "../Select";
import { Field } from "./Field";
import { AVATARS, STT_LANGUAGE_LIST } from "@/app/lib/constants";


interface AvatarConfigProps {
  config: StartAvatarRequest;
  onConfigChange: (config: StartAvatarRequest) => void;
}

export const AvatarConfig: React.FC<AvatarConfigProps> = ({
  config,
  onConfigChange,
}) => {
  const [showMore, setShowMore] = useState(false);

  const selectedAvatar = useMemo(() => {
    const avatar = AVATARS.find((a) => a.avatar_id === config.avatarName);
    return avatar
      ? { isCustom: false, name: avatar.name, avatarId: avatar.avatar_id }
      : { isCustom: true, name: "Custom Avatar ID", avatarId: null };
  }, [config.avatarName]);

  const onChange = <T extends keyof StartAvatarRequest>(key: T, value: StartAvatarRequest[T]) => {
    onConfigChange({ ...config, [key]: value });
  };

  return (
    <div className="relative flex flex-col gap-4 w-[550px] py-8 max-h-full overflow-y-auto px-4">
      <Field label="Custom Knowledge Base ID">
        <Input
          placeholder="Enter custom knowledge base ID"
          value={config.knowledgeId || ""}
          onChange={(v) => onChange("knowledgeId", v)}
        />
      </Field>

      <Field label="Avatar ID">
        <Select
          options={[...AVATARS, "CUSTOM"]}
          value={selectedAvatar.isCustom ? "Custom Avatar ID" : selectedAvatar.name}
          isSelected={(option) =>
            typeof option === "string" ? selectedAvatar.isCustom : option.avatar_id === selectedAvatar.avatarId
          }
          renderOption={(option) => (typeof option === "string" ? "Custom Avatar ID" : option.name)}
          onSelect={(option) => {
            if (typeof option === "string") onChange("avatarName", "");
            else onChange("avatarName", option.avatar_id);
          }}
        />
      </Field>

      {selectedAvatar.isCustom && (
        <Field label="Custom Avatar ID">
          <Input
            placeholder="Enter custom avatar ID"
            value={config.avatarName || ""}
            onChange={(v) => onChange("avatarName", v)}
          />
        </Field>
      )}

      <Field label="Language">
        <Select
          options={STT_LANGUAGE_LIST}
          value={STT_LANGUAGE_LIST.find((l) => l.value === config.language)?.label}
          isSelected={(option) => option.value === config.language}
          renderOption={(option) => option.label}
          onSelect={(option) => onChange("language", option.value)}
        />
      </Field>

      <Field label="Avatar Quality">
        <Select
          options={Object.values(AvatarQuality)}
          value={config.quality}
          isSelected={(option) => option === config.quality}
          renderOption={(option) => option}
          onSelect={(option) => onChange("quality", option)}
        />
      </Field>

      <Field label="Voice Chat Transport">
        <Select
          options={Object.values(VoiceChatTransport)}
          value={config.voiceChatTransport}
          isSelected={(option) => option === config.voiceChatTransport}
          renderOption={(option) => option}
          onSelect={(option) => onChange("voiceChatTransport", option)}
        />
      </Field>

      {showMore && (
        <>
          <h1 className="text-zinc-100 w-full text-center mt-5">Voice Settings</h1>
          <Field label="Custom Voice ID">
            <Input
              placeholder="Enter custom voice ID"
              value={config.voice?.voiceId || ""}
              onChange={(v) => onChange("voice", { ...config.voice, voiceId: v })}
            />
          </Field>
          <Field label="Emotion">
            <Select
              options={Object.values(VoiceEmotion)}
              value={config.voice?.emotion}
              isSelected={(option) => option === config.voice?.emotion}
              renderOption={(option) => option}
              onSelect={(option) => onChange("voice", { ...config.voice, emotion: option })}
            />
          </Field>
          <Field label="ElevenLabs Model">
            <Select
              options={Object.values(ElevenLabsModel)}
              value={config.voice?.model}
              isSelected={(option) => option === config.voice?.model}
              renderOption={(option) => option}
              onSelect={(option) => onChange("voice", { ...config.voice, model: option })}
            />
          </Field>

          <h1 className="text-zinc-100 w-full text-center mt-5">STT Settings</h1>
          <Field label="Provider">
            <Select
              options={Object.values(STTProvider)}
              value={config.sttSettings?.provider}
              isSelected={(option) => option === config.sttSettings?.provider}
              renderOption={(option) => option}
              onSelect={(option) => onChange("sttSettings", { ...config.sttSettings, provider: option })}
            />
          </Field>
        </>
      )}

      <button
        className="text-zinc-400 text-sm cursor-pointer w-full text-center bg-transparent"
        onClick={() => setShowMore(!showMore)}
      >
        {showMore ? "Show less" : "Show more..."}
      </button>
    </div>
  );
};
