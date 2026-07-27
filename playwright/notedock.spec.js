import { expect, test } from "@playwright/test";

test("normalizes the sample into a reviewable checklist", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Turn scattered client notes/ })).toBeVisible();
  await page.getByRole("button", { name: "Load sample" }).click();
  await page.getByRole("button", { name: "Normalize notes" }).click();
  await expect(page.getByText("8 notes normalized locally.")).toBeVisible();
  await expect(page.getByText("Exact repeat")).toBeVisible();
  await expect(page.getByText("Needs placement").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy Markdown" })).toBeVisible();
});

test("exports the normalized checklist through both local formats", async ({ context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:4175",
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Load sample" }).click();
  await page.getByRole("button", { name: "Normalize notes" }).click();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download CSV" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("launch-film-revision-2.csv");
  await expect(page.getByText("CSV checklist downloaded.")).toBeVisible();

  await page.getByRole("button", { name: "Copy Markdown" }).click();
  await expect(page.getByText("Markdown checklist copied.")).toBeVisible();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain("# Launch film — revision 2");
  expect(clipboard).toContain("- [ ] **00:00:18**");
});

test("keeps an invalid submission recoverable", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Revision notes").fill("[Email | Maya]");
  await page.getByRole("button", { name: "Normalize notes" }).click();
  await expect(page.getByText(/Add at least one revision note/)).toBeVisible();
  await expect(page.getByLabel("Revision notes")).toHaveAttribute("aria-invalid", "true");
});

test("exposes labeled controls, landmarks, and keyboard focus", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Load sample" }).click();
  await page.getByRole("button", { name: "Normalize notes" }).click();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByLabel("Project name")).toBeVisible();
  await expect(page.getByLabel("Timeline frame rate")).toBeVisible();
  await expect(page.getByLabel("Revision notes")).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy Markdown" })).toBeVisible();
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.tagName);
  expect(focused).not.toBe("BODY");
  const duplicateIds = await page.evaluate(() => {
    const ids = [...document.querySelectorAll("[id]")].map((element) => element.id);
    return ids.filter((id, index) => ids.indexOf(id) !== index);
  });
  expect(duplicateIds).toEqual([]);
});

test("theme toggle exposes its state", async ({ page }) => {
  await page.goto("/");
  const toggle = page.locator("#theme-button");
  await expect(toggle).toHaveAccessibleName(/Dark mode/);
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
