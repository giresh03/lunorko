import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, CheckCircle2, Globe2, MessageSquareQuote } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GermanyProgram from "@/components/GermanyProgram";
import { Button } from "@/components/ui/button";
import { germanyProgram, programPages, syllabusChecks, curriculumChecks, purchaseChecks } from "@/content/germanyProgram";
import learningImage from "@/assets/sections/student-success.jpg";
import NotFound from "@/pages/NotFound";

export default function GermanyProgramDetails() {
  const { section = "overview" } = useParams();
  const current = programPages.find((page) => page.id === section);
  const index = programPages.findIndex((page) => page.id === section);
  const next = programPages[index + 1];

  useEffect(() => {
    window.scrollTo(0, 0);
    const previousTitle = document.title;
    document.title = `${current?.label ?? "Program"} · Germany Program | Lunorsoft`;
    return () => { document.title = previousTitle; };
  }, [current]);

  if (!current) return <NotFound />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24">
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-10 lg:px-6">
            <Button variant="link" asChild className="mb-6 h-auto p-0"><Link to="/internships"><ArrowLeft />Internships</Link></Button>
            <p className="flex items-center gap-2 text-sm font-medium text-primary"><Globe2 className="h-4 w-4" />{germanyProgram.collaboration}</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Germany Program</h1>
            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <span>One-time program fee <strong className="ml-2 text-foreground">₹3,35,000</strong></span>
              <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />Last payment date: <time dateTime={germanyProgram.paymentDeadline} className="font-medium text-foreground">{germanyProgram.paymentDeadlineLabel}</time></span>
            </div>
          </div>
          <nav aria-label="Germany program pages" className="container mx-auto flex flex-wrap gap-1 px-4 pb-4 lg:px-6">
            {programPages.map((page) => (
              <Button key={page.id} variant={section === page.id ? "secondary" : "ghost"} asChild>
                <Link aria-current={section === page.id ? "page" : undefined} to={`${germanyProgram.basePath}${page.id === "overview" ? "" : `/${page.id}`}`}>{page.label}</Link>
              </Button>
            ))}
          </nav>
        </header>

        <section className="container mx-auto px-4 py-10 lg:px-6" aria-labelledby="program-page-heading">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase text-primary">{current.label}</p>
            <h2 id="program-page-heading" className="mt-3 text-3xl font-semibold">{current.title}</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{current.intro}</p>
          </div>

          {section === "overview" && (
            <div className="mt-8 grid items-start gap-10 lg:grid-cols-2">
              <div>
                <h3 className="text-xl font-semibold">An informed next step</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">Lunorsoft offers this Germany program in collaboration with Parul University. Explore the syllabus, curriculum and schedule, and confirm the complete program terms before paying.</p>
                <dl className="mt-6 divide-y divide-border border-y border-border">
                  {[["Collaboration", germanyProgram.collaboration], ["Destination", "Germany"], ["Program fee", "₹3,35,000 · one-time"], ["Payment deadline", germanyProgram.paymentDeadlineLabel], ["Payment method", "Razorpay"]].map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4 py-4 text-sm"><dt className="text-muted-foreground">{label}</dt><dd className="font-medium">{value}</dd></div>
                  ))}
                </dl>
              </div>
              <figure><img src={learningImage} alt="Illustrative student learning scene" className="aspect-[4/3] w-full rounded-lg object-cover" /><figcaption className="mt-2 text-xs text-muted-foreground">Illustrative learning image; not a photograph of this program or its participants.</figcaption></figure>
            </div>
          )}

          {(section === "syllabus" || section === "curriculum") && (
            <>
              <div className="mt-7 flex items-center gap-3 border-y border-border py-4 text-sm text-muted-foreground"><BookOpen className="h-5 w-5 shrink-0 text-primary" />The items below are questions to confirm, not an approved syllabus or curriculum.</div>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {(section === "syllabus" ? syllabusChecks : curriculumChecks).map((item, itemIndex) => (
                  <article key={item.title} className="rounded-lg border border-border bg-card p-6">
                    <p className="font-mono text-sm text-primary">0{itemIndex + 1}</p><h3 className="mt-3 text-xl font-semibold">{item.title}</h3><p className="mt-3 leading-relaxed text-muted-foreground">{item.detail}</p>
                  </article>
                ))}
              </div>
            </>
          )}

          {section === "schedule" && (
            <div className="mt-8 max-w-3xl divide-y divide-border border-y border-border">
              {[["Last payment date", germanyProgram.paymentDeadlineLabel, true], ["Orientation & preparation", "Awaiting official dates", false], ["Teaching period & duration", "Awaiting official timetable", false], ["Travel & stay in Germany", "Awaiting official confirmation", false], ["Assessment & completion", "Awaiting official dates", false]].map(([label, value, confirmed]) => (
                <div key={String(label)} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"><span className="font-medium">{label}</span><span className={`flex items-center gap-2 text-sm ${confirmed ? "text-primary" : "text-muted-foreground"}`}>{confirmed && <CheckCircle2 className="h-4 w-4" />}{value}</span></div>
              ))}
              <p className="py-5 text-sm leading-relaxed text-muted-foreground">The payment deadline is not the program start date. Confirm your schedule and travel requirements before arranging travel.</p>
            </div>
          )}

          {section === "testimonials" && (
            <div className="mt-8 max-w-3xl border-y border-border py-8">
              <MessageSquareQuote className="h-8 w-8 text-primary" /><h3 className="mt-4 text-xl font-semibold">Verified experiences only</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">Program-specific student reviews will appear here once authentic feedback is available and approved for publication. We do not use unrelated student reviews or invented quotes to promote this program.</p>
              <p className="mt-4 text-sm text-muted-foreground">Until then, base your decision on the official program documents and written terms from Lunorsoft.</p>
            </div>
          )}

          <aside className="mt-10 border-t border-border pt-8" aria-label="Before you purchase">
            <h3 className="text-xl font-semibold">Before you purchase</h3>
            <p className="mt-3 text-muted-foreground">Ask the Lunorsoft team for written confirmation of:</p>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">{purchaseChecks.map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{item}</li>)}</ul>
            <p className="mt-5 text-sm text-muted-foreground">These details have not yet been published here. Payment alone does not guarantee a visa, admission or employment.</p>
          </aside>

          <div className="mt-8 flex flex-wrap gap-3">
            {next && <Button variant="outline" asChild><Link to={`${germanyProgram.basePath}/${next.id}`}>Read {next.label.toLowerCase()}<ArrowRight /></Link></Button>}
            <Button variant="secondary" asChild><a href="#program-purchase">View purchase option<ArrowRight /></a></Button>
          </div>
        </section>
        <GermanyProgram checkoutSection />
      </main>
      <Footer />
    </div>
  );
}