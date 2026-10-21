import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Send, Code2, ImagePlus, X, Copy, Check, AlertCircle, ArrowDown, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, isToday, isYesterday } from "date-fns";

interface ChatMessage {
  id: string;
  user_id: string;
  domain_id: string;
  content: string;
  message_type: string;
  code_snippet: string | null;
  code_language: string | null;
  file_url: string | null;
  created_at: string;
  client_id?: string | null;
  pending?: boolean;
  failed?: boolean;
  local_preview?: string;
}

const NAME_COLORS = [
  "text-primary",
  "text-emerald-400",
  "text-sky-400",
  "text-amber-400",
  "text-fuchsia-400",
  "text-teal-300",
  "text-orange-400",
];

const colorFor = (userId: string) => {
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) % 9973;
  return NAME_COLORS[h % NAME_COLORS.length];
};

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMMM d, yyyy");
};

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="group/code relative mt-1.5 max-w-full overflow-hidden rounded-md border border-border bg-muted/60">
      <button
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        className="absolute right-1.5 top-1.5 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover/code:opacity-100"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <pre className="overflow-x-auto p-3 text-xs font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const DomainChat = ({ domainId, channelName }: { domainId: string; channelName?: string }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [atBottom, setAtBottom] = useState(true);
  const [unseen, setUnseen] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const profilesRef = useRef<Record<string, string>>({});
  const atBottomRef = useRef(true);

  profilesRef.current = profiles;
  atBottomRef.current = atBottom;

  const loadProfiles = useCallback(async (userIds: string[]) => {
    const missing = userIds.filter((id) => id && !profilesRef.current[id]);
    if (missing.length === 0) return;
    const { data } = await supabase
      .from("public_profiles")
      .select("user_id, display_name, username")
      .in("user_id", missing);
    if (!data?.length) return;
    setProfiles((prev) => {
      const next = { ...prev };
      data.forEach((p: any) => { next[p.user_id] = p.username || p.display_name || "User"; });
      return next;
    });
  }, []);

  // Initial fetch — paints messages first, resolves names after
  useEffect(() => {
    let cancelled = false;
    setMessages([]);
    (async () => {
      const { data } = await supabase
        .from("community_messages")
        .select("*")
        .eq("domain_id", domainId)
        .order("created_at", { ascending: true })
        .limit(100);
      if (cancelled || !data) return;
      setMessages(data as ChatMessage[]);
      loadProfiles([...new Set(data.map((m) => m.user_id))]);
    })();
    return () => { cancelled = true; };
  }, [domainId, loadProfiles]);

  // Realtime — subscribe once per channel
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${domainId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_messages", filter: `domain_id=eq.${domainId}` },
        (payload) => {
          const incoming = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            // replace matching optimistic row if present
            const optimisticIdx = prev.findIndex(
              (m) => m.pending && m.user_id === incoming.user_id && m.content === incoming.content
            );
            if (optimisticIdx !== -1) {
              const next = [...prev];
              next[optimisticIdx] = incoming;
              return next;
            }
            return [...prev, incoming];
          });
          if (!atBottomRef.current && incoming.user_id !== user?.id) setUnseen((u) => u + 1);
          loadProfiles([incoming.user_id]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "community_messages" },
        (payload) => {
          const removedId = (payload.old as { id?: string })?.id;
          if (!removedId) return;
          setMessages((prev) => prev.filter((m) => m.id !== removedId));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [domainId, loadProfiles, user?.id]);

  const scrollToBottom = useCallback((smooth = false) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    setUnseen(0);
  }, []);

  useEffect(() => {
    if (atBottomRef.current) scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setAtBottom(near);
    if (near) setUnseen(0);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024 || !file.type.startsWith("image/")) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    const text = newMessage.trim();
    const code = codeSnippet.trim();
    const file = imageFile;
    if ((!text && !code && !file) || !user) return;

    const clientId = crypto.randomUUID();
    const localPreview = imagePreview || undefined;

    // 1. paint instantly
    setMessages((prev) => [
      ...prev,
      {
        id: clientId,
        client_id: clientId,
        user_id: user.id,
        domain_id: domainId,
        content: text || (code ? "Shared a code snippet" : "Shared an image"),
        message_type: file ? "image" : code ? "code" : "text",
        code_snippet: code || null,
        code_language: code ? "javascript" : null,
        file_url: null,
        local_preview: localPreview,
        created_at: new Date().toISOString(),
        pending: true,
      },
    ]);
    setNewMessage("");
    setCodeSnippet("");
    setShowCode(false);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setAtBottom(true);
    atBottomRef.current = true;
    inputRef.current?.focus();

    // 2. persist in background
    let fileUrl: string | null = null;
    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("community-images").upload(path, file);
      if (!error) {
        fileUrl = supabase.storage.from("community-images").getPublicUrl(path).data.publicUrl;
      }
    }

    const payload: any = {
      user_id: user.id,
      domain_id: domainId,
      content: text || (code ? "Shared a code snippet" : fileUrl ? "Shared an image" : ""),
      message_type: fileUrl ? "image" : code ? "code" : "text",
    };
    if (code) {
      payload.code_snippet = code;
      payload.code_language = "javascript";
    }
    if (fileUrl) payload.file_url = fileUrl;

    const { data, error } = await supabase.from("community_messages").insert(payload).select().single();

    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.client_id === clientId);
      if (idx === -1) return prev;
      const next = [...prev];
      if (error || !data) {
        next[idx] = { ...next[idx], pending: false, failed: true };
      } else if (prev.some((m) => m.id === (data as ChatMessage).id)) {
        next.splice(idx, 1); // realtime already delivered it
      } else {
        next[idx] = data as ChatMessage;
      }
      return next;
    });
  };

  const nameOf = (userId: string) => (userId === user?.id ? profiles[userId] || "You" : profiles[userId] || "User");

  // group consecutive messages by author within 5 minutes
  const rows = useMemo(() => {
    return messages.map((msg, i) => {
      const prev = messages[i - 1];
      const newDay = !prev || dayLabel(prev.created_at) !== dayLabel(msg.created_at);
      const grouped =
        !newDay &&
        prev?.user_id === msg.user_id &&
        new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() < 5 * 60 * 1000;
      return { msg, newDay, grouped };
    });
  }, [messages]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* Transcript */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto py-4"
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <div className="rounded-full border border-border bg-card p-4">
              <Hash className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Welcome to #{channelName || domainId}
            </p>
            <p className="text-xs text-muted-foreground">
              This is the start of the channel. Say hello 👋
            </p>
          </div>
        )}

        {rows.map(({ msg, newDay, grouped }) => (
          <div key={msg.id}>
            {newDay && (
              <div className="my-4 flex items-center gap-3 px-4">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {dayLabel(msg.created_at)}
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>
            )}
            <div
              className={`group flex gap-3 px-4 transition-colors hover:bg-muted/40 ${grouped ? "py-0.5" : "mt-2 py-1"} ${msg.pending ? "opacity-60" : ""}`}
            >
              <div className="w-9 shrink-0">
                {grouped ? (
                  <span className="hidden text-[10px] leading-6 text-muted-foreground/60 group-hover:block">
                    {format(new Date(msg.created_at), "HH:mm")}
                  </span>
                ) : (
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-card text-[11px] font-semibold text-foreground">
                      {(nameOf(msg.user_id) || "U").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
              <div className="min-w-0 flex-1">
                {!grouped && (
                  <div className="flex items-baseline gap-2">
                    <span className={`text-sm font-semibold ${colorFor(msg.user_id)}`}>
                      {nameOf(msg.user_id)}
                    </span>
                    <span className="text-[10px] text-muted-foreground/70">
                      {format(new Date(msg.created_at), "HH:mm")}
                    </span>
                    {msg.failed && (
                      <span className="flex items-center gap-1 text-[10px] text-destructive">
                        <AlertCircle className="h-3 w-3" /> failed to send
                      </span>
                    )}
                  </div>
                )}
                {msg.content && (
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">
                    {msg.content}
                  </p>
                )}
                {msg.code_snippet && <CodeBlock code={msg.code_snippet} />}
                {(msg.file_url || msg.local_preview) && (
                  <img
                    src={msg.file_url || msg.local_preview}
                    alt="Shared attachment"
                    loading="lazy"
                    className="mt-1.5 max-h-64 max-w-full cursor-pointer rounded-md border border-border object-cover transition-opacity hover:opacity-90"
                    onClick={() => msg.file_url && window.open(msg.file_url, "_blank")}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New messages pill */}
      {!atBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className="mx-4 mb-1 flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1 text-[11px] font-medium text-primary-foreground shadow-lg"
        >
          <ArrowDown className="h-3 w-3" />
          {unseen > 0 ? `${unseen} new message${unseen > 1 ? "s" : ""}` : "Jump to latest"}
        </button>
      )}

      {/* Composer */}
      <div className="px-4 pb-4 pt-1">
        {imagePreview && (
          <div className="mb-2 inline-block">
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="h-20 rounded-md border border-border object-cover" />
              <Button size="icon" variant="destructive" className="absolute -right-1.5 -top-1.5 h-5 w-5" onClick={removeImage}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        {showCode && (
          <textarea
            className="mb-2 h-24 w-full resize-none rounded-md border border-border bg-muted/60 p-2.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Paste your code here..."
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
          />
        )}
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1.5 transition-colors focus-within:border-primary/60">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground" onClick={() => fileInputRef.current?.click()} title="Attach image">
            <ImagePlus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={`h-8 w-8 shrink-0 ${showCode ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setShowCode(!showCode)}
            title="Share code"
          >
            <Code2 className="h-4 w-4" />
          </Button>
          <Input
            ref={inputRef}
            placeholder={`Message #${channelName || domainId}`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="h-8 border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
          />
          <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleSend} title="Send">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DomainChat;
