import { useState, useEffect, useRef } from "react";
import { Send, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface TeamChatProps {
  projectId: string;
  profiles: Record<string, string>;
}

interface Msg {
  id: string;
  user_id: string;
  content: string;
  message_type: string;
  code_snippet: string | null;
  created_at: string;
}

const TeamChat = ({ projectId, profiles }: TeamChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("team_messages")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (data) setMessages(data as Msg[]);
    };
    fetch();
  }, [projectId]);

  useEffect(() => {
    const channel = supabase
      .channel(`team-chat-${projectId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "team_messages",
        filter: `project_id=eq.${projectId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Msg]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [projectId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if ((!newMessage.trim() && !codeSnippet.trim()) || !user) return;
    setSending(true);
    await supabase.from("team_messages").insert({
      project_id: projectId,
      user_id: user.id,
      content: newMessage.trim() || "Shared code",
      message_type: codeSnippet ? "code" : "text",
      code_snippet: codeSnippet || null,
    });
    setNewMessage("");
    setCodeSnippet("");
    setShowCode(false);
    setSending(false);
  };

  return (
    <div className="flex flex-col h-[400px] rounded-lg border border-border bg-card">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Team chat — start collaborating! 💬
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.user_id === user?.id;
          return (
            <div key={msg.id} className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                  {(profiles[msg.user_id] || "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="max-w-[75%]">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {isOwn ? "You" : profiles[msg.user_id] || "User"}
                  </span>
                  <span className="text-[9px] text-muted-foreground/60">
                    {format(new Date(msg.created_at), "HH:mm")}
                  </span>
                </div>
                <div className={`rounded-lg px-3 py-1.5 text-sm ${isOwn ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  {msg.content}
                </div>
                {msg.code_snippet && (
                  <pre className="mt-1 rounded-md bg-muted p-2 text-xs font-mono overflow-x-auto">
                    <code>{msg.code_snippet}</code>
                  </pre>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {showCode && (
        <div className="border-t border-border p-2">
          <textarea
            className="w-full rounded-md bg-muted p-2 text-xs font-mono resize-none h-16 focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Paste code..."
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
          />
        </div>
      )}
      <div className="border-t border-border p-2 flex items-center gap-2">
        <Button size="icon" variant={showCode ? "default" : "outline"} className="h-7 w-7" onClick={() => setShowCode(!showCode)}>
          <Code2 className="h-3.5 w-3.5" />
        </Button>
        <Input
          placeholder="Message your team..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          className="h-7 text-sm"
        />
        <Button size="icon" className="h-7 w-7" onClick={handleSend} disabled={sending}>
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default TeamChat;
