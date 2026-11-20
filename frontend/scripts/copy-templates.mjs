// Copies the Mutual NDA templates from the repo-level /templates directory into
// frontend/content so the app has a single source of truth for the legal text.
// Runs automatically before `dev` and `build` (see package.json).
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "..", "templates");
const target = join(root, "content");

mkdirSync(target, { recursive: true });
for (const file of ["Mutual-NDA.md", "Mutual-NDA-coverpage.md"]) {
  copyFileSync(join(source, file), join(target, file));
  console.log(`copied ${file} -> content/${file}`);
}
