import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function GitHubCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<"working" | "done" | "error">("working");
  const [message, setMessage] = useState("Linking your GitHub account…");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const code = params.get("code");
      const returnedState = params.get("state");
      const ghError = params.get("error_description") || params.get("error");

      if (ghError) {
        if (!cancelled) { setState("error"); setMessage(ghError); }
        return;
      }
      if (!code || !returnedState) {
        if (!cancelled) { setState("error"); setMessage("Missing authorization details from GitHub."); }
        return;
      }
      const expected = sessionStorage.getItem("lunor_github_state");
      if (expected && expected !== returnedState) {
        if (!cancelled) { setState("error"); setMessage("This authorization request could not be verified."); }
        return;
      }

      const { data, error } = await supabase.functions.invoke("github-oauth", {
        body: {
          action: "callback",
          code,
          state: returnedState,
          redirect_uri: `${window.location.origin}/github/callback`,
        },
      });

      if (cancelled) return;
      const errText = (data as { error?: string } | null)?.error;
      if (error || errText) {
        setState("error");
        setMessage(errText || error?.message || "GitHub authorization failed.");
        return;
      }

      sessionStorage.removeItem("lunor_github_state");
      setState("done");
      setMessage(`Connected as ${(data as { login?: string })?.login ?? "your GitHub account"}.`);

      const back = sessionStorage.getItem("lunor_github_return") || "/domains";
      sessionStorage.removeItem("lunor_github_return");
      setTimeout(() => navigate(back, { replace: true }), 1200);
    })();

    return () => { cancelled = true; };
  }, [params, navigate]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="glass-panel w-full max-w-md rounded-xl border border-border p-8 text-center">
        {state === "working" && <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />}
        {state === "done" && <CheckCircle2 className="mx-auto mb-4 h-8 w-8 text-primary" />}
        {state === "error" && <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-destructive" />}
        <h1 className="mb-2 text-xl font-semibold text-foreground">GitHub</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
        {state === "error" && (
          <Button className="mt-6" onClick={() => navigate("/domains", { replace: true })}>
            Back to the editor
          </Button>
        )}
      </div>
    </main>
  );
}
