import { useEffect, useRef } from "react";

export const useScrollReveal = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    const el = ref.current;
    if (!el) return () => observer.disconnect();

    // Use MutationObserver to pick up dynamically added .scroll-reveal elements
    const observeAll = () => {
      el.querySelectorAll(".scroll-reveal:not(.revealed)").forEach((child) =>
        observer.observe(child)
      );
    };
    observeAll();

    const mutation = new MutationObserver(observeAll);
    mutation.observe(el, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, []);
  return ref;
};

export const scrollRevealStyle = `
  .scroll-reveal.revealed {
    opacity: 1 !important;
    transform: translateY(0) scale(1) !important;
  }
`;
