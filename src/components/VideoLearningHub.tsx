import { useState, useEffect } from "react";
import {
  Video, Play, Clock, ExternalLink, Star, Bookmark, BookmarkCheck,
  Download, DownloadCloud, Filter, ListVideo, Wifi, WifiOff
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { Resource } from "@/lib/domains";

const OFFLINE_KEY = "lunor-video-hub-saved";

interface Playlist {
  id: string;
  label: string;
  icon: typeof Video;
  filter: (r: Resource) => boolean;
}

const sourceColors: Record<string, string> = {
  YouTube: "bg-red-500/10 text-red-400 border-red-500/20",
  Udemy: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Coursera: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const PLAYLISTS: Playlist[] = [
  { id: "all", label: "All Videos", icon: Video, filter: () => true },
  { id: "react-native", label: "React Native", icon: ListVideo, filter: (r) => /react native/i.test(r.title + (r.description || "")) },
  { id: "flutter", label: "Flutter & Dart", icon: ListVideo, filter: (r) => /flutter|dart/i.test(r.title + (r.description || "")) },
  { id: "kotlin", label: "Kotlin / Android", icon: ListVideo, filter: (r) => /kotlin|android/i.test(r.title + (r.description || "")) },
  { id: "courses", label: "Full Courses", icon: Star, filter: (r) => r.type === "course" },
  { id: "quick", label: "Quick Tutorials", icon: Play, filter: (r) => r.type === "video" },
];

function getSavedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]");
  } catch { return []; }
}

function setSavedIds(ids: string[]) {
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(ids));
}

interface Props {
  videos: Resource[];
  domainColor: string;
}

const VideoLearningHub = ({ videos, domainColor }: Props) => {
  const [activePlaylist, setActivePlaylist] = useState("all");
  const [savedIds, setSaved] = useState<string[]>(getSavedIds);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const { toast } = useToast();

  useEffect(() => { setSavedIds(savedIds); }, [savedIds]);

  const toggleSave = (id: string, title: string) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      toast({
        title: next.includes(id) ? "Saved for offline" : "Removed from saved",
        description: title,
      });
      return next;
    });
  };

  const playlist = PLAYLISTS.find((p) => p.id === activePlaylist) || PLAYLISTS[0];
  let filtered = videos.filter(playlist.filter);
  if (showSavedOnly) filtered = filtered.filter((v) => savedIds.includes(v.id));

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" /> Video Learning Hub
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Curated playlists from YouTube &amp; Udemy · {videos.length} resources · {savedIds.length} saved offline
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={showSavedOnly ? "default" : "outline"}
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            className="gap-1.5"
          >
            {showSavedOnly ? <WifiOff className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
            {showSavedOnly ? "Saved Only" : "Offline Library"}
          </Button>
          {savedIds.length > 0 && !showSavedOnly && (
            <Badge variant="outline" className="border-primary/30 text-primary text-xs px-2">
              <DownloadCloud className="h-3 w-3 mr-1" /> {savedIds.length}
            </Badge>
          )}
        </div>
      </div>

      {/* Playlist Tabs */}
      <Tabs value={activePlaylist} onValueChange={setActivePlaylist}>
        <TabsList className="bg-muted/50 h-auto flex-wrap gap-1 p-1">
          {PLAYLISTS.map((pl) => {
            const count = videos.filter(pl.filter).length;
            return (
              <TabsTrigger
                key={pl.id}
                value={pl.id}
                className="text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                disabled={count === 0}
              >
                <pl.icon className="h-3.5 w-3.5" />
                {pl.label}
                <span className="opacity-60">({count})</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {PLAYLISTS.map((pl) => (
          <TabsContent key={pl.id} value={pl.id} className="mt-6">
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center">
                {showSavedOnly ? (
                  <>
                    <Bookmark className="mx-auto h-12 w-12 text-muted-foreground/30" />
                    <p className="mt-4 text-muted-foreground">No saved videos in this playlist yet.</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowSavedOnly(false)}>
                      Browse All
                    </Button>
                  </>
                ) : (
                  <>
                    <Filter className="mx-auto h-12 w-12 text-muted-foreground/30" />
                    <p className="mt-4 text-muted-foreground">No videos match this playlist filter.</p>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Featured */}
                {featured && !showSavedOnly && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" /> Featured
                      </h4>
                    </div>
                    <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
                      <a href={featured.url} target="_blank" rel="noopener noreferrer" className="grid md:grid-cols-2">
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          <HubThumb resource={featured} />
                          <PlayOverlay size="lg" />
                          {featured.duration && <DurationBadge duration={featured.duration} />}
                        </div>
                        <div className="flex flex-col justify-center p-8">
                          <div className="mb-3 flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${sourceColors[featured.source] || ""}`}>{featured.source}</Badge>
                            <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                              {featured.type === "course" ? "Course" : "Tutorial"}
                            </Badge>
                          </div>
                          <h4 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{featured.title}</h4>
                          {featured.description && <p className="mt-2 text-sm text-muted-foreground">{featured.description}</p>}
                          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">Watch Now <ExternalLink className="h-4 w-4" /></span>
                        </div>
                      </a>
                      <SaveButton id={featured.id} title={featured.title} saved={savedIds.includes(featured.id)} onToggle={toggleSave} />
                    </div>
                  </div>
                )}

                {/* Grid */}
                <h4 className="mb-4 text-lg font-bold text-foreground">
                  {showSavedOnly ? "Saved for Offline" : pl.label}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">({(showSavedOnly ? filtered : rest).length})</span>
                </h4>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {(showSavedOnly ? filtered : rest).map((r) => (
                    <div key={r.id} className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl">
                      <a href={r.url} target="_blank" rel="noopener noreferrer">
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          <HubThumb resource={r} />
                          <PlayOverlay />
                          {r.duration && <DurationBadge duration={r.duration} />}
                        </div>
                        <div className="p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <Badge variant="outline" className={`text-[10px] ${sourceColors[r.source] || "border-border"}`}>{r.source}</Badge>
                            <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                              {r.type === "course" ? "Course" : "Video"}
                            </Badge>
                          </div>
                          <h4 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{r.title}</h4>
                          {r.description && <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{r.description}</p>}
                        </div>
                      </a>
                      <SaveButton id={r.id} title={r.title} saved={savedIds.includes(r.id)} onToggle={toggleSave} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Offline info */}
      {savedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
          <Wifi className="h-5 w-5 text-primary shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-foreground">{savedIds.length} video{savedIds.length > 1 ? "s" : ""} saved</span>
            <span className="text-muted-foreground"> — Links and metadata stored locally for offline browsing. Switch to "Offline Library" to filter.</span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Small sub-components ───────────────────────── */

const HubThumb = ({ resource }: { resource: Resource }) => {
  const videoId = resource.url.includes("youtube.com/watch?v=")
    ? resource.url.split("v=")[1]?.split("&")[0]
    : null;
  const thumb = resource.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null);
  return thumb ? (
    <img src={thumb} alt={resource.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
  ) : (
    <div className="flex h-full items-center justify-center"><Video className="h-12 w-12 text-muted-foreground/30" /></div>
  );
};

const PlayOverlay = ({ size = "md" }: { size?: "md" | "lg" }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
    <div className={`flex items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg ${size === "lg" ? "h-16 w-16" : "h-14 w-14"}`}>
      <Play className={`ml-0.5 ${size === "lg" ? "h-7 w-7" : "h-6 w-6"}`} />
    </div>
  </div>
);

const DurationBadge = ({ duration }: { duration: string }) => (
  <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-background/80 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
    <Clock className="h-3 w-3" />{duration}
  </div>
);

const SaveButton = ({ id, title, saved, onToggle }: { id: string; title: string; saved: boolean; onToggle: (id: string, title: string) => void }) => (
  <button
    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(id, title); }}
    className={`absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all ${
      saved ? "bg-primary text-primary-foreground shadow-lg" : "bg-background/60 text-foreground hover:bg-background/80"
    }`}
    title={saved ? "Remove from offline" : "Save for offline"}
  >
    {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
  </button>
);

export default VideoLearningHub;
