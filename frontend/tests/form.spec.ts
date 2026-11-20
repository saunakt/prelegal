import { expect, test, type Locator, type Page } from "@playwright/test";

// Functional tests: form behaviour and the live preview.

function preview(page: Page): Locator {
  return page.getByRole("region", { name: "NDA preview" });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  // Wait for hydration: the effect that defaults the effective date has run.
  await expect(page.getByLabel("Effective date", { exact: true })).not.toHaveValue("");
});

test("shows the form and a preview with the template defaults", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Mutual NDA Creator" })).toBeVisible();
  await expect(page.getByLabel("Purpose")).toHaveValue(/Evaluating whether to enter into a business relationship/);
  await expect(preview(page).getByRole("heading", { name: "Mutual Non-Disclosure Agreement", exact: true })).toBeVisible();
  await expect(preview(page).getByText("Expires 1 year from Effective Date.")).toBeVisible();
  await expect(preview(page).getByText("1 year from Effective Date, but in the case of trade secrets")).toBeVisible();
  await expect(preview(page).getByRole("heading", { name: "Standard Terms" })).toBeVisible();
});

test("defaults the effective date to today", async ({ page }) => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  await expect(page.getByLabel("Effective date", { exact: true })).toHaveValue(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
});

test("updates the preview live as the purpose and effective date change", async ({ page }) => {
  await page.getByLabel("Purpose").fill("Exploring a joint product launch.");
  await expect(preview(page).getByText("Exploring a joint product launch.")).toBeVisible();

  await page.getByLabel("Effective date", { exact: true }).fill("2027-03-15");
  await expect(preview(page).getByText("March 15, 2027")).toBeVisible();
});

test("fills governing law and jurisdiction into the standard terms", async ({ page }) => {
  const terms = preview(page).locator(".standard-terms");
  // Blank values show a placeholder rather than an empty gap.
  await expect(terms.getByText("[__________]").first()).toBeVisible();

  await page.getByLabel("Governing law").fill("Delaware");
  await page.getByLabel("Jurisdiction").fill("courts located in New Castle, DE");

  await expect(terms).toContainText("laws of the State of Delaware");
  await expect(terms).toContainText("federal or state courts located in courts located in New Castle, DE");
  await expect(preview(page)).toContainText("Governing Law: Delaware");
  await expect(preview(page)).toContainText("Jurisdiction: courts located in New Castle, DE");
  // No raw template markup leaks through.
  await expect(terms).not.toContainText("coverpage_link");
  await expect(terms).not.toContainText("<span");
});

test("MNDA term radios and year input drive the preview", async ({ page }) => {
  const years = page.getByRole("spinbutton", { name: "Number of years" }).first();
  await years.fill("3");
  await expect(preview(page).getByText("Expires 3 years from Effective Date.")).toBeVisible();

  await page.getByLabel("Continues until terminated").check();
  await expect(years).toBeDisabled();
  await expect(preview(page).getByText("Continues until terminated in accordance with the terms of the MNDA.")).toBeVisible();
  // The selected option shows a checked box, the other an empty one.
  await expect(preview(page).getByText("☑")).toHaveCount(2); // one per option group
});

test("term of confidentiality can be set to perpetuity", async ({ page }) => {
  await page.getByLabel("In perpetuity").check();
  const confYears = page.getByRole("spinbutton", { name: "Number of years" }).nth(1);
  await expect(confYears).toBeDisabled();
  await expect(preview(page).getByText("In perpetuity.")).toBeVisible();
  await expect(preview(page).getByText(/from Effective Date, but in the case of trade secrets/)).toBeVisible();
});

test("year inputs clamp invalid values to at least 1", async ({ page }) => {
  const years = page.getByRole("spinbutton", { name: "Number of years" }).first();
  await years.fill("0");
  await expect(preview(page).getByText("Expires 1 year from Effective Date.")).toBeVisible();
  await years.fill("2");
  await expect(preview(page).getByText("Expires 2 years from Effective Date.")).toBeVisible();
});

test("modifications default to None and show custom text when entered", async ({ page }) => {
  await expect(preview(page).getByText("None.", { exact: true })).toBeVisible();
  await page.getByLabel("MNDA modifications").fill("Section 5 is amended to a 30 day notice period.");
  await expect(preview(page).getByText("Section 5 is amended to a 30 day notice period.")).toBeVisible();
  await expect(preview(page).getByText("None.", { exact: true })).toHaveCount(0);
});

test("party details appear in the signature table", async ({ page }) => {
  const party1 = page.getByRole("group", { name: "Party 1" });
  const party2 = page.getByRole("group", { name: "Party 2" });

  await party1.getByLabel("Company").fill("Acme Corp");
  await party1.getByLabel("Print name").fill("Ada Lovelace");
  await party1.getByLabel("Title").fill("CEO");
  await party1.getByLabel("Notice address").fill("ada@acme.example");
  await party2.getByLabel("Company").fill("Globex LLC");
  await party2.getByLabel("Print name").fill("Alan Turing");
  await party2.getByLabel("Signing date").fill("2027-04-01");

  const table = preview(page).getByRole("table");
  const row = (label: string) => table.locator("tr", { has: page.locator("th", { hasText: new RegExp(`^${label}`) }) });
  await expect(row("Company")).toContainText("Acme Corp");
  await expect(row("Company")).toContainText("Globex LLC");
  await expect(row("Print Name")).toContainText("Ada Lovelace");
  await expect(row("Print Name")).toContainText("Alan Turing");
  await expect(row("Title")).toContainText("CEO");
  await expect(row("Notice Address")).toContainText("ada@acme.example");
  await expect(row("Date")).toContainText("April 1, 2027");
});

test("renders the full set of standard terms from the template", async ({ page }) => {
  const terms = preview(page).locator(".standard-terms");
  for (const heading of [
    "Introduction", "Use and Protection of Confidential Information", "Exceptions",
    "Disclosures Required by Law", "Term and Termination", "Return or Destruction of Confidential Information",
    "Proprietary Rights", "Disclaimer", "Governing Law and Jurisdiction", "Equitable Relief", "General",
  ]) {
    await expect(terms.locator("strong", { hasText: new RegExp(`^${heading}$`) }).first()).toBeVisible();
  }
  await expect(terms.locator("li")).toHaveCount(11);
});
