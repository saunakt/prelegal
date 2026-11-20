export type Party = {
  name: string;
  title: string;
  company: string;
  noticeAddress: string;
  date: string;
};

export type NdaData = {
  purpose: string;
  effectiveDate: string;
  mndaTermType: "expires" | "continues";
  mndaTermYears: number;
  confidentialityType: "years" | "perpetuity";
  confidentialityYears: number;
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
  party1: Party;
  party2: Party;
};

const emptyParty: Party = {
  name: "",
  title: "",
  company: "",
  noticeAddress: "",
  date: "",
};

// Defaults mirror the checked options / placeholder text in the Common Paper cover page.
export const defaultNda: NdaData = {
  purpose:
    "Evaluating whether to enter into a business relationship with the other party.",
  effectiveDate: "",
  mndaTermType: "expires",
  mndaTermYears: 1,
  confidentialityType: "years",
  confidentialityYears: 1,
  governingLaw: "",
  jurisdiction: "",
  modifications: "",
  party1: { ...emptyParty },
  party2: { ...emptyParty },
};

export function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function years(n: number): string {
  return `${n} year${n === 1 ? "" : "s"}`;
}

const BLANK = "[__________]";

/**
 * Prepares the Standard Terms for display: fills in the Governing Law and
 * Jurisdiction (the only values the terms state directly) and turns the other
 * cover-page references into plain defined terms, as in the published agreement.
 */
export function renderStandardTerms(terms: string, data: NdaData): string {
  const span = (label: string) =>
    new RegExp(`<span class="coverpage_link">${label}</span>`, "g");
  return terms
    .replace(span("Governing Law"), `**${data.governingLaw.trim() || BLANK}**`)
    .replace(span("Jurisdiction"), `**${data.jurisdiction.trim() || BLANK}**`)
    .replace(/<span class="coverpage_link">([^<]+)<\/span>/g, "$1");
}
