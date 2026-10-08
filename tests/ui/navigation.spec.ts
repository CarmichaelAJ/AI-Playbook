import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const sizes = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

for (const { name, width, height } of sizes) {
  test.describe(`header and side menu on ${name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto("/", { waitUntil: "networkidle" });
    });

    test("Search and Sign in are in the header; Plays is not navigation", async ({ page }) => {
      const header = page.getByRole("banner");
      await expect(header.getByRole("link", { name: "Search", exact: true })).toHaveAttribute("href", "/search");
      await expect(header.getByRole("link", { name: "Sign in", exact: true })).toHaveAttribute("href", "/sign-in");
      await expect(header.getByRole("link", { name: /plays/i })).toHaveCount(0);
      await expect(page.getByRole("navigation", { name: "Footer navigation" }).getByRole("link", { name: /plays/i })).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const small = await header.locator("a:visible, button:visible").evaluateAll((els) =>
        els.filter((el) => { const r = el.getBoundingClientRect(); return r.height < 44 || r.width < 44; }).map((el) => el.textContent));
      expect(small).toEqual([]);
    });

    test("keyboard: open, trap focus, Escape closes and restores focus", async ({ page }) => {
      const toggle = page.getByRole("button", { name: "Menu", exact: true });
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await toggle.focus();
      await page.keyboard.press("Enter");
      const menu = page.getByRole("dialog", { name: "Site menu" });
      await expect(menu).toBeVisible();
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      await expect(menu.getByRole("button", { name: "Close menu" })).toBeFocused();
      const links = menu.getByRole("link");
      const count = await links.count();
      for (const label of ["Communities", "Tools", "Learn"]) {
        await expect(menu.getByRole("link", { name: new RegExp(`^${label}`) })).toBeVisible();
      }
      await expect(menu.getByRole("link", { name: /^Plays/ })).toHaveCount(0);
      // Tab around the whole drawer and confirm focus never escapes it.
      for (let i = 0; i < count + 3; i += 1) {
        await page.keyboard.press("Tab");
        expect(await page.evaluate(() => !!document.activeElement?.closest("#site-menu"))).toBe(true);
      }
      await page.keyboard.press("Shift+Tab");
      expect(await page.evaluate(() => !!document.activeElement?.closest("#site-menu"))).toBe(true);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
      await page.keyboard.press("Escape");
      await expect(menu).toHaveCount(0);
      await expect(toggle).toBeFocused();
    });

    test("pointer: open, navigate from the menu, and dismiss with the backdrop", async ({ page }) => {
      const toggle = page.getByRole("button", { name: "Menu", exact: true });
      await toggle.click();
      const menu = page.getByRole("dialog", { name: "Site menu" });
      await expect(menu).toBeVisible();
      await page.mouse.click(8, height - 8);
      await expect(menu).toHaveCount(0);
      await toggle.click();
      await menu.getByRole("link", { name: /^Communities/ }).click();
      await expect(page).toHaveURL(/\/communities$/);
      await expect(menu).toHaveCount(0);
      await page.getByRole("banner").getByRole("link", { name: "Sign in", exact: true }).click();
      await expect(page).toHaveURL(/\/sign-in$/);
    });
  });
}

test("reduced motion removes the drawer animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  const duration = await page.locator(".site-drawer").evaluate((el) => parseFloat(getComputedStyle(el).animationDuration));
  expect(duration).toBeLessThan(0.001);
});
