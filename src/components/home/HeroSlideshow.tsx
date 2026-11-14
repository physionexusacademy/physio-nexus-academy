import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { HeroShowController } from "./HeroShowController";

export type HeroSlide = {
  id: string;
  href: string;
  badge: string;
  title: string;
  tag: string;
  chips: string[];
  cta: string;
  /** "r g b" of the slide's accent colour. */
  accent: string;
  icon: ReactNode;
  scene: ReactNode;
};

export const HERO_SLIDE_MS = 6200;

/**
 * The hero's feature slideshow: one card per thing the academy offers, each with a small animated screen.
 *
 * This is a server component: every card is plain HTML in the page, so nothing has to be hydrated and no card is sent twice.
 * HeroShowController (a few kilobytes, renders nothing) attaches to this markup to make it move: it plays by itself (the
 * progress bar is the timer), stops while the pointer or keyboard is on it, while the tab is hidden or the hero is off screen,
 * and never plays by itself for people who ask their device for less motion. Arrow keys, the dots and a swipe move it by hand.
 * Every card is one link to the real feature. Without script the first card simply shows.
 */
export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const count = slides.length;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <section
      id="hero-show"
      className="hs"
      style={{ "--dir": 1, "--hs-ms": `${HERO_SLIDE_MS}ms`, "--hs-cur": slides[0].accent } as CSSProperties}
      data-moved="0"
      data-awake="1"
      data-playing="1"
      data-run="1"
      data-ready="0"
      aria-roledescription="carousel"
      aria-label="What you can do at Physio Nexus Academy"
    >
      <div className="hs-frame">
        <div className="hs-top">
          <span className="hs-live"><span className="nx-live" aria-hidden="true" /> Feature tour</span>
          <span className="hs-count" aria-hidden="true">
            <b data-hs-now>{pad(1)}</b><i> / {pad(count)}</i>
          </span>
        </div>

        <div className="hs-stage">
          {slides.map((slide, i) => (
            <article
              key={slide.id}
              className="hs-slide"
              data-pos={i === 0 ? "active" : "idle"}
              data-accent={slide.accent}
              style={{ "--hs-a": slide.accent } as CSSProperties}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}: ${slide.title}`}
              aria-hidden={i === 0 ? undefined : true}
              inert={i !== 0}
            >
              <div className="hs-scene">{slide.scene}</div>
              <div className="hs-info">
                <span className="hs-badge">{slide.icon}{slide.badge}</span>
                <p className="hs-title">{slide.title}</p>
                <p className="hs-tag">{slide.tag}</p>
                <ul className="hs-chips">
                  {slide.chips.map((chip) => (
                    <li key={chip}>{chip}</li>
                  ))}
                </ul>
                <a href={slide.href} className="hs-go">
                  {slide.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="hs-controls">
          <ol className="hs-dots" aria-label="Choose a feature">
            {slides.map((slide, i) => (
              <li key={slide.id}>
                <button type="button" className="hs-dot" data-hs="dot" data-i={i} aria-label={`Show ${slide.title}`} aria-current={i === 0 ? "true" : undefined}>
                  <i className="hs-fill" />
                </button>
              </li>
            ))}
          </ol>
          <div className="hs-buttons">
            <button type="button" className="hs-btn" data-hs="prev" aria-label="Previous feature">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" className="hs-btn" data-hs="play" aria-label="Pause the slideshow" aria-pressed="false">
              <Pause className="hs-ic-pause h-4 w-4" aria-hidden="true" />
              <Play className="hs-ic-play h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" className="hs-btn" data-hs="next" aria-label="Next feature">
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <HeroShowController />
    </section>
  );
}
