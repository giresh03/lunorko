import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Send, Bot, User, Loader2, Trash2, ArrowRightToLine, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { getDomainPromptConfig } from "@/lib/domainPrompts";
import { formatWebsiteAssistantMessage, generateFullStackWebsite, isWebsiteGenerationRequest } from "@/lib/fullStackWebsiteGenerator";
import { domains } from "@/lib/domains";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CodeAssistantProps {
  domainName: string;
  onSendToEditor?: (code: string, language: string) => void;
}

const CODE_ASSISTANT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/code-assistant`;

const CodeAssistant = ({ domainName, onSendToEditor }: CodeAssistantProps) => {
  const domainId = useMemo(() => {
    return domains.find(d => d.name === domainName)?.id ?? domainName.toLowerCase().replace(/\s+/g, "-");
  }, [domainName]);

  const promptConfig = useMemo(() => getDomainPromptConfig(domainId), [domainId]);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `👋 Hi! I'm your **${domainName}** AI assistant. Ask me anything — code generation, debugging, concepts, best practices!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    const prompt = input;
    setInput("");
    setIsLoading(true);

    if (domainId === "web-development" && isWebsiteGenerationRequest(prompt)) {
      const site = generateFullStackWebsite(prompt);
      setMessages((prev) => [...prev, { role: "assistant", content: formatWebsiteAssistantMessage(site) }]);
      const html = site.files.find((file) => file.name === "index.html");
      if (html && onSendToEditor) onSendToEditor(html.content, "html");
      setIsLoading(false);
      return;
    }

    let assistantSoFar = "";

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length === updatedMessages.length + 1) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const resp = await fetch(CODE_ASSISTANT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          domain: domainId,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        let msg = err.error || "Something went wrong. Please try again.";
        if (resp.status === 404) msg = `AI service not deployed. Deploy: supabase functions deploy code-engine --project-ref ${import.meta.env.VITE_SUPABASE_PROJECT_ID || "YOUR_PROJECT_REF"}`;
        if (resp.status === 401) msg = "Please log in to use the AI assistant.";
        if (resp.status === 503 && err.hint) msg = `${err.error} ${err.hint}`;
        upsert(`❌ ${msg}`);
        setIsLoading(false);
        return;
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Flush remaining
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw || raw.startsWith(":") || !raw.startsWith("data: ")) continue;
          const json = raw.slice(6).trim();
          if (json === "[DONE]") continue;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch {}
        }
      }
    } catch (e) {
      console.error("Chat error:", e);
      upsert("❌ Connection error. Please try again.");
    }

    setIsLoading(false);
  }, [input, isLoading, messages, domainName, domainId, onSendToEditor]);

  const handleClear = () => {
    setMessages([
      {
        role: "assistant",
        content: `👋 Chat cleared! I'm your **${domainName}** AI assistant. How can I help?`,
      },
    ]);
  };

  return (
    <div className="flex h-[550px] flex-col rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Bot className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium text-foreground">{domainName} Assistant</span>
        <span className="rounded-sm bg-primary/10 px-2 py-0.5 text-xs text-primary">AI Powered</span>
        <Button variant="ghost" size="sm" className="ml-auto h-7 px-2" onClick={handleClear}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${msg.role === "user" ? "bg-secondary" : "bg-primary/10"}`}>
              {msg.role === "user" ? (
                <User className="h-4 w-4 text-secondary-foreground" />
              ) : (
                <Bot className="h-4 w-4 text-primary" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <div className="prose prose-sm prose-invert max-w-none [&_pre]:bg-background [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:text-xs [&_code]:text-primary [&_code]:bg-background/50 [&_code]:px-1 [&_code]:rounded-sm [&_pre]:relative">
                <ReactMarkdown
                  components={{
                    pre({ children, ...props }) {
                      // Extract code text and language from the child <code> element
                      const codeEl = (children as any)?.props;
                      const codeText = codeEl?.children || "";
                      const className = codeEl?.className || "";
                      const lang = className.replace("language-", "") || "javascript";

                      return (
                        <div className="relative group">
                          <pre {...props}>{children}</pre>
                          {onSendToEditor && msg.role === "assistant" && String(codeText).trim().length > 0 && (
                            <button
                              onClick={() => onSendToEditor(String(codeText).trim(), lang)}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground hover:bg-primary/90"
                              title="Send to Code Editor"
                            >
                              <ArrowRightToLine className="h-3 w-3" />
                              Editor
                            </button>
                          )}
                        </div>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Starter Prompts */}
      {messages.length <= 1 && !isLoading && (
        <div className="border-t border-border px-3 py-2">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Try asking</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {promptConfig.starterPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => { setInput(prompt); }}
                className="rounded-md border border-border bg-secondary/50 px-2.5 py-1 text-xs text-secondary-foreground hover:bg-secondary transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={`Ask about ${domainName.toLowerCase()}...`}
            className="flex-1 rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            disabled={isLoading}
          />
          <Button size="sm" onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CodeAssistant;
