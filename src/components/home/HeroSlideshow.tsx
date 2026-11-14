import { HERO_ICONS, type HeroIcon } from "./hero-icons";
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
  icon: HeroIcon;
  /** The card's animated screen, as an HTML string (see hero-scenes.ts). */
  scene: string;
};

export const HERO_SLIDE_MS = 6200;

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pad = (value: number) => String(value).padStart(2, "0");

/** The slideshow's markup. Every value is trusted constant text from LobbyHero; nothing from a visitor goes in. */
export function heroSlideshowHtml(slides: HeroSlide[]) {
  const count = slides.length;
  const cards = slides
    .map(
      (slide, i) =>
        `<article class="hs-slide" data-pos="${i === 0 ? "active" : "idle"}" data-accent="${slide.accent}" style="--hs-a:${slide.accent}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${count}: ${escape(slide.title)}"${i === 0 ? "" : ' aria-hidden="true" inert'}>` +
        `<div class="hs-scene">${slide.scene}</div>` +
        `<div class="hs-info"><span class="hs-badge">${HERO_ICONS[slide.icon]}${escape(slide.badge)}</span><p class="hs-title">${escape(slide.title)}</p><p class="hs-tag">${escape(slide.tag)}</p>` +
        `<ul class="hs-chips">${slide.chips.map((chip) => `<li>${escape(chip)}</li>`).join("")}</ul>` +
        `<a href="${slide.href}" class="hs-go">${escape(slide.cta)} ${HERO_ICONS.arrowRight}</a></div></article>`,
    )
    .join("");
  const dots = slides
    .map(
      (slide, i) =>
        `<li><button type="button" class="hs-dot" data-hs="dot" data-i="${i}" aria-label="Show ${escape(slide.title)}"${i === 0 ? ' aria-current="true"' : ""}><i class="hs-fill"></i></button></li>`,
    )
    .join("");
  return (
    `<section id="hero-show" class="hs" style="--dir:1;--hs-ms:${HERO_SLIDE_MS}ms;--hs-cur:${slides[0].accent}" data-moved="0" data-awake="1" data-playing="1" data-run="1" data-ready="0" aria-roledescription="carousel" aria-label="What you can do at Physio Nexus Academy">` +
    `<div class="hs-frame"><div class="hs-top"><span class="hs-live"><span class="nx-live" aria-hidden="true"></span> Feature tour</span><span class="hs-count" aria-hidden="true"><b data-hs-now>${pad(1)}</b><i> / ${pad(count)}</i></span></div>` +
    `<div class="hs-stage">${cards}</div>` +
    `<div class="hs-controls"><ol class="hs-dots" aria-label="Choose a feature">${dots}</ol><div class="hs-buttons">` +
    `<button type="button" class="hs-btn" data-hs="prev" aria-label="Previous feature">${HERO_ICONS.chevronLeft}</button>` +
    `<button type="button" class="hs-btn" data-hs="play" aria-label="Pause the slideshow" aria-pressed="false">${HERO_ICONS.pause}${HERO_ICONS.play}</button>` +
    `<button type="button" class="hs-btn" data-hs="next" aria-label="Next feature">${HERO_ICONS.chevronRight}</button>` +
    `</div></div></div></section>`
  );
}

/**
 * The hero's feature slideshow: one card per thing the academy offers, each with a small animated screen.
 *
 * The cards are sent as ONE HTML string (dangerouslySetInnerHTML) and not as React elements, so the browser parses them once and
 * React neither receives them a second time nor walks them when the page starts (that cost about 260 ms of blocking time on a
 * phone). HeroShowController (a few kilobytes, renders nothing) attaches to the markup to make it move: it plays by itself (the
 * progress bar is the timer), stops while the pointer or keyboard is on it, while the tab is hidden or the hero is off screen, and
 * never plays by itself for people who ask their device for less motion. Arrow keys, the dots and a swipe move it by hand. Every
 * card is one link to the real feature. Without script the first card simply shows.
 */
export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  return (
    <>
      <div className="lobby-show" dangerouslySetInnerHTML={{ __html: heroSlideshowHtml(slides) }} />
      <HeroShowController />
    </>
  );
}
