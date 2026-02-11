import { Users, BookOpen, Code2, Award } from "lucide-react";

const stats = [
  { icon: Users, value: "10,000+", label: "Active Students" },
  { icon: BookOpen, value: "12+", label: "Engineering Domains" },
  { icon: Code2, value: "50,000+", label: "AI Code Sessions" },
  { icon: Award, value: "95%", label: "Satisfaction Rate" },
];

const StatsSection = () => (
  <section className="border-y border-border bg-card/50 py-16">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out text-center"
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <stat.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground md:text-4xl">{stat.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
