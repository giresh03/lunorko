import { Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";

interface VoiceAssistantProps {
  supported: boolean;
  listening: boolean;
  speaking: boolean;
  transcript: string;
  error: string | null;
  voiceEnabled: boolean;
  disabled?: boolean;
  accent: string;
  muted: string;
  onToggleListening: () => void;
  onToggleVoice: () => void;
  onStopSpeaking: () => void;
}

const VoiceAssistant = ({
  supported, listening, speaking, transcript, error, voiceEnabled,
  disabled, accent, muted, onToggleListening, onToggleVoice, onStopSpeaking,
}: VoiceAssistantProps) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleListening}
          disabled={disabled || !supported}
          title={supported ? (listening ? "Stop listening" : "Speak a command") : "Voice input not supported in this browser"}
          className="relative flex h-7 w-7 items-center justify-center rounded-full transition-all disabled:opacity-40"
          style={{
            backgroundColor: listening ? accent : accent + "18",
            color: listening ? "#ffffff" : accent,
            boxShadow: listening ? `0 0 0 4px ${accent}33` : "none",
          }}
        >
          {listening && (
            <span
              className="absolute inset-0 animate-ping rounded-full"
              style={{ backgroundColor: accent, opacity: 0.35 }}
            />
          )}
          {supported ? <Mic className="relative h-3.5 w-3.5" /> : <MicOff className="relative h-3.5 w-3.5" />}
        </button>

        <button
          type="button"
          onClick={speaking ? onStopSpeaking : onToggleVoice}
          title={speaking ? "Stop speaking" : voiceEnabled ? "Voice replies on" : "Voice replies off"}
          className="flex h-7 w-7 items-center justify-center rounded-full transition-colors"
          style={{ color: voiceEnabled || speaking ? accent : muted, backgroundColor: (voiceEnabled || speaking) ? accent + "18" : "transparent" }}
        >
          {speaking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : voiceEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
        </button>

        {(listening || transcript) && (
          <span
            className="flex-1 truncate rounded-full px-2 py-0.5 text-[10px]"
            style={{ backgroundColor: accent + "12", color: accent }}
          >
            {transcript || "Listening…"}
          </span>
        )}
      </div>
      {error && <p className="text-[9px]" style={{ color: "#ef4444" }}>{error}</p>}
    </div>
  );
};

export default VoiceAssistant;
