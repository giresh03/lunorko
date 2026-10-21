// Shared Anthropic (Claude) helpers for edge functions.
// The key is read ONLY from the ANTHROPIC_API_KEY secret — never hard-code it.
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...   (optionally ANTHROPIC_MODEL=claude-sonnet-5-5)

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-5-5";

export function anthropicKey(): string {
  return (Deno.env.get("ANTHROPIC_API_KEY") || "").trim();
}

export function anthropicModel(): string {
  return (Deno.env.get("ANTHROPIC_MODEL") || DEFAULT_MODEL).trim();
}

type ChatMessage = { role: string; content: unknown };

/** Claude wants alternating user/assistant turns that start with a user turn. */
export function toClaudeMessages(messages: ChatMessage[]): { role: "user" | "assistant"; content: string }[] {
  const out: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of messages || []) {
    if (m.role !== "user" && m.role !== "assistant") continue;
    const text = typeof m.content === "string" ? m.content : JSON.stringify(m.content ?? "");
    if (!text.trim()) continue;
    const last = out[out.length - 1];
    if (last && last.role === m.role) last.content += `\n\n${text}`;
    else out.push({ role: m.role, content: text });
  }
  while (out.length && out[0].role !== "user") out.shift();
  if (!out.length) out.push({ role: "user", content: "Hello" });
  return out;
}

export function callClaude(opts: {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  model?: string;
}): Promise<Response> {
  const body: Record<string, unknown> = {
    model: opts.model || anthropicModel(),
    max_tokens: opts.maxTokens ?? 8192,
    system: opts.system,
    messages: toClaudeMessages(opts.messages),
    stream: !!opts.stream,
  };
  if (typeof opts.temperature === "number") body.temperature = opts.temperature;
  return fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": anthropicKey(),
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

/** Non-streaming helper: returns the concatenated text of the reply. */
export async function claudeText(opts: Parameters<typeof callClaude>[0]): Promise<string> {
  const resp = await callClaude({ ...opts, stream: false });
  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    throw new ClaudeError(resp.status, detail);
  }
  const data = await resp.json();
  return (data?.content ?? [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("");
}

export class ClaudeError extends Error {
  status: number;
  detail: string;
  constructor(status: number, detail: string) {
    super(`Anthropic error ${status}`);
    this.status = status;
    this.detail = detail;
  }
}

/** Map an Anthropic failure to a user-facing JSON error Response. */
export function claudeErrorResponse(status: number, detail: string, headers: Record<string, string>): Response {
  console.error(`[claude] Anthropic error ${status}`, detail.slice(0, 500));
  const json = { ...headers, "Content-Type": "application/json" };
  if (status === 429 || status === 529) {
    return new Response(JSON.stringify({ error: "Claude is busy right now. Please wait a moment and try again." }), { status: 429, headers: json });
  }
  if (status === 401 || status === 403) {
    return new Response(JSON.stringify({ error: "The Claude API key was rejected. Check ANTHROPIC_API_KEY in the project secrets." }), { status: 503, headers: json });
  }
  if (status === 400 && detail.includes("credit balance")) {
    return new Response(JSON.stringify({ error: "The Claude API account is out of credits. Add credits in the Anthropic console." }), { status: 402, headers: json });
  }
  return new Response(JSON.stringify({ error: `AI service error (${status})` }), { status: 502, headers: json });
}

/**
 * Convert Anthropic's SSE stream into the OpenAI-style SSE the frontend already parses:
 *   data: {"choices":[{"delta":{"content":"..."}}]}
 */
export function claudeStreamToOpenAi(resp: Response): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const reader = resp.body!.getReader();
  let buf = "";
  const emit = (ctrl: ReadableStreamDefaultController<Uint8Array>, line: string) => {
    if (!line.startsWith("data: ")) return;
    const j = line.slice(6).trim();
    if (!j) return;
    try {
      const p = JSON.parse(j);
      if (p.type === "content_block_delta" && p.delta?.type === "text_delta" && p.delta.text) {
        ctrl.enqueue(enc.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: p.delta.text } }] })}\n\n`));
      }
    } catch { /* ignore keep-alives / partial lines */ }
  };
  return new ReadableStream({
    async start(ctrl) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() || "";
          for (const line of lines) emit(ctrl, line);
        }
        if (buf) emit(ctrl, buf);
        ctrl.enqueue(enc.encode("data: [DONE]\n\n"));
      } finally {
        ctrl.close();
      }
    },
  });
}
