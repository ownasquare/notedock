import { expect, test } from "@playwright/test";

test("captures the completed light and dark workflow", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Load sample" }).click();
  await page.getByRole("button", { name: "Normalize notes" }).click();
  await expect(page.getByText("8 notes normalized locally.")).toBeVisible();
  await page.screenshot({
    path: `proof/screenshots/${testInfo.project.name}-light.png`,
    fullPage: true,
  });

  await page.locator("#theme-button").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.screenshot({
    path: `proof/screenshots/${testInfo.project.name}-dark.png`,
    fullPage: true,
  });
});
