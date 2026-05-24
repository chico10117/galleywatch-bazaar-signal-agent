import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeBazaar, fetchBazaarSnapshotRaw } from "../lib/analyze.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const shouldWrite = process.argv.includes("--write");
const fromIndex = process.argv.indexOf("--from");
const fromFile = fromIndex >= 0 ? process.argv[fromIndex + 1] : null;

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function prettyJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function loadSnapshot() {
  if (fromFile) {
    const rawText = await readFile(resolve(root, fromFile), "utf8");
    const snapshot = JSON.parse(rawText);
    const fetchedAt = new Date().toISOString();
    return {
      analysisGeneratedAt: snapshot?.generated_at || fetchedAt,
      fetchedAt,
      rawText,
      snapshot,
      sourceMode: "pinned-file",
      sourceFile: fromFile
    };
  }

  const { rawText, snapshot } = await fetchBazaarSnapshotRaw();
  const fetchedAt = new Date().toISOString();
  return {
    analysisGeneratedAt: snapshot?.generated_at || fetchedAt,
    fetchedAt,
    rawText,
    snapshot,
    sourceMode: "live-api",
    sourceFile: null
  };
}

async function writeOutputs(analysis, rawText, context) {
  const reportsDir = join(root, "reports");
  const replayDir = join(root, "replay", "latest");
  await mkdir(reportsDir, { recursive: true });
  await mkdir(replayDir, { recursive: true });

  const analysisJson = prettyJson(analysis);
  const reportMarkdown = `${analysis.markdown}\n`;
  const rawSnapshot = rawText.endsWith("\n") ? rawText : `${rawText}\n`;
  const rawSnapshotHash = sha256(rawSnapshot);
  const analysisHash = sha256(analysisJson);
  const reportHash = sha256(reportMarkdown);

  const manifest = {
    schema: "galleywatch.replay.v1",
    generatedAt: analysis.generatedAt,
    fetchedAt: context.fetchedAt,
    sourceMode: context.sourceMode,
    sourceFile: context.sourceFile,
    sourceUrl: analysis.sourceUrl,
    sourceGeneratedAt: analysis.sourceGeneratedAt,
    blockNumber: analysis.blockNumber,
    nodeVersion: process.version,
    commands: {
      live: "npm install && npm run report:write",
      pinnedReplay: "npm install && npm run report:replay"
    },
    files: {
      rawSnapshot: "replay/latest/raw-snapshot.json",
      analysis: "replay/latest/analysis.json",
      report: "replay/latest/report.md"
    },
    sha256: {
      rawSnapshot: rawSnapshotHash,
      analysisJson: analysisHash,
      reportMarkdown: reportHash
    },
    scoringPolicy: analysis.scoringPolicy,
    provenance: analysis.provenance,
    dataQuality: analysis.dataQuality
  };

  await writeFile(join(reportsDir, "latest.md"), reportMarkdown);
  await writeFile(join(reportsDir, "latest.json"), analysisJson);
  await writeFile(join(replayDir, "raw-snapshot.json"), rawSnapshot);
  await writeFile(join(replayDir, "analysis.json"), analysisJson);
  await writeFile(join(replayDir, "report.md"), reportMarkdown);
  await writeFile(join(replayDir, "manifest.json"), prettyJson(manifest));
}

const context = await loadSnapshot();
const rawSnapshot = context.rawText.endsWith("\n") ? context.rawText : `${context.rawText}\n`;
const analysis = analyzeBazaar(context.snapshot, {
  generatedAt: context.analysisGeneratedAt,
  replay: {
    fetchedAt: context.fetchedAt,
    rawSnapshotSha256: sha256(rawSnapshot),
    rawSnapshotFile: "replay/latest/raw-snapshot.json",
    manifestFile: "replay/latest/manifest.json",
    sourceMode: context.sourceMode
  }
});

if (shouldWrite) {
  await writeOutputs(analysis, context.rawText, context);
}

console.log(analysis.markdown);
