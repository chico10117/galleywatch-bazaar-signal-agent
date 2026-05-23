import { analyzeBazaar, fetchBazaarSnapshot } from "../lib/analyze.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).send("Method not allowed");
    return;
  }

  try {
    const snapshot = await fetchBazaarSnapshot();
    const analysis = analyzeBazaar(snapshot);
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.status(200).send(analysis.markdown);
  } catch (error) {
    res.status(502).send(`Failed to fetch Chef Universe Bazaar data: ${error.message}`);
  }
}
