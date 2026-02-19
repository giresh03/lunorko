import { Link } from "react-router-dom";
import { domains } from "@/lib/domains";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

function hslToValues(hslStr: string) {
  return hslStr; // already in "h s% l%" format
}

const Domains3DSection = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="mb-14 text-center scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
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

        {/* Domain Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-7xl mx-auto">
          {domains.map((domain, i) => (
            <motion.div
              key={domain.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to={`/domains/${domain.id}`}
                className="group relative block h-[280px] rounded-xl overflow-hidden border border-border/50 hover:border-primary/40 transition-all duration-500"
              >
                {/* Domain image */}
                <img
                  src={domain.image}
                  alt={domain.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                  style={{ background: `linear-gradient(135deg, hsl(${domain.color} / 0.6), transparent)` }}
                />

                {/* Glow border effect on hover */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    boxShadow: `inset 0 0 30px hsl(${domain.color} / 0.15), 0 0 40px hsl(${domain.color} / 0.1)`,
                  }}
                />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  {/* Icon */}
                  <div
                    className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `hsl(${domain.color} / 0.2)` }}
                  >
                    <domain.icon
                      className="h-5 w-5"
                      style={{ color: `hsl(${domain.color})` }}
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-1 tracking-tight">
                    {domain.name}
                  </h3>

                  {/* Topic pills */}
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {domain.topics.slice(0, 3).map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-0.5 text-[10px] font-medium rounded-full border"
                        style={{
                          color: `hsl(${domain.color})`,
                          borderColor: `hsl(${domain.color} / 0.3)`,
                          background: `hsl(${domain.color} / 0.1)`,
                        }}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  {/* Arrow indicator */}
                  <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 -translate-x-2">
                    <ArrowRight className="h-4 w-4 text-white" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
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
