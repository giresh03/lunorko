import { Star, Quote } from "lucide-react";
import studentSuccessImg from "@/assets/sections/student-success.jpg";

const testimonials = [
  {
    name: "Arjun Mehta",
    role: "3rd Year, CSE — IIT Bombay",
    text: "Lunor.AI replaced 5 different platforms for me. The AI code assistant alone saved me 100+ hours during my internship prep.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Final Year, IT — NIT Trichy",
    text: "The roadmaps are incredibly well-structured. I went from knowing nothing about cloud computing to getting an AWS certification in 3 months.",
    rating: 5,
  },
  {
    name: "Rahul Verma",
    role: "2nd Year, ECE — BITS Pilani",
    text: "The mentor sessions were game-changing. Got real industry insights that my college professors couldn't provide. Totally worth it!",
    rating: 5,
  },
  {
    name: "Sneha Patel",
    role: "Final Year, CSE — VIT Vellore",
    text: "I built my entire portfolio using Lunor.AI's project guidance. Got placed at a top product company with a 24 LPA package!",
    rating: 5,
  },
];

const TestimonialsSection = () => (
  <section className="relative overflow-hidden py-24">
    {/* Background */}
    <div className="absolute inset-0 z-0">
      <img src={studentSuccessImg} alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" />
    </div>

    <div className="container relative z-10 mx-auto px-4">
      <div className="mb-12 text-center scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
        <span className="mb-3 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
          Student Stories
        </span>
        <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
          Loved by <span className="text-primary">10,000+ Students</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Hear from engineering students who transformed their careers with Lunor.AI
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out"
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <div className="group rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg">
              <Quote className="mb-3 h-6 w-6 text-primary/40" />
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground italic">"{t.text}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-primary text-primary" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
