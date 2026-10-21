import { Loader2, Trash2, Download, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStudio } from "@/hooks/useStudio";

const CreationsGrid = () => {
  const { creations, loadingCreations, deleteCreation } = useStudio();

  if (loadingCreations) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (creations.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border text-muted-foreground">
        <ImageIcon className="h-10 w-10 opacity-40" />
        <p className="mt-3 text-sm">Nothing here yet — generate something and save it.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {creations.map((c) => (
        <div
          key={c.id}
          className="group overflow-hidden rounded-2xl border border-border bg-card/50 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_-12px_hsl(var(--primary))]"
        >
          <div className="relative flex aspect-video items-center justify-center bg-background/60">
            {c.url && c.kind === "video" ? (
              <video src={c.url} controls playsInline className="h-full w-full object-cover" />
            ) : c.url ? (
              <img src={c.url} alt={c.prompt} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs text-muted-foreground">{c.status}</span>
            )}
            <Badge className="absolute left-2 top-2 bg-background/80 text-[10px] uppercase tracking-wider">
              {c.kind}
            </Badge>
          </div>
          <div className="space-y-3 p-4">
            <p className="line-clamp-2 text-sm text-muted-foreground">{c.prompt}</p>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                {new Date(c.created_at).toLocaleDateString()}
              </span>
              <div className="flex gap-1">
                {c.url && (
                  <Button size="icon" variant="ghost" asChild>
                    <a href={c.url} download>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button size="icon" variant="ghost" onClick={() => deleteCreation(c)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CreationsGrid;
