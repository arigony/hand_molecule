// MolecuAR — Etapa 1: alternância entre câmera frontal e traseira.
// Este arquivo não altera a molécula nem o rastreamento principal.
// Ele intercepta getUserMedia para trocar o facingMode usado pelo modo AR.
(() => {
  const STORAGE_KEY = "molecuar_camera_facing";
  const originalGetUserMedia = navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices);

  if (!originalGetUserMedia) {
    console.warn("[MolecuAR camera-toggle] getUserMedia indisponível.");
    return;
  }

  let facing = localStorage.getItem(STORAGE_KEY) || "user";
  if (!['user', 'environment'].includes(facing)) facing = "user";

  function cloneConstraints(constraints) {
    if (!constraints || typeof constraints !== "object") return constraints;
    return {
      ...constraints,
      video: typeof constraints.video === "object" ? { ...constraints.video } : constraints.video
    };
  }

  function applyFacingToConstraints(constraints) {
    const next = cloneConstraints(constraints || { video: true, audio: false });
    if (!next.video) return next;
    if (typeof next.video !== "object") next.video = {};

    next.video.facingMode = { ideal: facing };

    const rear = facing === "environment";
    if (rear) {
      next.video.width = next.video.width || { ideal: 1280 };
      next.video.height = next.video.height || { ideal: 720 };
    }

    return next;
  }

  navigator.mediaDevices.getUserMedia = function patchedGetUserMedia(constraints) {
    return originalGetUserMedia(applyFacingToConstraints(constraints));
  };

  function injectStyle() {
    if (document.getElementById("camera-toggle-style")) return;
    const style = document.createElement("style");
    style.id = "camera-toggle-style";
    style.textContent = `
      .camera-button { min-width: 134px; }
      body.front-camera #cameraVideo { transform: scaleX(-1) !important; }
      body.rear-camera #cameraVideo { transform: none !important; }
      body.rear-camera #handOverlay { transform: scaleX(-1); transform-origin: center center; }
    `;
    document.head.appendChild(style);
  }

  function getButton() {
    let button = document.getElementById("cameraFlip");
    if (button) return button;

    const holder = document.querySelector(".view-buttons");
    if (!holder) return null;

    button = document.createElement("button");
    button.id = "cameraFlip";
    button.className = "mode-button camera-button";
    button.type = "button";
    button.title = "Alternar câmera frontal/traseira";
    holder.appendChild(button);
    return button;
  }

  function applyVisualState() {
    document.body.classList.toggle("front-camera", facing === "user");
    document.body.classList.toggle("rear-camera", facing === "environment");

    const video = document.getElementById("cameraVideo");
    if (video) video.classList.toggle("mirrored", facing === "user");

    const button = getButton();
    if (button) {
      const rear = facing === "environment";
      button.textContent = rear ? "Câmera: traseira" : "Câmera: frontal";
      button.classList.toggle("active", rear);
      button.setAttribute("aria-pressed", rear ? "true" : "false");
    }
  }

  function toast(message) {
    const box = document.getElementById("toastBox");
    if (!box) return;
    const el = document.createElement("div");
    el.className = "toast info";
    el.textContent = message;
    box.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => el.remove(), 3400);
  }

  function restartARIfActive() {
    const video = document.getElementById("cameraVideo");
    const gallery = document.getElementById("galleryMode");
    const ar = document.getElementById("arMode");
    const active = video?.srcObject || video?.classList.contains("ar-visible") || ar?.classList.contains("active");

    if (!active || !gallery || !ar) return;

    gallery.click();
    setTimeout(() => ar.click(), 650);
  }

  function toggleCamera() {
    facing = facing === "user" ? "environment" : "user";
    localStorage.setItem(STORAGE_KEY, facing);
    applyVisualState();
    toast(facing === "environment" ? "Câmera traseira selecionada." : "Câmera frontal selecionada.");
    restartARIfActive();
  }

  function setup() {
    injectStyle();
    applyVisualState();
    const button = getButton();
    if (button && !button.dataset.cameraToggleReady) {
      button.dataset.cameraToggleReady = "1";
      button.addEventListener("click", toggleCamera);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }

  window.MolecuARCameraToggle = {
    version: "rear-camera-1",
    get facingMode() { return facing; },
    setFacingMode(value) {
      if (!['user', 'environment'].includes(value)) return;
      facing = value;
      localStorage.setItem(STORAGE_KEY, facing);
      applyVisualState();
    }
  };
})();