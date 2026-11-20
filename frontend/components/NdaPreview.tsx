import ReactMarkdown from "react-markdown";
import {
  formatDate,
  renderStandardTerms,
  years,
  type NdaData,
  type Party,
} from "@/lib/nda";

const BLANK = "[__________]";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="text-base font-bold">{label}</h3>
      {hint && <p className="text-xs italic text-neutral-500">{hint}</p>}
      <div className="mt-1">{children}</div>
    </section>
  );
}

function Option({ checked, children }: { checked: boolean; children: React.ReactNode }) {
  return (
    <p className="flex gap-2">
      <span aria-hidden>{checked ? "☑" : "☐"}</span>
      <span>{children}</span>
    </p>
  );
}

function PartyCell({ value }: { value: string }) {
  return <td className="border border-neutral-400 px-2 py-2 align-top whitespace-pre-wrap">{value}</td>;
}

export default function NdaPreview({
  data,
  standardTerms,
}: {
  data: NdaData;
  standardTerms: string;
}) {
  const rows: [string, (p: Party) => string, string?][] = [
    ["Signature", () => ""],
    ["Print Name", (p) => p.name],
    ["Title", (p) => p.title],
    ["Company", (p) => p.company],
    ["Notice Address", (p) => p.noticeAddress, "Use either email or postal address"],
    ["Date", (p) => formatDate(p.date)],
  ];

  return (
    <article className="nda-document font-serif text-[15px] leading-relaxed">
      <h1 className="text-2xl font-bold">Mutual Non-Disclosure Agreement</h1>

      <h2 className="mt-4 text-lg font-bold">USING THIS MUTUAL NON-DISCLOSURE AGREEMENT</h2>
      <p className="mt-2">
        This Mutual Non-Disclosure Agreement (the “MNDA”) consists of: (1) this Cover Page (“
        <strong>Cover Page</strong>”) and (2) the Common Paper Mutual NDA Standard Terms Version
        1.0 (“<strong>Standard Terms</strong>”) identical to those posted at{" "}
        <a className="underline" href="https://commonpaper.com/standards/mutual-nda/1.0">
          commonpaper.com/standards/mutual-nda/1.0
        </a>
        . Any modifications of the Standard Terms should be made on the Cover Page, which will
        control over conflicts with the Standard Terms.
      </p>

      <Field label="Purpose" hint="How Confidential Information may be used">
        <p>{data.purpose.trim() || BLANK}</p>
      </Field>

      <Field label="Effective Date">
        <p>{formatDate(data.effectiveDate) || BLANK}</p>
      </Field>

      <Field label="MNDA Term" hint="The length of this MNDA">
        <Option checked={data.mndaTermType === "expires"}>
          Expires {years(data.mndaTermYears)} from Effective Date.
        </Option>
        <Option checked={data.mndaTermType === "continues"}>
          Continues until terminated in accordance with the terms of the MNDA.
        </Option>
      </Field>

      <Field label="Term of Confidentiality" hint="How long Confidential Information is protected">
        <Option checked={data.confidentialityType === "years"}>
          {years(data.confidentialityYears)} from Effective Date, but in the case of trade secrets
          until Confidential Information is no longer considered a trade secret under applicable
          laws.
        </Option>
        <Option checked={data.confidentialityType === "perpetuity"}>In perpetuity.</Option>
      </Field>

      <Field label="Governing Law & Jurisdiction">
        <p>Governing Law: {data.governingLaw.trim() || BLANK}</p>
        <p>Jurisdiction: {data.jurisdiction.trim() || BLANK}</p>
      </Field>

      <Field label="MNDA Modifications">
        <p className="whitespace-pre-wrap">{data.modifications.trim() || "None."}</p>
      </Field>

      <p className="mt-5">
        By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective
        Date.
      </p>

      <table className="mt-3 w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-1/5 border border-neutral-400 px-2 py-2" />
            <th className="border border-neutral-400 px-2 py-2">PARTY 1</th>
            <th className="border border-neutral-400 px-2 py-2">PARTY 2</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, get, hint]) => (
            <tr key={label} className={label === "Signature" ? "h-14" : undefined}>
              <th className="border border-neutral-400 px-2 py-2 text-left align-top font-semibold">
                {label}
                {hint && <span className="block text-xs font-normal italic text-neutral-500">{hint}</span>}
              </th>
              <PartyCell value={get(data.party1)} />
              <PartyCell value={get(data.party2)} />
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-3 text-xs text-neutral-600">
        Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under{" "}
        <a className="underline" href="https://creativecommons.org/licenses/by/4.0/">
          CC BY 4.0
        </a>
        .
      </p>

      <div className="standard-terms">
        <h1 className="text-2xl font-bold">Standard Terms</h1>
        <div className="terms-body mt-3">
          <ReactMarkdown
            components={{
              a: ({ href, children }) => (
                <a className="underline" href={href}>
                  {children}
                </a>
              ),
            }}
          >
            {renderStandardTerms(standardTerms.replace(/^# Standard Terms\s*/, ""), data)}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
