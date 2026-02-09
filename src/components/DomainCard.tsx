import { Link } from "react-router-dom";
import { domains } from "@/lib/domains";

const DomainCard = ({ domain }: { domain: typeof domains[0] }) => {
  const Icon = domain.icon;

  return (
    <Link
      to={`/domain/${domain.id}`}
      className="group relative flex flex-col gap-4 rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:glow-primary"
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-lg"
        style={{ backgroundColor: `hsl(${domain.color} / 0.15)` }}
      >
        <Icon className="h-6 w-6" style={{ color: `hsl(${domain.color})` }} />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {domain.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{domain.description}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {domain.topics.slice(0, 4).map((topic) => (
          <span
            key={topic}
            className="rounded-sm bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
          >
            {topic}
          </span>
        ))}
        {domain.topics.length > 4 && (
          <span className="text-xs text-muted-foreground">+{domain.topics.length - 4} more</span>
        )}
      </div>
    </Link>
  );
};

export default DomainCard;
