import { Link } from "react-router-dom";
import { domains } from "@/lib/domains";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useCallback } from "react";

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
    if (glowRef.current) {
      glowRef.current.style.opacity = "0";
    }
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
          to={`/domains/${domain.id}`}
          className="group relative block h-[320px] rounded-2xl overflow-hidden border border-border/40 hover:border-primary/50 transition-colors duration-500 shadow-lg hover:shadow-2xl"
        >
          {/* Domain image */}
          <img
            src={domain.image}
            alt={domain.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />

          {/* Interactive glow that follows cursor */}
          <div
            ref={glowRef}
            className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
          />

          {/* Glow border on hover */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              boxShadow: `inset 0 0 40px hsl(${domain.color} / 0.2), 0 0 60px hsl(${domain.color} / 0.15)`,
            }}
          />

          {/* Floating 3D icon */}
          <div
            className="absolute top-4 left-4 flex h-12 w-12 items-center justify-center rounded-xl backdrop-blur-md border border-border/30 transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1"
            style={{
              background: `hsl(${domain.color} / 0.25)`,
              transform: "translateZ(30px)",
            }}
          >
            <Icon className="h-6 w-6" style={{ color: `hsl(${domain.color})` }} />
          </div>

          {/* Arrow */}
          <div className="absolute top-4 right-4 h-9 w-9 rounded-full bg-foreground/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <ArrowRight className="h-4 w-4 text-foreground" />
          </div>

          {/* Content */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col p-5" style={{ transform: "translateZ(20px)" }}>
            <h3 className="text-xl font-bold text-white mb-1.5 tracking-tight drop-shadow-lg">
              {domain.name}
            </h3>
            <p className="text-white/70 text-sm line-clamp-2 mb-3 leading-relaxed">
              {domain.description}
            </p>

            {/* Topic pills */}
            <div className="flex flex-wrap gap-1.5">
              {domain.topics.slice(0, 4).map((topic) => (
                <span
                  key={topic}
                  className="px-2.5 py-0.5 text-[11px] font-medium rounded-full border backdrop-blur-sm"
                  style={{
                    color: `hsl(${domain.color})`,
                    borderColor: `hsl(${domain.color} / 0.35)`,
                    background: `hsl(${domain.color} / 0.15)`,
                  }}
                >
                  {topic}
                </span>
              ))}
              {domain.topics.length > 4 && (
                <span className="px-2 py-0.5 text-[11px] text-white/50">
                  +{domain.topics.length - 4}
                </span>
              )}
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
        {/* Header */}
        <div className="mb-16 text-center scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-primary">
            12+ Domains
          </span>
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl mt-4">
            Explore Every{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-[hsl(192,91%,50%)]">
              Engineering Domain
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Click any domain to dive into curated resources, AI coding assistance, and guided roadmaps.
          </p>
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
