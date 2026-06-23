"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ImageIcon, MusicIcon, VideoIcon, Code } from "lucide-react";
import clsx from "clsx";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-[1152px] mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(217,38,28,0.5)] transition-all border border-[#F7F4EB]/10">
            <img src="/logo.png" alt="StegoForge" className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-semibold text-lg tracking-wider hidden sm:block group-hover:text-[#F7F4EB] transition-colors">
            STEGOFORGE
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 bg-[#F7F4EB]/5 rounded-full p-1 border border-[#F7F4EB]/10 backdrop-blur-md">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                  active
                    ? "bg-[#D9261C] text-white shadow-[0_4px_14px_rgba(217,38,28,0.3)]"
                    : "text-[#F7F4EB]/70 hover:text-[#F7F4EB] hover:bg-[#F7F4EB]/10"
                )}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center">
          <a
            href="https://github.com/hilmanmaulana1237/multimedia-uas"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-[#F7F4EB]/70 hover:text-white transition-colors group"
          >
            GitHub
            <Code size={18} className="group-hover:scale-110 transition-transform" />
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-[#F7F4EB]/80 hover:text-white focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={clsx(
          "md:hidden absolute top-full left-0 right-0 glass-heavy border-t border-[#F7F4EB]/10 transition-all duration-300 overflow-hidden",
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 border-transparent"
        )}
      >
        <div className="p-4 flex flex-col gap-2">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-3 rounded-lg hover:bg-[#F7F4EB]/10 text-sm font-medium transition-colors"
          >
            Beranda
          </Link>
          {navLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={clsx(
                  "p-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors",
                  active ? "bg-[#D9261C]/20 text-[#D9261C]" : "hover:bg-[#F7F4EB]/10 text-[#F7F4EB]/80"
                )}
              >
                <Icon size={18} />
                {link.label} Codec
              </Link>
            );
          })}
          <div className="h-[1px] bg-[#F7F4EB]/10 my-2" />
          <a
            href="https://github.com/hilmanmaulana1237/multimedia-uas"
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-lg hover:bg-[#F7F4EB]/10 text-sm font-medium transition-colors flex justify-between items-center"
          >
            GitHub <Code size={16} />
          </a>
        </div>
      </div>
    </nav>
  );
}
