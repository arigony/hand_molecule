// MolecuAR resolver multilíngue: PT/ES/EN → Wikidata → PubChem CID.
// Este arquivo intercepta apenas a chamada PubChem de nome → CID.
// A estrutura 2D/3D continua vindo do PubChem no script principal.
(() => {
  const originalFetch = window.fetch.bind(window);

  const LOCAL_ALIASES = [
    { cid: 962, en: "water", names: ["água", "agua", "water", "h2o"] },
    { cid: 702, en: "ethanol", names: ["etanol", "ethanol", "álcool etílico", "alcool etilico", "alcohol etílico", "alcohol etilico", "ethyl alcohol"] },
    { cid: 241, en: "benzene", names: ["benzeno", "benceno", "benzene"] },
    { cid: 2519, en: "caffeine", names: ["cafeína", "cafeina", "caffeine"] },
    { cid: 2244, en: "aspirin", names: ["aspirina", "aspirin", "ácido acetilsalicílico", "acido acetilsalicilico", "acetylsalicylic acid"] },
    { cid: 681, en: "dopamine", names: ["dopamina", "dopamine"] },
    { cid: 5793, en: "glucose", names: ["glicose", "glucose", "glucosa", "dextrose", "dextrosa"] },
    { cid: 5202, en: "serotonin", names: ["serotonina", "serotonin"] },
    { cid: 5816, en: "epinephrine", names: ["adrenalina", "adrenaline", "epinefrina", "epinephrine"] },
    { cid: 54670067, en: "ascorbic acid", names: ["vitamina c", "vitamin c", "ácido ascórbico", "acido ascorbico", "ascorbic acid"] },
    { cid: 644019, en: "cannabidiol", names: ["cbd", "canabidiol", "cannabidiol"] },
    { cid: 1983, en: "acetaminophen", names: ["paracetamol", "acetaminofeno", "acetaminophen"] },
    { cid: 3672, en: "ibuprofen", names: ["ibuprofeno", "ibuprofen"] },
    { cid: 180, en: "acetone", names: ["acetona", "acetone"] },
    { cid: 887, en: "methanol", names: ["metanol", "methanol", "álcool metílico", "alcool metilico", "alcohol metilico", "methyl alcohol"] },
    { cid: 176, en: "acetic acid", names: ["ácido acético", "acido acetico", "acetic acid", "ácido etanoico", "acido etanoico", "ethanoic acid"] },
    { cid: 222, en: "ammonia", names: ["amônia", "amonia", "amoníaco", "amoniaco", "ammonia"] },
    { cid: 280, en: "carbon dioxide", names: ["dióxido de carbono", "dioxido de carbono", "carbon dioxide", "co2"] },
    { cid: 281, en: "carbon monoxide", names: ["monóxido de carbono", "monoxido de carbono", "carbon monoxide", "co"] },
    { cid: 5988, en: "sucrose", names: ["sacarose", "sacarosa", "sucrose", "açúcar", "acucar", "azúcar", "azucar"] },
    { cid: 5984, en: "fructose", names: ["frutose", "fructose", "fructosa"] },
    { cid: 6134, en: "lactose", names: ["lactose"] },
    { cid: 445154, en: "resveratrol", names: ["resveratrol"] },
    { cid: 969516, en: "curcumin", names: ["curcumina", "curcumin"] },
    { cid: 1176, en: "urea", names: ["ureia", "urea"] },
    { cid: 996, en: "phenol", names: ["fenol", "phenol"] },
    { cid: 1140, en: "toluene", names: ["tolueno", "toluene"] },
    { cid: 6212, en: "chloroform", names: ["clorofórmio", "cloroformio", "cloroformo", "chloroform"] },
    { cid: 240, en: "benzaldehyde", names: ["benzaldeído", "benzaldeido", "benzaldehído", "benzaldehido", "benzaldehyde"] },
    { cid: 1049, en: "pyridine", names: ["piridina", "pyridine"] },
    { cid: 5997, en: "cholesterol", names: ["colesterol", "cholesterol"] }
  ];

  function normalizeName(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  const aliasMap = new Map();
  for (const item of LOCAL_ALIASES) {
    for (const name of item.names) aliasMap.set(normalizeName(name), item);
  }

  function cidResponse(cid, source, inputName) {
    console.info(`[MolecuAR resolver] ${inputName} → CID ${cid} (${source})`);
    return new Response(JSON.stringify({ IdentifierList: { CID: [Number(cid)] } }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  async function fetchJson(url, timeoutMs = 10000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await originalFetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  function getPubChemCID(entity) {
    const claim = entity?.claims?.P662?.[0];
    const value = claim?.mainsnak?.datavalue?.value;
    const cid = Number(String(value || "").trim());
    return Number.isFinite(cid) && cid > 0 ? cid : null;
  }

  function bestLabel(entity, fallback) {
    return entity?.labels?.pt?.value ||
      entity?.labels?.es?.value ||
      entity?.labels?.en?.value ||
      fallback;
  }

  async function wikidataToCID(term) {
    const languages = ["pt", "es", "en"];
    const ids = [];
    const seen = new Set();

    for (const lang of languages) {
      const url =
        "https://www.wikidata.org/w/api.php" +
        "?origin=*" +
        "&action=wbsearchentities" +
        "&format=json" +
        "&type=item" +
        "&limit=8" +
        `&language=${lang}` +
        `&uselang=${lang}` +
        `&search=${encodeURIComponent(term)}`;

      try {
        const data = await fetchJson(url, 9000);
        for (const item of data?.search || []) {
          if (item?.id && !seen.has(item.id)) {
            seen.add(item.id);
            ids.push(item.id);
          }
        }
      } catch (error) {
        console.warn("[MolecuAR resolver] Wikidata search failed:", lang, error);
      }
    }

    if (!ids.length) return null;

    const entityUrl =
      "https://www.wikidata.org/w/api.php" +
      "?origin=*" +
      "&action=wbgetentities" +
      "&format=json" +
      "&props=labels|claims" +
      "&languages=pt|es|en" +
      `&ids=${ids.slice(0, 20).join("|")}`;

    try {
      const data = await fetchJson(entityUrl, 12000);
      const entities = Object.values(data?.entities || {});
      const target = normalizeName(term);

      const candidates = entities
        .map(entity => {
          const cid = getPubChemCID(entity);
          if (!cid) return null;
          const label = bestLabel(entity, term);
          const score = normalizeName(label) === target ? 2 : 1;
          return { cid, label, qid: entity.id, score };
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score);

      return candidates[0] || null;
    } catch (error) {
      console.warn("[MolecuAR resolver] Wikidata entity lookup failed:", error);
      return null;
    }
  }

  function extractPubChemName(urlText) {
    try {
      const url = new URL(urlText);
      if (!url.hostname.includes("pubchem.ncbi.nlm.nih.gov")) return null;
      const match = url.pathname.match(/\/rest\/pug\/compound\/name\/([^/]+)\/cids\/JSON/i);
      return match ? decodeURIComponent(match[1]) : null;
    } catch {
      return null;
    }
  }

  window.fetch = async function patchedFetch(input, init) {
    const urlText = typeof input === "string" ? input : input?.url;
    const pubchemName = extractPubChemName(urlText || "");

    if (!pubchemName) return originalFetch(input, init);

    const normalized = normalizeName(pubchemName);
    const local = aliasMap.get(normalized);
    if (local) return cidResponse(local.cid, `local alias: ${local.en}`, pubchemName);

    const direct = await originalFetch(input, init);
    if (direct.ok) return direct;

    const hit = await wikidataToCID(pubchemName);
    if (hit?.cid) return cidResponse(hit.cid, `Wikidata ${hit.qid}: ${hit.label}`, pubchemName);

    return direct;
  };

  window.MolecuARResolver = {
    version: "wikidata-1",
    aliases: LOCAL_ALIASES.length,
    normalizeName
  };
})();
