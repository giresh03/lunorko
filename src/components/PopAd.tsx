import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Dialog, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import posterAsset from "@/assets/dussehra_poster.png.asset.json";

const festivalSessionKey = "lunor-dussehra-poster-shown";

interface PopAd {
  id: string;
  title: string | null;
  image_url: string;
  link_url: string | null;
  festival_name: string;
  start_date: string;
  end_date: string;
}

const PopAd = () => {
  const [ad, setAd] = useState<PopAd | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [festivalOpen, setFestivalOpen] = useState(() => {
    try {
      return sessionStorage.getItem(festivalSessionKey) !== "1";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!festivalOpen) return;
    try {
      sessionStorage.setItem(festivalSessionKey, "1");
    } catch {
      // The popup remains dismissible when browser storage is blocked.
    }
  }, [festivalOpen]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);

    const fetchActiveAd = async () => {
      try {
        const { data, error } = await supabase
          .from("pop_ads" as any)
          .select("id, title, image_url, link_url, festival_name, start_date, end_date")
          .eq("is_active", true)
          .lte("start_date", today)
          .gte("end_date", today)
          .order("sort_order", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          const row = data as any;
          const wasDismissed = sessionStorage.getItem(`popad-dismissed-${row.id}`);
          if (!wasDismissed) setAd(row as PopAd);
        }
      } catch {
        // pop_ads table may not exist yet (404) - fail silently
      }
    };

    fetchActiveAd();
  }, []);

  const handleDismiss = () => {
    try {
      if (ad) sessionStorage.setItem(`popad-dismissed-${ad.id}`, "1");
    } catch {
      // Dismiss in memory even when session storage is unavailable.
    }
    setDismissed(true);
    setAd(null);
  };

  if (festivalOpen) {
    return (
      <Dialog open={festivalOpen} onOpenChange={setFestivalOpen}>
        <DialogPortal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed inset-0 z-[101] flex items-center justify-center bg-background/95 p-3 pt-16 sm:p-6 sm:pt-16 focus:outline-none"
          >
            <DialogTitle className="sr-only">Dussehra subscription offer</DialogTitle>
            <div className="absolute right-4 top-4 z-10">
            <Button
              variant="outline"
              size="icon"
              aria-label="Close festival offer"
              className="h-10 w-10 bg-background text-foreground shadow-lg"
              onClick={() => setFestivalOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            </div>
            <Link
              to="/pricing"
              aria-label="View Dussehra subscription pricing"
              onClick={() => setFestivalOpen(false)}
              className="flex h-full w-full items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <img
                src={posterAsset.url}
                alt="Happy Dussehra. Festival subscription offer. Grab your offer now."
                className="h-full w-full object-contain"
                fetchPriority="high"
              />
            </Link>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    );
  }

  if (!ad || dismissed) return null;

  const content = (
    <div className="relative max-w-2xl w-full mx-auto overflow-hidden rounded-2xl bg-card border border-border shadow-2xl">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/80 hover:bg-background"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
      {ad.link_url ? (
        <a href={ad.link_url} target="_blank" rel="noopener noreferrer" onClick={handleDismiss}>
          <img src={ad.image_url} alt={ad.title || ad.festival_name} className="w-full h-auto object-cover" />
          {ad.title && (
            <div className="p-4 text-center">
              <p className="font-semibold text-foreground">{ad.title}</p>
              <p className="text-sm text-muted-foreground">{ad.festival_name}</p>
            </div>
          )}
        </a>
      ) : (
        <>
          <img src={ad.image_url} alt={ad.title || ad.festival_name} className="w-full h-auto object-cover" />
          {ad.title && (
            <div className="p-4 text-center">
              <p className="font-semibold text-foreground">{ad.title}</p>
              <p className="text-sm text-muted-foreground">{ad.festival_name}</p>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={handleDismiss} aria-hidden />
      <div className="relative z-10" onClick={(e) => e.stopPropagation()}>
        {content}
      </div>
    </div>
  );
};

export default PopAd;
