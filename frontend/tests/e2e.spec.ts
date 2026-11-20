import { expect, test } from "@playwright/test";

// End-to-end: a user completes the whole flow and produces a PDF.

test("user fills the NDA and downloads a PDF", async ({ page }) => {
  // The Download PDF button calls window.print(); record the call instead of opening a dialog.
  await page.addInitScript(() => {
    (window as unknown as { __printCalls: number }).__printCalls = 0;
    window.print = () => {
      (window as unknown as { __printCalls: number }).__printCalls++;
    };
  });

  await page.goto("/");
  await expect(page.getByLabel("Effective date", { exact: true })).not.toHaveValue("");

  await page.getByLabel("Purpose").fill("Evaluating a potential software partnership.");
  await page.getByLabel("Effective date", { exact: true }).fill("2027-01-10");
  await page.getByLabel("Governing law").fill("California");
  await page.getByLabel("Jurisdiction").fill("San Francisco, CA");
  const party1 = page.getByRole("group", { name: "Party 1" });
  const party2 = page.getByRole("group", { name: "Party 2" });
  await party1.getByLabel("Company").fill("Acme Corp");
  await party1.getByLabel("Print name").fill("Ada Lovelace");
  await party2.getByLabel("Company").fill("Globex LLC");
  await party2.getByLabel("Print name").fill("Alan Turing");

  const doc = page.getByRole("region", { name: "NDA preview" });
  await expect(doc).toContainText("Evaluating a potential software partnership.");
  await expect(doc).toContainText("January 10, 2027");
  await expect(doc).toContainText("laws of the State of California");
  await expect(doc).toContainText("Acme Corp");
  await expect(doc).toContainText("Globex LLC");

  await page.getByRole("button", { name: "Download PDF" }).click();
  expect(await page.evaluate(() => (window as unknown as { __printCalls: number }).__printCalls)).toBe(1);

  // Render the document the way the browser prints it and check the output.
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("button", { name: "Download PDF" })).toBeHidden();
  await expect(page.getByLabel("Governing law")).toBeHidden();
  await expect(doc).toBeVisible();

  const pdf = await page.pdf({ format: "Letter", printBackground: true });
  expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
  // Cover page and the standard terms start on a separate page, so there are at least 2 pages.
  const pages = pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? [];
  expect(pages.length).toBeGreaterThanOrEqual(2);
});

test("the standard terms start on their own page when printed", async ({ page }) => {
  await page.goto("/");
  await page.emulateMedia({ media: "print" });
  const breakBefore = await page.locator(".standard-terms").evaluate((el) => getComputedStyle(el).breakBefore);
  expect(breakBefore).toBe("page");
});

test("no hydration or console errors, even when an extension modifies <body>", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));

  // Simulate a browser extension adding an attribute to <body> before hydration.
  await page.addInitScript(() => {
    const mo = new MutationObserver(() => {
      if (document.body) {
        document.body.setAttribute("data-testim-main-word-scripts-loaded", "true");
        mo.disconnect();
      }
    });
    mo.observe(document, { childList: true, subtree: true });
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByLabel("Effective date", { exact: true })).not.toHaveValue("");
  expect(errors).toEqual([]);
});

test("the form is usable on a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/");
  await page.getByLabel("Governing law").fill("New York");
  await expect(page.getByRole("region", { name: "NDA preview" })).toContainText("laws of the State of New York");
});
