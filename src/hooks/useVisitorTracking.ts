import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Tracks a single page visit per session using sessionStorage to deduplicate */
export function useVisitorTracking() {
  useEffect(() => {
    const key = "lunor_visit_tracked";
    if (sessionStorage.getItem(key)) return;

    // Generate or reuse a persistent visitor id
    let visitorId = localStorage.getItem("lunor_visitor_id");
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem("lunor_visitor_id", visitorId);
    }

    supabase
      .from("site_visits" as any)
      .insert({
        page_path: window.location.pathname,
        visitor_id: visitorId,
        user_agent: navigator.userAgent.slice(0, 256),
      })
      .then(() => {
        sessionStorage.setItem(key, "1");
      });
  }, []);
}
