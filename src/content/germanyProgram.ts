export const germanyProgram = {
  name: "Germany Program",
  collaboration: "Lunorsoft × Parul University",
  paymentDeadline: "2026-11-20",
  paymentDeadlineLabel: "20 November 2026",
  basePath: "/internships/germany",
};

export const programPages = [
  { id: "overview", label: "Overview", title: "Explore the Germany program", intro: "Review the program information before making your purchase." },
  { id: "syllabus", label: "Syllabus", title: "Syllabus & learning topics", intro: "The official syllabus is awaiting publication. Confirm the academic scope with Lunorsoft before paying." },
  { id: "curriculum", label: "Curriculum", title: "Curriculum & learning outcomes", intro: "The detailed curriculum is awaiting confirmation from the program team." },
  { id: "schedule", label: "Schedule", title: "Program schedule", intro: "The payment deadline is confirmed. Teaching dates, travel dates and the duration have not yet been published." },
  { id: "testimonials", label: "Testimonials", title: "Student testimonials", intro: "No verified testimonials for this Germany program have been supplied yet." },
] as const;

export const syllabusChecks = [
  { title: "Modules & topics", detail: "Request the official module list, subject coverage and the sequence in which topics will be taught." },
  { title: "Entry requirements", detail: "Confirm the eligible courses, year of study, prerequisite knowledge and any language requirements." },
  { title: "Practical learning", detail: "Ask which workshops, assignments or projects are included and which tools or equipment students need." },
  { title: "Assessment", detail: "Confirm how students are assessed, the completion requirements and the exact certificate or academic credit offered." },
];

export const curriculumChecks = [
  { title: "Preparation", detail: "Confirm whether orientation, pre-arrival preparation and introductory learning are part of the program." },
  { title: "Academic delivery", detail: "Request the teaching format, faculty details, contact hours and the balance of classroom and practical work." },
  { title: "Applied work", detail: "Confirm any individual or group projects, industry activities, supervision and expected deliverables." },
  { title: "Completion", detail: "Request the learning outcomes, assessment process and written details of the qualification awarded." },
];

export const purchaseChecks = [
  "Eligibility, admission requirements and the participating institution in Germany",
  "Program duration, teaching timetable and travel dates",
  "Whether tuition, accommodation, flights, meals, insurance and visa costs are included",
  "Cancellation, refund and rescheduling terms in writing",
];