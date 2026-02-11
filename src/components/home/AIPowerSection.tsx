import { Brain, MessageSquare, Bug, Lightbulb, FileCode2, Wand2 } from "lucide-react";
import aiPowerImg from "@/assets/sections/ai-power.jpg";

const capabilities = [
  { icon: MessageSquare, title: "Ask Anything", desc: "Chat with AI about any coding concept, get instant explanations" },
  { icon: Bug, title: "Debug Instantly", desc: "Paste your error, get step-by-step fixes in seconds" },
  { icon: FileCode2, title: "Generate Code", desc: "Describe what you want, AI writes production-ready code" },
  { icon: Lightbulb, title: "Learn Concepts", desc: "AI breaks down complex topics into simple analogies" },
  { icon: Wand2, title: "Optimize Code", desc: "Get performance improvements and best-practice suggestions" },
  { icon: Brain, title: "Domain Expert", desc: "AI adapts its knowledge based on your selected domain" },
];

const AIPowerSection = () => (
  <section className="py-24">
    <div className="container mx-auto px-4">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* Image */}
        <div className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out order-2 lg:order-1">
          <div className="relative overflow-hidden rounded-xl border border-border">
            <img
              src={aiPowerImg}
              alt="AI-powered coding brain"
              className="w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-sm font-medium text-foreground">
                Our AI understands 12+ engineering domains
              </p>
              <p className="text-xs text-muted-foreground">
                Powered by advanced language models trained on millions of code repositories
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="order-1 lg:order-2">
          <div className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
            <span className="mb-3 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
              AI-Powered
            </span>
            <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
              Your Personal <span className="text-primary">AI Coding Mentor</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              Not just another ChatGPT wrapper. Our AI is fine-tuned for engineering students —
              it understands your domain, your level, and your goals.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {capabilities.map((cap, i) => (
              <div
                key={i}
                className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="group flex gap-3 rounded-lg border border-border bg-card p-4 transition-all duration-300 hover:border-primary/30">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                    <cap.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{cap.title}</h4>
                    <p className="text-xs text-muted-foreground">{cap.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default AIPowerSection;
