import { expect, test } from "@playwright/test";

test("navigates from landing to catalog and product detail", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Buscar" }).click();
  await expect(page).toHaveURL(/\/productos/);
  await expect(page.getByRole("heading", { name: "Productos" })).toBeVisible();

  await page.getByRole("link", { name: /Tomate/ }).first().click();
  await expect(page).toHaveURL(/\/producto\//);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Tomate");
  await expect(page.getByRole("link", { name: "Contactar" })).toBeVisible();
});
