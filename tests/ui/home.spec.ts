import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { APPROVED_MEMO } from "../../content/memo";
import { ALL_LIBRARY, SHELF_FILTERS, STRATEGY_STACK } from "../../content/library";

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
});

test("hero shows the H1 and four working routes that leave the page", async ({ page }) => {
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator("h1")).toHaveText("Airman's AI Playbook");
  const hero = page.locator("section[aria-labelledby='playbook-title']");
  const box = await hero.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(900 - 100);
  const routes = [["Communities", "/communities"], ["Search", "/search"], ["Tools", "/tools"], ["Sign in", "/sign-in"]];
  const actions = hero.getByRole("navigation", { name: "Start here" }).getByRole("link");
  await expect(actions).toHaveCount(4);
  for (const [label, href] of routes) {
    await expect(hero.getByRole("navigation", { name: "Start here" }).getByRole("link", { name: new RegExp(`^${label}`) })).toHaveAttribute("href", href);
  }
  for (const [label, href] of routes) {
    await page.goto("/", { waitUntil: "networkidle" });
    await hero.getByRole("navigation", { name: "Start here" }).getByRole("link", { name: new RegExp(`^${label}`) }).click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator("main h1")).toHaveCount(1);
  }
});

test("header notices and the old leadership letter are gone", async ({ page }) => {
  await expect(page.getByText("Concept demonstration", { exact: false })).toHaveCount(0);
  await expect(page.getByText("Plays are examples", { exact: false })).toHaveCount(0);
  await expect(page.getByText("Not an endorsement", { exact: false })).toHaveCount(0);
  await expect(page.getByText("Not a CSAF endorsement", { exact: false })).toHaveCount(0);
  await expect(page.locator("#leadership-source, [data-leadership-signature]")).toHaveCount(0);
  await expect(page.getByText("First letter to the force")).toHaveCount(0);
  const html = await page.content();
  expect(html).not.toContain("csaf-first-letter");
  expect(html).not.toContain("csaf-wilsbach-signature");
});

test("header uses the Air Force symbol at its native proportions", async ({ page }) => {
  const symbol = page.locator("header img.site-brand-symbol");
  await expect(symbol).toHaveAttribute("src", "/assets/af-symbol-white.svg");
  await expect(symbol).toHaveAttribute("alt", "U.S. Air Force symbol");
  expect(await symbol.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  const rendered = await symbol.boundingBox();
  expect(rendered!.width / rendered!.height).toBeCloseTo(338.667 / 264.018, 1);
  await expect(page.locator("header").getByText("AP", { exact: true })).toHaveCount(0);
});

test("the approved memorandum is shown only when one has been supplied", async ({ page }) => {
  const memo = page.getByTestId("leadership-memo");
  if (!APPROVED_MEMO) {
    await expect(memo).toHaveCount(0);
    return;
  }
  await expect(memo.getByRole("heading", { name: APPROVED_MEMO.heading })).toBeVisible();
  await expect(memo.locator("time")).toHaveAttribute("datetime", APPROVED_MEMO.date.iso);
  await expect(memo).toContainText(`SUBJECT: ${APPROVED_MEMO.subject}`);
  if (APPROVED_MEMO.isSeparatePageMfr) await expect(memo).not.toContainText("FROM:");
  for (const block of APPROVED_MEMO.body) await expect(memo).toContainText(block.text);
  await expect(memo.locator("svg[role='img']")).toHaveAttribute("aria-label", APPROVED_MEMO.signature.alt);
  await expect(memo).toContainText(APPROVED_MEMO.endorsement);
  // Memo sits directly below the hero.
  const order = await page.evaluate(() => {
    const hero = document.querySelector("section[aria-labelledby='playbook-title']")!;
    return hero.nextElementSibling?.getAttribute("data-testid");
  });
  expect(order).toBe("leadership-memo");
  // Reduced motion: the complete static signature, no animation.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload({ waitUntil: "networkidle" });
  await expect(memo.locator("svg[role='img']")).toHaveAttribute("data-phase", "static");
});

test("optional setup saves preferences and saved items remain removable", async ({ page }) => {
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Set up Home", exact: true }).click();
  const setup = page.getByRole("dialog", { name: "Set up Home", exact: true });
  await expect(setup).toBeVisible();
  await setup.getByRole("button", { name: /^Find a tool/ }).click();
  await setup.getByRole("button", { name: /^Make it repeatable/ }).click();
  await setup.getByRole("button", { name: "Save setup", exact: true }).click();
  await expect(setup).toHaveCount(0);
  await page.reload({ waitUntil: "networkidle" });
  const reference = page.locator("[data-home-reference]");
  await expect(reference).toContainText("Find a tool");
  await expect(reference.getByRole("link", { name: "Start here", exact: true })).toHaveAttribute("href", "/tools");
  await page.goto("/tools", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Add GenAI.mil to Home", exact: true }).click();
  await page.getByRole("banner").getByRole("link", { name: /Airman's AI Playbook/ }).click();
  await expect(reference.getByRole("link", { name: "Tool GenAI.mil", exact: true })).toHaveAttribute("href", "https://genai.mil");
  await reference.getByRole("button", { name: "Remove GenAI.mil", exact: true }).click();
  await expect(reference.getByText("Star a play or tool to save it here", { exact: false })).toBeVisible();
  await reference.getByRole("button", { name: "Change Home setup" }).click();
  await page.keyboard.press("Escape");
  await expect(setup).toHaveCount(0);
});

test("reference tabs, strategy disclosures, and source filters retain keyboard and content behavior", async ({ page }) => {
  const reference = page.locator("[data-home-reference]");
  const saved = reference.getByRole("tab", { name: "Saved work", exact: true });
  await saved.focus();
  await page.keyboard.press("ArrowRight");
  await expect(reference.getByRole("tab", { name: "Strategy", exact: true })).toBeFocused();
  await expect(reference.getByRole("tab", { name: "Strategy", exact: true })).toHaveAttribute("aria-selected", "true");
  const panel = reference.getByRole("tabpanel");
  await expect(panel).toHaveCount(1);
  await expect(panel).toContainText("A practical response to published direction.");
  await expect(panel).not.toContainText("endorsement");
  for (const doc of STRATEGY_STACK) {
    const disclosure = panel.getByRole("button", { name: new RegExp(doc.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) });
    await disclosure.click();
    await expect(disclosure).toHaveAttribute("aria-expanded", "true");
    await expect(disclosure.locator("a")).toHaveCount(0);
    await expect(panel.getByText(doc.translation_line!, { exact: true })).toBeVisible();
    await disclosure.click();
  }
  await reference.getByRole("tab", { name: "Strategy", exact: true }).focus();
  await page.keyboard.press("End");
  await expect(reference.getByRole("tab", { name: "Sources", exact: true })).toBeFocused();
  for (const filter of SHELF_FILTERS) {
    await panel.getByRole("group", { name: "Filter sources" }).getByRole("button", { name: filter.label, exact: true }).click();
    const expected = filter.id === "all" ? ALL_LIBRARY : ALL_LIBRARY.filter((doc) => doc.category === filter.id);
    await expect(panel.locator("article")).toHaveCount(expected.length);
    await expect(panel.getByRole("status")).toContainText(`${expected.length} sources shown`);
  }
  await reference.getByRole("tab", { name: "Sources", exact: true }).focus();
  await page.keyboard.press("Home");
  await expect(saved).toBeFocused();
  await expect(saved).toHaveAttribute("aria-selected", "true");
});

test("adoption actions, global search, strategy and guide remain reachable", async ({ page }) => {
  await page.getByRole("button", { name: "Read the user guide", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "User Guide" })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.locator("#home-search").fill("awards");
  await page.locator("main form").getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/\/search\?q=awards$/);
  await expect(page.getByRole("textbox", { name: "Search the AI Playbook" })).toHaveValue("awards");
});

for (const width of [1440, 1024, 768, 390]) {
  test(`home composition and reference accessibility at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: testInfo.outputPath(`home-${width}.png`), fullPage: true });
    const title = await page.locator("#playbook-title").boundingBox();
    expect(title!.y).toBeLessThan(500);
    const actions = await page.getByRole("navigation", { name: "Start here" }).getByRole("link").evaluateAll((links) => links.map((link) => link.getBoundingClientRect().height));
    expect(Math.min(...actions)).toBeGreaterThanOrEqual(44);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
    for (const tab of ["Saved work", "Strategy", "Sources"]) {
      await page.getByRole("tab", { name: tab, exact: true }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    }
    const shortControls = await page.locator("main button:visible, main summary:visible")
      .evaluateAll((elements) => elements.filter((element) => element.getBoundingClientRect().height < 44).map((element) => element.textContent));
    expect(shortControls).toEqual([]);
  });
}
