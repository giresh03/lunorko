import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);

    const fetchActiveAd = async () => {
      const { data } = await supabase
        .from("pop_ads")
        .select("id, title, image_url, link_url, festival_name, start_date, end_date")
        .eq("is_active", true)
        .lte("start_date", today)
        .gte("end_date", today)
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (data) {
        const wasDismissed = sessionStorage.getItem(`popad-dismissed-${data.id}`);
        if (!wasDismissed) setAd(data);
      }
    };

    fetchActiveAd();
  }, []);

  const handleDismiss = () => {
    if (ad) sessionStorage.setItem(`popad-dismissed-${ad.id}`, "1");
    setDismissed(true);
    setAd(null);
  };

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
