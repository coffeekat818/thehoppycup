"use client";

// created by John Hong
// May 27, 2026

import React, { useEffect, useRef, useState } from "react";

const SECTION_COUNT = 3;

function ScrollHint({
  caption,
  visible,
  onClick,
  ariaLabel,
}: {
  caption: string;
  visible: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onPointerUp={(e) => {
        e.preventDefault();
        e.currentTarget.blur();
        onClick();
      }}
      className={`absolute bottom-8 left-1/2 flex -translate-x-1/2 touch-manipulation flex-col items-center gap-2 transition-opacity duration-500 ${
        visible
          ? "pointer-events-auto opacity-40 hover:opacity-65"
          : "pointer-events-none opacity-0"
      }`}
    >
      <span className="font-serif text-xs lowercase tracking-wide md:text-sm">
        {caption}
      </span>
      <svg
        width="28"
        height="28"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
        className="scroll-hint-bounce"
      >
        <path
          d="M10 4v10M10 14l-4-4M10 14l4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function LoopingVideo({
  className,
  sources,
}: {
  className?: string;
  sources: { src: string; type: string }[];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const loopCleanly = () => {
      if (!video.duration || !Number.isFinite(video.duration)) return;

      // Restart just before the last frame to avoid the native loop flash.
      if (video.duration - video.currentTime <= 0.06) {
        video.currentTime = 0.001;
      }
    };

    const restartFromStart = () => {
      video.currentTime = 0.001;
      void video.play().catch(() => {});
    };

    const resumePlayback = () => {
      if (document.visibilityState === "visible") {
        void video.play().catch(() => {});
      }
    };

    const startPlayback = () => {
      void video.play().catch(() => {});
    };

    video.addEventListener("timeupdate", loopCleanly);
    video.addEventListener("ended", restartFromStart);
    video.addEventListener("canplay", startPlayback);
    document.addEventListener("visibilitychange", resumePlayback);

    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      startPlayback();
    }

    return () => {
      video.removeEventListener("timeupdate", loopCleanly);
      video.removeEventListener("ended", restartFromStart);
      video.removeEventListener("canplay", startPlayback);
      document.removeEventListener("visibilitychange", resumePlayback);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      preload="auto"
      controls={false}
      disablePictureInPicture
      className={className}
    >
      {sources.map((source) => (
        <source key={source.src} src={source.src} type={source.type} />
      ))}
    </video>
  );
}

export default function HoppyCupLandingPage() {
  const mainRef = useRef<HTMLElement>(null);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const isNavigatingRef = useRef(false);
  const [activeSection, setActiveSection] = useState(0);

  const menu = [
    "welcome drink",
    "coffee!",
    "something something matcha",
    "miso thirsty",
    "green?\u00a0blue???",
    "round and chewy",
    "farewell drink",
  ];

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const updateActiveSection = () => {
      if (isNavigatingRef.current) return;

      const midpoint = main.scrollTop + main.clientHeight * 0.5;
      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      sectionsRef.current.forEach((section, index) => {
        if (!section) return;

        const sectionCenter = section.offsetTop + section.offsetHeight * 0.5;
        const distance = Math.abs(midpoint - sectionCenter);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });

      setActiveSection(bestIndex);
    };

    main.addEventListener("scroll", updateActiveSection, { passive: true });
    updateActiveSection();

    return () => main.removeEventListener("scroll", updateActiveSection);
  }, []);

  const scrollToSection = (index: number) => {
    const main = mainRef.current;
    const section = sectionsRef.current[index];
    if (!main || !section || isNavigatingRef.current) return;

    isNavigatingRef.current = true;
    let finished = false;

    const finishNavigation = () => {
      if (finished) return;
      finished = true;

      isNavigatingRef.current = false;

      const midpoint = main.scrollTop + main.clientHeight * 0.5;
      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      sectionsRef.current.forEach((sec, i) => {
        if (!sec) return;

        const sectionCenter = sec.offsetTop + sec.offsetHeight * 0.5;
        const distance = Math.abs(midpoint - sectionCenter);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = i;
        }
      });

      setActiveSection(bestIndex);
    };

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    main.scrollTo({
      top: section.offsetTop,
      left: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });

    main.addEventListener("scrollend", finishNavigation, { once: true });
    window.setTimeout(finishNavigation, prefersReducedMotion ? 100 : 900);
  };

  return (
    <main
      ref={mainRef}
      className="h-[100svh] snap-y snap-mandatory scroll-smooth overflow-y-auto overscroll-y-contain bg-[#082B16] text-[#F4F1E8] selection:bg-[#F4F1E8] selection:text-[#082B16]"
    >
      <nav
        aria-label="Page sections"
        className="fixed right-4 md:right-6 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-3"
      >
        {Array.from({ length: SECTION_COUNT }, (_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Go to section ${index + 1}`}
            aria-current={activeSection === index ? "true" : undefined}
            onClick={() => scrollToSection(index)}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              activeSection === index
                ? "scale-125 bg-[#F4F1E8] opacity-100"
                : "bg-[#F4F1E8] opacity-30 hover:opacity-55"
            }`}
          />
        ))}
      </nav>

      {/* 1 — Home */}
      <section
        ref={(el) => {
          sectionsRef.current[0] = el;
        }}
        className="relative flex h-[100svh] snap-start snap-always flex-col items-center justify-center px-6 text-center"
      >
        <div className="flex w-[160px] items-center justify-center md:w-[260px]">
          <LoopingVideo
            className="block h-auto w-full object-contain md:hidden"
            sources={[
              { src: "/hoppy-cup-animation.mp4", type: "video/mp4" },
            ]}
          />

          <LoopingVideo
            className="hidden h-auto w-full object-contain md:block"
            sources={[
              { src: "/hoppy-cup-animation.webm", type: "video/webm" },
              { src: "/hoppy-cup-animation.mp4", type: "video/mp4" },
            ]}
          />
        </div>

        <h1 className="mt-2 font-serif text-2xl lowercase tracking-tight md:mt-6 md:text-3xl">
          the hoppy cup
        </h1>

        <ScrollHint
          caption="hop to rsvp"
          visible={activeSection === 0}
          onClick={() => scrollToSection(1)}
          ariaLabel="Hop to RSVP"
        />
      </section>

      {/* 2 — Date & RSVP */}
      <section
        ref={(el) => {
          sectionsRef.current[1] = el;
        }}
        className="relative flex h-[100svh] snap-start snap-always flex-col items-center justify-center px-6 text-center"
      >
        <div className="mx-auto flex w-full max-w-sm flex-col items-center font-serif lowercase">
          <p className="text-5xl leading-tight tracking-tight md:text-7xl">
            june 21
          </p>

          <a
            href="https://maps.google.com/?q=Paper+Son+Coffee+303+2nd+St+N102+San+Francisco+CA+94107"
            target="_blank"
            rel="noreferrer"
            className="group mt-14 block text-center transition-opacity duration-300 hover:opacity-70"
          >
            <span className="block text-sm leading-relaxed opacity-55 md:text-base">
              paper son coffee
              <br />
              303 2nd st n102
              <br />
              san francisco
            </span>
          </a>

          <a
            href="https://partiful.com/e/IovGicSSM1YrbLYAF9uS?"
            target="_blank"
            rel="noreferrer"
            className="mt-12 block text-center text-lg underline underline-offset-4 transition-opacity duration-300 hover:opacity-60 md:text-xl"
          >
            you&apos;re invited — RSVP
          </a>
        </div>

        <ScrollHint
          caption="hop to menu"
          visible={activeSection === 1}
          onClick={() => scrollToSection(2)}
          ariaLabel="Hop to menu"
        />
      </section>

      {/* 3 — Menu */}
      <section
        ref={(el) => {
          sectionsRef.current[2] = el;
        }}
        className="flex h-[100svh] snap-start snap-always flex-col items-center justify-center px-4 py-4 sm:px-6 sm:py-8"
      >
        <div className="w-full max-w-[288px] bg-[#F4F1E8] px-4 py-5 text-[#082B16] shadow-2xl sm:max-w-[320px] sm:rotate-[-1deg] sm:px-6 sm:py-8">
          <div className="border-b border-dashed border-[#082B16]/30 pb-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] sm:pb-4 sm:text-xs sm:tracking-[0.25em]">
            the hoppy cup
          </div>

          <div className="mt-3 text-center font-mono text-[10px] leading-relaxed opacity-70 sm:mt-5 sm:text-[11px]">
            come back anytime
            <br />
            we&apos;re still working on it
          </div>

          <table className="mt-4 w-full table-fixed border-collapse sm:mt-8">
            <colgroup>
              <col className="w-7 sm:w-8" />
              <col />
            </colgroup>
            <tbody>
              {menu.map((item, index) => (
                <tr
                  key={item}
                  className="border-b border-dotted border-[#082B16]/20"
                >
                  <td className="receipt-item-text py-1.5 pr-2 align-top text-[13px] tabular-nums sm:py-2 sm:text-sm">
                    {String(index + 1).padStart(2, "0")}
                  </td>
                  <td className="receipt-item-text py-1.5 text-right text-[13px] leading-snug sm:py-2 sm:text-sm">
                    {item}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 border-t border-dashed border-[#082B16]/30 pt-3 text-center font-mono text-[9px] uppercase tracking-[0.18em] opacity-60 sm:mt-8 sm:pt-4 sm:text-[10px] sm:tracking-[0.2em]">
            june 21 · san francisco
          </div>
        </div>

        <p className="mt-8 font-serif text-sm lowercase opacity-50 sm:mt-12 md:text-base">
          by stone and john
        </p>
      </section>
    </main>
  );
}
