import { useState, useEffect, useRef } from "react";
import { Send, Code2, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface ChatMessage {
  id: string;
  user_id: string;
  domain_id: string;
  content: string;
  message_type: string;
  code_snippet: string | null;
  code_language: string | null;
  created_at: string;
  display_name?: string;
}

const DomainChat = ({ domainId }: { domainId: string }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [sending, setSending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("community_messages")
        .select("*")
        .eq("domain_id", domainId)
        .order("created_at", { ascending: true })
        .limit(100);
      if (data) {
        setMessages(data);
        // Fetch profiles for all unique user_ids
        const userIds = [...new Set(data.map((m) => m.user_id))];
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("user_id, display_name")
            .in("user_id", userIds);
          const map: Record<string, string> = {};
          (profilesData || []).forEach((p) => {
            map[p.user_id] = p.display_name || "User";
          });
          setProfiles(map);
        }
      }
    };
    fetchMessages();
  }, [domainId]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${domainId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "community_messages",
          filter: `domain_id=eq.${domainId}`,
        },
        async (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMsg]);
          // Fetch profile if not cached
          if (!profiles[newMsg.user_id]) {
            const { data } = await supabase
              .from("profiles")
              .select("user_id, display_name")
              .eq("user_id", newMsg.user_id)
              .single();
            if (data) {
              setProfiles((prev) => ({ ...prev, [data.user_id]: data.display_name || "User" }));
            }
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [domainId, profiles]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if ((!newMessage.trim() && !codeSnippet.trim()) || !user) return;
    setSending(true);
    const payload: any = {
      user_id: user.id,
      domain_id: domainId,
      content: newMessage.trim() || (codeSnippet ? "Shared a code snippet" : ""),
      message_type: codeSnippet ? "code" : "text",
    };
    if (codeSnippet) {
      payload.code_snippet = codeSnippet;
      payload.code_language = "javascript";
    }
    await supabase.from("community_messages").insert(payload);
    setNewMessage("");
    setCodeSnippet("");
    setShowCode(false);
    setSending(false);
  };

  const getInitials = (userId: string) => {
    const name = profiles[userId] || "U";
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col h-[500px] rounded-lg border border-border bg-card">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No messages yet. Start the conversation! 💬
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.user_id === user?.id;
          return (
            <div key={msg.id} className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {getInitials(msg.user_id)}
                </AvatarFallback>
              </Avatar>
              <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {isOwn ? "You" : profiles[msg.user_id] || "User"}
                  </span>
                  <span className="text-[9px] text-muted-foreground/60">
                    {format(new Date(msg.created_at), "HH:mm")}
                  </span>
                </div>
                <div className={`rounded-lg px-3 py-2 text-sm ${isOwn ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  {msg.content}
                </div>
                {msg.code_snippet && (
                  <pre className="mt-1 rounded-md bg-muted p-2 text-xs font-mono overflow-x-auto max-w-full">
                    <code>{msg.code_snippet}</code>
                  </pre>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Code input */}
      {showCode && (
        <div className="border-t border-border p-2">
          <textarea
            className="w-full rounded-md bg-muted p-2 text-xs font-mono resize-none h-20 focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Paste your code here..."
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
          />
        </div>
      )}

      {/* Input bar */}
      <div className="border-t border-border p-3 flex items-center gap-2">
        <Button
          size="icon"
          variant={showCode ? "default" : "outline"}
          className="h-8 w-8 shrink-0"
          onClick={() => setShowCode(!showCode)}
        >
          <Code2 className="h-4 w-4" />
        </Button>
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          className="h-8 text-sm"
        />
        <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleSend} disabled={sending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DomainChat;
