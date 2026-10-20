import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { PHOTOGRAPHS } from "../../content/photography";

test("home alternates dark and light scenes", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const tones = await page.locator("main > div > section, main > div > [class*='band']").evaluateAll((sections) =>
    sections.map((section) => {
      const [r, g, b] = getComputedStyle(section).backgroundColor.match(/\d+(\.\d+)?/g)!.map(Number);
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.35 ? "dark" : "light";
    }));
  const rhythm = tones.join(" ").replace(/(dark|light)( \1)+/g, "$1");
  expect(rhythm.startsWith("dark light dark light")).toBe(true);
  expect(tones.filter((tone) => tone === "dark").length).toBeGreaterThanOrEqual(3);
});

test("every photograph is attributed, loads, and links to its source", async ({ page }) => {
  await page.goto("/credits", { waitUntil: "networkidle" });
  for (const photo of Object.values(PHOTOGRAPHS)) {
    const entry = page.locator(`#${photo.id}`);
    await expect(entry).toContainText(photo.credit);
    await expect(entry).toContainText(photo.releaseId ?? "");
    await expect(entry.getByRole("link", { name: /View the original/ })).toHaveAttribute("href", photo.sourceUrl);
    await entry.scrollIntoViewIfNeeded();
    await expect.poll(() => entry.locator("img").evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0 && image.currentSrc.includes("/assets/photography/"))).toBe(true);
    expect(photo.rights.length).toBeGreaterThan(20);
  }
  await expect(page.getByText("Nothing is generated, composited, or retouched.")).toBeVisible();
});

test("photographs on the home page credit their source", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const images = await page.locator("main img[src*='/assets/photography/']").evaluateAll((items) => items.map((item) => (item as HTMLImageElement).getAttribute("src")));
  expect(images.length).toBeGreaterThanOrEqual(5);
  const credits = await page.locator("main a[href^='/credits#']").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  for (const src of new Set(images)) {
    const id = src!.match(/photography\/(.+)-2400\.webp/)![1];
    expect(credits).toContain(`/credits#${id}`);
  }
});

for (const width of [1440, 390]) {
  test(`cinematic page headers are accessible without overflow at ${width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const route of ["/tools", "/communities", "/communities/maintainers", "/sign-in", "/ai-automation", "/search", "/credits"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      await expect(page.locator("main h1")).toHaveCount(1);
      await expect(page.locator(".page-hero")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const results = await new AxeBuilder({ page }).exclude("iframe").analyze();
      expect(results.violations, route).toEqual([]);
    }
  });
}
