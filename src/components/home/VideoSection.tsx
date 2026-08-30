import { Play } from "lucide-react";
import { useRef, useState } from "react";
import platformDemoVideo from "@/assets/sections/platform-demo.mp4";

const VideoSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
          <span className="mb-3 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
            See It In Action
          </span>
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Watch <span className="text-primary">Lunor.AI</span> in Action
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            See how our AI-powered platform helps engineering students learn faster, code smarter, and get job-ready.
          </p>
        </div>

        <div className="scroll-reveal opacity-0 scale-95 transition-all duration-700 ease-out mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-xl border border-border shadow-2xl">
            <video
              ref={videoRef}
              src={platformDemoVideo}
              className="w-full"
              controls={isPlaying}
              loop
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              poster=""
            />
            {/* Play overlay */}
            {!isPlaying && (
              <button
                onClick={handlePlay}
                className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-sm transition-opacity duration-300 hover:bg-background/30"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-110">
                  <Play className="h-8 w-8 ml-1" />
                </div>
                <span className="mt-4 text-sm font-medium text-foreground">Watch Demo</span>
              </button>
            )}
          </div>
          <div className="mt-4 text-center">
            <Link to="/promo" className="text-sm font-medium text-primary hover:underline">
              Watch the full explainer →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
