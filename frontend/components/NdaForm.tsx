"use client";

import type { NdaData, Party } from "@/lib/nda";

type Props = {
  data: NdaData;
  onChange: (next: NdaData) => void;
};

const input =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600";

function Label({ text, hint, children }: { text: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-neutral-800">{text}</span>
      {hint && <span className="ml-2 text-xs text-neutral-500">{hint}</span>}
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Legend({ children }: { children: React.ReactNode }) {
  return <legend className="mb-2 text-sm font-semibold text-neutral-900">{children}</legend>;
}

function Years({ value, onChange, disabled }: { value: number; onChange: (n: number) => void; disabled?: boolean }) {
  return (
    <input
      type="number"
      min={1}
      max={99}
      value={value}
      disabled={disabled}
      aria-label="Number of years"
      onChange={(e) => onChange(Math.max(1, Math.floor(Number(e.target.value)) || 1))}
      className={`${input.replace("w-full ", "")} w-20 disabled:opacity-40`}
    />
  );
}

function PartyFields({
  title,
  party,
  onChange,
}: {
  title: string;
  party: Party;
  onChange: (p: Party) => void;
}) {
  const set = (key: keyof Party) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...party, [key]: e.target.value });
  return (
    <fieldset className="space-y-3 rounded-lg border border-neutral-200 p-4">
      <Legend>{title}</Legend>
      <Label text="Company">
        <input className={input} value={party.company} onChange={set("company")} />
      </Label>
      <Label text="Print name">
        <input className={input} value={party.name} onChange={set("name")} />
      </Label>
      <Label text="Title">
        <input className={input} value={party.title} onChange={set("title")} />
      </Label>
      <Label text="Notice address" hint="email or postal address">
        <textarea className={input} rows={2} value={party.noticeAddress} onChange={set("noticeAddress")} />
      </Label>
      <Label text="Signing date" hint="optional">
        <input type="date" className={input} value={party.date} onChange={set("date")} />
      </Label>
    </fieldset>
  );
}

export default function NdaForm({ data, onChange }: Props) {
  const update = <K extends keyof NdaData>(key: K, value: NdaData[K]) =>
    onChange({ ...data, [key]: value });

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      <Label text="Purpose" hint="how Confidential Information may be used">
        <textarea
          className={input}
          rows={3}
          value={data.purpose}
          onChange={(e) => update("purpose", e.target.value)}
        />
      </Label>

      <Label text="Effective date">
        <input
          type="date"
          className={input}
          value={data.effectiveDate}
          onChange={(e) => update("effectiveDate", e.target.value)}
        />
      </Label>

      <fieldset>
        <Legend>MNDA term</Legend>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mndaTerm"
              checked={data.mndaTermType === "expires"}
              onChange={() => update("mndaTermType", "expires")}
            />
            Expires after
            <Years
              value={data.mndaTermYears}
              disabled={data.mndaTermType !== "expires"}
              onChange={(n) => update("mndaTermYears", n)}
            />
            year(s) from Effective Date
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mndaTerm"
              checked={data.mndaTermType === "continues"}
              onChange={() => update("mndaTermType", "continues")}
            />
            Continues until terminated
          </label>
        </div>
      </fieldset>

      <fieldset>
        <Legend>Term of confidentiality</Legend>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="confidentiality"
              checked={data.confidentialityType === "years"}
              onChange={() => update("confidentialityType", "years")}
            />
            <Years
              value={data.confidentialityYears}
              disabled={data.confidentialityType !== "years"}
              onChange={(n) => update("confidentialityYears", n)}
            />
            year(s) from Effective Date (trade secrets protected as long as they remain trade secrets)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="confidentiality"
              checked={data.confidentialityType === "perpetuity"}
              onChange={() => update("confidentialityType", "perpetuity")}
            />
            In perpetuity
          </label>
        </div>
      </fieldset>

      <Label text="Governing law" hint="state, e.g. Delaware">
        <input
          className={input}
          value={data.governingLaw}
          onChange={(e) => update("governingLaw", e.target.value)}
        />
      </Label>

      <Label text="Jurisdiction" hint="city or county and state, e.g. New Castle, DE">
        <input
          className={input}
          value={data.jurisdiction}
          onChange={(e) => update("jurisdiction", e.target.value)}
        />
      </Label>

      <Label text="MNDA modifications" hint="optional">
        <textarea
          className={input}
          rows={3}
          value={data.modifications}
          onChange={(e) => update("modifications", e.target.value)}
        />
      </Label>

      <PartyFields title="Party 1" party={data.party1} onChange={(p) => update("party1", p)} />
      <PartyFields title="Party 2" party={data.party2} onChange={(p) => update("party2", p)} />
    </form>
  );
}
