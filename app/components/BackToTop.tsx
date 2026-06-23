"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import clsx from "clsx";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={clsx(
        "fixed bottom-8 right-8 z-40 p-3 rounded-full bg-[#D9261C] text-white shadow-[0_4px_14px_rgba(217,38,28,0.4)] hover:bg-[#9D1A10] hover:scale-110 hover:shadow-[0_8px_20px_rgba(217,38,28,0.6)] transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      )}
    >
      <ArrowUp size={24} />
    </button>
  );
}
