import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useScrollReveal, scrollRevealStyle } from "@/hooks/useScrollReveal";
import {
  Search, Building2, Filter, GraduationCap, Briefcase, Code2,
  MapPin, ChevronRight, Sparkles, CalendarDays, ExternalLink,
  BookOpen, Lightbulb, Route, Clock, User2, X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingDialog from "@/components/BookingDialog";
import { supabase } from "@/integrations/supabase/client";
import { domains } from "@/lib/domains";

interface GuidanceMentor {
  id: string;
  name: string;
  company: string;
  role: string;
  domain_id: string;
  bio: string | null;
  avatar_url: string | null;
  meeting_link: string | null;
  years_experience: number;
  college_preparation: string | null;
  tech_stack: string[] | null;
  career_tips: string | null;
  journey_summary: string | null;
}

const companies = [
  "All", "Google", "Microsoft", "Amazon", "Meta", "Apple", "JP Morgan",
  "Uber", "Flipkart", "Adobe", "Polygon", "Oracle", "Bosch",
  "TCS", "Infosys", "Wipro", "Cognizant", "HCL", "Deloitte", "Amazon Web Services"
];

const GuidanceRoadmap = () => {
  const [mentors, setMentors] = useState<GuidanceMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [selectedMentor, setSelectedMentor] = useState<GuidanceMentor | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingMentor, setBookingMentor] = useState<GuidanceMentor | null>(null);
  const pageRef = useScrollReveal();

  useEffect(() => {
    const fetchMentors = async () => {
      const { data } = await supabase
        .from("mentors")
        .select("id, name, company, role, domain_id, bio, avatar_url, meeting_link, years_experience, is_active, created_at, college_preparation, tech_stack, career_tips, journey_summary")
        .eq("is_active", true)
        .not("college_preparation", "is", null);
      setMentors((data as GuidanceMentor[]) ?? []);
      setLoading(false);
    };
    fetchMentors();
  }, []);

  const filtered = useMemo(() => mentors.filter((m) => {
    const matchDomain = selectedDomain === "all" || m.domain_id === selectedDomain;
    const matchCompany = selectedCompany === "All" || m.company === selectedCompany;
    const matchSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      m.company.toLowerCase().includes(search.toLowerCase()) ||
      m.domain_id.toLowerCase().includes(search.toLowerCase());
    return matchDomain && matchCompany && matchSearch;
  }), [mentors, selectedDomain, selectedCompany, search]);

  const grouped = useMemo(() => {
    const map: Record<string, GuidanceMentor[]> = {};
    filtered.forEach((m) => {
      const domainName = domains.find((d) => d.id === m.domain_id)?.name || m.domain_id;
      (map[domainName] ??= []).push(m);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const getDomain = (id: string) => domains.find((d) => d.id === id);

  const handleBook = (mentor: GuidanceMentor) => {
    setBookingMentor(mentor);
    setShowBooking(true);
    setSelectedMentor(null);
  };

  return (
    <div className="min-h-screen bg-background" ref={pageRef}>
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-20">
        {/* Hero Section */}
        <div className="relative mb-12 overflow-hidden rounded-xl border border-border bg-card p-8 md:p-12 scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
          <div className="absolute inset-0 gradient-hero opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Career Guidance
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Guidance Roadmap
            </h1>
            <p className="max-w-2xl text-muted-foreground leading-relaxed">
              Learn from senior professionals at <span className="font-semibold text-foreground">Google, Microsoft, Amazon, JP Morgan, Meta, Apple</span> and more. 
              Discover what they prepared in college, the tech stacks their companies use, and get personalized career advice.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 font-medium">
                <GraduationCap className="h-3.5 w-3.5" /> College Prep Tips
              </span>
              <span className="flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 font-medium">
                <Code2 className="h-3.5 w-3.5" /> Company Tech Stacks
              </span>
              <span className="flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 font-medium">
                <Route className="h-3.5 w-3.5" /> Career Roadmaps
              </span>
              <span className="flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 font-medium">
                <CalendarDays className="h-3.5 w-3.5" /> Book 1:1 Sessions
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4 scroll-reveal opacity-0 translate-y-6 transition-all duration-700 delay-100 ease-out">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mentors, companies, roles..."
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
          <div className="flex items-center justify-center py-20 text-muted-foreground">Loading guidance roadmaps…</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="text-muted-foreground">No mentors found matching your filters.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {grouped.map(([domainName, domainMentors]) => {
              const domainData = domains.find((d) => d.name === domainName);
              const DomainIcon = domainData?.icon || Code2;
              return (
                <section key={domainName}>
                  <div className="mb-6 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: domainData ? `hsl(${domainData.color} / 0.15)` : undefined,
                      }}
                    >
                      <DomainIcon
                        className="h-5 w-5"
                        style={{ color: domainData ? `hsl(${domainData.color})` : undefined }}
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{domainName}</h2>
                      <p className="text-xs text-muted-foreground">
                        {domainMentors.length} professional{domainMentors.length > 1 ? "s" : ""} sharing their roadmap
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {domainMentors.map((mentor, mi) => {
                      const domain = getDomain(mentor.domain_id);
                      return (
                        <div
                          key={mentor.id}
                          className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-2 cursor-pointer scroll-reveal opacity-0 translate-y-6 duration-500 ease-out"
                          style={{ transitionDelay: `${mi * 80}ms` }}
                          onClick={() => setSelectedMentor(mentor)}
                        >
                          {/* Domain banner image */}
                          {domain?.image && (
                            <div className="relative h-24 w-full overflow-hidden">
                              <img
                                src={domain.image}
                                alt={domain.name}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-75"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
                                <Badge
                                  variant="outline"
                                  className="text-[10px] backdrop-blur-md border-border/30 bg-background/40 text-foreground"
                                >
                                  <Briefcase className="mr-1 h-3 w-3" /> {mentor.years_experience}y experience
                                </Badge>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col flex-1 p-5">
                            {/* Header */}
                            <div className="flex items-start gap-3 mb-4">
                              <div
                              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-2 ring-primary/20 ring-offset-2 ring-offset-card transition-all duration-300 group-hover:ring-primary/50"
                                style={{
                                  backgroundColor: domain ? `hsl(${domain.color} / 0.15)` : undefined,
                                  color: domain ? `hsl(${domain.color})` : undefined,
                                }}
                              >
                                {mentor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-300">{mentor.name}</h3>
                                <p className="text-xs text-muted-foreground truncate">{mentor.role}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <Building2 className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs font-medium text-foreground">{mentor.company}</span>
                                </div>
                              </div>
                            </div>

                            {/* Journey summary */}
                            {mentor.journey_summary && (
                              <p className="mb-4 text-xs text-muted-foreground italic leading-relaxed line-clamp-2 border-l-2 border-primary/30 pl-3">
                                "{mentor.journey_summary}"
                              </p>
                            )}

                            {/* Tech stack preview */}
                            {mentor.tech_stack && mentor.tech_stack.length > 0 && (
                              <div className="mb-4 flex flex-wrap gap-1.5">
                                {mentor.tech_stack.slice(0, 5).map((tech) => (
                                  <span
                                    key={tech}
                                    className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary"
                                  >
                                    {tech}
                                  </span>
                                ))}
                                {mentor.tech_stack.length > 5 && (
                                  <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                                    +{mentor.tech_stack.length - 5}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* CTA */}
                            <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
                              <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:underline">
                                View Roadmap <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                              </span>
                              <div className="flex gap-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-[10px] px-2"
                                  onClick={(e) => { e.stopPropagation(); handleBook(mentor); }}
                                >
                                  <CalendarDays className="mr-1 h-3 w-3" /> Book
                                </Button>
                                {mentor.meeting_link && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2"
                                    asChild
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <a href={mentor.meeting_link} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
      <Footer />

      {/* Mentor Detail Dialog */}
      <Dialog open={!!selectedMentor} onOpenChange={() => setSelectedMentor(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedMentor && (() => {
            const domain = getDomain(selectedMentor.domain_id);
            return (
              <>
                <DialogHeader>
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold"
                      style={{
                        backgroundColor: domain ? `hsl(${domain.color} / 0.15)` : undefined,
                        color: domain ? `hsl(${domain.color})` : undefined,
                      }}
                    >
                      {selectedMentor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <DialogTitle className="text-xl">{selectedMentor.name}</DialogTitle>
                      <p className="text-sm text-muted-foreground">{selectedMentor.role} at {selectedMentor.company}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="secondary" className="text-[10px]">
                          <Clock className="mr-1 h-3 w-3" /> {selectedMentor.years_experience} years
                        </Badge>
                        {domain && (
                          <Badge
                            variant="outline"
                            className="text-[10px]"
                            style={{
                              borderColor: `hsl(${domain.color} / 0.3)`,
                              color: `hsl(${domain.color})`,
                            }}
                          >
                            {domain.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <Tabs defaultValue="roadmap" className="mt-4">
                  <TabsList className="w-full">
                    <TabsTrigger value="roadmap" className="flex-1 text-xs">
                      <Route className="mr-1.5 h-3.5 w-3.5" /> Roadmap
                    </TabsTrigger>
                    <TabsTrigger value="techstack" className="flex-1 text-xs">
                      <Code2 className="mr-1.5 h-3.5 w-3.5" /> Tech Stack
                    </TabsTrigger>
                    <TabsTrigger value="tips" className="flex-1 text-xs">
                      <Lightbulb className="mr-1.5 h-3.5 w-3.5" /> Tips
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="roadmap" className="mt-4 space-y-6">
                    {/* Journey */}
                    {selectedMentor.journey_summary && (
                      <div className="rounded-lg border border-border bg-card p-4">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                          <Sparkles className="h-4 w-4 text-primary" /> My Journey
                        </h4>
                        <p className="text-sm text-muted-foreground italic leading-relaxed">
                          "{selectedMentor.journey_summary}"
                        </p>
                      </div>
                    )}

                    {/* College Prep */}
                    {selectedMentor.college_preparation && (
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                          <GraduationCap className="h-4 w-4 text-primary" /> What I Prepared in College
                        </h4>
                        <div className="rounded-lg border border-border bg-card p-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {selectedMentor.college_preparation}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedMentor.bio && (
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                          <User2 className="h-4 w-4 text-primary" /> About
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{selectedMentor.bio}</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="techstack" className="mt-4">
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
                        <Code2 className="h-4 w-4 text-primary" /> Technologies Used at {selectedMentor.company}
                      </h4>
                      {selectedMentor.tech_stack && selectedMentor.tech_stack.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {selectedMentor.tech_stack.map((tech) => (
                            <div
                              key={tech}
                              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5"
                            >
                              <div className="h-2 w-2 rounded-full bg-primary" />
                              <span className="text-sm font-medium text-foreground">{tech}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No tech stack information available.</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="tips" className="mt-4">
                    {selectedMentor.career_tips && (
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                          <Lightbulb className="h-4 w-4 text-primary" /> Career Advice
                        </h4>
                        <div className="rounded-lg border border-border bg-card p-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {selectedMentor.career_tips}
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <Separator className="my-4" />

                <div className="flex gap-3">
                  <Button className="flex-1" onClick={() => handleBook(selectedMentor)}>
                    <CalendarDays className="mr-2 h-4 w-4" /> Book a Session
                  </Button>
                  {selectedMentor.meeting_link && (
                    <Button variant="outline" asChild>
                      <a href={selectedMentor.meeting_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" /> Meeting Link
                      </a>
                    </Button>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      {bookingMentor && (
        <BookingDialog
          open={showBooking}
          onOpenChange={setShowBooking}
          mentor={bookingMentor}
        />
      )}
      <style>{scrollRevealStyle}</style>
    </div>
  );
};

export default GuidanceRoadmap;
