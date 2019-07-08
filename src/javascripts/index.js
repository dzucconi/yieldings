import { diffChars } from "diff";

const STATE = {
  edited: false,
  editor: "",
  removed: ""
};

const DOM = {
  app: document.getElementById("app"),
  editor: document.getElementById("editor"),
  removed: document.getElementById("removed"),
  reset: document.getElementById("reset")
};

const init = () => {
  try {
    STATE.editor = DOM.editor.value = localStorage.getItem("editor") || "";
    STATE.removed = DOM.removed.value = localStorage.getItem("removed") || "";
  } catch (e) {
    // Ignore
  }

  STATE.editor = DOM.editor.value;

  DOM.editor.addEventListener("touchstart", () => {
    setTimeout(() => window.scrollTo(0, 0), 500);
  });

  DOM.editor.addEventListener("input", () => {
    const diff = diffChars(STATE.editor, DOM.editor.value);

    diff.forEach(part => {
      if (part.removed) {
        STATE.removed += part.value;
      }
    });

    try {
      localStorage.setItem("editor", DOM.editor.value);
      localStorage.setItem("removed", (DOM.removed.value = STATE.removed));
    } catch (e) {
      // Ignore
    }

    STATE.editor = DOM.editor.value;

    if (!STATE.edited) {
      STATE.edited = true;
      DOM.reset.style.opacity = 1;
    }
  });

  DOM.reset.addEventListener("click", e => {
    e.preventDefault();

    try {
      localStorage.setItem("editor", (STATE.editor = DOM.editor.value = ""));
      localStorage.setItem("removed", (STATE.removed = DOM.removed.value = ""));
    } catch (e) {
      // Ignore
    }

    DOM.editor.focus();
    setTimeout(() => window.scrollTo(0, 0), 500);
  });
};

document.addEventListener("DOMContentLoaded", init);
