import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { domains } from "@/lib/domains";
import { getRoadmap } from "@/lib/learningRoadmap";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import LevelWorkspace from "@/components/learn/LevelWorkspace";
import { lessonVideoFor } from "@/lib/lessonVideos";

const LevelPage = () => {
  const { domainId, levelIndex } = useParams();
  const navigate = useNavigate();
  const domain = domains.find((d) => d.id === domainId);
  const roadmap = useMemo(() => getRoadmap(domainId ?? ""), [domainId]);
  const learning = useLearningProgress(domainId ?? "");
  const level = roadmap.find((l) => l.index === Number(levelIndex));

  const backToRoadmap = () => navigate(`/domain/${domainId}`);

  if (!domain || !level) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-28 pb-16 text-center">
          <h1 className="mb-4 text-2xl font-bold text-foreground">Level not found</h1>
          <Button onClick={backToRoadmap}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to roadmap
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
          {domain.name} · Level {level.index} of {roadmap.length}
        </p>
        <LevelWorkspace
          domainId={domainId ?? ""}
          domainName={domain.name}
          level={level}
          videoUrl={
            lessonVideoFor(domain.id, level.index) ??
            domain.resources.find((resource) => resource.type === "video")?.url
          }
          onBack={backToRoadmap}
          onComplete={(score) => learning.completeLevel(level.index, score, level.xp)}
        />
      </main>
      <Footer />
    </div>
  );
};

export default LevelPage;
