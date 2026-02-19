import { useState, useEffect, useRef, useCallback } from "react";
import { Brain, MessageSquare, Bug, Lightbulb, FileCode2, Wand2, Sun, Moon, Sparkles, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

/* ───── Token types for syntax highlighting ───── */
type TokenType = "keyword" | "string" | "comment" | "function" | "number" | "operator" | "punctuation" | "type" | "variable" | "plain" | "decorator" | "ai-suggestion";

interface Token {
  text: string;
  type: TokenType;
}

interface CodeLine {
  tokens: Token[];
  indent: number;
}

/* ───── Code samples ───── */
const CODE_LINES: CodeLine[] = [
  { indent: 0, tokens: [
    { text: "import", type: "keyword" }, { text: " { ", type: "punctuation" },
    { text: "NeuralNetwork", type: "type" }, { text: " } ", type: "punctuation" },
    { text: "from", type: "keyword" }, { text: " ", type: "plain" },
    { text: "'@lunor/ai-core'", type: "string" },
  ]},
  { indent: 0, tokens: [
    { text: "import", type: "keyword" }, { text: " { ", type: "punctuation" },
    { text: "Pipeline", type: "type" }, { text: ", ", type: "punctuation" },
    { text: "Tokenizer", type: "type" }, { text: " } ", type: "punctuation" },
    { text: "from", type: "keyword" }, { text: " ", type: "plain" },
    { text: "'@lunor/nlp'", type: "string" },
  ]},
  { indent: 0, tokens: [] },
  { indent: 0, tokens: [
    { text: "// Initialize the AI model with domain context", type: "comment" },
  ]},
  { indent: 0, tokens: [
    { text: "const", type: "keyword" }, { text: " ", type: "plain" },
    { text: "model", type: "variable" }, { text: " = ", type: "operator" },
    { text: "new", type: "keyword" }, { text: " ", type: "plain" },
    { text: "NeuralNetwork", type: "type" }, { text: "({", type: "punctuation" },
  ]},
  { indent: 1, tokens: [
    { text: "layers", type: "variable" }, { text: ": ", type: "punctuation" },
    { text: "[", type: "punctuation" }, { text: "128", type: "number" },
    { text: ", ", type: "punctuation" }, { text: "256", type: "number" },
    { text: ", ", type: "punctuation" }, { text: "512", type: "number" },
    { text: "]", type: "punctuation" }, { text: ",", type: "punctuation" },
  ]},
  { indent: 1, tokens: [
    { text: "activation", type: "variable" }, { text: ": ", type: "punctuation" },
    { text: "'relu'", type: "string" }, { text: ",", type: "punctuation" },
  ]},
  { indent: 1, tokens: [
    { text: "optimizer", type: "variable" }, { text: ": ", type: "punctuation" },
    { text: "'adam'", type: "string" }, { text: ",", type: "punctuation" },
  ]},
  { indent: 0, tokens: [
    { text: "})", type: "punctuation" },
  ]},
  { indent: 0, tokens: [] },
  { indent: 0, tokens: [
    { text: "async", type: "keyword" }, { text: " ", type: "plain" },
    { text: "function", type: "keyword" }, { text: " ", type: "plain" },
    { text: "trainModel", type: "function" }, { text: "(", type: "punctuation" },
    { text: "dataset", type: "variable" }, { text: ": ", type: "punctuation" },
    { text: "Dataset", type: "type" }, { text: ")", type: "punctuation" },
    { text: " {", type: "punctuation" },
  ]},
  { indent: 1, tokens: [
    { text: "const", type: "keyword" }, { text: " ", type: "plain" },
    { text: "tokenizer", type: "variable" }, { text: " = ", type: "operator" },
    { text: "new", type: "keyword" }, { text: " ", type: "plain" },
    { text: "Tokenizer", type: "type" }, { text: "()", type: "punctuation" },
  ]},
  { indent: 1, tokens: [
    { text: "const", type: "keyword" }, { text: " ", type: "plain" },
    { text: "pipeline", type: "variable" }, { text: " = ", type: "operator" },
    { text: "new", type: "keyword" }, { text: " ", type: "plain" },
    { text: "Pipeline", type: "type" }, { text: "(", type: "punctuation" },
    { text: "model", type: "variable" }, { text: ", ", type: "punctuation" },
    { text: "tokenizer", type: "variable" }, { text: ")", type: "punctuation" },
  ]},
  { indent: 0, tokens: [] },
  { indent: 1, tokens: [
    { text: "// AI suggests: Add batch processing for efficiency", type: "ai-suggestion" },
  ]},
  { indent: 1, tokens: [
    { text: "await", type: "keyword" }, { text: " ", type: "plain" },
    { text: "pipeline", type: "variable" }, { text: ".", type: "punctuation" },
    { text: "fit", type: "function" }, { text: "(", type: "punctuation" },
    { text: "dataset", type: "variable" }, { text: ", {", type: "punctuation" },
  ]},
  { indent: 2, tokens: [
    { text: "epochs", type: "variable" }, { text: ": ", type: "punctuation" },
    { text: "100", type: "number" }, { text: ",", type: "punctuation" },
  ]},
  { indent: 2, tokens: [
    { text: "batchSize", type: "variable" }, { text: ": ", type: "punctuation" },
    { text: "32", type: "number" }, { text: ",", type: "punctuation" },
  ]},
  { indent: 2, tokens: [
    { text: "onEpoch", type: "variable" }, { text: ": ", type: "punctuation" },
    { text: "(", type: "punctuation" }, { text: "e", type: "variable" },
    { text: ") ", type: "punctuation" }, { text: "=>", type: "operator" },
    { text: " ", type: "plain" }, { text: "console", type: "variable" },
    { text: ".", type: "punctuation" }, { text: "log", type: "function" },
    { text: "(", type: "punctuation" }, { text: "`Epoch ${", type: "string" },
    { text: "e", type: "variable" }, { text: "}`", type: "string" },
    { text: ")", type: "punctuation" },
  ]},
  { indent: 1, tokens: [
    { text: "  })", type: "punctuation" },
  ]},
  { indent: 0, tokens: [
    { text: "}", type: "punctuation" },
  ]},
];

/* ───── Color maps ───── */
const darkColors: Record<TokenType, string> = {
  keyword: "text-[#c792ea]",
  string: "text-[#c3e88d]",
  comment: "text-[#546e7a]",
  function: "text-[#82aaff]",
  number: "text-[#f78c6c]",
  operator: "text-[#89ddff]",
  punctuation: "text-[#89ddff]",
  type: "text-[#ffcb6b]",
  variable: "text-[#eeffff]",
  plain: "text-[#eeffff]",
  decorator: "text-[#c792ea]",
  "ai-suggestion": "text-[#6366f1]",
};

const lightColors: Record<TokenType, string> = {
  keyword: "text-[#7c3aed]",
  string: "text-[#059669]",
  comment: "text-[#9ca3af]",
  function: "text-[#2563eb]",
  number: "text-[#ea580c]",
  operator: "text-[#0891b2]",
  punctuation: "text-[#6b7280]",
  type: "text-[#d97706]",
  variable: "text-[#1e293b]",
  plain: "text-[#334155]",
  decorator: "text-[#7c3aed]",
  "ai-suggestion": "text-[#6366f1]",
};

const darkGlowColors: Record<TokenType, string> = {
  keyword: "drop-shadow(0 0 6px rgba(199,146,234,0.5))",
  string: "drop-shadow(0 0 6px rgba(195,232,141,0.4))",
  comment: "none",
  function: "drop-shadow(0 0 6px rgba(130,170,255,0.5))",
  number: "drop-shadow(0 0 6px rgba(247,140,108,0.4))",
  operator: "drop-shadow(0 0 4px rgba(137,221,255,0.3))",
  punctuation: "none",
  type: "drop-shadow(0 0 6px rgba(255,203,107,0.4))",
  variable: "none",
  plain: "none",
  decorator: "drop-shadow(0 0 6px rgba(199,146,234,0.4))",
  "ai-suggestion": "drop-shadow(0 0 8px rgba(99,102,241,0.6))",
};

/* ───── Capabilities list ───── */
const capabilities = [
  { icon: MessageSquare, title: "Ask Anything", desc: "Chat with AI about any coding concept" },
  { icon: Bug, title: "Debug Instantly", desc: "Paste your error, get step-by-step fixes" },
  { icon: FileCode2, title: "Generate Code", desc: "AI writes production-ready code" },
  { icon: Lightbulb, title: "Learn Concepts", desc: "Complex topics broken into simple analogies" },
  { icon: Wand2, title: "Optimize Code", desc: "Performance improvements and best practices" },
  { icon: Brain, title: "Domain Expert", desc: "AI adapts to your selected domain" },
];

/* ───── Terminal log lines ───── */
const TERMINAL_LINES = [
  { text: "$ lunor train --model neural-v3", type: "command" as const },
  { text: "⚡ Loading dataset... 50,000 samples", type: "info" as const },
  { text: "✓ Tokenizer initialized (vocab: 32,000)", type: "success" as const },
  { text: "⟳ Epoch 1/100 — loss: 0.8234 — acc: 0.62", type: "info" as const },
  { text: "⟳ Epoch 25/100 — loss: 0.3102 — acc: 0.85", type: "info" as const },
  { text: "⟳ Epoch 50/100 — loss: 0.1247 — acc: 0.93", type: "info" as const },
  { text: "✓ Training complete — accuracy: 97.3%", type: "success" as const },
  { text: "✓ Model saved to ./models/neural-v3.bin", type: "success" as const },
];

/* ───── Main component ───── */
const AIPowerSection = () => {
  const [isDark, setIsDark] = useState(true);
  const [visibleLines, setVisibleLines] = useState(0);
  const [cursorLine, setCursorLine] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [terminalLines, setTerminalLines] = useState(0);
  const [aiThinking, setAiThinking] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  // Intersection observer to trigger animation when in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          setIsInView(true);
          hasAnimated.current = true;
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Typing animation
  useEffect(() => {
    if (!isInView) return;
    const totalLines = CODE_LINES.length;
    let line = 0;
    const interval = setInterval(() => {
      line++;
      setVisibleLines(line);
      setCursorLine(line - 1);

      // Trigger AI thinking on suggestion line
      if (line === 15) {
        setAiThinking(true);
        setTimeout(() => setAiThinking(false), 1200);
      }

      if (line >= totalLines) {
        clearInterval(interval);
        // Start terminal after code
        setTimeout(() => {
          let tLine = 0;
          const tInterval = setInterval(() => {
            tLine++;
            setTerminalLines(tLine);
            if (tLine >= TERMINAL_LINES.length) clearInterval(tInterval);
          }, 400);
        }, 600);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [isInView]);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(interval);
  }, []);

  const colors = isDark ? darkColors : lightColors;

  return (
    <section ref={sectionRef} className="py-28">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* IDE Mockup */}
          <div className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out order-2 lg:order-1">
            <div
              className={cn(
                "relative rounded-xl border overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
                isDark
                  ? "bg-[#0d1117] border-[#30363d] shadow-[0_0_80px_rgba(99,102,241,0.08)]"
                  : "bg-[#ffffff] border-[#d1d5db] shadow-[0_8px_40px_rgba(0,0,0,0.08)]"
              )}
            >
              {/* Title bar */}
              <div className={cn(
                "flex items-center justify-between px-4 py-2.5 border-b transition-colors duration-700",
                isDark ? "bg-[#161b22] border-[#30363d]" : "bg-[#f6f8fa] border-[#d1d5db]"
              )}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <span className={cn(
                    "ml-3 text-xs font-mono transition-colors duration-700",
                    isDark ? "text-[#8b949e]" : "text-[#656d76]"
                  )}>
                    ai-model.ts — Lunor IDE
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* AI indicator */}
                  <div className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all duration-500",
                    aiThinking
                      ? "bg-[hsl(239,84%,67%/0.15)] text-[#818cf8]"
                      : isDark
                        ? "bg-[#21262d] text-[#8b949e]"
                        : "bg-[#eaeef2] text-[#656d76]"
                  )}>
                    <Sparkles className={cn("h-3 w-3", aiThinking && "animate-pulse")} />
                    {aiThinking ? "AI Thinking..." : "AI Ready"}
                  </div>
                  {/* Theme toggle */}
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className={cn(
                      "relative w-12 h-6 rounded-full transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden",
                      isDark
                        ? "bg-[#30363d] shadow-[inset_0_0_12px_rgba(99,102,241,0.2)]"
                        : "bg-[#dbeafe] shadow-[inset_0_0_12px_rgba(250,204,21,0.3)]"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
                        isDark
                          ? "left-0.5 bg-[#6366f1] shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                          : "left-[26px] bg-[#fbbf24] shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                      )}
                    >
                      {isDark ? <Moon className="h-3 w-3 text-[#e0e7ff]" /> : <Sun className="h-3 w-3 text-[#fef3c7]" />}
                    </div>
                  </button>
                </div>
              </div>

              {/* Code area */}
              <div className="relative overflow-hidden">
                {/* Background grid */}
                <div
                  className={cn(
                    "absolute inset-0 transition-opacity duration-700",
                    isDark ? "opacity-100" : "opacity-0"
                  )}
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99,102,241,0.04) 1px, transparent 0)`,
                    backgroundSize: "24px 24px",
                  }}
                />

                <div className="relative p-4 font-mono text-[13px] leading-6 min-h-[380px] overflow-x-auto">
                  {CODE_LINES.slice(0, visibleLines).map((line, lineIdx) => (
                    <div
                      key={lineIdx}
                      className={cn(
                        "flex items-center group transition-all duration-300",
                        cursorLine === lineIdx && "bg-[hsl(239,84%,67%/0.04)]"
                      )}
                    >
                      {/* Line number */}
                      <span className={cn(
                        "w-8 shrink-0 text-right pr-4 select-none text-[11px] transition-colors duration-700",
                        isDark ? "text-[#484f58]" : "text-[#c9d1d9]",
                        cursorLine === lineIdx && (isDark ? "text-[#6366f1]" : "text-[#4f46e5]")
                      )}>
                        {lineIdx + 1}
                      </span>

                      {/* Code content */}
                      <span style={{ paddingLeft: `${line.indent * 20}px` }} className="flex items-center">
                        {line.tokens.map((token, tokenIdx) => (
                          <span
                            key={tokenIdx}
                            className={cn(
                              colors[token.type],
                              "transition-colors duration-700",
                              token.type === "ai-suggestion" && "italic"
                            )}
                            style={{
                              filter: isDark ? darkGlowColors[token.type] : "none",
                            }}
                          >
                            {token.text}
                          </span>
                        ))}
                        {/* Cursor */}
                        {cursorLine === lineIdx && (
                          <span
                            className={cn(
                              "inline-block w-[2px] h-[18px] ml-0.5 transition-opacity duration-100",
                              cursorVisible ? "opacity-100" : "opacity-0",
                              isDark ? "bg-[#6366f1]" : "bg-[#4f46e5]",
                            )}
                            style={{
                              boxShadow: isDark ? "0 0 8px rgba(99,102,241,0.6)" : "none",
                            }}
                          />
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terminal panel */}
              {terminalLines > 0 && (
                <div className={cn(
                  "border-t transition-all duration-700",
                  isDark ? "bg-[#0d1117] border-[#30363d]" : "bg-[#f9fafb] border-[#d1d5db]"
                )}>
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-1.5 border-b transition-colors duration-700",
                    isDark ? "border-[#21262d]" : "border-[#e5e7eb]"
                  )}>
                    <Terminal className={cn("h-3 w-3", isDark ? "text-[#8b949e]" : "text-[#6b7280]")} />
                    <span className={cn(
                      "text-[10px] font-mono uppercase tracking-wider transition-colors duration-700",
                      isDark ? "text-[#8b949e]" : "text-[#6b7280]"
                    )}>
                      Output
                    </span>
                  </div>
                  <div className="p-3 font-mono text-[12px] leading-5 max-h-[160px] overflow-y-auto">
                    {TERMINAL_LINES.slice(0, terminalLines).map((tl, i) => (
                      <div key={i} className={cn(
                        "transition-all duration-300",
                        tl.type === "command" && (isDark ? "text-[#79c0ff]" : "text-[#0550ae]"),
                        tl.type === "info" && (isDark ? "text-[#8b949e]" : "text-[#656d76]"),
                        tl.type === "success" && (isDark ? "text-[#3fb950]" : "text-[#116329]"),
                      )}
                        style={{
                          filter: tl.type === "success" && isDark
                            ? "drop-shadow(0 0 4px rgba(63,185,80,0.3))"
                            : "none"
                        }}
                      >
                        {tl.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ambient glow (dark mode only) */}
              <div className={cn(
                "absolute -bottom-20 -right-20 w-60 h-60 rounded-full blur-[80px] transition-opacity duration-700 pointer-events-none",
                isDark ? "opacity-100 bg-[hsl(239,84%,67%/0.06)]" : "opacity-0"
              )} />
              <div className={cn(
                "absolute -top-10 -left-10 w-40 h-40 rounded-full blur-[60px] transition-opacity duration-700 pointer-events-none",
                isDark ? "opacity-100 bg-[hsl(192,91%,36%/0.04)]" : "opacity-0"
              )} />
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <div className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[hsl(239,84%,67%/0.3)] bg-[hsl(239,84%,67%/0.06)] px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-[hsl(239,84%,67%)]">
                <Sparkles className="h-3 w-3" /> AI-Powered IDE
              </span>
              <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl leading-[1.1]">
                Your Personal{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#6366f1] to-[#06b6d4]">
                  AI Coding Mentor
                </span>
              </h2>
              <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                Not just another ChatGPT wrapper. Our AI is fine-tuned for engineering students —
                it understands your domain, your level, and your goals.
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {capabilities.map((cap, i) => (
                <div
                  key={i}
                  className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="group flex gap-3 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm p-4 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-[hsl(239,84%,67%/0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(99,102,241,0.06)]">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(239,84%,67%/0.08)] transition-all duration-500 group-hover:scale-110 group-hover:bg-[hsl(239,84%,67%/0.15)] group-hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]">
                      <cap.icon className="h-4 w-4 text-[hsl(239,84%,67%)]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{cap.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{cap.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIPowerSection;
