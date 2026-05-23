const SOURCE_URL = "https://www.chefuniverse.io/api/v1/agent_bazaar";

function n(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(n(value) * factor) / factor;
}

function compact(value, digits = 2) {
  const number = n(value);
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: digits,
    notation: Math.abs(number) >= 1000000 ? "compact" : "standard"
  }).format(number);
}

function pct(value) {
  return `${round(value, 2)}%`;
}

function signalScore(signals = []) {
  return signals.reduce((total, signal) => total + n(signal.score) * 100, 0);
}

function signalNames(signals = []) {
  return signals.map((signal) => signal.kind).filter(Boolean);
}

function priceMomentumScore(ingredient) {
  const change24h = n(ingredient.price_change_24h_pct);
  const change12h = n(ingredient.price_change_12h_pct);
  return clamp((change24h + change12h) / 2, -30, 30);
}

function liquidityScore(ingredient) {
  const impact = ingredient.liquidity_impact_10k_chef || {};
  const tokensReceived = n(impact.tokens_received);
  const partialPenalty = impact.partial_fill ? -20 : 0;
  const slippagePenalty = -Math.abs(n(impact.slippage_pct));
  return clamp(Math.log10(tokensReceived + 1) * 8 + partialPenalty + slippagePenalty, 0, 50);
}

function cargoScore(ingredient) {
  const grade = n(ingredient.grade);
  const price = Math.max(n(ingredient.current_price_chef), 0.000001);
  const progress = n(ingredient.progress);
  const liquidity = liquidityScore(ingredient);
  const valueDensity = clamp((grade / price) * 3, 0, 45);
  const supplyWindow = progress > 0 && progress < 0.82 ? 18 : progress >= 0.82 ? 6 : 8;
  return round(valueDensity + liquidity + supplyWindow, 2);
}

function watchScore(ingredient) {
  const signals = signalScore(ingredient.signals || []);
  const momentum = priceMomentumScore(ingredient);
  const volume = clamp(Math.log10(n(ingredient.volume_24h_chef) + 1) * 7, 0, 55);
  const progress = clamp(n(ingredient.progress) * 22, 0, 22);
  const concentrationPenalty = n(ingredient.top_buyer_concentration_24h_pct) > 85 ? -8 : 0;
  return round(signals + momentum + volume + progress + concentrationPenalty, 2);
}

function riskNotes(ingredient) {
  const notes = [];
  if (n(ingredient.top_buyer_concentration_24h_pct) >= 90) {
    notes.push("buyer concentration is high");
  }
  if (n(ingredient.price_change_24h_pct) <= -8) {
    notes.push("24h price move is negative");
  }
  if (ingredient.liquidity_impact_10k_chef?.partial_fill) {
    notes.push("10k CHEF route may partially fill");
  }
  if (!n(ingredient.volume_24h_chef)) {
    notes.push("24h volume is thin");
  }
  return notes;
}

function summarizeIngredient(ingredient) {
  const signals = ingredient.signals || [];
  return {
    ticker: ingredient.ticker,
    address: ingredient.address,
    emoji: ingredient.emoji || "",
    grade: n(ingredient.grade),
    priceChef: n(ingredient.current_price_chef),
    supplyProgress: n(ingredient.progress),
    volume24hChef: n(ingredient.volume_24h_chef),
    change24hPct: n(ingredient.price_change_24h_pct),
    change12hPct: n(ingredient.price_change_12h_pct),
    watchScore: watchScore(ingredient),
    cargoScore: cargoScore(ingredient),
    signals: signalNames(signals),
    notes: [
      ...signals.map((signal) => signal.note).filter(Boolean),
      ...riskNotes(ingredient)
    ]
  };
}

function marketPosture(ingredients) {
  const withVolume = ingredients.filter((item) => n(item.volume_24h_chef) > 0);
  const averageChange = withVolume.length
    ? withVolume.reduce((total, item) => total + n(item.price_change_24h_pct), 0) / withVolume.length
    : 0;
  const activeCount = withVolume.length;
  const signaledCount = ingredients.filter((item) => (item.signals || []).length > 0).length;

  if (activeCount === 0) {
    return "quiet";
  }
  if (averageChange < -5) {
    return "defensive";
  }
  if (signaledCount >= 3 || averageChange > 5) {
    return "active";
  }
  return "selective";
}

function buildMarkdown(analysis) {
  const lines = [];
  lines.push("# Galleywatch Bazaar Signal Report");
  lines.push("");
  lines.push(`Generated: ${analysis.generatedAt}`);
  lines.push(`Source: ${SOURCE_URL}`);
  lines.push(`Block: ${analysis.blockNumber || "unknown"}`);
  lines.push(`Posture: ${analysis.posture}`);
  lines.push("");
  lines.push("## Watchlist");
  for (const item of analysis.watchlist.slice(0, 5)) {
    const signals = item.signals.length ? item.signals.join(", ") : "no named signal";
    lines.push(
      `- ${item.ticker}: watch ${item.watchScore}, ${signals}, ${pct(item.change24hPct)} 24h, ${compact(item.volume24hChef)} CHEF volume.`
    );
  }
  lines.push("");
  lines.push("## Cargo Candidates");
  for (const item of analysis.cargoCandidates.slice(0, 5)) {
    lines.push(
      `- ${item.ticker}: cargo ${item.cargoScore}, grade ${item.grade}, price ${round(item.priceChef, 4)} CHEF, supply ${pct(item.supplyProgress * 100)}.`
    );
  }
  lines.push("");
  lines.push("## Risk Notes");
  if (analysis.riskRadar.length === 0) {
    lines.push("- No major concentration, negative-move, or partial-fill flags detected by this agent.");
  } else {
    for (const item of analysis.riskRadar.slice(0, 6)) {
      lines.push(`- ${item.ticker}: ${item.notes.join("; ")}.`);
    }
  }
  lines.push("");
  lines.push("This report is an agent-generated market readout, not financial advice or a guaranteed-profit claim.");
  return lines.join("\n");
}

export function analyzeBazaar(snapshot) {
  const ingredients = Array.isArray(snapshot?.ingredients) ? snapshot.ingredients : [];
  const summarized = ingredients.map(summarizeIngredient);
  const watchlist = [...summarized].sort((a, b) => b.watchScore - a.watchScore);
  const cargoCandidates = [...summarized].sort((a, b) => b.cargoScore - a.cargoScore);
  const riskRadar = summarized.filter((item) => item.notes.some((note) => /concentration|negative|partial|thin/.test(note)));
  const topSignals = Array.isArray(snapshot?.top_signals) ? snapshot.top_signals : [];

  const analysis = {
    generatedAt: new Date().toISOString(),
    sourceGeneratedAt: snapshot?.generated_at || null,
    blockNumber: snapshot?.block_number || null,
    sourceUrl: SOURCE_URL,
    globalAsset: snapshot?.global_asset || null,
    ingredientCount: ingredients.length,
    posture: marketPosture(ingredients),
    topSignals,
    watchlist: watchlist.slice(0, 10),
    cargoCandidates: cargoCandidates.slice(0, 10),
    riskRadar: riskRadar.slice(0, 10),
    disclaimer: "Signal report only. No guaranteed-profit claims."
  };
  analysis.markdown = buildMarkdown(analysis);
  return analysis;
}

export async function fetchBazaarSnapshot(fetchImpl = fetch) {
  const response = await fetchImpl(SOURCE_URL, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "Galleywatch-Bazaar-Signal-Agent/0.1"
    }
  });
  if (!response.ok) {
    throw new Error(`Chef Universe Bazaar API returned ${response.status}`);
  }
  return response.json();
}

export const formatters = { compact, pct, round };
