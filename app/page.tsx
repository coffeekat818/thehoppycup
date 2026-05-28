"use client";

// created by John Hong
// May 27, 2026

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const SECTION_COUNT = 3;

const RSVP_SESSIONS = [
  {
    time: "9:00am",
    href: "https://partiful.com/e/0e7arZwWKwRvJlbs36eB?c=GOjmPWWw",
  },
  {
    time: "11:30am",
    href: "https://partiful.com/e/w481cnlvAWSSjkEKj93I?c=c8UQZCtr",
  },
  {
    time: "2:00pm",
    href: "https://partiful.com/e/68QYQ3EGNmUhYtBHbFNJ?c=SAOBbKU1",
  },
] as const;

function fadeInOnce(
  el: HTMLElement,
  duration: number,
  onComplete?: () => void
) {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reducedMotion) {
    el.style.opacity = "1";
    onComplete?.();
    return;
  }

  const animation = el.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration,
    easing: "ease-out",
    fill: "forwards",
  });

  void animation.finished.then(onComplete).catch(onComplete);

  return () => animation.cancel();
}

function tapHaptic() {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(pointer: coarse)").matches) return;

  try {
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (!isIOS && typeof navigator.vibrate === "function") {
      navigator.vibrate(12);
      return;
    }

    const label = document.createElement("label");
    label.setAttribute("aria-hidden", "true");
    label.style.cssText =
      "display:none;position:fixed;opacity:0;pointer-events:none;";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("switch", "");
    label.appendChild(input);
    document.head.appendChild(label);
    label.click();
    document.head.removeChild(label);
  } catch {
    // unsupported or blocked
  }
}

function HeroIntroFade({
  className = "",
  children,
  onComplete,
}: {
  className?: string;
  children: React.ReactNode;
  onComplete?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    return fadeInOnce(el, 1000, onComplete);
  }, [onComplete]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

function ScrollHint({
  caption,
  visible,
  onClick,
  ariaLabel,
  direction = "down",
}: {
  caption: string;
  visible: boolean;
  onClick: () => void;
  ariaLabel: string;
  direction?: "up" | "down";
}) {
  const isUp = direction === "up";

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onPointerUp={(e) => {
        e.preventDefault();
        e.currentTarget.blur();
        tapHaptic();
        onClick();
      }}
      className={`absolute left-1/2 z-10 flex -translate-x-1/2 touch-manipulation flex-col items-center justify-center gap-2 px-10 py-5 transition-opacity duration-500 ${
        isUp ? "top-6 flex-col-reverse" : "bottom-6"
      } ${
        visible
          ? "pointer-events-auto opacity-40 hover:opacity-65"
          : "pointer-events-none opacity-0"
      }`}
    >
      <span className="pointer-events-none font-serif text-xs lowercase tracking-wide md:text-sm">
        {caption}
      </span>
      <svg
        width="28"
        height="28"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
        className={`pointer-events-none ${isUp ? "scroll-hint-bounce-up" : "scroll-hint-bounce-down"}`}
      >
        <path
          d={
            isUp
              ? "M10 16V6M10 6l-4 4M10 6l4 4"
              : "M10 4v10M10 14l-4-4M10 14l4-4"
          }
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
  const [heroHintVisible, setHeroHintVisible] = useState(false);

  const onHeroIntroComplete = useCallback(() => {
    window.setTimeout(() => setHeroHintVisible(true), 300);
  }, []);

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

  const scrollToAdjacentSection = (delta: -1 | 1) => {
    const nextIndex = activeSection + delta;
    if (nextIndex < 0 || nextIndex >= SECTION_COUNT) return;
    scrollToSection(nextIndex);
  };

  return (
    <main
      ref={mainRef}
      className="h-[100svh] snap-y snap-mandatory scroll-smooth overflow-y-auto overscroll-y-contain bg-[#082B16] text-[#F4F1E8] selection:bg-[#F4F1E8] selection:text-[#082B16]"
    >
      <nav
        aria-label="Page sections"
        className="fixed right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3 md:flex md:right-6"
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
        <HeroIntroFade
          className="flex flex-col items-center"
          onComplete={onHeroIntroComplete}
        >
          <div className="flex w-[160px] items-center justify-center md:w-[260px]">
            {/* Touch devices: MP4 only (legacy mobile WebM support) */}
            <LoopingVideo
              className="block h-auto w-full object-contain [@media(pointer:fine)]:hidden"
              sources={[
                { src: "/hoppy-cup-animation.mp4", type: "video/mp4" },
              ]}
            />

            {/* Mouse/trackpad: WebM with alpha, MP4 fallback */}
            <LoopingVideo
              className="hidden h-auto w-full object-contain [@media(pointer:fine)]:block"
              sources={[
                { src: "/hoppy-cup-animation.webm", type: "video/webm" },
                { src: "/hoppy-cup-animation.mp4", type: "video/mp4" },
              ]}
            />
          </div>

          <h1 className="mt-2 font-serif text-2xl lowercase tracking-tight md:mt-6 md:text-3xl">
            the hoppy cup
          </h1>
        </HeroIntroFade>

        <ScrollHint
          caption="hop to rsvp"
          visible={activeSection === 0 && heroHintVisible}
          onClick={() => scrollToAdjacentSection(1)}
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

          <div className="mt-6 flex w-full flex-col items-center space-y-6">
            <p className="text-sm opacity-55 md:text-base">
              pick a session · 6 guests each
            </p>

            <ul className="grid w-full grid-cols-3 gap-3">
              {RSVP_SESSIONS.map((session) => (
                <li key={session.time}>
                  <a
                    href={session.href}
                    target="_blank"
                    rel="noreferrer"
                    className="block border border-[#F4F1E8]/20 px-2 py-3 text-sm transition-all duration-300 hover:border-[#F4F1E8]/40 hover:opacity-80 md:py-4 md:text-lg"
                  >
                    {session.time}
                  </a>
                </li>
              ))}
            </ul>

            <a
              href="https://maps.google.com/?q=Paper+Son+Coffee+303+2nd+St+N102+San+Francisco+CA+94107"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 text-sm opacity-50 transition-opacity duration-300 hover:opacity-70 md:text-base"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="shrink-0 opacity-80"
              >
                <path
                  d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span>paper son coffee @ fidi</span>
            </a>
          </div>
        </div>

        <ScrollHint
          caption="hop to menu"
          visible={activeSection === 1}
          onClick={() => scrollToAdjacentSection(1)}
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
        <div className="flex flex-col items-center">
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

            <div className="mt-4 text-center font-mono text-[9px] uppercase tracking-[0.18em] opacity-60 sm:mt-8 sm:text-[10px] sm:tracking-[0.2em]">
              june 21 · san francisco
            </div>
          </div>

          <p className="mt-8 font-serif text-sm lowercase opacity-50 sm:mt-12 md:text-base">
            by stone and john
          </p>
        </div>
      </section>
    </main>
  );
}
