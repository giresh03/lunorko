import { useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Download, Play, Pause, Share2 } from "lucide-react";
import promoVideo from "@/assets/promo-video.mp4";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const PromoVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = promoVideo;
    a.download = "Lunor-AI-Promo.mp4";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({ title: "Download started!", description: "Your promo video is being downloaded." });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Lunor.AI — AI-Powered Learning",
          text: "Check out Lunor.AI — the AI-powered learning platform for engineers!",
          url: window.location.origin,
        });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.origin);
      toast({ title: "Link copied!", description: "Share link copied to clipboard." });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-2 text-4xl font-bold text-foreground md:text-5xl">
            Lunor.AI <span className="text-primary">Promo Video</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Share this video to spread the word about AI-powered learning for engineers.
          </p>

          <div className="relative mx-auto overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            <video
              ref={videoRef}
              src={promoVideo}
              className="w-full"
              loop
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onClick={togglePlay}
              controls
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" onClick={togglePlay} variant="outline">
              {isPlaying ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <Button size="lg" onClick={handleDownload}>
              <Download className="mr-2 h-5 w-5" />
              Download Video
            </Button>
            <Button size="lg" variant="secondary" onClick={handleShare}>
              <Share2 className="mr-2 h-5 w-5" />
              Share
            </Button>
          </div>

          <div className="mt-12 grid gap-6 text-left md:grid-cols-3">
            {[
              { title: "4 Domains", desc: "Web Development, App Development, DSA & Competitive Programming, and UI/UX Design." },
              { title: "AI Code Assistant", desc: "Real-time AI help while you code — like having a mentor 24/7." },
              { title: "Gamified Learning", desc: "Daily challenges, XP points, achievements, and leaderboards." },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-2 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PromoVideo;
