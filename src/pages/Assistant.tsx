import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Send, Loader2, Sparkles, Flame, Trophy, Bookmark } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VoiceAssistant from "@/components/editor/VoiceAssistant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { useSiteAssistant } from "@/hooks/useSiteAssistant";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { useGamification } from "@/hooks/useGamification";
import { useDashboard } from "@/hooks/useDashboard";
import { Link } from "react-router-dom";

const SUGGESTIONS = [
  "How am I doing so far?",
  "Take me to my dashboard",
  "What should I learn next?",
  "Open web development",
];

const Assistant = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bootstrapped = useRef(false);

  const {
    threads, messages, loadingThreads, loadingMessages, sending, error,
    createThread, openOrCreateThread, deleteThread, send,
  } = useSiteAssistant(threadId ?? null);

  const voice = useVoiceAssistant({
    onFinalTranscript: (text) => {
      handleSend(text);
    },
  });

  const gamification = useGamification();
  const { progress, bookmarks } = useDashboard();

  const totalTopics = useMemo(
    () => progress.reduce((sum, p) => sum + (p.completed_topics?.length ?? 0), 0),
    [progress],
  );

  // Pick or create a thread when landing on /assistant
  useEffect(() => {
    if (authLoading || !user || threadId || loadingThreads || bootstrapped.current) return;
    bootstrapped.current = true;
    if (threads.length > 0) {
      navigate(`/assistant/${threads[0].id}`, { replace: true });
    } else {
      openOrCreateThread().then((id) => {
        if (id) navigate(`/assistant/${id}`, { replace: true });
        else bootstrapped.current = false;
      });
    }
  }, [authLoading, user, threadId, loadingThreads, threads, openOrCreateThread, navigate]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId, sending]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const handleSend = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || sending) return;
    setInput("");
    const result = await send(text, window.location.pathname);
    if (result?.reply && voice.voiceEnabled) voice.speak(result.reply);
    inputRef.current?.focus();
  };

  const handleNewThread = async () => {
    const id = await createThread();
    if (id) navigate(`/assistant/${id}`);
  };

  const handleDelete = async (id: string) => {
    await deleteThread(id);
    if (id === threadId) {
      const next = threads.find((t) => t.id !== id);
      navigate(next ? `/assistant/${next.id}` : "/assistant", { replace: true });
      bootstrapped.current = false;
    }
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
          <Sparkles className="mb-4 h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold">Your personal AI assistant</h1>
          <p className="mt-2 max-w-md text-muted-foreground">
            Sign in and your own assistant will track your progress, answer questions about the platform, and take you wherever you need to go.
          </p>
          <Button asChild className="btn-sheen mt-6 bg-gradient-to-r from-primary to-primary-glow font-semibold text-primary-foreground shadow-glow">
            <Link to="/auth">Sign in to continue</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pb-16 pt-24">
        <header className="mb-6">
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Your AI <span className="text-primary">Assistant</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask about your progress, get guidance, or just say “take me to pricing”.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5">
              <Trophy className="h-3.5 w-3.5 text-primary" /> Level {gamification.xp?.level ?? 1} · {gamification.xp?.total_xp ?? 0} XP
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5">
              <Flame className="h-3.5 w-3.5 text-primary" /> {gamification.xp?.current_streak ?? 0}-day streak
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> {totalTopics} topics done
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5">
              <Bookmark className="h-3.5 w-3.5 text-primary" /> {bookmarks.length} bookmarks
            </span>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          {/* Threads */}
          <aside className="rounded-2xl border border-border/60 bg-card/40 p-3">
            <Button onClick={handleNewThread} variant="outline" size="sm" className="mb-3 w-full border-border/70">
              <Plus className="mr-1.5 h-4 w-4" /> New chat
            </Button>
            <ScrollArea className="h-[240px] lg:h-[52vh]">
              <div className="space-y-1 pr-2">
                {loadingThreads && <p className="px-2 py-4 text-xs text-muted-foreground">Loading chats…</p>}
                {!loadingThreads && threads.length === 0 && (
                  <p className="px-2 py-4 text-xs text-muted-foreground">No chats yet.</p>
                )}
                {threads.map((t) => (
                  <div
                    key={t.id}
                    className={`group flex items-center gap-1 rounded-lg px-1 transition-colors ${
                      t.id === threadId ? "bg-primary/10" : "hover:bg-muted/40"
                    }`}
                  >
                    <button
                      onClick={() => navigate(`/assistant/${t.id}`)}
                      className={`flex-1 truncate px-2 py-2 text-left text-sm ${
                        t.id === threadId ? "font-medium text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {t.title}
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      aria-label="Delete chat"
                      className="rounded p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </aside>

          {/* Chat */}
          <section className="flex h-[68vh] flex-col rounded-2xl border border-border/60 bg-card/40">
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
              {loadingMessages && <p className="text-xs text-muted-foreground">Loading messages…</p>}
              {!loadingMessages && messages.length === 0 && (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow shadow-glow">
                    <Sparkles className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Hey! I know your progress and every corner of Lunor.AI. Ask me anything.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSend(s)}
                        className="rounded-full border border-border/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground"
                        : "border border-border/60 bg-muted/30 text-foreground"
                    } ${m.pending ? "opacity-70" : ""}`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/30 px-4 py-2.5 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> thinking…
                  </div>
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
                  disabled={sending}
                  accent="hsl(var(--primary))"
                  muted="hsl(var(--muted-foreground))"
                  onToggleListening={voice.toggleListening}
                  onToggleVoice={() => voice.setVoiceEnabled(!voice.voiceEnabled)}
                  onStopSpeaking={voice.stopSpeaking}
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Ask your assistant anything…"
                  disabled={sending}
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={sending || !input.trim()}
                  className="btn-sheen bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-glow"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Assistant;
