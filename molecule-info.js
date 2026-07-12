(() => {
  const state = {
    currentCID: null,
    token: 0,
    propertyCache: new Map(),
    viewCache: new Map(),
    smilesCache: new Map()
  };

  function $(id) { return document.getElementById(id); }

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function withTimeout(url, ms = 12000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
  }

  function cleanText(text) {
    return String(text || "")
      .replace(/\s+/g, " ")
      .replace(/\[[^\]]{1,40}\]/g, "")
      .trim();
  }

  function truncate(text, max = 170) {
    const cleaned = cleanText(text);
    if (!cleaned) return "";
    if (cleaned.length <= max) return cleaned;
    return `${cleaned.slice(0, max - 1).trim()}…`;
  }

  function fmt(value, suffix = "") {
    if (value === undefined || value === null || value === "") return "—";
    return `${value}${suffix}`;
  }

  function fmtNumber(value, digits = 2, suffix = "") {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return `${n.toFixed(digits).replace(/\.?0+$/, "")}${suffix}`;
  }

  function item(label, value, wide = false) {
    const safeValue = value || "—";
    return `<div class="info-item${wide ? " wide" : ""}"><span>${esc(label)}</span><strong>${esc(safeValue)}</strong></div>`;
  }

  function extractCID() {
    const meta = $("moleculeMeta")?.textContent || "";
    const match = meta.match(/CID\s+(\d+)/i);
    return match ? Number(match[1]) : null;
  }

  function transformCard() {
    const card = document.querySelector(".info-card");
    if (!card || $("infoToggle")) return;

    card.id = "infoCard";
    card.classList.add("collapsed");

    const icon = card.querySelector(".info-icon");
    const text = card.querySelector(".info-text");

    const toggle = document.createElement("button");
    toggle.id = "infoToggle";
    toggle.className = "info-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");

    if (icon) toggle.appendChild(icon);
    if (text) toggle.appendChild(text);

    const chevron = document.createElement("div");
    chevron.className = "info-chevron";
    chevron.setAttribute("aria-hidden", "true");
    chevron.textContent = "⌃";
    toggle.appendChild(chevron);

    const body = document.createElement("div");
    body.id = "moleculeInfoBody";
    body.className = "info-body";
    body.innerHTML = `
      <div class="info-section-title">Informações químicas</div>
      <div id="moleculeInfoGrid" class="info-grid">
        ${item("Carregando", "—", true)}
      </div>
      <small id="infoSource" class="info-source">Fonte: PubChem</small>
    `;

    card.replaceChildren(toggle, body);
    toggle.addEventListener("click", () => setExpanded(!card.classList.contains("expanded")));

    let startY = null;
    card.addEventListener("pointerdown", event => { startY = event.clientY; });
    card.addEventListener("pointerup", event => {
      if (startY === null) return;
      const delta = event.clientY - startY;
      if (delta < -24) setExpanded(true);
      if (delta > 24) setExpanded(false);
      startY = null;
    });
  }

  function setExpanded(expanded) {
    const card = $("infoCard");
    const toggle = $("infoToggle");
    if (!card || !toggle) return;
    card.classList.toggle("expanded", expanded);
    card.classList.toggle("collapsed", !expanded);
    toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
  }

  function renderInitial() {
    const grid = $("moleculeInfoGrid");
    const source = $("infoSource");
    if (!grid) return;

    const name = $("moleculeName")?.textContent || "—";
    const formula = $("moleculeFormula")?.textContent || "—";
    const meta = $("moleculeMeta")?.textContent || "";
    const cid = extractCID();
    const atoms = meta.match(/(\d+)\s+átomos/i)?.[1] || "—";
    const bonds = meta.match(/(\d+)\s+ligações/i)?.[1] || "—";

    grid.innerHTML = [
      item("Nome", name, true),
      item("Fórmula", formula),
      item("CID PubChem", cid ? String(cid) : "—"),
      item("Átomos", atoms),
      item("Ligações", bonds),
      item("Modelo", "ball-and-stick", true)
    ].join("");

    if (source) source.textContent = "Fonte: PubChem. Toque ou arraste o cartão para cima para ver mais.";
  }

  async function fetchProperties(cid) {
    if (state.propertyCache.has(cid)) return state.propertyCache.get(cid);
    const props = [
      "MolecularFormula",
      "MolecularWeight",
      "IUPACName",
      "XLogP",
      "ExactMass",
      "TPSA",
      "Complexity",
      "HBondDonorCount",
      "HBondAcceptorCount",
      "RotatableBondCount",
      "Charge",
      "CanonicalSMILES",
      "IsomericSMILES"
    ].join(",");
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/${props}/JSON`;
    const response = await withTimeout(url, 12000);
    if (!response.ok) throw new Error(`PubChem properties HTTP ${response.status}`);
    const data = await response.json();
    const value = data?.PropertyTable?.Properties?.[0] || {};
    state.propertyCache.set(cid, value);
    return value;
  }

  async function fetchSMILES(cid, props = {}) {
    const cached = state.smilesCache.get(cid);
    if (cached) return cached;

    const fromProps = normalizeSMILES(props.IsomericSMILES || props.CanonicalSMILES);
    if (fromProps) {
      state.smilesCache.set(cid, fromProps);
      return fromProps;
    }

    const urls = [
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/IsomericSMILES,CanonicalSMILES/JSON`,
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/CanonicalSMILES/JSON`
    ];

    for (const url of urls) {
      try {
        const response = await withTimeout(url, 10000);
        if (!response.ok) continue;
        const data = await response.json();
        const row = data?.PropertyTable?.Properties?.[0] || {};
        const smiles = normalizeSMILES(row.IsomericSMILES || row.CanonicalSMILES);
        if (smiles) {
          state.smilesCache.set(cid, smiles);
          return smiles;
        }
      } catch (error) {
        console.warn("SMILES indisponível nesta tentativa", error);
      }
    }

    return "";
  }

  function normalizeSMILES(value) {
    const text = String(value || "").trim();
    if (!text || text === "—") return "";
    return text.replace(/\s+/g, "");
  }

  async function fetchPugView(cid) {
    if (state.viewCache.has(cid)) return state.viewCache.get(cid);
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON`;
    const response = await withTimeout(url, 14000);
    if (!response.ok) throw new Error(`PubChem PUG-View HTTP ${response.status}`);
    const data = await response.json();
    state.viewCache.set(cid, data);
    return data;
  }

  function collectStrings(section, out = []) {
    for (const info of section?.Information || []) {
      const value = info?.Value;
      if (Array.isArray(value?.StringWithMarkup)) {
        for (const s of value.StringWithMarkup) if (s?.String) out.push(s.String);
      }
      if (Array.isArray(value?.Number)) out.push(value.Number.join(", "));
    }
    for (const child of section?.Section || []) collectStrings(child, out);
    return out;
  }

  function findSections(section, headings, out = []) {
    const title = String(section?.TOCHeading || "").toLowerCase();
    if (headings.some(h => title === h || title.includes(h))) out.push(section);
    for (const child of section?.Section || []) findSections(child, headings, out);
    return out;
  }

  function firstSectionText(data, headings, maxLength = 170) {
    const root = data?.Record;
    if (!root) return "";
    const targets = headings.map(h => h.toLowerCase());
    const sections = findSections(root, targets);
    for (const section of sections) {
      const strings = collectStrings(section)
        .map(cleanText)
        .filter(Boolean)
        .filter(text => !/not available|no data|no information/i.test(text));
      if (strings.length) return truncate(strings[0], maxLength);
    }
    return "";
  }

  function fahrenheitToC(value) { return (Number(value) - 32) * 5 / 9; }
  function kelvinToC(value) { return Number(value) - 273.15; }

  function convertRanges(text, regex, converter) {
    return text.replace(regex, (match, a, b) => {
      if (b !== undefined) {
        const c1 = converter(a);
        const c2 = converter(b);
        if (Number.isFinite(c1) && Number.isFinite(c2)) return `${fmtNumber(c1, 1)}–${fmtNumber(c2, 1)} °C`;
      }
      const c = converter(a);
      return Number.isFinite(c) ? `${fmtNumber(c, 1)} °C` : match;
    });
  }

  function normalizeTemperatureC(text) {
    const raw = cleanText(text);
    if (!raw) return "";

    if (/°\s*C|deg\s*C|degrees?\s*C|Celsius|Centigrade/i.test(raw)) {
      return raw
        .replace(/degrees?\s*Celsius/ig, "°C")
        .replace(/degrees?\s*C/ig, "°C")
        .replace(/deg\s*C/ig, "°C")
        .replace(/Celsius/ig, "°C")
        .replace(/Centigrade/ig, "°C");
    }

    let converted = raw;
    converted = convertRanges(converted, /(-?\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(-?\d+(?:\.\d+)?)\s*°?\s*F\b/gi, fahrenheitToC);
    converted = convertRanges(converted, /(-?\d+(?:\.\d+)?)\s*°?\s*F\b/gi, fahrenheitToC);
    converted = convertRanges(converted, /(-?\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(-?\d+(?:\.\d+)?)\s*K\b/g, kelvinToC);
    converted = convertRanges(converted, /(-?\d+(?:\.\d+)?)\s*K\b/g, kelvinToC);

    return converted;
  }

  async function renderDetailed(cid) {
    const token = ++state.token;
    const source = $("infoSource");
    if (source) source.textContent = "Buscando propriedades no PubChem...";

    try {
      const props = await fetchProperties(cid);
      const smilesPromise = fetchSMILES(cid, props);
      if (token !== state.token) return;

      let view = null;
      try { view = await fetchPugView(cid); } catch (error) { console.warn("PUG-View indisponível", error); }

      const smiles = await smilesPromise;
      if (token !== state.token) return;

      const solubility = view ? firstSectionText(view, ["Solubility", "Water Solubility"], 155) : "";
      const melting = normalizeTemperatureC(view ? firstSectionText(view, ["Melting Point"], 120) : "");
      const boiling = normalizeTemperatureC(view ? firstSectionText(view, ["Boiling Point"], 120) : "");
      const density = view ? firstSectionText(view, ["Density"], 120) : "";
      const uses = view ? firstSectionText(view, ["Use and Manufacturing", "Uses", "Drug and Medication Information"], 185) : "";
      const hazards = view ? firstSectionText(view, ["GHS Hazard Statements", "Hazards Identification", "Safety and Hazards"], 185) : "";

      const formula = props.MolecularFormula || $("moleculeFormula")?.textContent || "—";
      const grid = $("moleculeInfoGrid");
      if (!grid) return;

      grid.innerHTML = [
        item("Fórmula", formula),
        item("Massa molar", fmtNumber(props.MolecularWeight, 2, " g/mol")),
        item("SMILES", truncate(smiles || "não informado", 260), true),
        item("LogP / XLogP", props.XLogP === undefined ? "—" : fmtNumber(props.XLogP, 2)),
        item("TPSA", fmtNumber(props.TPSA, 1, " Å²")),
        item("Doadores H", fmt(props.HBondDonorCount)),
        item("Aceptores H", fmt(props.HBondAcceptorCount)),
        item("Ligações rot.", fmt(props.RotatableBondCount)),
        item("Carga", fmt(props.Charge)),
        item("Complexidade", fmtNumber(props.Complexity, 0)),
        item("Massa exata", fmtNumber(props.ExactMass, 4, " Da")),
        item("Solubilidade", solubility || "não informada", true),
        item("Ponto de fusão (°C)", melting || "não informado"),
        item("Ponto de ebulição (°C)", boiling || "não informado"),
        item("Densidade", density || "não informada"),
        item("Uso / contexto", uses || "não informado", true),
        item("Perigos", hazards || "não informado", true),
        item("Nome IUPAC", truncate(props.IUPACName || "—", 220), true)
      ].join("");

      if (source) source.textContent = "Fonte: PubChem PUG REST/PUG-View. Temperaturas em °C quando disponíveis ou convertíveis.";
    } catch (error) {
      console.warn(error);
      if (source) source.textContent = "Fonte: PubChem. Propriedades detalhadas indisponíveis para este composto.";
    }
  }

  function refresh() {
    transformCard();
    renderInitial();
    const cid = extractCID();
    if (!cid || cid === state.currentCID) return;
    state.currentCID = cid;
    renderDetailed(cid);
  }

  function init() {
    transformCard();
    refresh();

    const meta = $("moleculeMeta");
    const formula = $("moleculeFormula");
    const name = $("moleculeName");
    const observer = new MutationObserver(refresh);
    [meta, formula, name].filter(Boolean).forEach(el => observer.observe(el, { childList: true, characterData: true, subtree: true }));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();