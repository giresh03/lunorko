import { Check, X } from "lucide-react";

const features = [
  { name: "Structured Roadmaps", lunor: true, youtube: false, bootcamp: true, chatgpt: false },
  { name: "AI Code Assistant", lunor: true, youtube: false, bootcamp: false, chatgpt: true },
  { name: "Domain-Specific AI", lunor: true, youtube: false, bootcamp: false, chatgpt: false },
  { name: "1:1 Mentorship", lunor: true, youtube: false, bootcamp: true, chatgpt: false },
  { name: "Free Tier Available", lunor: true, youtube: true, bootcamp: false, chatgpt: true },
  { name: "Curated Resources", lunor: true, youtube: false, bootcamp: true, chatgpt: false },
  { name: "Hands-on Projects", lunor: true, youtube: false, bootcamp: true, chatgpt: false },
  { name: "Community Support", lunor: true, youtube: true, bootcamp: true, chatgpt: false },
];

const Cell = ({ value }: { value: boolean }) =>
  value ? (
    <Check className="mx-auto h-4 w-4 text-primary" />
  ) : (
    <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
  );

const ComparisonSection = () => (
  <section className="border-y border-border bg-card/30 py-24">
    <div className="container mx-auto px-4">
      <div className="mb-12 text-center scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
        <span className="mb-3 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
          Comparison
        </span>
        <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
          Why Lunor.AI <span className="text-primary">Beats the Rest</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          See how we stack up against other learning options
        </p>
      </div>

      <div className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out mx-auto max-w-4xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Feature</th>
              <th className="px-4 py-3 text-center font-semibold text-primary">Lunor.AI</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">YouTube</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Bootcamps</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">ChatGPT</th>
            </tr>
          </thead>
          <tbody>
            {features.map((f, i) => (
              <tr key={i} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 font-medium text-foreground">{f.name}</td>
                <td className="px-4 py-3 bg-primary/5"><Cell value={f.lunor} /></td>
                <td className="px-4 py-3"><Cell value={f.youtube} /></td>
                <td className="px-4 py-3"><Cell value={f.bootcamp} /></td>
                <td className="px-4 py-3"><Cell value={f.chatgpt} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

export default ComparisonSection;
