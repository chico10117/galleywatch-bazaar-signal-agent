import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeBazaar, fetchBazaarSnapshot } from "../lib/analyze.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const shouldWrite = process.argv.includes("--write");

const snapshot = await fetchBazaarSnapshot();
const analysis = analyzeBazaar(snapshot);

if (shouldWrite) {
  const reportsDir = join(root, "reports");
  await mkdir(reportsDir, { recursive: true });
  await writeFile(join(reportsDir, "latest.md"), analysis.markdown);
  await writeFile(join(reportsDir, "latest.json"), JSON.stringify(analysis, null, 2));
}

console.log(analysis.markdown);
