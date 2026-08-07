import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles, X, Send, Loader2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VoiceAssistant from "@/components/editor/VoiceAssistant";
import { useAuth } from "@/hooks/useAuth";
import { useSiteAssistant } from "@/hooks/useSiteAssistant";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";

const HIDDEN_PREFIXES = ["/assistant", "/auth", "/reset-password", "/github/callback", "/visual-builder"];

const AssistantLauncher = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { threads, messages, sending, error, createThread, send, credits, outOfCredits } =
    useSiteAssistant(activeThread);
  const voice = useVoiceAssistant({ onFinalTranscript: (text) => handleSend(text) });

  // Attach to the most recent thread so the widget and the full page share history.
  useEffect(() => {
    if (!open || !user || activeThread) return;
    if (threads.length > 0) setActiveThread(threads[0].id);
    else createThread().then((id) => id && setActiveThread(id));
  }, [open, user, activeThread, threads, createThread]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, sending, activeThread]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const handleSend = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || sending) return;
    setInput("");
    const result = await send(text, location.pathname);
    if (result?.threadId) setActiveThread(result.threadId);
    if (result?.reply && voice.voiceEnabled) voice.speak(result.reply);
    inputRef.current?.focus();
  };

  if (!user) return null;
  if (HIDDEN_PREFIXES.some((p) => location.pathname.startsWith(p))) return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open your AI assistant"
          className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-glow transition-transform duration-300 hover:scale-110"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
          <Sparkles className="relative h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-40 flex h-[520px] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow shadow-glow">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Lunor Assistant</p>
                <p className="text-[10px] text-muted-foreground">knows your progress · can navigate for you</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate(activeThread ? `/assistant/${activeThread}` : "/assistant")}
                aria-label="Open full assistant"
                className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
                className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="py-6 text-center text-xs text-muted-foreground">
                <p>Hi! Try “how's my streak?” or “take me to the community”.</p>
                <Link to="/assistant" className="mt-2 inline-block text-primary hover:underline">
                  See all my chats
                </Link>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground"
                      : "border border-border/60 bg-muted/30"
                  } ${m.pending ? "opacity-70" : ""}`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> thinking…
              </div>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="border-t border-border/60 p-3">
            <div className="mb-2">
              <VoiceAssistant
                supported={voice.supported}
                listening={voice.listening}
                speaking={voice.speaking}
                transcript={voice.transcript}
                error={voice.error}
                voiceEnabled={voice.voiceEnabled}
                disabled={sending || outOfCredits}
                accent="hsl(var(--primary))"
                muted="hsl(var(--muted-foreground))"
                onToggleListening={voice.toggleListening}
                onToggleVoice={() => voice.setVoiceEnabled(!voice.voiceEnabled)}
                onStopSpeaking={voice.stopSpeaking}
              />
            </div>
            {credits && (
              <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{credits.balance} credits left</span>
                <Link to="/pricing" className="font-medium text-primary hover:underline">
                  Top up
                </Link>
              </div>
            )}
            {outOfCredits && (
              <p className="mb-2 rounded-md border border-primary/40 bg-primary/10 px-2 py-1.5 text-[11px] text-foreground">
                Out of AI credits.{" "}
                <Link to="/pricing" className="font-semibold text-primary hover:underline">
                  Top up for Rs50 / 20 credits
                </Link>
              </p>
            )}
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={outOfCredits ? "Out of credits — top up" : "Ask or say a command…"}
                disabled={sending || outOfCredits}
                className="h-9 text-sm"
              />
              <Button
                size="sm"
                onClick={() => handleSend()}
                disabled={sending || outOfCredits || !input.trim()}
                className="btn-sheen h-9 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-glow"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssistantLauncher;
