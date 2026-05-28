"use client";

// created by John Hong
// May 27, 2026

import React from "react";

export default function HoppyCupLandingPage() {
  

  const menu = [
    "welcome drink",
    "coffee!",
    "something something matcha",
    "miso thirsty",
    "green? blue???",
    "round and chewy",
    "farewell drink",
  ];

  return (
    <main className="min-h-screen bg-[#082B16] text-[#F4F1E8] overflow-x-hidden selection:bg-[#F4F1E8] selection:text-[#082B16]">
      

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="w-[260px] md:w-[360px] flex items-center justify-center">
          {/* Mobile: force MP4 */}
          <video
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            className="block md:hidden w-full h-auto object-contain"
          >
            <source src="/hoppy-cup-animation.mp4" type="video/mp4" />
          </video>

          {/* Desktop/tablet: use WebM */}
          <video
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            className="hidden md:block w-full h-auto object-contain"
          >
            <source src="/hoppy-cup-animation.webm" type="video/webm" />
            <source src="/hoppy-cup-animation.mp4" type="video/mp4" />
          </video>
        </div>

        <h1 className="mt-6 font-serif text-2xl md:text-3xl lowercase tracking-tight">
          the hoppy cup
        </h1>
      </section>

      {/* DETAILS */}
      <section className="px-6 py-24 text-center border-t border-[#F4F1E8]/10">
        <div className="max-w-sm mx-auto font-serif lowercase">
          <div className="flex flex-col items-center">
            <p className="text-5xl md:text-7xl leading-tight tracking-tight">
              june 21
            </p>

            <a
              href="https://maps.google.com/?q=Paper+Son+Coffee+303+2nd+St+N102+San+Francisco+CA+94107"
              target="_blank"
              rel="noreferrer"
              className="group mt-14 inline-flex flex-col items-center transition-opacity duration-300 hover:opacity-70"
            >
              <p className="text-sm md:text-base opacity-55 leading-relaxed">
                paper son coffee
                <br />
                303 2nd st n102
                <br />
                san francisco
              </p>
            </a>
          </div>

          <a
            href="https://partiful.com/e/IovGicSSM1YrbLYAF9uS?"
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-12 text-lg md:text-xl underline underline-offset-4 transition-opacity duration-300 hover:opacity-60"
          >
            you&apos;re invited — RSVP
          </a>
        </div>
      </section>

      <section className="px-6 py-28 border-t border-[#F4F1E8]/10">
        <div className="max-w-[320px] mx-auto bg-[#F4F1E8] text-[#082B16] px-6 py-8 shadow-2xl rotate-[-1deg]">
          <div className="text-center font-mono text-xs uppercase tracking-[0.25em] border-b border-dashed border-[#082B16]/30 pb-4">
            the hoppy cup
          </div>

          <div className="mt-5 text-center font-mono text-[11px] leading-relaxed opacity-70">
            come back anytime
            <br />
            we&apos;re still working on it
          </div>

          <div className="mt-8 space-y-4 font-mono text-sm lowercase">
            {menu.map((item, index) => (
              <div
                key={item}
                className="flex items-start justify-between gap-4 border-b border-dotted border-[#082B16]/20 pb-2"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span className="text-right">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-dashed border-[#082B16]/30 pt-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
            june 21 · san francisco
          </div>
        </div>
      </section>

      <section className="px-6 py-24 text-center">
        <p className="font-serif lowercase text-sm md:text-base opacity-50">
          by stone and john
        </p>
      </section>
    </main>
  );
}


