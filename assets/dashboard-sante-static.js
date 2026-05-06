// === STATIC SNAPSHOT BOOTSTRAP — généré par export.sh ===
// Ne pas modifier : régénéré à chaque export.
(function () {
  const PREFIX = 'dashboard-sante-';
  const _set = Storage.prototype.setItem;
  const _del = Storage.prototype.removeItem;
  Storage.prototype.setItem = function (k, v) {
    if (typeof k === 'string' && k.indexOf(PREFIX) === 0) return;
    return _set.call(this, k, v);
  };
  Storage.prototype.removeItem = function (k) {
    if (typeof k === 'string' && k.indexOf(PREFIX) === 0) return;
    return _del.call(this, k);
  };

  function freeze() {
    document.querySelectorAll('[contenteditable="true"], [contenteditable=""]').forEach(function (el) {
      el.setAttribute('contenteditable', 'false');
      el.classList.add('editable');
    });
    document.querySelectorAll('[draggable="true"]').forEach(function (el) {
      el.removeAttribute('draggable');
    });
    const MUTATING = /(addAlim|delAlim|chgQty|setQty|addSupp|delSupp|exportFoods|importFoods|saveAsDefaults|resetFoods|resetAll|resetChecklist|resetTimelineOrder|exportStaticHTML)/;
    document.querySelectorAll('button, label.aliment-btn').forEach(function (el) {
      const onclick = el.getAttribute('onclick') || '';
      if (MUTATING.test(onclick)) el.remove();
    });
    document.querySelectorAll('input[type="file"]').forEach(function (el) {
      const wrap = el.closest('label');
      if (wrap) wrap.remove(); else el.remove();
    });
    document.querySelectorAll('input[type="number"], input[type="text"], textarea, select').forEach(function (el) {
      el.setAttribute('disabled', '');
    });
    document.querySelectorAll('.tl-check').forEach(function (el) {
      el.setAttribute('disabled', '');
      el.style.pointerEvents = 'none';
    });
    document.querySelectorAll('.aliment-actions, .checklist-header .cl-actions').forEach(function (el) {
      const hasContent = Array.from(el.children).some(function (c) { return c.id !== 'save-status'; });
      if (!hasContent) el.style.display = 'none';
    });
    document.querySelectorAll('[data-export-skip]').forEach(function (el) { el.remove(); });
    document.documentElement.setAttribute('data-static', '1');
  }

  function run() { freeze(); setTimeout(freeze, 50); setTimeout(freeze, 300); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
