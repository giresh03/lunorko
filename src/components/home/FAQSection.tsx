import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is Lunor.AI really free to use?",
    a: "Yes! Our Free Forever plan gives you access to all 12+ domain roadmaps, limited AI code assistant queries per day, curated learning resources, and community access — no credit card required.",
  },
  {
    q: "How is Lunor.AI different from just using YouTube or ChatGPT?",
    a: "YouTube is unstructured and overwhelming. ChatGPT is generic and doesn't understand your learning context. Lunor.AI combines curated, structured roadmaps with a domain-specific AI assistant that adapts to your skill level, plus mentor access and hands-on projects — all in one platform.",
  },
  {
    q: "Which engineering domains are supported?",
    a: "We currently support 12+ domains including Web Development, App Development, Data Science & ML, Cybersecurity, Cloud Computing, DevOps, Blockchain, IoT, System Design, DSA, UI/UX Design, and Database Management — with more being added regularly.",
  },
  {
    q: "Do I need prior coding experience to start?",
    a: "Not at all! Each domain roadmap starts from the absolute basics and progressively guides you to advanced topics. Our AI assistant is also designed to explain concepts at your level.",
  },
  {
    q: "How does the AI Code Assistant work?",
    a: "Our AI is fine-tuned for engineering students. You can ask it to generate code, debug errors, explain concepts, optimize your solutions, or help you build projects — all within your selected domain context.",
  },
  {
    q: "What do I get with the Pro plan?",
    a: "Pro (₹49/month) unlocks unlimited AI assistant queries, 1:1 mentor booking sessions with industry professionals, premium course recommendations, certificates of completion, and resume & interview preparation support.",
  },
  {
    q: "Can Lunor.AI help me get placed?",
    a: "Absolutely. Our roadmaps are industry-aligned, mentors are from top companies, and the Pro plan includes interview prep and resume building. Many of our students have landed roles at top product companies.",
  },
  {
    q: "Is there a student discount available?",
    a: "Our Free tier is already packed with value. For the Pro plan, we occasionally run student-exclusive offers — join our community to stay updated on discounts and promotions.",
  },
];

const FAQSection = () => (
  <section className="py-24">
    <div className="container mx-auto px-4">
      <div className="mb-12 text-center scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
        <span className="mb-3 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
          FAQ
        </span>
        <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
          Frequently Asked <span className="text-primary">Questions</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Got questions? We've got answers.
        </p>
      </div>

      <div className="mx-auto max-w-3xl scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="rounded-lg border border-border bg-card px-6 transition-colors hover:border-primary/30"
            >
              <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  </section>
);

export default FAQSection;
