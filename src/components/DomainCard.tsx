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
        className="group relative flex flex-col gap-5 rounded-xl bg-card p-7 min-h-[260px] transition-all duration-500 hover:bg-card/90 hover:-translate-y-1 hover:shadow-xl"
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
          style={{ backgroundColor: `hsl(${domain.color} / 0.15)` }}
        >
          <Icon className="h-7 w-7 transition-all duration-500" style={{ color: `hsl(${domain.color})` }} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
            {domain.name}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">{domain.description}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {domain.topics.slice(0, 4).map((topic) => (
            <span
              key={topic}
              className="rounded-md bg-secondary/80 px-2.5 py-1 text-xs text-secondary-foreground transition-colors duration-300 group-hover:bg-primary/10 group-hover:text-primary"
            >
              {topic}
            </span>
          ))}
          {domain.topics.length > 4 && (
            <span className="text-xs text-muted-foreground px-1 py-1">+{domain.topics.length - 4}</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
          Explore <ArrowRight className="h-3 w-3" />
        </div>
      </Link>
    </BackgroundGradient>
  );
};

export default DomainCard;
