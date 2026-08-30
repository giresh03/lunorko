import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Sparkles, Bug, Lightbulb, BookOpen, HelpCircle, Loader2 } from "lucide-react";
import type { LevelDef } from "@/lib/learningRoadmap";

interface Props {
  domainName: string;
  level: LevelDef;
  code: string;
  challenge: unknown | null;
}

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const QUICK = [
  { label: "Explain", icon: BookOpen, prompt: "Explain this level's concepts to me clearly with a small example." },
  { label: "Give Hint", icon: Lightbulb, prompt: "Give me a hint for what I'm working on — do not reveal the full answer." },
  { label: "Find Bug", icon: Bug, prompt: "Look at my current code and tell me exactly what is wrong and why." },
  { label: "Show Example", icon: Sparkles, prompt: "Show me a short worked example using this level's concepts." },
  { label: "Quiz Me", icon: HelpCircle, prompt: "Quiz me with 3 short questions on this level, one at a time." },
];

const LevelTutor = ({ domainName, level, code, challenge }: Props) => {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: `Hey! I'm your ${domainName} tutor for Level ${level.index} — ${level.title}. Ask me anything, or tap a quick action below.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("level-coach", {
        body: {
          mode: "chat",
          domain_name: domainName,
          level_index: level.index,
          level_title: level.title,
          tier: level.tier,
          concepts: level.concepts,
          message: text,
          history: next.slice(0, -1).slice(-8),
          code,
          challenge,
        },
      });
      if (error) throw error;
      setMessages((m) => [...m, { role: "assistant", content: data?.reply || "I couldn't answer that — try rephrasing." }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `I hit an error reaching the tutor service: ${(e as Error).message}` },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 1e6, behavior: "smooth" }));
    }
  };

  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xl">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Bot className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">AI Tutor</p>
          <p className="text-[11px] text-muted-foreground">Level {level.index} · {level.title}</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[92%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-auto bg-primary/15 text-foreground"
                : "bg-muted/50 text-foreground/90"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
          </div>
        )}
      </div>

      <div className="border-t border-border/60 p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {QUICK.map((q) => (
            <Button
              key={q.label}
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-[11px]"
              disabled={loading}
              onClick={() => send(q.prompt)}
            >
              <q.icon className="h-3 w-3" /> {q.label}
            </Button>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your tutor…"
            className="h-9 text-sm"
          />
          <Button type="submit" size="sm" className="h-9" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LevelTutor;
