"use client";

import Link from "next/link";
import { ArrowRight, ImageIcon, MusicIcon, VideoIcon, Shield, Zap, LockKeyhole, Search, Cpu, Globe, Mail } from "lucide-react";
import { useScrollReveal } from "./lib/hooks";
import clsx from "clsx";

export default function Home() {
  const processReveal = useScrollReveal();
  const featuresReveal = useScrollReveal();
  const teamReveal = useScrollReveal();

  return (
    <div className="flex flex-col items-center w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center max-w-4xl pt-12 md:pt-16 pb-16 md:pb-24 px-4 md:px-6 relative w-full">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(600px,100vw)] h-[min(600px,100vw)] bg-[#D9261C]/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

        <div className="inline-block px-4 py-1.5 rounded-full border border-[#D9261C]/30 bg-[#D9261C]/10 text-[#D9261C] text-sm font-medium mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          UAS Capstone Project
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-white tracking-tight mb-6 md:mb-8 leading-[1.1] md:leading-[1.1] animate-fade-up" style={{ animationDelay: '0.2s' }}>
          Stego<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D9261C] to-[#9D1A10]">Forge</span> <br />
          <span className="text-2xl sm:text-3xl md:text-5xl text-[#F7F4EB]/80 font-medium mt-2 block">
            Media Studio
          </span>
        </h1>

        <p className="text-base md:text-lg text-[#F7F4EB]/70 max-w-2xl mx-auto mb-10 md:mb-12 animate-fade-up leading-relaxed px-2" style={{ animationDelay: '0.3s' }}>
          Platform pemrosesan multimedia berbasis web yang mendukung kompresi, dekompresi,
          dan penyisipan pesan rahasia (steganografi) yang diproses 100% di browser Anda.
        </p>
      </section>

      {/* Modules Selection */}
      <section className="w-full max-w-[1152px] px-4 md:px-6 mb-20 md:mb-32 z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full">
          {/* Image Module */}
          <Link href="/image" className="group animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="glass-card h-full p-6 md:p-8 flex flex-col transition-all duration-400 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(217,38,28,0.15)] group-hover:border-[#D9261C]/50">
              <div className="w-16 h-16 rounded-2xl bg-[#D9261C]/10 text-[#D9261C] flex items-center justify-center mb-6 group-hover:bg-[#D9261C] group-hover:text-white transition-colors duration-300">
                <ImageIcon size={32} />
              </div>
              <h2 className="text-2xl font-display font-semibold text-white mb-3">Image Codec</h2>
              <p className="text-[#F7F4EB]/60 flex-1 mb-8">
                Kompresi gambar (JPEG/WebP) dan sembunyikan pesan rahasia menggunakan teknik LSB Steganography.
              </p>
              <div className="flex items-center text-[#D9261C] font-medium text-sm group-hover:tracking-wider transition-all">
                Mulai Proses Gambar <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Audio Module */}
          <Link href="/audio" className="group animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <div className="glass-card h-full p-6 md:p-8 flex flex-col transition-all duration-400 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(217,38,28,0.15)] group-hover:border-[#D9261C]/50">
              <div className="w-16 h-16 rounded-2xl bg-[#D9261C]/10 text-[#D9261C] flex items-center justify-center mb-6 group-hover:bg-[#D9261C] group-hover:text-white transition-colors duration-300">
                <MusicIcon size={32} />
              </div>
              <h2 className="text-2xl font-display font-semibold text-white mb-3">Audio Codec</h2>
              <p className="text-[#F7F4EB]/60 flex-1 mb-8">
                Konversi WAV ke MP3/AAC untuk kompresi, dan sisipkan pesan rahasia pada file audio.
              </p>
              <div className="flex items-center text-[#D9261C] font-medium text-sm group-hover:tracking-wider transition-all">
                Mulai Proses Audio <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Video Module */}
          <Link href="/video" className="group animate-fade-up" style={{ animationDelay: '0.6s' }}>
            <div className="glass-card h-full p-6 md:p-8 flex flex-col transition-all duration-400 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(217,38,28,0.15)] group-hover:border-[#D9261C]/50">
              <div className="w-16 h-16 rounded-2xl bg-[#D9261C]/10 text-[#D9261C] flex items-center justify-center mb-6 group-hover:bg-[#D9261C] group-hover:text-white transition-colors duration-300">
                <VideoIcon size={32} />
              </div>
              <h2 className="text-2xl font-display font-semibold text-white mb-3">Video Codec</h2>
              <p className="text-[#F7F4EB]/60 flex-1 mb-8">
                Kompresi video dengan menyesuaikan resolusi, bitrate, dan format menggunakan ffmpeg.wasm.
              </p>
              <div className="flex items-center text-[#D9261C] font-medium text-sm group-hover:tracking-wider transition-all">
                Mulai Proses Video <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Process Section */}
      <section
        ref={processReveal.ref}
        className={clsx(
          "w-full max-w-[1152px] px-4 md:px-6 mb-20 md:mb-32 transition-all duration-1000",
          processReveal.isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
        )}
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Cara Kerja</h2>
          <p className="text-[#F7F4EB]/60 max-w-2xl mx-auto">Empat langkah mudah untuk memproses file multimedia Anda secara lokal dengan keamanan terjamin.</p>
        </div>

        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-8 left-1/8 right-1/8 h-[1px] bg-gradient-to-r from-transparent via-[#D9261C]/30 to-transparent -z-10"></div>

          {[
            { num: "01", title: "Upload File", desc: "Pilih file gambar, audio, atau video dari perangkat Anda." },
            { num: "02", title: "Pilih Mode", desc: "Tentukan apakah ingin mengompres, mendekode, atau menyisipkan pesan." },
            { num: "03", title: "Proses Lokal", desc: "Semua diproses langsung di browser Anda. Tidak ada data yang dikirim ke server." },
            { num: "04", title: "Unduh Hasil", desc: "Simpan file hasil yang telah diproses kembali ke perangkat Anda." },
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full glass-heavy border border-[#D9261C]/50 text-[#D9261C] flex items-center justify-center text-xl font-display font-bold mb-6 shadow-[0_0_20px_rgba(217,38,28,0.2)]">
                {step.num}
              </div>
              <h3 className="text-xl font-display font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-[#F7F4EB]/60">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresReveal.ref}
        className={clsx(
          "w-full max-w-[1152px] px-4 md:px-6 mb-24 transition-all duration-1000",
          featuresReveal.isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
        )}
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Fitur Unggulan</h2>
          <p className="text-[#F7F4EB]/60 max-w-2xl mx-auto">Dirancang untuk kecepatan, keamanan, dan pengalaman pengguna yang luar biasa.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: <Shield size={24} />, title: "Privasi Terjamin", desc: "Pemrosesan 100% dilakukan di perangkat Anda. Tidak ada file yang diunggah ke server kami." },
            { icon: <Zap size={24} />, title: "Cepat & Efisien", desc: "Menggunakan WebAssembly (WASM) untuk pemrosesan video dan audio sekelas desktop di browser." },
            { icon: <LockKeyhole size={24} />, title: "Steganografi Aman", desc: "Teknik LSB tersembunyi yang menjaga kualitas media agar tetap terlihat dan terdengar identik." },
            { icon: <Search size={24} />, title: "Lossless Decoding", desc: "Mendukung konversi kembali ke format tanpa kompresi (PNG, WAV, AVI) untuk preservasi." },
            { icon: <Globe size={24} />, title: "Berjalan di Mana Saja", desc: "Kompatibel dengan semua browser modern (Chrome, Firefox, Safari, Edge) tanpa perlu instalasi aplikasi." },
            { icon: <Cpu size={24} />, title: "Multi-Format", desc: "Mendukung berbagai format populer seperti JPEG, PNG, MP3, AAC, WAV, MP4, dan WebM." },
          ].map((feat, i) => (
            <div key={i} className="glass p-6 rounded-2xl hover:border-[#D9261C]/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#0B0E11] border border-[#F7F4EB]/10 flex items-center justify-center text-[#D9261C] mb-4">
                {feat.icon}
              </div>
              <h3 className="text-lg font-display font-semibold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-[#F7F4EB]/60 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section
        ref={teamReveal.ref}
        className={clsx(
          "w-full max-w-[1152px] px-4 md:px-6 mb-24 transition-all duration-1000",
          teamReveal.isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
        )}
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Tim Pengembang</h2>
          <p className="text-[#F7F4EB]/60 max-w-2xl mx-auto">Dua talenta di balik terciptanya platform Multimedia Codec & Steganography ini.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            {
              name: "Hilman Maulana",
              nim: "1237050020",
              role: "Fullstack Developer",
              img: "/fototim/Hilman.jpg",
            },
            {
              name: "Mochamad Fahmi Rizieq",
              nim: "1237050074",
              role: "UI/UX Designer & QA",
              img: "/fototim/Fahmi.jpg",
            }
          ].map((member, i) => (
            <div key={i} className="glass-card p-8 flex flex-col items-center text-center group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(217,38,28,0.15)] hover:border-[#D9261C]/40 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#D9261C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              <div className="w-32 h-32 rounded-full mb-6 p-1 bg-gradient-to-tr from-[#9D1A10] to-[#D9261C] group-hover:shadow-[0_0_20px_rgba(217,38,28,0.4)] transition-all duration-500">
                <img src={member.img} alt={member.name} className="w-full h-full object-cover rounded-full border-2 border-[#0B0E11]" />
              </div>

              <h3 className="text-xl font-display font-semibold text-white mb-1 group-hover:text-[#D9261C] transition-colors">{member.name}</h3>
              <p className="text-sm font-mono text-[#F7F4EB]/60 mb-3">{member.nim}</p>
              <p className="text-sm font-medium text-[#F7F4EB]/80 bg-[#D9261C]/10 px-3 py-1 rounded-full border border-[#D9261C]/20 inline-block">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Banner */}
      <section className="w-full bg-gradient-to-r from-[#0B0E11] via-[#D9261C]/10 to-[#0B0E11] py-12 md:py-16 border-y border-[#F7F4EB]/5">
        <div className="max-w-[1152px] mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
          {[
            { value: "100%", label: "Client-Side" },
            { value: "3", label: "Media Modul" },
            { value: "15+", label: "Format Support" },
            { value: "0", label: "Server Storage" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-2">
              <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1 md:mb-2">{stat.value}</div>
              <div className="text-xs md:text-sm text-[#D9261C] font-medium tracking-wider uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
