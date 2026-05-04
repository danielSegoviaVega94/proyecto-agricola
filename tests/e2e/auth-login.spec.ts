import { expect, test } from "@playwright/test";

test("shows login tabs and requests email otp in fallback flow", async ({ page }) => {
  let otpRequestCount = 0;

  await page.route("**/auth/v1/otp**", async (route) => {
    otpRequestCount += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          user: null,
          session: null,
          message_id: "mock-message-id",
        },
        error: null,
      }),
    });
  });

  await page.goto("/login");

  await expect(page.getByRole("tab", { name: "Teléfono" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Google" })).toBeVisible();

  await page.getByRole("button", { name: "Usar email de prueba" }).click();
  await page.getByLabel("Email para prueba").fill("comprador@example.com");
  await page.getByRole("button", { name: "Enviar enlace por email" }).click();

  await expect.poll(() => otpRequestCount).toBeGreaterThan(0);
  await expect(page.getByText("Revisa tu correo para continuar.")).toBeVisible();
});
