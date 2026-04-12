import puppeteer from "puppeteer";
import { mkdir, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)));
const OUT_DIR = resolve(ROOT, "temporary screenshots");

const [, , urlArg, labelArg] = process.argv;
if (!urlArg) {
  console.error("usage: node screenshot.mjs <url> [label]");
  process.exit(1);
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

const browser = await puppeteer.launch({
  headless: true,
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
});
try {
  const page = await browser.newPage();
  await page.goto(urlArg, { waitUntil: "networkidle0", timeout: 60000 });
  // Kill all GSAP animations and force everything visible for static screenshots
  await page.evaluate(() => {
    // If GSAP loaded, kill all tweens/timelines and clear inline styles
    if (typeof gsap !== "undefined") {
      gsap.globalTimeline.clear();
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.getAll().forEach(t => t.kill());
      }
      // Remove all GSAP-set inline styles (opacity, transform, scale)
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
  // Wait for fonts and pending transitions
  await page.evaluateHandle("document.fonts.ready");
  await new Promise((r) => setTimeout(r, 900));
  await page.screenshot({ path: outPath, fullPage: true });
  console.log(`saved ${outPath}`);
} finally {
  await browser.close();
}
