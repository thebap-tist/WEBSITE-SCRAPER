import puppeteer from "puppeteer";
import { mkdir, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)));
const OUT_DIR = resolve(ROOT, "temporary screenshots");

// Args: node screenshot.mjs <url> [label] [--scroll=N] [--mobile] [--live]
// --scroll=N  scroll to Y=N pixels before screenshot, preserves GSAP (for pinned scroll verification)
// --mobile    use 390x844 viewport
// --live      preserve GSAP animations even without --scroll
const rawArgs = process.argv.slice(2);
const flags = rawArgs.filter((a) => a.startsWith("--"));
const positional = rawArgs.filter((a) => !a.startsWith("--"));
const [urlArg, labelArg] = positional;
if (!urlArg) {
  console.error("usage: node screenshot.mjs <url> [label] [--scroll=N] [--mobile] [--live]");
  process.exit(1);
}
const scrollFlag = flags.find((f) => f.startsWith("--scroll="));
const scrollY = scrollFlag ? parseInt(scrollFlag.split("=")[1], 10) : null;
const isMobile = flags.includes("--mobile");
const isLive = isLiveMode(flags, scrollY);

function isLiveMode(flags, scrollY) {
  // When scrolling or explicitly --live, preserve GSAP so pinned ScrollTriggers render their real state.
  return flags.includes("--live") || scrollY !== null;
}

await mkdir(OUT_DIR, { recursive: true });

const existing = await readdir(OUT_DIR).catch(() => []);
let maxN = 0;
for (const name of existing) {
  const match = name.match(/^screenshot-(\d+)(?:-.*)?\.png$/);
  if (match) {
    const n = parseInt(match[1], 10);
    if (n > maxN) maxN = n;
  }
}
const nextN = maxN + 1;
const labelSuffix = labelArg ? `-${labelArg}` : "";
const outPath = resolve(OUT_DIR, `screenshot-${nextN}${labelSuffix}.png`);

const viewport = isMobile
  ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
  : { width: 1440, height: 900, deviceScaleFactor: 2 };

const browser = await puppeteer.launch({
  headless: true,
  defaultViewport: viewport,
});
try {
  const page = await browser.newPage();
  await page.goto(urlArg, { waitUntil: "networkidle0", timeout: 60000 });

  if (isLive) {
    // Live mode: let GSAP + ScrollTrigger run. Scroll to requested position, wait, screenshot.
    await page.evaluateHandle("document.fonts.ready");
    await new Promise((r) => setTimeout(r, 600));
    if (scrollY !== null) {
      await page.evaluate((y) => window.scrollTo(0, y), scrollY);
      // scrub: 1 lerps with ~1s damping. Wait longer so animation fully catches up.
      await new Promise((r) => setTimeout(r, 2500));
    }
    // For pinned scroll screenshots, fullPage with pinned elements is unreliable.
    // Use a viewport-only screenshot when scrolling (captures the pinned scene).
    const fullPage = scrollY === null;
    await page.screenshot({ path: outPath, fullPage });
  } else {
    // Static mode: kill GSAP, force everything visible, take full-page screenshot
    await page.evaluate(() => {
      // Remove stack-mode so pillar-wrappers fall back to normal document flow
      document.body.classList.remove("stack-mode");
      // If GSAP loaded, kill all tweens/timelines and clear inline styles
      if (typeof gsap !== "undefined") {
        gsap.globalTimeline.clear();
        if (typeof ScrollTrigger !== "undefined") {
          ScrollTrigger.getAll().forEach(t => t.kill());
        }
        gsap.utils.toArray("[style]").forEach(el => {
          el.style.opacity = "";
          el.style.transform = "";
          el.style.scale = "";
          el.style.visibility = "";
        });
      }
      // Brute-force: ensure every element is visible
      document.querySelectorAll("*").forEach(el => {
        const s = getComputedStyle(el);
        if (parseFloat(s.opacity) < 0.1 && !el.closest(".parallax-blob")) {
          el.style.opacity = "1";
          el.style.transform = "none";
        }
      });
      const style = document.createElement("style");
      style.textContent = `.float-phone { animation: none !important; transform: rotate(-2.2deg) !important; }`;
      document.head.appendChild(style);
    });
    await page.evaluateHandle("document.fonts.ready");
    await new Promise((r) => setTimeout(r, 900));
    await page.screenshot({ path: outPath, fullPage: true });
  }
  console.log(`saved ${outPath}`);
} finally {
  await browser.close();
}
