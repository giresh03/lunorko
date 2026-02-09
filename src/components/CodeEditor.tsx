import { useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Play, RotateCcw, Copy, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const LANGUAGE_TEMPLATES: Record<string, { label: string; template: string }> = {
  javascript: {
    label: "JavaScript",
    template: `// Welcome to Lunor.AI Code Editor\n// Write your JavaScript code here and click Run!\n\nfunction greet(name) {\n  return \`Hello, \${name}! Welcome to Lunor.AI 🚀\`;\n}\n\nconsole.log(greet("Engineer"));\nconsole.log("2 + 2 =", 2 + 2);\n`,
  },
  typescript: {
    label: "TypeScript",
    template: `// TypeScript Editor\n// Note: Runs as JavaScript (types are stripped)\n\ninterface User {\n  name: string;\n  role: string;\n}\n\nconst user: User = { name: "Student", role: "Developer" };\nconsole.log(\`\${user.name} is a \${user.role}\`);\n`,
  },
  python: {
    label: "Python",
    template: `# Python Editor (preview only — no execution)\n# Connect a backend to run Python code\n\ndef fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        yield a\n        a, b = b, a + b\n\nprint(list(fibonacci(10)))\n`,
  },
  html: {
    label: "HTML",
    template: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Lunor.AI</title>\n  <style>\n    body { font-family: sans-serif; padding: 2rem; background: #1a1a2e; color: #eee; }\n    h1 { color: #00d4aa; }\n  </style>\n</head>\n<body>\n  <h1>Hello from Lunor.AI!</h1>\n  <p>Edit this HTML and click Run to preview.</p>\n</body>\n</html>`,
  },
  css: {
    label: "CSS",
    template: `/* CSS Editor */\n.container {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 100vh;\n  background: linear-gradient(135deg, #0a0a1a, #1a1a2e);\n}\n\n.card {\n  padding: 2rem;\n  border-radius: 0.5rem;\n  border: 1px solid rgba(0, 212, 170, 0.3);\n  background: rgba(255, 255, 255, 0.05);\n}\n`,
  },
  json: {
    label: "JSON",
    template: `{\n  "name": "lunor-ai-project",\n  "version": "1.0.0",\n  "description": "My Lunor.AI project",\n  "dependencies": {\n    "react": "^18.0.0",\n    "typescript": "^5.0.0"\n  }\n}\n`,
  },
};

const CodeEditorComponent = ({ domainName }: { domainName: string }) => {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(LANGUAGE_TEMPLATES.javascript.template);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(LANGUAGE_TEMPLATES[lang]?.template || "");
    setOutput([]);
    setShowLangMenu(false);
  };

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setOutput([]);

    if (language === "javascript" || language === "typescript") {
      try {
        const logs: string[] = [];
        const mockConsole = {
          log: (...args: unknown[]) => logs.push(args.map(String).join(" ")),
          error: (...args: unknown[]) => logs.push(`❌ ${args.map(String).join(" ")}`),
          warn: (...args: unknown[]) => logs.push(`⚠️ ${args.map(String).join(" ")}`),
        };
        const fn = new Function("console", code);
        fn(mockConsole);
        setOutput(logs.length ? logs : ["✅ Code executed successfully (no output)"]);
      } catch (err: unknown) {
        setOutput([`❌ Error: ${err instanceof Error ? err.message : String(err)}`]);
      }
    } else if (language === "html") {
      setOutput(["📄 HTML preview would render below. Connect a sandbox to preview HTML."]);
    } else {
      setOutput([`⚙️ ${LANGUAGE_TEMPLATES[language]?.label} execution requires a backend runtime. Coming soon!`]);
    }

    setTimeout(() => setIsRunning(false), 300);
  }, [code, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(LANGUAGE_TEMPLATES[language]?.template || "");
    setOutput([]);
  };

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-3">
          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              {LANGUAGE_TEMPLATES[language]?.label}
              <ChevronDown className="h-3 w-3" />
            </button>
            {showLangMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowLangMenu(false)} />
                <div className="absolute top-full left-0 z-20 mt-1 min-w-[140px] rounded-md border border-border bg-popover p-1 shadow-lg">
                  {Object.entries(LANGUAGE_TEMPLATES).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => handleLanguageChange(key)}
                      className={`w-full rounded-sm px-3 py-1.5 text-left text-xs transition-colors ${
                        key === language
                          ? "bg-primary/10 text-primary"
                          : "text-popover-foreground hover:bg-secondary"
                      }`}
                    >
                      {val.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{domainName} Editor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs">
            {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 px-2 text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" onClick={handleRun} disabled={isRunning} className="h-7 gap-1.5 px-3 text-xs">
            <Play className="h-3.5 w-3.5" />
            Run
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="min-h-[350px]">
        <Editor
          height="350px"
          language={language}
          value={code}
          onChange={(val) => setCode(val || "")}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            renderLineHighlight: "line",
            padding: { top: 12 },
            wordWrap: "on",
            tabSize: 2,
            automaticLayout: true,
          }}
        />
      </div>

      {/* Output */}
      {output.length > 0 && (
        <div className="border-t border-border">
          <div className="flex items-center gap-2 border-b border-border px-4 py-1.5">
            <span className="text-xs font-medium text-muted-foreground">Output</span>
          </div>
          <div className="max-h-[200px] overflow-y-auto bg-background p-4 font-mono text-sm">
            {output.map((line, i) => (
              <div key={i} className="text-foreground whitespace-pre-wrap">
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditorComponent;
