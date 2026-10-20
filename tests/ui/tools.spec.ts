import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { INTENTS, TOOLS } from "../../lib/mock/tools";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("ap.onboarding", JSON.stringify({ seen: true }));
  });
  await page.goto("/tools", { waitUntil: "networkidle" });
  await expect(page.locator("#tool-directory article")).toHaveCount(TOOLS.length);
});

test("search combines with every task filter and supports clear and empty states", async ({ page }) => {
  const cards = page.locator("#tool-directory article");
  for (const intent of INTENTS) {
    const filter = page.getByRole("button", { name: intent.label, exact: true });
    await filter.click();
    await expect(filter).toHaveAttribute("aria-pressed", "true");
    await expect(cards).toHaveCount(intent.toolIds.length);
    expect(await cards.evaluateAll((items) => items.map((item) => item.id).sort()))
      .toEqual(intent.toolIds.map((id) => `tool-row-${id}`).sort());
    await filter.click();
    await expect(cards).toHaveCount(TOOLS.length);
  }
  await page.getByRole("button", { name: "write", exact: true }).click();
  await page.locator("#tools-search").fill("  SaGe  ");
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toHaveAttribute("id", "tool-row-t15");
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await expect(page.locator("#tools-search")).toBeFocused();
  await expect(cards).toHaveCount(2);
  await page.locator("#tools-search").fill("no-such-tool-xyz");
  await expect(page.getByRole("heading", { name: "No tools found" })).toBeVisible();
  await expect(page.locator("#tools-result-count")).toContainText("0 of 12");
  await page.getByRole("button", { name: "Show all tools" }).click();
  await expect(cards).toHaveCount(TOOLS.length);
  await expect(page.locator("#tools-search")).toHaveValue("");
  await expect(page.getByRole("button", { name: "All tools", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.locator("#tools-search").fill("research");
  await expect(page.locator("#tool-row-t1")).toBeVisible();
  await expect(page.locator("#tool-row-t15")).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await page.locator("#tools-search").fill("Automation");
  await expect(page.locator("#tool-row-t22")).toBeVisible();
  await page.locator("#tools-search").fill("Advanced");
  await expect(page.locator("#tool-row-t15")).toBeVisible();
});

test("all tools retain source descriptions, launch links, status, and coming-soon notes", async ({ page }) => {
  for (const tool of TOOLS) {
    const card = page.locator(`#tool-row-${tool.id}`);
    await expect(card.getByRole("heading", { name: tool.name, exact: true })).toBeVisible();
    await expect(card.getByText(tool.one_liner, { exact: true })).toBeVisible();
    await card.getByRole("button", { name: /^View / }).click();
    const dialog = page.getByRole("dialog", { name: tool.name, exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(tool.description, { exact: true })).toBeVisible();
    if (tool.status === "live") {
      if (tool.launch_url) {
        await expect(dialog.getByRole("link", { name: `Open ${tool.name} →`, exact: true })).toHaveAttribute("href", tool.launch_url);
      } else {
        await expect(dialog.getByText("Link being verified — check back")).toBeVisible();
        await expect(dialog.getByRole("link", { name: /^Open / })).toHaveCount(0);
      }
      await expect(dialog.getByText(tool.cleared_line, { exact: true })).toBeVisible();
      await expect(dialog.locator("button[aria-pressed='false']")).toHaveCount(tool.access_path.length);
      await expect(dialog.getByRole("link", { name: "Report an issue" })).toHaveAttribute("target", "_blank");
      for (const playId of tool.play_ids) {
        await expect(dialog.locator(`a[href$="#${playId}"][href^="/communities/"]`)).toHaveCount(1);
      }
      if (tool.path_pending_verification) {
        await expect(dialog.getByText("Exact steps pending verification")).toBeVisible();
      } else {
        await expect(dialog.locator("time")).toHaveAttribute("datetime", tool.path_verified_on);
      }
    } else {
      await expect(dialog.getByText(tool.soon_note!, { exact: true })).toBeVisible();
      await expect(dialog.getByRole("link", { name: /^Open / })).toHaveCount(0);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(card.getByRole("button", { name: /^View / })).toBeFocused();
  }
});

test("saved tools, checked steps, and launcher mode persist across reloads", async ({ page, context }) => {
  const card = page.locator("#tool-row-t1");
  await card.getByRole("button", { name: "Add GenAI.mil to Home" }).click();
  await card.getByRole("button", { name: /^View / }).click();
  let dialog = page.getByRole("dialog", { name: "GenAI.mil", exact: true });
  const step = TOOLS[0].access_path[0].step;
  await dialog.getByRole("button", { name: step, exact: true }).click();
  await page.reload();
  await expect(card.getByRole("button", { name: "Remove GenAI.mil from Home" })).toHaveAttribute("aria-pressed", "true");
  await card.getByRole("button", { name: /^View / }).click();
  dialog = page.getByRole("dialog", { name: "GenAI.mil", exact: true });
  await expect(dialog.getByRole("button", { name: step, exact: true })).toHaveAttribute("aria-pressed", "true");
  await context.route("https://genai.mil/**", (route) => route.fulfill({ body: "Test launch destination" }));
  const popup = page.waitForEvent("popup");
  await dialog.getByRole("link", { name: "Open GenAI.mil →", exact: true }).click();
  await (await popup).close();
  await page.reload();
  await card.getByRole("button", { name: /^View / }).click();
  await expect(page.locator("#tool-path-t1")).toBeHidden();
  await page.getByRole("button", { name: "First time here? See the path in" }).click();
  await expect(page.locator("#tool-path-t1")).toBeVisible();
  await expect(page.getByRole("button", { name: step, exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("clipboard success and failure are explicit, and dialog keyboard focus stays contained", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.locator("#tool-row-t1").getByRole("button", { name: /^View / }).click();
  const dialog = page.getByRole("dialog", { name: "GenAI.mil", exact: true });
  const close = dialog.getByRole("button", { name: "Close details" });
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("link", { name: "Report an issue" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await dialog.getByRole("button", { name: "Copy prompt", exact: true }).click();
  await expect(dialog.getByText("Prompt copied to clipboard.", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(TOOLS[0].first_move?.copyable);
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => { throw new Error("Clipboard denied for test"); } },
    });
  });
  await dialog.getByRole("button", { name: "Copied", exact: true }).click();
  await expect(dialog.getByText("Could not copy. Select the prompt above and copy it manually.")).toBeVisible();
  const accessibility = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
  expect(accessibility.violations).toEqual([]);
});

for (const width of [1440, 1024, 768, 390]) {
  test(`layout, keyboard navigation, and accessibility at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const undersizedControls = await page.locator("main button:visible, .site-header button:visible")
      .evaluateAll((buttons) => buttons.filter((button) => {
        const bounds = button.getBoundingClientRect();
        return bounds.width < 44 || bounds.height < 44;
      }).map((button) => button.textContent));
    expect(undersizedControls).toEqual([]);
    if (width === 390) {
      const search = await page.locator("#tools-search").boundingBox();
      expect(search).not.toBeNull();
      expect(search!.y + search!.height).toBeLessThanOrEqual(670);
    }
    await page.screenshot({ path: testInfo.outputPath(`tools-${width}.png`), fullPage: true });
    const accessibility = await new AxeBuilder({ page }).analyze();
    expect(accessibility.violations).toEqual([]);
    const menu = page.getByRole("button", { name: "Menu", exact: true });
    await menu.focus();
    await page.keyboard.press("Enter");
    const drawer = page.getByRole("dialog", { name: "Site menu" });
    await expect(drawer).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(drawer.getByRole("link", { name: /^Communities/ })).toBeFocused();
    expect(await page.evaluate(() => {
      const style = getComputedStyle(document.activeElement!);
      return style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2;
    })).toBe(true);
    await expect(drawer.getByRole("link", { name: /^Tools/ })).toHaveAttribute("aria-current", "page");
    await page.keyboard.press("Escape");
    await expect(menu).toBeFocused();
    await expect(drawer).toHaveCount(0);
    const card = page.locator("#tool-row-t1");
    await card.getByRole("button", { name: /^View / }).click();
    if (width >= 1024) {
      await expect(page.getByRole("dialog", { name: "GenAI.mil", exact: true })).toBeVisible();
    } else {
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(card.getByRole("link", { name: "Open GenAI.mil →" })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await card.getByRole("button", { name: "Close GenAI.mil access and details" }).click();
      await expect(page.locator("#tool-details-t1")).toBeHidden();
    }
  });
}

test("shared navigation preserves routes and guide access without interrupting first visits", async ({ page, browser }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const [label, route] of [["Communities", "/communities"], ["Learn", "/ai-automation"], ["Tools", "/tools"]]) {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await page.getByRole("dialog", { name: "Site menu" }).getByRole("link", { name: new RegExp(`^${label}`) }).click();
    await expect(page).toHaveURL(new RegExp(`${route}$`));
    await expect(page.locator("main h1")).toHaveCount(1);
  }
  await page.goto("/communities/front-office-admin", { waitUntil: "networkidle" });
  const expand = page.getByRole("button", { name: "Expand play", exact: true }).first();
  await expand.click();
  await expect(page.getByRole("dialog", { name: "MFR in One Pass", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Close details", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(expand).toBeFocused();
  await page.getByRole("banner").getByRole("link", { name: "Search" }).click();
  await expect(page).toHaveURL(/\/search$/);
  await page.getByRole("navigation", { name: "Support" }).getByRole("button", { name: "User guide" }).click();
  await expect(page.getByRole("dialog", { name: "User Guide" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "User Guide" })).toHaveCount(0);
  expect(errors).toEqual([]);
  const firstVisit = await browser.newContext();
  const freshPage = await firstVisit.newPage();
  await freshPage.goto("http://127.0.0.1:3100/tools", { waitUntil: "networkidle" });
  await expect(freshPage.getByRole("dialog")).toHaveCount(0);
  await expect(freshPage.locator("#tools-search")).toBeVisible();
  await firstVisit.close();
});
