export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#F7F4EB]/10 py-8 text-center relative z-10">
      <div className="max-w-[1152px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-left">
          <p className="font-display font-semibold text-lg tracking-wider text-white">
            CODEC STEGO
          </p>
          <p className="text-sm text-[#F7F4EB]/60 mt-1">
            UAS Capstone Project - Multimedia
          </p>
        </div>
        
        <div className="text-sm text-[#F7F4EB]/60">
          &copy; {new Date().getFullYear()} Capstone Project. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
