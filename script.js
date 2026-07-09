import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const EXAMPLES = [
  { label: "Água", cid: 962, name: "Water" },
  { label: "Etanol", cid: 702, name: "Ethanol" },
  { label: "Benzeno", cid: 241, name: "Benzene" },
  { label: "Cafeína", cid: 2519, name: "Caffeine" },
  { label: "Aspirina", cid: 2244, name: "Aspirin" },
  { label: "Dopamina", cid: 681, name: "Dopamine" },
  { label: "Glicose", cid: 5793, name: "Glucose" },
  { label: "Serotonina", cid: 5202, name: "Serotonin" },
  { label: "Adrenalina", cid: 5816, name: "Epinephrine" },
  { label: "Vitamina C", cid: 54670067, name: "Ascorbic acid" },
  { label: "CBD", cid: 644019, name: "Cannabidiol" }
];

const ELEMENT_SYMBOLS = {
  1: "H", 5: "B", 6: "C", 7: "N", 8: "O", 9: "F",
  11: "Na", 12: "Mg", 13: "Al", 14: "Si", 15: "P", 16: "S", 17: "Cl",
  19: "K", 20: "Ca", 24: "Cr", 26: "Fe", 29: "Cu", 30: "Zn", 35: "Br",
  53: "I", 80: "Hg"
};

const ELEMENT_COLORS = {
  H: "#f5f5f5",
  C: "#242424",
  N: "#2f55d4",
  O: "#e21b23",
  F: "#7bd75b",
  P: "#ff8a00",
  S: "#f2c230",
  Cl: "#34b233",
  Br: "#8b2b20",
  I: "#6c2e8f",
  Na: "#7f55d9",
  Mg: "#40c050",
  Ca: "#44cc44",
  Fe: "#d66a36",
  Cu: "#b87333",
  Zn: "#7c7fae",
  default: "#8f8f8f"
};

const ATOM_RADII = {
  H: 0.14,
  C: 0.22,
  N: 0.21,
  O: 0.21,
  F: 0.20,
  P: 0.24,
  S: 0.24,
  Cl: 0.24,
  Br: 0.25,
  I: 0.27,
  Na: 0.25,
  Mg: 0.24,
  Ca: 0.26,
  Fe: 0.23,
  Cu: 0.23,
  Zn: 0.23,
  default: 0.22
};

const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 780;

const TARGET_BOND_LENGTH = 1.0;
const SINGLE_BOND_RADIUS = 0.052;
const MULTIPLE_BOND_RADIUS = 0.032;
const MULTIPLE_BOND_OFFSET = 0.085;

const LOCAL_FALLBACKS = {
  962: {
    name: "Water",
    cid: 962,
    atoms: [
      { el: "O", pos: [0.0000, 0.0000, 0.0000] },
      { el: "H", pos: [0.9572, 0.0000, 0.0000] },
      { el: "H", pos: [-0.2390, 0.9270, 0.0000] }
    ],
    bonds: [[0, 1], [0, 2]],
    bo: [1, 1]
  },
  702: {
    name: "Ethanol",
    cid: 702,
    atoms: [
      { el: "C", pos: [-0.748, 0.015, 0.024] },
      { el: "C", pos: [0.748, -0.015, -0.024] },
      { el: "O", pos: [1.306, 1.210, 0.354] },
      { el: "H", pos: [-1.146, 0.987, -0.284] },
      { el: "H", pos: [-1.126, -0.756, -0.662] },
      { el: "H", pos: [-1.135, -0.213, 1.024] },
      { el: "H", pos: [1.134, 0.212, -1.025] },
      { el: "H", pos: [1.151, -0.988, 0.282] },
      { el: "H", pos: [2.252, 1.168, 0.275] }
    ],
    bonds: [[0, 1], [1, 2], [0, 3], [0, 4], [0, 5], [1, 6], [1, 7], [2, 8]],
    bo: [1, 1, 1, 1, 1, 1, 1, 1]
  },
  241: {
    name: "Benzene",
    cid: 241,
    atoms: [
      { el: "C", pos: [1.396, 0.000, 0.000] },
      { el: "C", pos: [0.698, 1.209, 0.000] },
      { el: "C", pos: [-0.698, 1.209, 0.000] },
      { el: "C", pos: [-1.396, 0.000, 0.000] },
      { el: "C", pos: [-0.698, -1.209, 0.000] },
      { el: "C", pos: [0.698, -1.209, 0.000] },
      { el: "H", pos: [2.479, 0.000, 0.000] },
      { el: "H", pos: [1.240, 2.147, 0.000] },
      { el: "H", pos: [-1.240, 2.147, 0.000] },
      { el: "H", pos: [-2.479, 0.000, 0.000] },
      { el: "H", pos: [-1.240, -2.147, 0.000] },
      { el: "H", pos: [1.240, -2.147, 0.000] }
    ],
    bonds: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]],
    bo: [2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1]
  }
};

const canvas = document.getElementById("scene");
const video = document.getElementById("cameraVideo");
const examplesBox = document.getElementById("examples");
const searchForm = document.getElementById("searchForm");
const queryInput = document.getElementById("queryInput");
const galleryModeButton = document.getElementById("galleryMode");
const arModeButton = document.getElementById("arMode");

const nameEl = document.getElementById("moleculeName");
const formulaEl = document.getElementById("moleculeFormula");
const metaEl = document.getElementById("moleculeMeta");
const loading = document.getElementById("loading");
const loadingText = document.getElementById("loadingText");
const toastBox = document.getElementById("toastBox");
const handStatusEl = document.getElementById("handStatus");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: !IS_MOBILE,
  alpha: false,
  powerPreference: "high-performance"
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, IS_MOBILE ? 1.35 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xeeeeee, 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color("#eeeeee");

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(0, 0.25, 7.2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.75;
controls.minDistance = 2.0;
controls.maxDistance = 30;

scene.add(new THREE.AmbientLight("#ffffff", 1.45));

const keyLight = new THREE.DirectionalLight("#ffffff", 1.55);
keyLight.position.set(4.5, 6.5, 6.0);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight("#ffffff", 0.55);
fillLight.position.set(-4.0, -2.5, 5.0);
scene.add(fillLight);

let moleculeGroup = null;
let currentMolecule = null;
let activeExampleCID = null;
let arVideoTexture = null;
let isAR = false;

let hands = null;
let handLoopActive = false;
let handFrameBusy = false;
let handDetected = false;
let handLostTimer = 0;
let stableHandFrames = 0;
let invalidHandFrames = 0;

const arTargetPosition = new THREE.Vector3(0, 0, 0);
const arTargetQuaternion = new THREE.Quaternion();
const arTargetScale = new THREE.Vector3(1, 1, 1);
const arEuler = new THREE.Euler();

let touchFallbackActive = false;
let touchStartX = 0;
let touchStartY = 0;
let touchRotationX = 0;
let touchRotationY = 0;
let touchStartDistance = 0;
let touchScale = 0.8;

const structureCache = new Map();

const atomGeometryCache = new Map();
const bondGeometryCache = new Map();

function mobileARBaseScale() {
  const atoms = currentMolecule?.atoms?.length || 12;

  if (atoms > 45) return 0.42;
  if (atoms > 25) return 0.50;
  if (atoms > 14) return 0.62;
  return 0.78;
}

function mobileARSafeAnchor() {
  return new THREE.Vector3(0, 0.18, 0);
}

function getAtomColor(el) {
  return ELEMENT_COLORS[el] || ELEMENT_COLORS.default;
}

function getAtomRadius(el) {
  return ATOM_RADII[el] || ATOM_RADII.default;
}

function getSphereGeometry(radius) {
  const key = radius.toFixed(3);
  if (!atomGeometryCache.has(key)) {
    atomGeometryCache.set(key, new THREE.SphereGeometry(radius, 36, 28));
  }
  return atomGeometryCache.get(key);
}

function getCylinderGeometry(radius, length) {
  const key = `${radius.toFixed(3)}-${length.toFixed(3)}`;
  if (!bondGeometryCache.has(key)) {
    bondGeometryCache.set(key, new THREE.CylinderGeometry(radius, radius, length, 18));
  }
  return bondGeometryCache.get(key);
}

function materialForAtom(el) {
  return new THREE.MeshPhongMaterial({
    color: getAtomColor(el),
    shininess: 88,
    specular: new THREE.Color("#c9c9c9")
  });
}

function materialForBond() {
  return new THREE.MeshPhongMaterial({
    color: "#8f8f8f",
    shininess: 34,
    specular: new THREE.Color("#666666")
  });
}

function showLoading(text = "Carregando...") {
  loadingText.textContent = text;
  loading.classList.remove("hidden");
}

function hideLoading() {
  loading.classList.add("hidden");
}

function toast(message, type = "info") {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  toastBox.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 250);
  }, 3600);
}

function fetchWithTimeout(url, ms = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

async function findCIDByName(name) {
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/cids/JSON`;
  const response = await fetchWithTimeout(url, 10000);

  if (!response.ok) {
    throw new Error(`CID não encontrado para "${name}"`);
  }

  const data = await response.json();
  const cid = data?.IdentifierList?.CID?.[0];

  if (!cid) {
    throw new Error(`CID não encontrado para "${name}"`);
  }

  return cid;
}

async function fetchPubChemCompound(cid) {
  const urls = [
    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/record/JSON?record_type=3d`,
    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/record/JSON?record_type=2d`,
    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/record/JSON`
  ];

  let lastError = null;

  for (const url of urls) {
    try {
      const response = await fetchWithTimeout(url, 14000);
      if (!response.ok) {
        lastError = new Error(`HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      const comp = data?.PC_Compounds?.[0];

      if (comp) {
        const parsed = parsePubChemCompound(comp, cid);
        if (parsed.atoms.length && parsed.bonds.length) {
          return parsed;
        }
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Estrutura PubChem indisponível");
}

function parsePubChemCompound(comp, cid) {
  const atomAids = comp?.atoms?.aid || [];
  const elements = comp?.atoms?.element || [];
  const coordsBlocks = comp?.coords || [];
  const coordsBlock = coordsBlocks.find(block => block?.conformers?.[0]?.x?.length) || coordsBlocks[0];
  const conformer = coordsBlock?.conformers?.[0];

  if (!conformer?.x?.length) {
    throw new Error("Coordenadas indisponíveis no registro PubChem");
  }

  const coordAids = coordsBlock?.aid || atomAids;
  const elementByAid = new Map();

  atomAids.forEach((aid, index) => {
    elementByAid.set(aid, elements[index] || 6);
  });

  const atoms = [];
  const aidToIndex = new Map();

  for (let i = 0; i < conformer.x.length; i++) {
    const aid = coordAids[i] ?? atomAids[i] ?? (i + 1);
    const atomicNumber = elementByAid.get(aid) || elements[i] || 6;
    const el = ELEMENT_SYMBOLS[atomicNumber] || "X";

    aidToIndex.set(aid, i);

    atoms.push({
      el,
      pos: [
        Number(conformer.x[i]) || 0,
        Number(conformer.y?.[i]) || 0,
        Number(conformer.z?.[i]) || 0
      ]
    });
  }

  const bonds = [];
  const bo = [];
  const bondData = comp?.bonds || {};
  const aid1 = bondData.aid1 || [];
  const aid2 = bondData.aid2 || [];
  const order = bondData.order || [];

  for (let i = 0; i < aid1.length; i++) {
    const a = aidToIndex.get(aid1[i]);
    const b = aidToIndex.get(aid2[i]);

    if (Number.isInteger(a) && Number.isInteger(b) && a !== b) {
      bonds.push([a, b]);
      const rawOrder = Number(order[i] || 1);
      bo.push(rawOrder >= 1 && rawOrder <= 3 ? rawOrder : 1);
    }
  }

  return normalizeMolecule({
    name: `CID ${cid}`,
    cid,
    atoms,
    bonds,
    bo
  });
}

function normalizeMolecule(molecule) {
  const atoms = molecule.atoms.map(atom => ({
    ...atom,
    pos: [...atom.pos],
    color: getAtomColor(atom.el),
    radius: getAtomRadius(atom.el)
  }));

  const center = new THREE.Vector3();

  for (const atom of atoms) {
    center.add(new THREE.Vector3(...atom.pos));
  }

  center.divideScalar(Math.max(atoms.length, 1));

  for (const atom of atoms) {
    atom.pos[0] -= center.x;
    atom.pos[1] -= center.y;
    atom.pos[2] -= center.z;
  }

  const lengths = [];

  for (const [a, b] of molecule.bonds) {
    const p1 = new THREE.Vector3(...atoms[a].pos);
    const p2 = new THREE.Vector3(...atoms[b].pos);
    const len = p1.distanceTo(p2);

    if (Number.isFinite(len) && len > 0.05) {
      lengths.push(len);
    }
  }

  let scale = 1;

  if (lengths.length) {
    lengths.sort((a, b) => a - b);
    const median = lengths[Math.floor(lengths.length / 2)];
    scale = TARGET_BOND_LENGTH / median;
  } else {
    const box = new THREE.Box3();

    for (const atom of atoms) {
      box.expandByPoint(new THREE.Vector3(...atom.pos));
    }

    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z, 1);
    scale = 3 / maxDim;
  }

  for (const atom of atoms) {
    atom.pos[0] *= scale;
    atom.pos[1] *= scale;
    atom.pos[2] *= scale;
  }

  return {
    ...molecule,
    atoms,
    formula: hillFormula(atoms)
  };
}

function hillFormula(atoms) {
  const counts = {};

  for (const atom of atoms) {
    counts[atom.el] = (counts[atom.el] || 0) + 1;
  }

  const parts = [];

  if (counts.C) {
    parts.push(`C${counts.C > 1 ? counts.C : ""}`);
    delete counts.C;
  }

  if (counts.H) {
    parts.push(`H${counts.H > 1 ? counts.H : ""}`);
    delete counts.H;
  }

  Object.keys(counts).sort().forEach(el => {
    parts.push(`${el}${counts[el] > 1 ? counts[el] : ""}`);
  });

  return parts.join("");
}

function createBondCylinder(start, end, radius, offset = new THREE.Vector3()) {
  const s = start.clone().add(offset);
  const e = end.clone().add(offset);
  const midpoint = s.clone().add(e).multiplyScalar(0.5);
  const direction = e.clone().sub(s);
  const length = direction.length();

  if (!Number.isFinite(length) || length < 0.001) {
    return null;
  }

  const geometry = getCylinderGeometry(radius, length);
  const mesh = new THREE.Mesh(geometry, materialForBond());

  mesh.position.copy(midpoint);
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );

  return mesh;
}

function perpendicularVector(direction) {
  const dir = direction.clone().normalize();
  const reference = Math.abs(dir.dot(new THREE.Vector3(0, 1, 0))) > 0.9
    ? new THREE.Vector3(1, 0, 0)
    : new THREE.Vector3(0, 1, 0);

  return new THREE.Vector3().crossVectors(dir, reference).normalize();
}

function createBond(atomA, atomB, order = 1) {
  const group = new THREE.Group();
  const start = new THREE.Vector3(...atomA.pos);
  const end = new THREE.Vector3(...atomB.pos);
  const direction = end.clone().sub(start);

  if (direction.length() < 0.001) {
    return group;
  }

  if (order >= 3) {
    const perp = perpendicularVector(direction).multiplyScalar(MULTIPLE_BOND_OFFSET);
    const perp2 = perpendicularVector(perp).multiplyScalar(MULTIPLE_BOND_OFFSET * 0.8);

    [
      new THREE.Vector3(),
      perp,
      perp.clone().negate()
    ].forEach(offset => {
      const cylinder = createBondCylinder(start, end, MULTIPLE_BOND_RADIUS, offset);
      if (cylinder) group.add(cylinder);
    });

    return group;
  }

  if (order === 2) {
    const perp = perpendicularVector(direction).multiplyScalar(MULTIPLE_BOND_OFFSET);

    [perp, perp.clone().negate()].forEach(offset => {
      const cylinder = createBondCylinder(start, end, MULTIPLE_BOND_RADIUS, offset);
      if (cylinder) group.add(cylinder);
    });

    return group;
  }

  const cylinder = createBondCylinder(start, end, SINGLE_BOND_RADIUS);

  if (cylinder) {
    group.add(cylinder);
  }

  return group;
}

function createAtom(atom) {
  const mesh = new THREE.Mesh(
    getSphereGeometry(atom.radius),
    materialForAtom(atom.el)
  );

  mesh.position.set(...atom.pos);
  mesh.userData = { element: atom.el };

  return mesh;
}

function buildMoleculeGroup(molecule) {
  const group = new THREE.Group();
  const bondsGroup = new THREE.Group();
  const atomsGroup = new THREE.Group();

  molecule.bonds.forEach(([a, b], index) => {
    const atomA = molecule.atoms[a];
    const atomB = molecule.atoms[b];

    if (atomA && atomB) {
      bondsGroup.add(createBond(atomA, atomB, molecule.bo[index] || 1));
    }
  });

  molecule.atoms.forEach(atom => {
    atomsGroup.add(createAtom(atom));
  });

  group.add(bondsGroup);
  group.add(atomsGroup);

  return group;
}

function fitCameraToMolecule(group) {
  const box = new THREE.Box3().setFromObject(group);
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();

  box.getCenter(center);
  box.getSize(size);

  group.position.sub(center);

  const maxDim = Math.max(size.x, size.y, size.z, 2.2);
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const distance = Math.min(Math.max((maxDim / (2 * Math.tan(fov / 2))) * 1.55, 3.6), 18);

  camera.position.set(0, Math.max(0.18, maxDim * 0.06), distance);
  camera.near = Math.max(0.05, distance / 100);
  camera.far = distance * 20;
  camera.updateProjectionMatrix();

  controls.target.set(0, 0, 0);
  controls.update();
}

function displayMolecule(molecule, displayName, source = "PubChem") {
  if (moleculeGroup) {
    scene.remove(moleculeGroup);
    disposeObject(moleculeGroup);
  }

  currentMolecule = molecule;
  moleculeGroup = buildMoleculeGroup(molecule);
  scene.add(moleculeGroup);
  fitCameraToMolecule(moleculeGroup);

  if (isAR && IS_MOBILE) {
    arTargetPosition.copy(mobileARSafeAnchor());
    const base = mobileARBaseScale();
    arTargetScale.set(base, base, base);
    moleculeGroup.position.copy(arTargetPosition);
    moleculeGroup.scale.copy(arTargetScale);
  }

  nameEl.textContent = displayName || molecule.name || `CID ${molecule.cid || ""}`;
  formulaEl.textContent = molecule.formula || "—";

  const bondText = molecule.bonds.length === 1 ? "ligação" : "ligações";
  const atomText = molecule.atoms.length === 1 ? "átomo" : "átomos";

  metaEl.textContent = `${molecule.atoms.length} ${atomText} · ${molecule.bonds.length} ${bondText} · ball-and-stick · ${source}${molecule.cid ? ` CID ${molecule.cid}` : ""}`;
}

function disposeObject(object) {
  object.traverse(child => {
    if (child.geometry && !atomGeometryCacheHas(child.geometry) && !bondGeometryCacheHas(child.geometry)) {
      child.geometry.dispose();
    }

    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(material => material.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}

function atomGeometryCacheHas(geometry) {
  for (const cached of atomGeometryCache.values()) {
    if (cached === geometry) return true;
  }
  return false;
}

function bondGeometryCacheHas(geometry) {
  for (const cached of bondGeometryCache.values()) {
    if (cached === geometry) return true;
  }
  return false;
}

async function loadByCID(cid, displayName = null) {
  const numericCID = Number(cid);
  activeExampleCID = numericCID;

  setActiveExample(numericCID);
  showLoading(`Carregando CID ${numericCID} no PubChem...`);

  try {
    let molecule;

    if (structureCache.has(numericCID)) {
      molecule = structureCache.get(numericCID);
    } else {
      molecule = await fetchPubChemCompound(numericCID);
      structureCache.set(numericCID, molecule);
    }

    hideLoading();
    displayMolecule(molecule, displayName || `CID ${numericCID}`, "PubChem");
    toast(`Carregado: ${molecule.formula}`, "success");
  } catch (error) {
    const fallback = LOCAL_FALLBACKS[numericCID];

    if (fallback) {
      const normalized = normalizeMolecule(fallback);
      hideLoading();
      displayMolecule(normalized, displayName || fallback.name, "fallback local");
      toast("PubChem indisponível. Usando fallback local padronizado.", "info");
    } else {
      hideLoading();
      toast("Não foi possível carregar a estrutura. Tente outro nome ou CID.", "error");
      console.error(error);
    }
  }
}

async function loadByQuery(query) {
  const text = query.trim();

  if (!text) return;

  if (/^\d+$/.test(text)) {
    await loadByCID(Number(text), `CID ${text}`);
    return;
  }

  showLoading(`Buscando "${text}" no PubChem...`);

  try {
    const cid = await findCIDByName(text);
    hideLoading();
    await loadByCID(cid, text);
  } catch (error) {
    hideLoading();
    toast("Molécula não encontrada. Tente o nome em inglês ou o CID.", "error");
    console.error(error);
  }
}

function createExampleButtons() {
  EXAMPLES.forEach(example => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "example-button";
    button.textContent = example.label;
    button.dataset.cid = String(example.cid);
    button.addEventListener("click", () => loadByCID(example.cid, example.label));
    examplesBox.appendChild(button);
  });
}

function setActiveExample(cid) {
  document.querySelectorAll(".example-button").forEach(button => {
    button.classList.toggle("active", Number(button.dataset.cid) === Number(cid));
  });
}


function distance2D(a, b) {
  return Math.hypot((a.x || 0) - (b.x || 0), (a.y || 0) - (b.y || 0));
}

function validateHandLandmarks(results, landmarks) {
  if (!landmarks || landmarks.length < 21) {
    return { valid: false, reason: "sem landmarks" };
  }

  const confidence = results?.multiHandedness?.[0]?.score ?? 0;
  const minConfidence = IS_MOBILE ? 0.52 : 0.60;

  if (confidence < minConfidence) {
    return { valid: false, reason: `confiança baixa (${Math.round(confidence * 100)}%)` };
  }

  const wrist = landmarks[0];
  const indexBase = landmarks[5];
  const middleBase = landmarks[9];
  const pinkyBase = landmarks[17];

  const palmWidth = distance2D(indexBase, pinkyBase);
  const palmLength = distance2D(wrist, middleBase);

  // Regra robusta para celular:
  // Não rejeitar mão real por estar muito perto/longe. Apenas remover casos absurdos.
  if (palmWidth < 0.018 || palmWidth > 0.82) {
    return { valid: false, reason: "mão fora do quadro" };
  }

  if (palmLength < 0.025 || palmLength > 0.88) {
    return { valid: false, reason: "mão fora do quadro" };
  }

  // Exige que pontos centrais estejam minimamente dentro ou próximos da tela.
  // Permite bordas, pois no celular a mão frequentemente fica parcialmente cortada.
  const mainIds = [0, 5, 9, 13, 17];
  const visible = mainIds.filter(id => {
    const p = landmarks[id];
    return p.x >= -0.20 && p.x <= 1.20 && p.y >= -0.20 && p.y <= 1.20;
  }).length;

  if (visible < 4) {
    return { valid: false, reason: "mão muito fora da câmera" };
  }

  return {
    valid: true,
    confidence,
    palmWidth,
    palmLength
  };
}

function rejectHandFrame(reason = "") {
  invalidHandFrames += 1;
  stableHandFrames = 0;

  // Histerese: não perder a mão por um único frame ruim no celular.
  const limit = IS_MOBILE ? 7 : 4;

  if (invalidHandFrames >= limit) {
    handDetected = false;
    setHandStatus(false, reason);
  }
}

async function setupHandTracking() {
  if (!window.Hands) {
    throw new Error("MediaPipe Hands não carregou");
  }

  if (!hands) {
    hands = new window.Hands({
      locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: IS_MOBILE ? 0 : 1,
      minDetectionConfidence: IS_MOBILE ? 0.50 : 0.62,
      minTrackingConfidence: IS_MOBILE ? 0.45 : 0.52,
      selfieMode: true
    });

    hands.onResults(handleHandResults);
  }
}

function startHandLoop() {
  handLoopActive = true;
  handFrameBusy = false;
  requestAnimationFrame(handLoop);
}

function stopHandLoop() {
  handLoopActive = false;
  handFrameBusy = false;
  handDetected = false;
  stableHandFrames = 0;
  invalidHandFrames = 0;
  if (handStatusEl) {
    handStatusEl.classList.add("hidden");
    handStatusEl.classList.remove("detected");
    handStatusEl.textContent = "Mão não detectada";
  }
}

async function handLoop() {
  if (!handLoopActive || !hands || !video.srcObject) {
    return;
  }

  const nextFrameDelay = IS_MOBILE ? 110 : 45;

  if (!handFrameBusy && video.readyState >= 2) {
    handFrameBusy = true;
    try {
      await hands.send({ image: video });
    } catch (error) {
      console.warn("Falha no rastreamento da mão:", error);
    } finally {
      handFrameBusy = false;
    }
  }

  setTimeout(() => requestAnimationFrame(handLoop), nextFrameDelay);
}

function setHandStatus(detected, reason = "") {
  if (!handStatusEl) return;

  handStatusEl.classList.remove("hidden");

  if (detected) {
    handStatusEl.classList.add("detected");
    handStatusEl.textContent = IS_MOBILE
      ? "Mão detectada — gire/incline a mão"
      : "Mão detectada — mova a mão para controlar";
  } else {
    handStatusEl.classList.remove("detected");
    handStatusEl.textContent = reason
      ? `Aguardando mão (${reason})`
      : "Mostre a mão aberta ou use toque para girar/zoom";
  }
}

function handleHandResults(results) {
  const landmarks = results?.multiHandLandmarks?.[0];

  if (!landmarks || !moleculeGroup) {
    rejectHandFrame("não visível");
    return;
  }

  const validation = validateHandLandmarks(results, landmarks);

  if (!validation.valid) {
    rejectHandFrame(validation.reason);
    return;
  }

  stableHandFrames += 1;
  invalidHandFrames = 0;

  // No celular, aceitar logo após validação robusta.
  // A molécula já está ancorada, então falso deslocamento não tira a estrutura da tela.
  if (!IS_MOBILE && stableHandFrames < 1) {
    setHandStatus(false, "confirmando");
    return;
  }

  handDetected = true;
  handLostTimer = performance.now();
  setHandStatus(true);

  const ids = [0, 5, 9, 13, 17];
  let cx = 0;
  let cy = 0;
  let cz = 0;

  ids.forEach(id => {
    cx += landmarks[id].x;
    cy += landmarks[id].y;
    cz += landmarks[id].z || 0;
  });

  cx /= ids.length;
  cy /= ids.length;
  cz /= ids.length;

  if (IS_MOBILE) {
    // No celular, manter a molécula em uma zona segura evita que ela saia da tela.
    // A mão controla rotação e escala; a posição fica suavemente ancorada.
    arTargetPosition.copy(mobileARSafeAnchor());
  } else {
    const ndc = new THREE.Vector3((0.5 - cx) * 1.6, (0.5 - cy) * 1.6, 0.12);
    const worldPoint = ndc.unproject(camera);
    const direction = worldPoint.sub(camera.position).normalize();
    const depth = Math.min(Math.max(camera.position.z * 0.55, 3.2), 8.5);

    arTargetPosition.copy(camera.position).add(direction.multiplyScalar(depth));

    arTargetPosition.x = THREE.MathUtils.clamp(arTargetPosition.x, -1.8, 1.8);
    arTargetPosition.y = THREE.MathUtils.clamp(arTargetPosition.y, -1.1, 1.1);
  }

  const wrist = landmarks[0];
  const indexBase = landmarks[5];
  const middleBase = landmarks[9];
  const pinkyBase = landmarks[17];

  const acrossX = indexBase.x - pinkyBase.x;
  const acrossY = indexBase.y - pinkyBase.y;
  const verticalX = middleBase.x - wrist.x;
  const verticalY = middleBase.y - wrist.y;

  const angleZ = Math.atan2(acrossY, acrossX);
  const angleY = (cx - 0.5) * Math.PI * (IS_MOBILE ? -1.35 : 1.8);
  const angleX = (cy - 0.5) * Math.PI * (IS_MOBILE ? 0.85 : 1.2) + verticalY * 1.1;

  arEuler.set(angleX, angleY, -angleZ);
  arTargetQuaternion.setFromEuler(arEuler);

  const handSize = Math.hypot(middleBase.x - wrist.x, middleBase.y - wrist.y);
  const normalized = THREE.MathUtils.clamp((handSize - 0.05) / 0.35, 0.25, 1.35);

  const baseScale = IS_MOBILE ? mobileARBaseScale() : 1.0;
  const scale = IS_MOBILE
    ? THREE.MathUtils.clamp(baseScale * (0.82 + normalized * 0.28), baseScale * 0.70, baseScale * 1.30)
    : THREE.MathUtils.clamp(normalized, 0.42, 1.25);

  arTargetScale.set(scale, scale, scale);
}

async function startARMode() {
  if (!navigator.mediaDevices?.getUserMedia) {
    toast("O modo AR exige HTTPS, localhost ou navegador compatível.", "error");
    return;
  }

  showLoading("Iniciando câmera e rastreamento da mão...");

  try {
    await setupHandTracking();

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: IS_MOBILE ? 640 : 1280 },
        height: { ideal: IS_MOBILE ? 480 : 720 },
        frameRate: { ideal: IS_MOBILE ? 15 : 30, max: IS_MOBILE ? 20 : 30 }
      },
      audio: false
    });

    video.srcObject = stream;
    await video.play();

    arVideoTexture = new THREE.VideoTexture(video);
    arVideoTexture.colorSpace = THREE.SRGBColorSpace;
    scene.background = arVideoTexture;
    renderer.setClearColor(0x000000, 1);

    isAR = true;
    controls.autoRotate = false;
    controls.enabled = false;
    touchFallbackActive = true;
    touchRotationX = 0;
    touchRotationY = 0;
    touchScale = IS_MOBILE ? 0.72 : 0.8;

    if (moleculeGroup) {
      arTargetPosition.copy(IS_MOBILE ? mobileARSafeAnchor() : new THREE.Vector3(0, 0, 0));
      arTargetQuaternion.identity();
      const base = IS_MOBILE ? mobileARBaseScale() : 0.8;
      arTargetScale.set(base, base, base);
      moleculeGroup.position.copy(arTargetPosition);
      moleculeGroup.scale.copy(arTargetScale);
    }

    galleryModeButton.classList.remove("active");
    arModeButton.classList.add("active");

    handLostTimer = performance.now();
    startHandLoop();
    setHandStatus(false);

    hideLoading();
    toast(IS_MOBILE ? "AR mobile ativo: mão controla rotação; toque também funciona." : "AR com rastreamento da mão ativo.", "success");
  } catch (error) {
    hideLoading();
    toast("Não foi possível iniciar a câmera ou o rastreamento da mão.", "error");
    console.error(error);
    stopARMode();
  }
}

function stopARMode() {
  stopHandLoop();

  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }

  if (arVideoTexture) {
    arVideoTexture.dispose();
    arVideoTexture = null;
  }

  scene.background = new THREE.Color("#eeeeee");
  renderer.setClearColor(0xeeeeee, 1);

  isAR = false;
  touchFallbackActive = false;
  controls.enabled = true;
  controls.autoRotate = true;

  if (moleculeGroup) {
    moleculeGroup.position.set(0, 0, 0);
    moleculeGroup.quaternion.identity();
    moleculeGroup.scale.set(1, 1, 1);
    fitCameraToMolecule(moleculeGroup);
  }

  arModeButton.classList.remove("active");
  galleryModeButton.classList.add("active");

  toast("Modo galeria ativo.", "info");
}

function touchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

canvas.addEventListener("touchstart", event => {
  if (!isAR || !touchFallbackActive || !moleculeGroup) return;

  event.preventDefault();

  if (event.touches.length === 1) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }

  if (event.touches.length === 2) {
    touchStartDistance = touchDistance(event.touches);
  }
}, { passive: false });

canvas.addEventListener("touchmove", event => {
  if (!isAR || !touchFallbackActive || !moleculeGroup) return;

  event.preventDefault();

  if (event.touches.length === 1) {
    const x = event.touches[0].clientX;
    const y = event.touches[0].clientY;

    touchRotationY += (x - touchStartX) * 0.008;
    touchRotationX += (y - touchStartY) * 0.008;
    touchRotationX = THREE.MathUtils.clamp(touchRotationX, -Math.PI / 2, Math.PI / 2);

    touchStartX = x;
    touchStartY = y;

    if (!handDetected) {
      arTargetPosition.copy(IS_MOBILE ? mobileARSafeAnchor() : arTargetPosition);
      arEuler.set(touchRotationX, touchRotationY, 0);
      arTargetQuaternion.setFromEuler(arEuler);
    }
  }

  if (event.touches.length === 2) {
    const distance = touchDistance(event.touches);
    const delta = distance - touchStartDistance;

    touchScale = THREE.MathUtils.clamp(touchScale + delta * 0.004, 0.35, 1.35);
    touchStartDistance = distance;

    if (!handDetected) {
      const correctedScale = IS_MOBILE ? THREE.MathUtils.clamp(touchScale * mobileARBaseScale(), mobileARBaseScale() * 0.65, mobileARBaseScale() * 1.45) : touchScale;
      arTargetScale.set(correctedScale, correctedScale, correctedScale);
    }
  }
}, { passive: false });

function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  if (moleculeGroup) {
    fitCameraToMolecule(moleculeGroup);
  }
}

function animate() {
  requestAnimationFrame(animate);

  if (moleculeGroup) {
    if (isAR) {
      if (handDetected) {
        moleculeGroup.position.lerp(arTargetPosition, 0.16);
        moleculeGroup.quaternion.slerp(arTargetQuaternion, 0.14);
        moleculeGroup.scale.lerp(arTargetScale, 0.14);
      } else if (performance.now() - handLostTimer > 700) {
        arTargetPosition.copy(IS_MOBILE ? mobileARSafeAnchor() : new THREE.Vector3(0, 0, 0));
        if (!touchFallbackActive) {
          arTargetQuaternion.identity();
          const base = IS_MOBILE ? mobileARBaseScale() : 0.72;
          arTargetScale.set(base, base, base);
        }
        moleculeGroup.position.lerp(arTargetPosition, 0.10);
        moleculeGroup.quaternion.slerp(arTargetQuaternion, 0.10);
        moleculeGroup.scale.lerp(arTargetScale, 0.10);
      }
    } else {
      moleculeGroup.rotation.y += 0.0004;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

searchForm.addEventListener("submit", event => {
  event.preventDefault();
  loadByQuery(queryInput.value);
});

galleryModeButton.addEventListener("click", () => {
  if (isAR) stopARMode();
});

arModeButton.addEventListener("click", () => {
  if (!isAR) startARMode();
});

window.addEventListener("resize", handleResize);

createExampleButtons();
animate();
loadByCID(241, "Benzeno");
