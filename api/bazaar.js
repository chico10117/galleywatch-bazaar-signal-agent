import { analyzeBazaar, fetchBazaarSnapshot } from "../lib/analyze.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const snapshot = await fetchBazaarSnapshot();
    const analysis = analyzeBazaar(snapshot);
    res.status(200).json({
      ok: true,
      fetchedAt: new Date().toISOString(),
      source: analysis.sourceUrl,
      snapshot,
      analysis
    });
  } catch (error) {
    res.status(502).json({
      ok: false,
      error: "Failed to fetch Chef Universe Bazaar data",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
}
