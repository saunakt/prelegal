import { readFile } from "node:fs/promises";
import { join } from "node:path";
import NdaApp from "@/components/NdaApp";

// content/ is populated from /templates by scripts/copy-templates.mjs (predev/prebuild).
async function getStandardTerms() {
  "use cache";
  return readFile(join(process.cwd(), "content", "Mutual-NDA.md"), "utf8");
}

export default async function Home() {
  return <NdaApp standardTerms={await getStandardTerms()} />;
}
