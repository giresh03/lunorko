import { Navigate } from "react-router-dom";
import { Sparkles, Image as ImageIcon, Wand2, Film, LayoutGrid, Palette } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LockGate from "@/components/LockGate";
import ImageStudio from "@/components/studio/ImageStudio";
import EditStudio from "@/components/studio/EditStudio";
import VideoStudio from "@/components/studio/VideoStudio";
import CreationsGrid from "@/components/studio/CreationsGrid";
import { useAuth } from "@/hooks/useAuth";

const Studio = () => {
  const { user, loading } = useAuth();

  if (!loading && !user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <LockGate lockKey="studio" name="Lunor Studio">
        <main className="mx-auto max-w-7xl px-4 pb-20 pt-28">
          <header className="relative overflow-hidden rounded-3xl border border-border bg-card/50 p-8 md:p-12">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(600px circle at 15% 0%, hsl(var(--primary) / 0.18), transparent 60%)",
              }}
            />
            <div className="relative">
              <Badge className="mb-4 bg-primary/15 text-primary">
                <Sparkles className="mr-1 h-3 w-3" /> AI Media Studio
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                Lunor <span className="text-primary">Studio</span>
              </h1>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                Generate posters, product shots, thumbnails and cinematic video clips from a single prompt.
                Edit any image by describing the change — no design tools required.
              </p>
            </div>
          </header>

          <Tabs defaultValue="image" className="mt-8">
            <TabsList className="flex w-full flex-wrap justify-start gap-2 bg-transparent p-0">
              {[
                { v: "image", label: "Images", Icon: ImageIcon },
                { v: "poster", label: "Posters", Icon: Palette },
                { v: "edit", label: "Edit", Icon: Wand2 },
                { v: "video", label: "Video", Icon: Film },
                { v: "library", label: "My creations", Icon: LayoutGrid },
              ].map(({ v, label, Icon }) => (
                <TabsTrigger
                  key={v}
                  value={v}
                  className="group rounded-full border border-border bg-card/60 px-5 py-2.5 text-sm transition-all duration-300 data-[state=active]:border-primary data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_24px_-8px_hsl(var(--primary))]"
                >
                  <Icon className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="image" className="mt-6">
              <ImageStudio kind="image" />
            </TabsContent>
            <TabsContent value="poster" className="mt-6">
              <ImageStudio kind="poster" />
            </TabsContent>
            <TabsContent value="edit" className="mt-6">
              <EditStudio />
            </TabsContent>
            <TabsContent value="video" className="mt-6">
              <VideoStudio />
            </TabsContent>
            <TabsContent value="library" className="mt-6">
              <CreationsGrid />
            </TabsContent>
          </Tabs>
        </main>
      </LockGate>
      <Footer />
    </div>
  );
};

export default Studio;
