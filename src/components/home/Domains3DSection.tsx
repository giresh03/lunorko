import { Link } from "react-router-dom";
import { domains } from "@/lib/domains";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useCallback, lazy, Suspense } from "react";

const World = lazy(() => import("@/components/ui/globe").then((m) => ({ default: m.World })));

const globeConfig = {
  pointSize: 4,
  globeColor: "#062056",
  showAtmosphere: true,
  atmosphereColor: "#FFFFFF",
  atmosphereAltitude: 0.1,
  emissive: "#062056",
  emissiveIntensity: 0.1,
  shininess: 0.9,
  polygonColor: "rgba(255,255,255,0.7)",
  ambientLight: "#38bdf8",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  pointLight: "#ffffff",
  arcTime: 1000,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  initialPosition: { lat: 22.3193, lng: 114.1694 },
  autoRotate: true,
  autoRotateSpeed: 0.5,
};

const colors = ["#06b6d4", "#3b82f6", "#6366f1"];
const sampleArcs = [
  { order: 1, startLat: -19.885592, startLng: -43.951191, endLat: -22.9068, endLng: -43.1729, arcAlt: 0.1, color: colors[0] },
  { order: 1, startLat: 28.6139, startLng: 77.209, endLat: 3.139, endLng: 101.6869, arcAlt: 0.2, color: colors[1] },
  { order: 2, startLat: 1.3521, startLng: 103.8198, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.2, color: colors[2] },
  { order: 2, startLat: 51.5072, startLng: -0.1276, endLat: 3.139, endLng: 101.6869, arcAlt: 0.3, color: colors[0] },
  { order: 3, startLat: -33.8688, startLng: 151.2093, endLat: 22.3193, endLng: 114.1694, arcAlt: 0.3, color: colors[1] },
  { order: 3, startLat: 21.3099, startLng: -157.8581, endLat: 40.7128, endLng: -74.006, arcAlt: 0.3, color: colors[2] },
  { order: 4, startLat: 11.986597, startLng: 8.571831, endLat: -15.595412, endLng: -56.05918, arcAlt: 0.5, color: colors[0] },
  { order: 4, startLat: -34.6037, startLng: -58.3816, endLat: 22.3193, endLng: 114.1694, arcAlt: 0.7, color: colors[1] },
  { order: 5, startLat: 14.5995, startLng: 120.9842, endLat: 51.5072, endLng: -0.1276, arcAlt: 0.3, color: colors[2] },
  { order: 5, startLat: 34.0522, startLng: -118.2437, endLat: 48.8566, endLng: -2.3522, arcAlt: 0.2, color: colors[0] },
  { order: 6, startLat: 37.5665, startLng: 126.978, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.1, color: colors[1] },
  { order: 7, startLat: 52.52, startLng: 13.405, endLat: 34.0522, endLng: -118.2437, arcAlt: 0.2, color: colors[2] },
  { order: 8, startLat: 49.2827, startLng: -123.1207, endLat: 52.3676, endLng: 4.9041, arcAlt: 0.2, color: colors[0] },
  { order: 9, startLat: 22.3193, startLng: 114.1694, endLat: -22.9068, endLng: -43.1729, arcAlt: 0.7, color: colors[1] },
  { order: 10, startLat: -22.9068, startLng: -43.1729, endLat: 28.6139, endLng: 77.209, arcAlt: 0.7, color: colors[2] },
];

const Domain3DCard = ({ domain, index }: { domain: typeof domains[0]; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 20;
    const rotateY = (x - 0.5) * 20;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, hsl(${domain.color} / 0.4), transparent 60%)`;
      glowRef.current.style.opacity = "1";
    }
  }, [domain.color]);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    if (glowRef.current) glowRef.current.style.opacity = "0";
  }, []);

  const Icon = domain.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: -10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="will-change-transform transition-transform duration-200 ease-out"
        style={{ transformStyle: "preserve-3d" }}
      >
        <Link
          to={`/domain/${domain.id}`}
          className="group relative block h-[320px] rounded-2xl overflow-hidden border border-border/40 hover:border-primary/50 transition-colors duration-500 shadow-lg hover:shadow-2xl"
        >
          <img src={domain.image} alt={domain.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />
          <div ref={glowRef} className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none" />
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: `inset 0 0 40px hsl(${domain.color} / 0.2), 0 0 60px hsl(${domain.color} / 0.15)` }} />

          <div className="absolute top-4 left-4 flex h-12 w-12 items-center justify-center rounded-xl backdrop-blur-md border border-border/30 transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1" style={{ background: `hsl(${domain.color} / 0.25)` }}>
            <Icon className="h-6 w-6" style={{ color: `hsl(${domain.color})` }} />
          </div>

          <div className="absolute top-4 right-4 h-9 w-9 rounded-full bg-foreground/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <ArrowRight className="h-4 w-4 text-foreground" />
          </div>

          <div className="absolute inset-x-0 bottom-0 flex flex-col p-5">
            <h3 className="text-xl font-bold text-white mb-1.5 tracking-tight drop-shadow-lg">{domain.name}</h3>
            <p className="text-white/70 text-sm line-clamp-2 mb-3 leading-relaxed">{domain.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {domain.topics.slice(0, 4).map((topic) => (
                <span key={topic} className="px-2.5 py-0.5 text-[11px] font-medium rounded-full border backdrop-blur-sm" style={{ color: `hsl(${domain.color})`, borderColor: `hsl(${domain.color} / 0.35)`, background: `hsl(${domain.color} / 0.15)` }}>
                  {topic}
                </span>
              ))}
              {domain.topics.length > 4 && <span className="px-2 py-0.5 text-[11px] text-white/50">+{domain.topics.length - 4}</span>}
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
};

const Domains3DSection = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header with Globe */}
        <div className="flex flex-col lg:flex-row items-center gap-8 mb-16">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-primary">
              12+ Domains
            </span>
            <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl mt-4">
              Explore Every{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-[hsl(192,91%,50%)]">
                Engineering Domain
              </span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl">
              Click any domain to dive into curated resources, AI coding assistance, and guided roadmaps.
            </p>
            <p className="mt-2 text-muted-foreground/70 text-sm">
              Our learners connect from around the world — join the global community.
            </p>
          </div>

          {/* Globe */}
          <div className="flex-1 relative h-[350px] md:h-[450px] w-full max-w-[500px]">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            }>
              <World globeConfig={globeConfig} data={sampleArcs} />
            </Suspense>
          </div>
        </div>

        {/* 3D Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {domains.map((domain, i) => (
            <Domain3DCard key={domain.id} domain={domain} index={i} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
          <Button size="lg" className="hover-scale" asChild>
            <Link to="/domains">
              View All Domains <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Domains3DSection;
