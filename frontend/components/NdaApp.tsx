"use client";

import { useEffect, useState } from "react";
import NdaForm from "./NdaForm";
import NdaPreview from "./NdaPreview";
import { defaultNda, todayISO, type NdaData } from "@/lib/nda";

export default function NdaApp({ standardTerms }: { standardTerms: string }) {
  const [data, setData] = useState<NdaData>(defaultNda);

  // Default the effective date to today, on the client so it matches the user's calendar.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData((d) => (d.effectiveDate ? d : { ...d, effectiveDate: todayISO() }));
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <header className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Mutual NDA Creator</h1>
          <p className="text-sm text-neutral-600">
            Fill in the details and the agreement updates as you type.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Download PDF
        </button>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section className="no-print" aria-label="NDA details">
          <NdaForm data={data} onChange={setData} />
        </section>
        <section aria-label="NDA preview" className="rounded-lg border border-neutral-200 bg-white p-8 text-neutral-900 shadow-sm print-sheet">
          <NdaPreview data={data} standardTerms={standardTerms} />
        </section>
      </div>
      <p className="no-print mt-4 text-center text-xs text-neutral-500">
        In the print dialog choose “Save as PDF” as the destination. This is a prototype and not
        legal advice.
      </p>
    </div>
  );
}
