import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DomainCard from "@/components/DomainCard";
import { domains } from "@/lib/domains";
import { useScrollReveal, scrollRevealStyle } from "@/hooks/useScrollReveal";

const Domains = () => {
  const pageRef = useScrollReveal();

  return (
    <div className="min-h-screen bg-background" ref={pageRef}>
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-20">
        <div className="mb-10 scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-serif">All Domains</h1>
          <p className="mt-2 text-muted-foreground">
            Choose a domain to start learning with AI-powered guidance and resources
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {domains.map((d, i) => (
            <div
              key={d.id}
              className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out hover-scale"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <DomainCard domain={d} />
            </div>
          ))}
        </div>
      </main>
      <Footer />
      <style>{scrollRevealStyle}</style>
    </div>
  );
};

export default Domains;
