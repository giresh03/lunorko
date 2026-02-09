import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DomainCard from "@/components/DomainCard";
import { domains } from "@/lib/domains";

const Domains = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-20">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground">All Domains</h1>
          <p className="mt-2 text-muted-foreground">
            Choose a domain to start learning with AI-powered guidance and resources
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {domains.map((d) => (
            <DomainCard key={d.id} domain={d} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Domains;
