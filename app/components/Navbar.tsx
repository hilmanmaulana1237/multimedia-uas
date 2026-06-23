"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ImageIcon, MusicIcon, VideoIcon, Code } from "lucide-react";
import clsx from "clsx";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/image", label: "Image", icon: ImageIcon },
    { href: "/audio", label: "Audio", icon: MusicIcon },
    { href: "/video", label: "Video", icon: VideoIcon },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-[#0B0E11]/80 backdrop-blur-xl border-b border-[#F7F4EB]/10 py-3"
          : "bg-transparent py-4 md:py-5"
      )}
    >
      <div className="max-w-[1152px] mx-auto px-4 md:px-12 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl overflow-hidden flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(217,38,28,0.5)] transition-all border border-[#F7F4EB]/10">
            <img src="/logo.png" alt="StegoForge" className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-semibold text-lg tracking-wider hidden lg:block group-hover:text-[#F7F4EB] transition-colors">
            STEGOFORGE
          </span>
        </Link>

        {/* Unified Nav (Desktop & Mobile) */}
        <div className="flex items-center gap-1 bg-[#F7F4EB]/5 rounded-full p-1 border border-[#F7F4EB]/10 backdrop-blur-md">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 flex items-center gap-1.5 md:gap-2 whitespace-nowrap",
                  active
                    ? "bg-[#D9261C] text-white shadow-[0_4px_14px_rgba(217,38,28,0.3)]"
                    : "text-[#F7F4EB]/70 hover:text-[#F7F4EB] hover:bg-[#F7F4EB]/10"
                )}
              >
                <Icon size={14} className="md:w-4 md:h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Section */}
        <div className="flex items-center shrink-0">
          <a
            href="https://github.com/hilmanmaulana1237/multimedia-uas"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-[#F7F4EB]/70 hover:text-white transition-colors group p-1 md:p-0"
            aria-label="GitHub Repository"
          >
            <span className="hidden sm:block">GitHub</span>
            <Code size={18} className="group-hover:scale-110 transition-transform" />
          </a>
        </div>
      </div>
    </nav>
  );
}
