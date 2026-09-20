(() => {
  "use strict";

  const NOTICE = "Nội dung được bảo vệ, không thể sao chép.";
  const TOAST_MS = 2200;

  let toast = null;
  let hideTimer = 0;

  function notify() {
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "protect-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
    }

    // A modal <dialog> sits in the top layer, so show the notice inside it when open.
    const host = document.querySelector("dialog[open]") || document.body;
    if (toast.parentNode !== host) host.append(toast);

    toast.textContent = NOTICE;
    toast.classList.add("is-visible");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => toast.classList.remove("is-visible"), TOAST_MS);
  }

  function block(event, { silent = false } = {}) {
    event.preventDefault();
    if (!silent) notify();
  }

  // Right-click / long-press menu, clipboard and drag & drop
  document.addEventListener("contextmenu", (event) => block(event));

  ["copy", "cut"].forEach((type) => {
    document.addEventListener(type, (event) => {
      block(event);
      // Whatever ends up on the clipboard is the notice, not page content.
      if (event.clipboardData) event.clipboardData.setData("text/plain", NOTICE);
    });
  });

  ["dragstart", "selectstart"].forEach((type) => {
    document.addEventListener(type, (event) => block(event, { silent: true }));
  });

  // Keyboard shortcuts: copy, cut, select all, save, print, view source, dev tools
  document.addEventListener(
    "keydown",
    (event) => {
      const key = String(event.key || "").toLowerCase();
      const mod = event.ctrlKey || event.metaKey;

      const blocked =
        key === "f12" ||
        (mod && ["c", "x", "a", "s", "p", "u"].includes(key)) ||
        (mod && event.shiftKey && ["i", "j", "c", "k"].includes(key)) ||
        (event.metaKey && event.altKey && ["i", "j", "c", "u"].includes(key));

      if (blocked) block(event);
    },
    true
  );

  // Best effort: replace a PrintScreen capture on the clipboard with the notice.
  document.addEventListener("keyup", (event) => {
    if (event.key !== "PrintScreen") return;
    notify();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(NOTICE).catch(() => {});
    }
  });

  window.addEventListener("beforeprint", notify);
})();
