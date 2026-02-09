import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Code2, Target, Users, Lightbulb } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-foreground">About Lunor.AI</h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Lunor.AI is an AI-powered edutech platform built for engineering students across all domains. 
            Our mission is to democratize coding education by combining curated learning resources with 
            intelligent AI assistants that help you learn, code, and debug faster than ever before.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {[
              { icon: Target, title: "Our Mission", desc: "Make quality engineering education accessible to every student through AI-powered tools." },
              { icon: Users, title: "For Students", desc: "Built specifically for engineering students who want to master real-world skills." },
              { icon: Code2, title: "AI-First", desc: "Every domain comes with its own AI code assistant for personalized learning." },
              { icon: Lightbulb, title: "Always Growing", desc: "We continuously add new domains, courses, and resources to keep you ahead." },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-6">
                <item.icon className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
