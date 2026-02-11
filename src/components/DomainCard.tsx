import { Link } from "react-router-dom";
import { domains } from "@/lib/domains";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { ArrowRight } from "lucide-react";

const DomainCard = ({ domain }: { domain: typeof domains[0] }) => {
  const Icon = domain.icon;

  return (
    <BackgroundGradient containerClassName="rounded-xl h-full">
      <Link
        to={`/domain/${domain.id}`}
        className="group relative flex flex-col rounded-xl bg-card overflow-hidden min-h-[320px] transition-all duration-500 hover:bg-card/90 hover:-translate-y-1 hover:shadow-xl"
      >
        {/* Image */}
        <div className="relative h-36 w-full overflow-hidden">
          <img
            src={domain.image}
            alt={domain.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          <div
            className="absolute top-3 left-3 flex h-10 w-10 items-center justify-center rounded-lg backdrop-blur-md border border-border/30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
            style={{ backgroundColor: `hsl(${domain.color} / 0.25)` }}
          >
            <Icon className="h-5 w-5" style={{ color: `hsl(${domain.color})` }} />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div>
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
              {domain.name}
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">{domain.description}</p>
          </div>
          <div className="mt-auto flex flex-wrap gap-1.5">
            {domain.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="rounded-md bg-secondary/80 px-2.5 py-1 text-xs text-secondary-foreground transition-colors duration-300 group-hover:bg-primary/10 group-hover:text-primary"
              >
                {topic}
              </span>
            ))}
            {domain.topics.length > 3 && (
              <span className="text-xs text-muted-foreground px-1 py-1">+{domain.topics.length - 3}</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
            Explore <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </Link>
    </BackgroundGradient>
  );
};

export default DomainCard;
