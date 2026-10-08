import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("communities start broad and narrow step by step", async ({ page }) => {
  await page.goto("/communities", { waitUntil: "networkidle" });
  await expect(page.locator("main h1")).toHaveText("Communities");
  const card = page.locator("#maintainers");
  await expect(card).toContainText("Maintenance and sortie generation");
  await card.getByRole("link", { name: /^2A/ }).click();
  await expect(page).toHaveURL(/\/communities\/afsc-2a$/);
  await expect(page.locator("main h1")).toHaveText("2A");
  await page.getByRole("navigation", { name: "Community path" });
  await page.getByRole("link", { name: "2A6X1" }).click();
  await expect(page).toHaveURL(/\/communities\/afsc-2a6x1$/);
  const path = page.getByRole("navigation", { name: "Community path" });
  await expect(path.getByRole("link", { name: "Maintenance and sortie generation" })).toBeVisible();
  await expect(path.getByRole("link", { name: "2A", exact: true })).toBeVisible();
  await expect(path.locator("[aria-current='page']")).toHaveText("2A6X1");
  // Plays from the broader community are linked, with their own community visible.
  const broader = page.getByRole("region", { name: "Plays from broader communities" });
  await expect(broader.getByRole("link", { name: "Maintenance and sortie generation" }).first()).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("a community with two parents shows both, and a play shows every community it is in", async ({ page }) => {
  await page.goto("/communities/udm", { waitUntil: "networkidle" });
  await expect(page.getByRole("navigation", { name: "Community path" })).toContainText("Unit programs and additional duties");
  await expect(page.getByRole("navigation", { name: "Community path" })).toContainText("Also under:");
  await page.goto("/communities/epb-narratives", { waitUntil: "networkidle" });
  const card = page.locator("#epb-forge");
  await expect(card).toBeVisible();
  await expect(card.getByRole("link", { name: "Front offices, CSS, and admin teams" })).toBeVisible();
  await expect(page.getByText("Check every draft before your name goes on it.")).toBeVisible();
});

test("there is no standalone plays page", async ({ page }) => {
  const response = await page.goto("/plays");
  expect(response!.status()).toBe(404);
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("a[href='/plays'], a[href^='/plays#']")).toHaveCount(0);
});

test("search shows the community of every play and finds communities by alias", async ({ page }) => {
  await page.goto("/search?q=EPB", { waitUntil: "networkidle" });
  const play = page.locator("div.rounded-card", { has: page.getByRole("heading", { name: "Performance Statement Forge (EPB)" }) });
  await expect(play.getByRole("link", { name: "EPB narratives" })).toHaveAttribute("href", "/communities/epb-narratives");
  await expect(play.getByRole("link", { name: "Front offices, CSS, and admin teams" })).toHaveAttribute("href", "/communities/front-office-admin");
  await page.getByRole("link", { name: "Performance Statement Forge (EPB)" }).first().click();
  await expect(page).toHaveURL(/\/communities\/front-office-admin#epb-forge$/);
  await page.goto("/search?q=unit%20deployment%20manager", { waitUntil: "networkidle" });
  await expect(page.locator("main h2").first()).toHaveText("UDM");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("sign-in route explains the build and does not fake an account", async ({ page }) => {
  await page.goto("/sign-in", { waitUntil: "networkidle" });
  await expect(page.locator("main h1")).toHaveText("Sign in");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("no accounts")).toBeVisible();
  await expect(page.getByText("nothing in this application is approved to handle restricted or classified information", { exact: false })).toBeVisible();
});
