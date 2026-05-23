const fmt = new Intl.NumberFormat("en", { maximumFractionDigits: 2, notation: "compact" });

function pct(value) {
  return `${Math.round(Number(value || 0) * 100) / 100}%`;
}

function scoreText(value) {
  return Math.round(Number(value || 0)).toString();
}

function row(item) {
  const div = document.createElement("div");
  div.className = "row";
  const signal = item.signals.length ? item.signals.join(", ") : "watch only";
  div.innerHTML = `
    <div class="ticker">${item.emoji || ""} ${item.ticker}</div>
    <div class="meta">${signal}<br>${pct(item.change24hPct)} 24h · ${fmt.format(item.volume24hChef)} CHEF volume · supply ${pct(item.supplyProgress * 100)}</div>
    <div class="score">${scoreText(item.watchScore)}</div>
  `;
  return div;
}

function pill(label, value) {
  const div = document.createElement("div");
  div.className = "pill";
  div.innerHTML = `<strong>${label}</strong><span>${value}</span>`;
  return div;
}

function drawCargoChart(canvas, candidates) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fff8ea";
  ctx.fillRect(0, 0, width, height);

  const max = Math.max(...candidates.map((item) => item.cargoScore), 1);
  const barGap = 12;
  const barHeight = 26;
  const x = 150;

  ctx.font = "700 16px Georgia";
  ctx.fillStyle = "#182820";
  ctx.fillText("Cargo score", 18, 30);

  candidates.slice(0, 7).forEach((item, index) => {
    const y = 58 + index * (barHeight + barGap);
    const w = Math.max(8, ((width - x - 34) * item.cargoScore) / max);
    ctx.fillStyle = "#17211b";
    ctx.fillText(item.ticker, 18, y + 18);
    ctx.fillStyle = index === 0 ? "#c7462f" : "#12684f";
    ctx.fillRect(x, y, w, barHeight);
    ctx.fillStyle = "#182820";
    ctx.fillText(Math.round(item.cargoScore), x + w + 8, y + 18);
  });
}

async function load() {
  const response = await fetch("/api/bazaar");
  if (!response.ok) throw new Error(`API returned ${response.status}`);
  const payload = await response.json();
  const analysis = payload.analysis;

  document.getElementById("posture").textContent = analysis.posture;
  document.getElementById("ingredient-count").textContent = analysis.ingredientCount;
  document.getElementById("block-number").textContent = analysis.blockNumber || "--";
  document.getElementById("snapshot-time").textContent = analysis.sourceGeneratedAt
    ? new Date(analysis.sourceGeneratedAt).toLocaleString()
    : "--";

  const watchlist = document.getElementById("watchlist");
  watchlist.replaceChildren(...analysis.watchlist.slice(0, 7).map(row));

  const cargo = document.getElementById("cargo-list");
  cargo.replaceChildren(
    ...analysis.cargoCandidates.slice(0, 5).map((item) =>
      pill(item.ticker, `grade ${item.grade} · ${Math.round(item.cargoScore)} cargo · ${Number(item.priceChef).toFixed(4)} CHEF`)
    )
  );
  drawCargoChart(document.getElementById("cargo-chart"), analysis.cargoCandidates);

  const risk = document.getElementById("risk-list");
  if (analysis.riskRadar.length) {
    risk.replaceChildren(
      ...analysis.riskRadar.slice(0, 7).map((item) => pill(item.ticker, item.notes.join("; ")))
    );
  } else {
    risk.replaceChildren(pill("Clear", "No major flags detected by this agent"));
  }

  document.getElementById("report").textContent = analysis.markdown;
}

load().catch((error) => {
  document.getElementById("posture").textContent = "API error";
  document.getElementById("report").textContent = `Failed to load live Bazaar data.\n\n${error.message}`;
});
