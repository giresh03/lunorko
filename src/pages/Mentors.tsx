import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Building2, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MentorCard from "@/components/MentorCard";
import { supabase } from "@/integrations/supabase/client";
import { domains } from "@/lib/domains";
import { useScrollReveal, scrollRevealStyle } from "@/hooks/useScrollReveal";

export interface Mentor {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  domain_id: string;
  bio: string | null;
  avatar_url: string | null;
  meeting_link: string | null;
  years_experience: number;
}

const companies = ["All", "Google", "Microsoft", "Amazon", "Meta", "Apple", "Uber", "Flipkart", "Adobe", "Oracle", "JP Morgan", "Polygon", "Bosch", "Deloitte", "Amazon Web Services", "TCS", "Infosys", "Wipro", "Cognizant", "HCL"];

const Mentors = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const pageRef = useScrollReveal();

  useEffect(() => {
    const fetchMentors = async () => {
      const { data } = await supabase.from("mentors").select("*").eq("is_active", true);
      setMentors((data as Mentor[]) ?? []);
      setLoading(false);
    };
    fetchMentors();
  }, []);

  const filtered = mentors.filter((m) => {
    const matchDomain = selectedDomain === "all" || m.domain_id === selectedDomain;
    const matchCompany = selectedCompany === "All" || m.company === selectedCompany;
    const matchSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      m.company.toLowerCase().includes(search.toLowerCase());
    return matchDomain && matchCompany && matchSearch;
  });

  // Group by company
  const grouped = filtered.reduce<Record<string, Mentor[]>>((acc, m) => {
    (acc[m.company] ??= []).push(m);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background" ref={pageRef}>
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-20">
        <div className="mb-8 scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-serif">Find a Mentor</h1>
          <p className="mt-1 text-muted-foreground">
            Connect with industry professionals for guidance, code reviews, and career advice
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4 scroll-reveal opacity-0 translate-y-6 transition-all duration-700 delay-100 ease-out">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mentors, roles, companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 mr-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Domain:</span>
            </div>
            <button
              onClick={() => setSelectedDomain("all")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedDomain === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              All
            </button>
            {domains.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDomain(d.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedDomain === d.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 mr-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Company:</span>
            </div>
            {companies.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCompany(c)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedCompany === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">Loading mentors…</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="text-muted-foreground">No mentors found matching your filters.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([company, companyMentors], gi) => (
            <div key={company} className="mb-10 scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out" style={{ transitionDelay: `${gi * 120}ms` }}>
              <div className="mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">{company}</h2>
                <span className="rounded-sm bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                  {companyMentors.length} mentor{companyMentors.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {companyMentors.map((mentor, mi) => (
                  <div
                    key={mentor.id}
                    className="scroll-reveal opacity-0 translate-y-6 transition-all duration-500 ease-out hover-scale"
                    style={{ transitionDelay: `${gi * 120 + mi * 80}ms` }}
                  >
                    <MentorCard mentor={mentor} />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
      <Footer />
      <style>{scrollRevealStyle}</style>
    </div>
  );
};

export default Mentors;
