function showTab(id) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  event.target.classList.add('active');
  window.scrollTo({top: document.querySelector('.tabs').offsetTop - 20, behavior:'smooth'});
}
function toggleVig(el) {
  el.closest('.vig-card').classList.toggle('open');
}

// ==================== ÉTAT MUTABLE ====================
// Les défauts (defaultFoods, foodGroups, defaultSupplements, defaultProfile,
// OMEGA, BCAA_PCT, PROT_SOURCES, FIBRE_SOL_PCT, MUCILAGE_FOODS, PECTINE_FOODS,
// BETA_GLUCANE_FOODS, ZINC_FROM_FOOD, ZINC_FROM_MULTI, ZINC_UL, NA_AJR_MAX,
// SALT_TARGET_MAX, K_TARGET_HIGH, SELENIUM_UL, SELENIUM_FROM_MULTI,
// SELENIUM_PER_G_NOIX_BRESIL, EPA_DHA_SUPP_G, EPA_DHA_FOOD_G, LEUCINE_PCT_OF_BCAA)
// sont définis dans `dashboard-sante-config.js`, chargé AVANT ce fichier.
let foods       = JSON.parse(JSON.stringify(defaultFoods));
let supplements = JSON.parse(JSON.stringify(defaultSupplements));
let profile     = { ...defaultProfile };
let mixOleagineux = JSON.parse(JSON.stringify(defaultMixOleagineux));

const STORAGE_KEY     = 'dashboard-sante-foods-v1';
const PROFILE_KEY     = 'dashboard-sante-profile-v1';
const SUPPLEMENTS_KEY = 'dashboard-sante-supplements-v1';
const CHECKLIST_KEY   = 'dashboard-sante-checklist-v1';
const MIX_OLEAGINEUX_KEY = 'dashboard-sante-mix-oleagineux-v1';
const TARGETS_KEY        = 'dashboard-sante-targets-v1';
const ORDER_KEY_PREFIX = 'dashboard-sante-order-v1-';
const REORDERABLE_TABS = ['routine', 'jeune'];
let saveStatusTimer = null;

function showSaveStatus(text) {
  const el = document.getElementById('save-status');
  if (!el) return;
  el.textContent = text;
  clearTimeout(saveStatusTimer);
  saveStatusTimer = setTimeout(() => { el.textContent = ''; }, 1800);
}

function saveFoodsToStorage() {
  const data = {};
  for (const id of Object.keys(foods)) data[id] = foods[id].qty;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), qty: data }));
    showSaveStatus('✓ Sauvegardé');
  } catch(err) {
    showSaveStatus('✗ Sauvegarde impossible');
  }
}

function saveProfile() {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    showSaveStatus('✓ Sauvegardé');
  } catch(err) {
    showSaveStatus('✗ Sauvegarde impossible');
  }
}

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return false;
    for (const k of Object.keys(defaultProfile)) {
      const dv = data[k];
      const expected = typeof defaultProfile[k];
      if (expected === 'number' && typeof dv === 'number' && isFinite(dv) && dv >= 0) {
        profile[k] = dv;
      } else if (expected === 'string' && typeof dv === 'string') {
        profile[k] = dv;
      }
    }
    return true;
  } catch(err) {
    return false;
  }
}

function loadFoodsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    const data = parsed && parsed.qty ? parsed.qty : parsed;
    if (!data || typeof data !== 'object') return false;
    for (const id of Object.keys(data)) {
      if (foods[id] && typeof data[id] === 'number' && data[id] >= 0) {
        foods[id].qty = data[id];
      }
    }
    // Migration : fusionne les anciennes clés selPD/selChia/selDiner si présentes et qu'aucun "sel" n'a été enregistré
    const legacy = ['selPD','selChia','selDiner'].map(k => typeof data[k] === 'number' ? data[k] : null);
    if (foods.sel && data.sel === undefined && legacy.some(v => v !== null)) {
      foods.sel.qty = legacy.reduce((s,v) => s + (v || 0), 0);
    }
    return true;
  } catch(err) {
    return false;
  }
}

function saveSupplements() {
  const data = {};
  for (const id of Object.keys(supplements)) data[id] = supplements[id].qty;
  try {
    localStorage.setItem(SUPPLEMENTS_KEY, JSON.stringify(data));
    showSaveStatus('✓ Sauvegardé');
  } catch(err) {
    showSaveStatus('✗ Sauvegarde impossible');
  }
}

function loadSupplements() {
  try {
    const raw = localStorage.getItem(SUPPLEMENTS_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return false;
    for (const id of Object.keys(data)) {
      if (supplements[id] && typeof data[id] === 'number' && data[id] >= 0) {
        supplements[id].qty = data[id];
      }
    }
    return true;
  } catch(err) {
    return false;
  }
}

// ──────── MIX OLÉAGINEUX (config par parts + total) ────────
// L'utilisateur définit la dose journalière totale + les parts relatives.
// Les qty individuelles sont dérivées : qty[id] = (parts[id] / Σparts) × total.
// Le résultat est arrondi à 0,1g pour rester lisible. Les apports finaux
// (kcal/prot/k/...) restent calculés à partir de foods[id].qty comme avant.
function saveMixOleagineux() {
  try {
    localStorage.setItem(MIX_OLEAGINEUX_KEY, JSON.stringify(mixOleagineux));
    showSaveStatus('✓ Sauvegardé');
  } catch (err) {
    showSaveStatus('✗ Sauvegarde impossible');
  }
}

function loadMixOleagineux() {
  try {
    const raw = localStorage.getItem(MIX_OLEAGINEUX_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return false;
    if (typeof data.total === 'number' && data.total >= 0) mixOleagineux.total = data.total;
    if (data.parts && typeof data.parts === 'object') {
      for (const id of MIX_OLEAGINEUX_IDS) {
        const v = data.parts[id];
        if (typeof v === 'number' && v >= 0) mixOleagineux.parts[id] = v;
      }
    }
    return true;
  } catch (err) {
    return false;
  }
}

// ==================== TARGETS — édition inline + persistence ====================

function saveTargets() {
  try {
    const data = { targets:{}, macroSplit:{} };
    for (const m of Object.keys(TARGETS))            data.targets[m]    = TARGETS[m];
    for (const k of Object.keys(MACRO_SPLIT_TARGET)) data.macroSplit[k] = MACRO_SPLIT_TARGET[k];
    localStorage.setItem(TARGETS_KEY, JSON.stringify(data));
    showSaveStatus('✓ Objectif sauvegardé');
  } catch (e) { /* silent */ }
}

function loadTargets() {
  try {
    const raw = localStorage.getItem(TARGETS_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data) return false;
    if (data.targets && typeof data.targets === 'object') {
      for (const m of Object.keys(data.targets)) {
        if (TARGETS[m] && typeof data.targets[m] === 'object') {
          TARGETS[m] = { ...TARGETS[m], ...data.targets[m] };
        }
      }
    }
    if (data.macroSplit && typeof data.macroSplit === 'object') {
      for (const k of Object.keys(data.macroSplit)) {
        if (MACRO_SPLIT_TARGET[k] && typeof data.macroSplit[k] === 'object') {
          MACRO_SPLIT_TARGET[k] = { ...MACRO_SPLIT_TARGET[k], ...data.macroSplit[k] };
        }
      }
    }
    return true;
  } catch (e) { return false; }
}

// Format affichable d'une target. Ex : { good:[1000,2000], unit:'mg' } → "1000-2000 mg"
function formatTargetText(metric) {
  const t = TARGETS[metric];
  if (!t || !Array.isArray(t.good) || t.good.length !== 2) return '—';
  const [lo, hi] = t.good;
  const u = t.unit || '';
  // Cas "max seul" : lo=0 et warnHigh défini → "≤hi unit"
  if (lo === 0 && hi > 0)             return `≤${fmt(hi)} ${u}`.trim();
  // Cas "min seul" : hi très élevé (>1e6) → "≥lo unit"
  if (hi >= 1e6)                       return `≥${fmt(lo)} ${u}`.trim();
  return `${fmt(lo)}-${fmt(hi)} ${u}`.trim();
}

// Parse "1000-2000" / "≤2300" / "≥110" / "1000+" → { lo, hi }
function parseTargetText(txt) {
  if (typeof txt !== 'string') return null;
  const cleaned = txt.replace(/[^0-9.,\-≤≥<>=+\s]/g, '').replace(/\s+/g, '');
  if (!cleaned) return null;
  // ≤ ou <=
  if (/^(≤|<=)/.test(cleaned)) {
    const v = parseFloat(cleaned.replace(/^(≤|<=)/, '').replace(',', '.'));
    if (!isFinite(v) || v < 0) return null;
    return { lo: 0, hi: v };
  }
  // ≥ ou >= ou trailing "+"
  if (/^(≥|>=)/.test(cleaned) || /\+$/.test(cleaned)) {
    const v = parseFloat(cleaned.replace(/^(≥|>=)/, '').replace(/\+$/, '').replace(',', '.'));
    if (!isFinite(v) || v < 0) return null;
    return { lo: v, hi: 1e9 };
  }
  // "lo-hi"
  const m = cleaned.match(/^(-?\d+(?:[.,]\d+)?)-(-?\d+(?:[.,]\d+)?)$/);
  if (m) {
    const lo = parseFloat(m[1].replace(',', '.'));
    const hi = parseFloat(m[2].replace(',', '.'));
    if (!isFinite(lo) || !isFinite(hi) || hi < lo) return null;
    return { lo, hi };
  }
  // Valeur seule → traitée comme min
  const v = parseFloat(cleaned.replace(',', '.'));
  if (isFinite(v) && v >= 0) return { lo: v, hi: 1e9 };
  return null;
}

// Restitue le texte de chaque cible éditable dans le DOM
function renderTargets() {
  document.querySelectorAll('[data-target-edit]').forEach(el => {
    const metric = el.dataset.targetEdit;
    if (!TARGETS[metric]) return;
    el.textContent = formatTargetText(metric);
    if (el.contentEditable !== 'true') {
      el.contentEditable = 'true';
      el.classList.add('editable');
      el.spellcheck = false;
      el.title = "Cliquer pour éditer · format : min-max, ≤max ou ≥min";
    }
  });
  // Cibles % macros (P/G/L)
  document.querySelectorAll('[data-macro-split-edit]').forEach(el => {
    const macro = el.dataset.macroSplitEdit;
    if (!MACRO_SPLIT_TARGET[macro]) return;
    const t = MACRO_SPLIT_TARGET[macro];
    el.textContent = `${fmt(t.good[0])}-${fmt(t.good[1])}%`;
    if (el.contentEditable !== 'true') {
      el.contentEditable = 'true';
      el.classList.add('editable');
      el.spellcheck = false;
      el.title = "Cliquer pour éditer la cible % macros (min-max)";
    }
  });
}

function bindTargetEditors() {
  // [data-target-edit]
  document.querySelectorAll('[data-target-edit]').forEach(el => {
    if (el.__targetBound) return;
    el.__targetBound = true;
    const commit = () => {
      const metric = el.dataset.targetEdit;
      const parsed = parseTargetText(el.textContent);
      if (!parsed) { renderTargets(); return; }
      const orig = TARGETS[metric] || {};
      // On préserve warnLow/warnHigh si compatibles, sinon on les recalcule autour de la cible
      const wLow  = (orig.warnLow !== undefined && orig.warnLow < parsed.lo)
                      ? orig.warnLow : Math.max(0, parsed.lo * 0.7);
      const wHigh = (orig.warnHigh !== undefined && orig.warnHigh > parsed.hi && parsed.hi < 1e8)
                      ? orig.warnHigh : (parsed.hi < 1e8 ? parsed.hi * 1.3 : undefined);
      TARGETS[metric] = { ...orig, good: [parsed.lo, parsed.hi] };
      if (wLow !== undefined)  TARGETS[metric].warnLow  = wLow;
      if (wHigh !== undefined) TARGETS[metric].warnHigh = wHigh;
      saveTargets();
      renderTargets();
      updateAll();
    };
    el.addEventListener('blur', commit);
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
      if (e.key === 'Escape') { e.preventDefault(); renderTargets(); el.blur(); }
    });
  });
  // [data-macro-split-edit]
  document.querySelectorAll('[data-macro-split-edit]').forEach(el => {
    if (el.__macroSplitBound) return;
    el.__macroSplitBound = true;
    const commit = () => {
      const macro = el.dataset.macroSplitEdit;
      const parsed = parseTargetText(el.textContent.replace('%', ''));
      if (!parsed || !MACRO_SPLIT_TARGET[macro]) { renderTargets(); return; }
      MACRO_SPLIT_TARGET[macro].good = [parsed.lo, Math.min(parsed.hi, 100)];
      saveTargets();
      renderTargets();
      updateAll();
    };
    el.addEventListener('blur', commit);
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
      if (e.key === 'Escape') { e.preventDefault(); renderTargets(); el.blur(); }
    });
  });
}

function resetTargetsToDefaults() {
  if (!confirm('Réinitialiser tous les objectifs nutritionnels aux valeurs par défaut ?')) return;
  try { localStorage.removeItem(TARGETS_KEY); } catch (e) {}
  location.reload();
}

function mixPartsSum() {
  return MIX_OLEAGINEUX_IDS.reduce((s, id) => s + (mixOleagineux.parts[id] || 0), 0);
}

function applyMixOleagineuxToFoods() {
  const sum = mixPartsSum();
  if (sum <= 0 || !(mixOleagineux.total > 0)) return;
  for (const id of MIX_OLEAGINEUX_IDS) {
    if (!foods[id]) continue;
    const pct = (mixOleagineux.parts[id] || 0) / sum;
    foods[id].qty = Math.round(mixOleagineux.total * pct * 10) / 10;
  }
}

function exportFoods() {
  const data = { savedAt: new Date().toISOString(), qty: {}, supplements: {} };
  for (const id of Object.keys(foods)) data.qty[id] = foods[id].qty;
  for (const id of Object.keys(supplements)) data.supplements[id] = supplements[id].qty;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0,10);
  a.href = url;
  a.download = `dashboard-sante-config-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showSaveStatus('✓ Exporté');
}

function importFoods(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      const data = parsed && parsed.qty ? parsed.qty : parsed;
      if (!data || typeof data !== 'object') throw new Error('Format inattendu');
      let count = 0, suppCount = 0;
      for (const id of Object.keys(data)) {
        if (foods[id] && typeof data[id] === 'number' && data[id] >= 0) {
          foods[id].qty = data[id];
          count++;
        }
      }
      if (parsed.supplements && typeof parsed.supplements === 'object') {
        for (const id of Object.keys(parsed.supplements)) {
          const v = parsed.supplements[id];
          if (supplements[id] && typeof v === 'number' && v >= 0) {
            supplements[id].qty = v;
            suppCount++;
          }
        }
        saveSupplements();
      }
      saveFoodsToStorage();
      renderAlimentsList();
      updateAll();
      showSaveStatus(`✓ Importé (${count} aliments${suppCount ? ` + ${suppCount} suppl.` : ''})`);
    } catch(err) {
      alert('Fichier invalide : ' + err.message);
    }
  };
  reader.readAsText(file);
}

function fmt(v, decimals=0) {
  if (!isFinite(v)) v = 0;
  const r = Number(v.toFixed(decimals));
  return r.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function compute(ids) {
  const t = { kcal:0, prot:0, k:0, fibre:0, vitC:0, na:0, gluc:0 };
  // Initialiser les micros à 0
  if (typeof MICRO_KEYS !== 'undefined') {
    for (const key of MICRO_KEYS) t[key] = 0;
  }
  for (const id of ids) {
    const f = foods[id];
    if (!f) continue;
    t.kcal  += (f.kcal  || 0) * f.qty;
    t.prot  += (f.prot  || 0) * f.qty;
    t.k     += (f.k     || 0) * f.qty;
    t.fibre += (f.fibre || 0) * f.qty;
    t.vitC  += (f.vitC  || 0) * f.qty;
    t.na    += (f.na    || 0) * f.qty;
    t.gluc  += (f.gluc  || 0) * f.qty;
    // Micronutriments (table parallèle MICRONUTRIENTS)
    if (typeof MICRONUTRIENTS !== 'undefined') {
      const m = MICRONUTRIENTS[id];
      if (m) {
        for (const key of MICRO_KEYS) {
          t[key] += (m[key] || 0) * f.qty;
        }
      }
    }
  }
  return t;
}

function renderAlimentsList() {
  const container = document.getElementById('aliments-list');
  if (!container) return;
  let html = '';
  for (const group of foodGroups) {
    html += `<div class="aliment-group"><div class="aliment-group-title">${group.title}</div>`;

    // Mix oléagineux : ligne "Total" + 6 lignes de parts (qty dérivée), puis
    // les autres ids du groupe (huile / chocolat) en mode qty classique.
    const isMix = group.title === 'Mix oléagineux';
    if (isMix) {
      const sum = mixPartsSum();
      html += `<div class="aliment-row mix-total-row" data-mix-total>
        <span class="aliment-name"><strong>Total quotidien (mix)</strong></span>
        <input type="number" class="qty-input" min="0" step="5" value="${mixOleagineux.total}" data-mix-total-input title="Dose journalière totale du mix d'oléagineux. Les composants sont distribués selon les parts ci-dessous." />
        <span class="aliment-unit">g/j</span>
        <span class="aliment-stats" data-mix-sum>somme parts : ${sum}</span>
      </div>`;
    }

    for (const id of group.ids) {
      const f = foods[id];
      if (!f) continue;
      const isMixPart = isMix && MIX_OLEAGINEUX_IDS.indexOf(id) >= 0;
      if (isMixPart) {
        const sum  = mixPartsSum();
        const part = mixOleagineux.parts[id] || 0;
        const pct  = sum > 0 ? (part / sum * 100) : 0;
        html += `<div class="aliment-row mix-part-row" data-mix-part="${id}">
          <span class="aliment-name">${f.name}</span>
          <input type="number" class="qty-input" min="0" step="1" value="${part}" data-mix-part-input="${id}" title="Part relative — la qté finale = part × total / Σ parts" />
          <span class="aliment-unit">part</span>
          <span class="mix-derived" data-mix-derived="${id}">${pct.toFixed(1)}% → ${f.qty}${f.unit}</span>
          <span class="aliment-stats" data-row-stats="${id}"></span>
        </div>`;
      } else {
        html += `<div class="aliment-row" data-id="${id}">
          <span class="aliment-name">${f.name}</span>
          <input type="number" class="qty-input" min="0" step="${f.step}" value="${f.qty}" data-id="${id}" />
          <span class="aliment-unit">${f.unit}${f.qty > 1 && f.unit === 'pièce' ? 's' : ''}</span>
          <span class="aliment-stats" data-row-stats="${id}"></span>
        </div>`;
      }
    }
    html += `</div>`;
  }

  html += `<div class="aliment-group"><div class="aliment-group-title">Suppléments — dose moyenne / jour</div>`;
  for (const id of Object.keys(supplements)) {
    const s = supplements[id];
    html += `<div class="aliment-row supp-row" data-supp-id="${id}">
      <span class="aliment-name">${s.name}</span>
      <input type="number" class="qty-input" min="0" step="${s.step}" value="${s.qty}" data-supp-id="${id}" />
      <span class="aliment-unit">${s.unit}/j</span>
      <span class="aliment-stats supp-hint">${s.hint}</span>
    </div>`;
  }
  html += `</div>`;

  container.innerHTML = html;
}

function updateRowStats(id) {
  const t = compute([id]);
  const el = document.querySelector(`[data-row-stats="${id}"]`);
  if (!el) return;
  el.innerHTML = `<span class="kcal-val">~${fmt(t.kcal)} kcal</span> · <span class="prot-val">${fmt(t.prot,1)}g prot</span> · <span class="gluc-val">${fmt(t.gluc,1)}g gluc</span> · <span class="k-val">${fmt(t.k)}mg K</span>`;
}

function updateTimelineCards() {
  const suppVitC = supplements.vitC ? supplements.vitC.qty : 0;
  document.querySelectorAll('.tl-card[data-foods]').forEach(card => {
    const ids = card.dataset.foods.split(',').map(s => s.trim()).filter(Boolean);
    if (!ids.length) return;
    const t = compute(ids);
    const setMetric = (metric, text) => {
      const el = card.querySelector(`[data-metric="${metric}"]`);
      if (el) el.textContent = text;
    };
    setMetric('kcal',  `~${fmt(t.kcal)} kcal`);
    setMetric('prot',  `Protéines ~${fmt(t.prot,0)}g`);
    setMetric('k',     `Potassium ~${fmt(t.k)}mg`);
    setMetric('fibre', `Fibres ~${fmt(t.fibre,0)}g`);
    // La carte "Kiwi + Zinc + Vit C" affiche le total alim + supplément en pic au moment du zinc
    const vitCWithSupp = ids.includes('kiwi') ? t.vitC + suppVitC : t.vitC;
    setMetric('vitC',  `Vit C ~${fmt(vitCWithSupp)}mg`);
    setMetric('na',    `Sodium ~${fmt(t.na)}mg`);
    setMetric('gluc',  `Glucides ~${fmt(t.gluc,0)}g`);
  });
}

function setAll(selector, text) {
  document.querySelectorAll(selector).forEach(el => el.textContent = text);
}

// Classe une valeur par rapport à un intervalle TARGETS : 'ok' | 'warn' | 'bad'
function classifyTarget(metric, value) {
  const t = TARGETS[metric];
  if (!t || !Array.isArray(t.good) || t.good.length !== 2) return 'ok';
  const [lo, hi] = t.good;
  if (value >= lo && value <= hi) return 'ok';
  if (value > hi) {
    if (t.warnHigh !== undefined && value > t.warnHigh) return 'bad';
    return 'warn';
  }
  // value < lo
  if (t.warnLow !== undefined && value < t.warnLow) return 'bad';
  return 'warn';
}

// Applique 'warn' / 'bad' (ou retire les deux) à tous les éléments concernés
function applyStatusClass(selector, status) {
  document.querySelectorAll(selector).forEach(el => {
    el.classList.remove('warn', 'bad');
    if (status === 'warn') el.classList.add('warn');
    else if (status === 'bad') el.classList.add('bad');
  });
}

function updateTotals() {
  const total = compute(Object.keys(foods));
  const foodNoWhey = compute(Object.keys(foods).filter(id => id !== 'whey'));
  const suppVitC = supplements.vitC ? supplements.vitC.qty : 0;
  const suppZinc = supplements.zinc ? supplements.zinc.qty : 0;

  setAll('[data-total="kcal"]',  `~${fmt(total.kcal)} kcal`);
  setAll('[data-total="prot"]',  `~${fmt(total.prot,0)}g`);
  setAll('[data-total="k"]',     `~${fmt(total.k)} mg`);
  setAll('[data-total="fibre"]', `~${fmt(total.fibre,0)}g`);
  setAll('[data-total="vitC"]',  `~${fmt(total.vitC)} mg`);
  setAll('[data-total="na"]',    `~${fmt(total.na)} mg`);
  setAll('[data-total="gluc"]',  `~${fmt(total.gluc,0)}g`);

  setAll('[data-stat-card="kcal"]',  `~${fmt(total.kcal)} kcal`);
  setAll('[data-stat-card="prot"]',  `~${fmt(total.prot,0)}g`);
  setAll('[data-stat-card="k"]',     `~${fmt(total.k)} mg`);
  setAll('[data-stat-card="fibre"]', `~${fmt(total.fibre,0)}g`);
  setAll('[data-stat-card="vitC"]',  `~${fmt(total.vitC)} mg`);
  setAll('[data-stat-card="na"]',    `~${fmt(total.na)} mg`);
  setAll('[data-stat-card="gluc"]',  `~${fmt(total.gluc,0)}g`);

  // Tableau Macros & Micros — colonne "Source alimentaire"
  setAll('[data-food="kcal"]',     `~${fmt(total.kcal)} kcal`);
  setAll('[data-food="prot"]',     `~${fmt(foodNoWhey.prot,0)}g`);
  setAll('[data-food="k"]',        `~${fmt(total.k)} mg`);
  setAll('[data-food="fibre"]',    `~${fmt(total.fibre,0)}g`);
  setAll('[data-food="vitC"]',     `~${fmt(total.vitC)} mg`);
  setAll('[data-food="na"]',       `~${fmt(total.na)} mg`);
  setAll('[data-food="gluc"]',     `~${fmt(total.gluc,0)}g`);

  // Tableau — colonne "Total" (alim + supplément)
  setAll('[data-grand="kcal"]',    `~${fmt(total.kcal)} kcal`);
  setAll('[data-grand="prot"]',    `~${fmt(total.prot,0)}g`);
  setAll('[data-grand="k"]',       `~${fmt(total.k)} mg`);
  setAll('[data-grand="fibre"]',   `~${fmt(total.fibre,0)}g`);
  setAll('[data-grand="vitC"]',    `~${fmt(total.vitC + suppVitC)} mg`);
  setAll('[data-grand="na"]',      `~${fmt(total.na)} mg`);
  setAll('[data-grand="gluc"]',    `~${fmt(total.gluc,0)}g`);
  setAll('[data-grand="zinc"]',    `~${fmtFr(ZINC_FROM_FOOD + suppZinc + ZINC_FROM_MULTI, 1)}`);

  // Affichage de la dose dans les libellés "Supplément" (col. milieu)
  setAll('[data-supp-display="vitC"]', fmtFr(suppVitC, 0));
  setAll('[data-supp-display="zinc"]', fmtFr(suppZinc, 1));

  // Coloration dynamique des cartes de stats et des totaux selon TARGETS
  // (vitC : on prend l'apport total alim + supplément, plus représentatif)
  const valuesForTarget = {
    kcal:  total.kcal,
    prot:  total.prot,
    gluc:  total.gluc,
    fibre: total.fibre,
    k:     total.k,
    vitC:  total.vitC + suppVitC,
    na:    total.na
  };
  for (const metric of Object.keys(valuesForTarget)) {
    const status = classifyTarget(metric, valuesForTarget[metric]);
    applyStatusClass(`[data-total="${metric}"]`,         status);
    applyStatusClass(`[data-stat-card="${metric}"]`,     status);
    applyStatusClass(`[data-grand="${metric}"]`,         status);
    applyStatusClass(`[data-status-mirror="${metric}"]`, status);
  }

  // Zinc et sélénium — pas de TARGETS standard, on classe selon les seuils RDA / UL
  const zincGrand = ZINC_FROM_FOOD + ZINC_FROM_MULTI + suppZinc;
  let zincStatus;
  if (zincGrand < 11 || zincGrand >= 50)        zincStatus = 'bad';
  else if (zincGrand > 37)                       zincStatus = 'warn';
  else                                            zincStatus = 'ok';
  applyStatusClass(`[data-grand="zinc"]`, zincStatus);

  const noixBQty = foods.noixBresil ? foods.noixBresil.qty : 0;
  const seGrand = noixBQty * SELENIUM_PER_G_NOIX_BRESIL + SELENIUM_FROM_MULTI;
  let seStatus;
  if (seGrand < 70 || seGrand >= 300)            seStatus = 'bad';
  else if (seGrand > 280)                         seStatus = 'warn';
  else                                            seStatus = 'ok';
  applyStatusClass(`[data-derived="selenium"]`, seStatus);

  // Vit C par aliment précis (ex. kiwi affiché dans la routine)
  // HTML normalise les attributs en minuscules → dataset.foodVitc (c minuscule)
  document.querySelectorAll('[data-food-vitc]').forEach(el => {
    const id = el.dataset.foodVitc;
    if (!foods[id]) return;
    el.textContent = fmt(foods[id].vitC * foods[id].qty);
  });

  // Vit C en pic au moment du zinc à 16h (kiwi alim + suppl Innovit)
  const kiwiVitC = foods.kiwi ? foods.kiwi.vitC * foods.kiwi.qty : 0;
  setAll('[data-derived="vitCAt16h"]', fmt(kiwiVitC + suppVitC));

  // ---- Micronutriments : alim / supplément / total + coloration ----
  if (typeof MICRO_KEYS !== 'undefined') {
    for (const m of MICRO_KEYS) {
      const foodVal  = total[m] || 0;
      const suppVal  = (typeof SUPPLEMENT_CONTRIBUTIONS !== 'undefined' && SUPPLEMENT_CONTRIBUTIONS[m]) || 0;
      const grandVal = foodVal + suppVal;
      const t = TARGETS[m];
      const u = (t && t.unit) || '';
      // 1 décimale pour micros à petites valeurs (mg ≤ ~10, µg ≤ ~10)
      const dec = (['cu','mn','b1','b2','b3','b5','b6','b12','vitD','vitK2'].includes(m)) ? 1 : 0;
      setAll(`[data-food="${m}"]`,  `~${fmtFr(foodVal, dec)} ${u}`.trim());
      setAll(`[data-supp="${m}"]`,  suppVal > 0 ? `~${fmtFr(suppVal, dec)} ${u}`.trim() : '—');
      setAll(`[data-grand="${m}"]`, `~${fmtFr(grandVal, dec)} ${u}`.trim());
      if (t) {
        const status = classifyTarget(m, grandVal);
        applyStatusClass(`[data-grand="${m}"]`, status);
        applyStatusClass(`[data-food="${m}"]`,  status);
      }
    }
  }

  // Ratio Zn / Cu (informatif — cible idéale 0,7-1,0)
  const cuTotal = (total.cu || 0) + ((typeof SUPPLEMENT_CONTRIBUTIONS !== 'undefined' && SUPPLEMENT_CONTRIBUTIONS.cu) || 0);
  if (cuTotal > 0) {
    const znTotal = ZINC_FROM_FOOD + ZINC_FROM_MULTI + suppZinc;
    const znCuRatio = znTotal / cuTotal;
    setAll('[data-derived="znCuRatio"]', fmtFr(znCuRatio, 1));
  }

  // Mise à jour du texte des cibles (au cas où l'utilisateur les a éditées)
  renderTargets();
}

// ==================== Profil éditable & valeurs dérivées ====================

function fmtFr(v, decimals=0) {
  if (!isFinite(v)) v = 0;
  return Number(v.toFixed(decimals)).toString().replace('.', ',');
}

function formatProfile(key, v) {
  if (key === 'water') return fmtFr(v, 1);
  return fmtFr(v, 0);
}

function capitalize(s) { return typeof s === 'string' && s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

function renderProfile() {
  document.querySelectorAll('[data-edit]').forEach(el => {
    const key = el.dataset.edit;
    if (profile[key] === undefined) return;
    el.textContent = formatProfile(key, profile[key]);
    if (el.contentEditable !== 'true') {
      el.contentEditable = 'true';
      el.classList.add('editable');
      el.spellcheck = false;
    }
  });
  document.querySelectorAll('[data-edit-text]').forEach(el => {
    const key = el.dataset.editText;
    if (typeof profile[key] !== 'string') return;
    el.textContent = capitalize(profile[key]);
    if (el.contentEditable !== 'true') {
      el.contentEditable = 'true';
      el.classList.add('editable');
      el.spellcheck = false;
      el.title = "Tapez 'homme' ou 'femme'";
    }
  });
  document.querySelectorAll('[data-edit-food]').forEach(el => {
    const id = el.dataset.editFood;
    if (!foods[id]) return;
    el.textContent = fmtFr(foods[id].qty, 1).replace(/[,.]0$/, '');
    if (el.contentEditable !== 'true') {
      el.contentEditable = 'true';
      el.classList.add('editable');
      el.spellcheck = false;
    }
  });
}

function updateDescriptions() {
  document.querySelectorAll('[data-qty]').forEach(el => {
    const id = el.dataset.qty;
    if (foods[id]) el.textContent = fmt(foods[id].qty);
  });
}

function updateDerived() {
  const total = compute(Object.keys(foods));
  const w = profile.weight || 1;
  const suppZinc = supplements.zinc ? supplements.zinc.qty : 0;

  // Protéines par kg de poids corporel
  setAll('[data-derived="protPerKg"]', fmtFr(total.prot / w, 2));

  // Protéines de la whey (qty whey × densité prot)
  if (foods.whey) {
    setAll('[data-derived="wheyProt"]', fmt(foods.whey.qty * foods.whey.prot, 0));
  }

  // Total mix oléagineux (en grammes)
  const oleagIds = ['noix','noixBresil','noisettes','grainesCourge','amandes','nigelle'];
  const oleagTotal = oleagIds.reduce((s, id) => s + (foods[id] ? foods[id].qty : 0), 0);
  setAll('[data-derived="oleagineuxTotal"]', fmt(oleagTotal));

  // Kcal du mix oléagineux + sa part dans le total
  const oleagKcal = oleagIds.reduce((s, id) => s + (foods[id] ? foods[id].qty * (foods[id].kcal || 0) : 0), 0);
  setAll('[data-derived="oleagKcal"]',    fmt(oleagKcal));
  if (total.kcal > 0) {
    setAll('[data-derived="oleagPctKcal"]', fmt((oleagKcal / total.kcal) * 100));
  }

  // Glucides des dattes (Medjool ~16 g nets / pièce 24 g — CIQUAL)
  const dattesFood = foods.dattes;
  const dattesGluc = dattesFood ? dattesFood.qty * (dattesFood.gluc || 0) : 0;
  setAll('[data-derived="dattesGluc"]', fmt(dattesGluc));

  // Sodium / potassium — ratios et pourcentages
  const naK = total.k > 0 ? total.na / total.k : 0;
  const naPctAjr = (total.na / NA_AJR_MAX) * 100;
  const kPctHigh = (total.k / K_TARGET_HIGH) * 100;
  setAll('[data-derived="naK"]',        fmtFr(naK, 2));
  setAll('[data-derived="naPctAjr"]',   fmt(naPctAjr));
  setAll('[data-derived="kPctHigh"]',   fmt(kPctHigh));

  // Sel ajouté — valeur courante + sodium qu'il apporte + visibilité du conseil
  const saltQty = foods.sel ? foods.sel.qty : 0;
  const saltNa  = saltQty * (foods.sel ? foods.sel.na : 387);
  setAll('[data-derived="saltCurrent"]', fmtFr(saltQty, 1).replace(/[,.]0$/, ''));
  setAll('[data-derived="saltNa"]',      fmt(saltNa));
  document.querySelectorAll('[data-salt-advice]').forEach(el => {
    el.style.display = saltQty > SALT_TARGET_MAX ? '' : 'none';
  });

  // Zinc total = alim + multi + suppl
  const zincTotal = ZINC_FROM_FOOD + ZINC_FROM_MULTI + suppZinc;
  const znPctUl = (zincTotal / ZINC_UL) * 100;
  setAll('[data-derived="znPctUl"]', fmt(znPctUl));

  // Sélénium = noix du Brésil × densité + multi
  const noixBQty = foods.noixBresil ? foods.noixBresil.qty : 0;
  const seleniumFood = noixBQty * SELENIUM_PER_G_NOIX_BRESIL;
  const seleniumTotal = seleniumFood + SELENIUM_FROM_MULTI;
  const sePctUl = (seleniumTotal / SELENIUM_UL) * 100;
  setAll('[data-derived="seleniumFood"]', fmt(seleniumFood));
  setAll('[data-derived="selenium"]',     fmt(seleniumTotal));
  setAll('[data-derived="sePctUl"]',      fmt(sePctUl));

  // Mise à jour des barres de mesure (vig-meter-fill)
  document.querySelectorAll('[data-meter]').forEach(el => {
    const key = el.dataset.meter;
    let pct = 0;
    if (key === 'naPctAjr') pct = naPctAjr;
    else if (key === 'kPctHigh') pct = kPctHigh;
    else if (key === 'znPctUl') pct = znPctUl;
    else if (key === 'sePctUl') pct = sePctUl;
    else if (key === 'protPerKg') pct = (total.prot / w) / 2 * 100; // 2 g/kg = 100%
    el.style.width = Math.min(120, Math.max(0, pct)) + '%';
  });

  // Profil — valeurs brutes (les unités restent dans le HTML)
  setAll('[data-profile="water"]',      fmtFr(profile.water, 1));
  setAll('[data-profile="sportHours"]', fmtFr(profile.sportHours, 0));
  setAll('[data-profile="weight"]',     fmtFr(profile.weight, 0));
  setAll('[data-profile="height"]',     fmtFr(profile.height, 0));
}

document.addEventListener('blur', e => {
  const t = e.target;
  if (!t.dataset) return;
  if (t.dataset.edit) {
    const key = t.dataset.edit;
    if (profile[key] === undefined) return;
    const text = (t.textContent || '').trim().replace(',', '.');
    const v = parseFloat(text);
    if (isFinite(v) && v >= 0) {
      profile[key] = v;
      saveProfile();
    }
    t.textContent = formatProfile(key, profile[key]);
    updateAll();
    return;
  }
  if (t.dataset.editText) {
    const key = t.dataset.editText;
    if (typeof profile[key] !== 'string') return;
    const raw = (t.textContent || '').trim().toLowerCase();
    if (raw === 'homme' || raw === 'femme') {
      profile[key] = raw;
      saveProfile();
    }
    t.textContent = capitalize(profile[key]);
    updateAll();
    return;
  }
  if (t.dataset.editFood) {
    const id = t.dataset.editFood;
    if (!foods[id]) return;
    const text = (t.textContent || '').trim().replace(',', '.');
    const v = parseFloat(text);
    if (isFinite(v) && v >= 0) {
      foods[id].qty = v;
      saveFoodsToStorage();
      renderAlimentsList();
    }
    t.textContent = fmtFr(foods[id].qty, 1).replace(/[,.]0$/, '');
    updateAll();
  }
}, true);

document.addEventListener('keydown', e => {
  const t = e.target;
  if (!t.dataset || (!t.dataset.edit && !t.dataset.editFood)) return;
  if (e.key === 'Enter') { e.preventDefault(); t.blur(); }
});

// ==================== VIGILANCE — niveaux, titres et conseils dynamiques ====================
const VIG_LEVELS = {
  critical: { label:'Critique',      sev:'sev-critical', lvl:'lvl-critical' },
  high:     { label:'Élevé',         sev:'sev-high',     lvl:'lvl-high' },
  medium:   { label:'Moyen',         sev:'sev-medium',   lvl:'lvl-medium' },
  low:      { label:'Résolu',        sev:'sev-low',      lvl:'lvl-low' },
  watch:    { label:'Surveillance',  sev:'sev-watch',    lvl:'lvl-watch' }
};
const VIG_SEV_CLASSES = ['sev-critical','sev-high','sev-medium','sev-low','sev-watch'];
const VIG_LVL_CLASSES = ['lvl-critical','lvl-high','lvl-medium','lvl-low','lvl-watch'];

function applyVigStatus(id, status) {
  const card = document.querySelector(`.vig-card[data-vig-id="${id}"]`);
  if (!card) return;
  const meta = VIG_LEVELS[status.level];
  if (meta) {
    const sev = card.querySelector('.vig-severity');
    if (sev) {
      sev.classList.remove(...VIG_SEV_CLASSES);
      sev.classList.add(meta.sev);
    }
    const lvl = card.querySelector('.vig-level');
    if (lvl) {
      lvl.classList.remove(...VIG_LVL_CLASSES);
      lvl.classList.add(meta.lvl);
      lvl.textContent = meta.label;
    }
  }
  if (status.title    !== undefined) {
    const t = card.querySelector('[data-vig-title]');
    if (t) t.innerHTML = status.title;
  }
  if (status.subtitle !== undefined) {
    const s = card.querySelector('[data-vig-subtitle]');
    if (s) s.innerHTML = status.subtitle;
  }
  if (status.advice   !== undefined) {
    const a = card.querySelector('[data-vig-advice]');
    if (a) a.innerHTML = status.advice;
  }
}

function vigSodium(saltQty, naK, na, k) {
  const naKf  = fmtFr(naK, 2);
  const saltF = fmtFr(saltQty, 1).replace(/[,.]0$/, '');
  const naF   = fmt(na);
  const kF    = fmt(k);
  if (saltQty <= 5 && naK <= 0.6) {
    return {
      level: 'low',
      title: 'Sodium maîtrisé — ratio Na/K équilibré ✅',
      subtitle: `Potassium ~${kF} mg ✅ — Sodium ~${naF} mg (≤ AJR) — Ratio ${naKf}:1`,
      advice: `<strong>Excellent :</strong> ratio Na/K à ${naKf}:1 (cible ≤1:1), sel ajouté à ${saltF} g/j (cible ≤5 g). Aucun ajustement requis — maintenir.`
    };
  }
  if (saltQty <= 8 && naK <= 1.0) {
    return {
      level: 'medium',
      title: 'Sodium modéré — ratio Na/K à surveiller',
      subtitle: `Potassium ~${kF} mg — Sodium ~${naF} mg — Ratio ${naKf}:1 (cible ≤1:1)`,
      advice: `<strong>À surveiller :</strong> ratio Na/K à ${naKf}:1, sel à ${saltF} g/j (cible ≤5 g). Continuer à privilégier les aliments riches en potassium ; viser à descendre le sel à ≤5 g.`
    };
  }
  return {
    level: 'high',
    title: 'Sodium élevé — ratio Na/K déséquilibré',
    subtitle: `Potassium ~${kF} mg ✅ — Sodium ~${naF} mg (cible ≤2 300 mg)`,
    advice: `<strong>Ratio Na/K :</strong> ${naKf}:1 (idéal ≤1:1). Sel ajouté actuel : ${saltF} g/j. Réduire le sel (édit. dans l'en-tête ou onglet Aliments) pour faire descendre le ratio.`
  };
}

function vigZinc(zincTotal) {
  const zF = fmtFr(zincTotal, 1);
  const pct = fmt((zincTotal / ZINC_UL) * 100);
  if (zincTotal < 11) {
    return {
      level: 'high',
      title: `Zinc ${zF}mg/j — apports insuffisants`,
      subtitle: `RDA homme = 11 mg/j. Total alim + multi + suppl. = ${zF} mg.`,
      advice: `<strong>Risque carence :</strong> apports sous la RDA. Augmenter zinc alimentaire (huîtres, viande rouge, oléagineux) ou ajouter zinc bisglycinate.`
    };
  }
  if (zincTotal <= 25) {
    return {
      level: 'low',
      title: `Zinc ${zF}mg/j — apports optimaux ✅`,
      subtitle: `Multi (Zn bisglycinate) + WW <span data-supp-display="zinc">0</span>mg + alimentation ~8mg`,
      advice: `<strong>Bien :</strong> apports dans la fourchette optimale (11-25 mg). Multi + alimentation suffisent — pas besoin d'augmenter le suppl. séparé.`
    };
  }
  if (zincTotal <= 37) {
    return {
      level: 'medium',
      title: `Zinc ${zF}mg/j — apports élevés (${pct}% UL)`,
      subtitle: `Multi (Zn bisglycinate) + WW <span data-supp-display="zinc">0</span>mg + alimentation ~8mg`,
      advice: `<strong>À surveiller :</strong> au-dessus de la RDA mais sous l'UL EFSA (40 mg). Le multi (Cu bisglycinate) compense partiellement. Bilan Zn/Cu sérique annuel recommandé.`
    };
  }
  if (zincTotal <= 49) {
    return {
      level: 'high',
      title: `Zinc ${zF}mg/j — proche limite EFSA 40mg`,
      subtitle: `Multi (Zn bisglycinate) + WW <span data-supp-display="zinc">0</span>mg + alimentation ~8mg`,
      advice: `<strong>Risque :</strong> déplétion cuivre en cas d'excès chronique. Le multi Vit4ever contient du cuivre bisglycinate — compense partiellement. Prendre le zinc WW 1j/2 les jours de viande rouge.`
    };
  }
  return {
    level: 'critical',
    title: `Zinc ${zF}mg/j — au-delà de l'UL EFSA`,
    subtitle: `Multi (Zn bisglycinate) + WW <span data-supp-display="zinc">0</span>mg + alimentation ~8mg`,
    advice: `<strong>Action :</strong> arrêter le zinc séparé sous 1 semaine. Bilan Zn/Cu sérique. Surveiller signes de carence cuivre (fatigue, anémie, infections).`
  };
}

function vigSelenium(seleniumTotal, seleniumFood) {
  const seF      = fmt(seleniumTotal);
  const seFoodF  = fmt(seleniumFood);
  const sePctUlF = fmt((seleniumTotal / SELENIUM_UL) * 100);
  if (seleniumTotal < 70) {
    return {
      level: 'high',
      title: `Sélénium ${seF}µg/j — apports insuffisants`,
      subtitle: `Noix du Brésil (~${seFoodF}µg) + multi (~55µg). RDA = 70µg.`,
      advice: `<strong>Risque carence :</strong> apports sous la RDA (70µg). Ajouter 2-3 noix du Brésil par jour suffit largement.`
    };
  }
  if (seleniumTotal <= 200) {
    return {
      level: 'low',
      title: `Sélénium ${seF}µg/j — apports optimaux ✅`,
      subtitle: `Noix du Brésil (~${seFoodF}µg) + multi (~55µg). UL = 300µg.`,
      advice: `<strong>Bien :</strong> 2-3 noix du Brésil + multi couvrent l'apport sans risque de sélénose. Maintenir.`
    };
  }
  if (seleniumTotal <= 280) {
    return {
      level: 'medium',
      title: `Sélénium ${seF}µg/j — fourchette haute (${sePctUlF}% UL)`,
      subtitle: `Noix du Brésil (~${seFoodF}µg) + multi (~55µg). UL = 300µg.`,
      advice: `<strong>Le contexte :</strong> 2-3 noix du Brésil par jour couvrent largement les besoins. Avec le multi en plus, vous êtes à ${sePctUlF}% de la limite haute. Ne pas augmenter au-delà de 8-10g de noix du Brésil. Signes de sélénose : cheveux cassants, ongles fragiles, haleine aillée, fatigue.`
    };
  }
  if (seleniumTotal < 300) {
    return {
      level: 'high',
      title: `Sélénium ${seF}µg/j — proche UL (${sePctUlF}%)`,
      subtitle: `Noix du Brésil (~${seFoodF}µg) + multi (~55µg). UL = 300µg.`,
      advice: `<strong>Vigilance :</strong> très proche de l'UL (300µg). Réduire les noix du Brésil à 4-6g/j ou alterner 1j/2.`
    };
  }
  return {
    level: 'critical',
    title: `Sélénium ${seF}µg/j — au-delà UL`,
    subtitle: `Noix du Brésil (~${seFoodF}µg) + multi (~55µg). UL = 300µg dépassé.`,
    advice: `<strong>Action :</strong> dépasse l'UL (300µg). Réduire immédiatement les noix du Brésil. Surveiller : haleine aillée, perte de cheveux, ongles cassants.`
  };
}

function vigCreatine(water) {
  const wF = fmtFr(water, 1);
  if (water < 2.5) {
    return {
      level: 'high',
      title: 'Créatine 10g/j — hydratation insuffisante',
      subtitle: `Hydratation actuelle ${wF}L/j. Pour 10g créatine, viser ≥3L.`,
      advice: `<strong>Action :</strong> augmenter l'hydratation à ≥3 L/j. Risque de crampes, fatigue et inconfort digestif si la créatine n'a pas assez d'eau pour son effet osmotique.`
    };
  }
  if (water < 3.0) {
    return {
      level: 'medium',
      title: 'Créatine 10g/j — hydratation à augmenter',
      subtitle: `Hydratation ${wF}L/j — viser 3L+ pour 10g créatine.`,
      advice: `Hydratation ${wF}L/j à augmenter vers 3L+. Bilan rénal annuel (créatinine, DFG, microalbuminurie). Prévenir le médecin pour interpréter correctement la créatinine.`
    };
  }
  return {
    level: 'medium',
    title: 'Créatine 10g/j — surveillance rénale',
    subtitle: 'Fausse la créatinine sérique. Informer le médecin.',
    advice: `Pas de risque rénal documenté chez les reins sains à ce dosage. Hydratation ${wF}L/j est adaptée. Bilan rénal annuel (créatinine, DFG, microalbuminurie). Prévenir le médecin pour interpréter correctement.`
  };
}

function vigGirofle(weight, clousQty) {
  const dja = fmt(2.5 * (weight || 64));
  // ~10-20 mg eugénol par clou (variable selon la taille)
  const eugMin = fmt(clousQty * 10);
  const eugMax = fmt(clousQty * 20);
  return {
    level: 'medium',
    subtitle: `${fmt(clousQty)} clous/j = ~${eugMin}-${eugMax}mg eugénol (DJA OMS : ~${dja}mg pour ${fmt(weight)}kg)`
  };
}

function vigProtein(protPerKg, totalProt) {
  const pkg = fmtFr(protPerKg, 2);
  const protF = fmt(totalProt);
  if (protPerKg < 1.2) {
    return {
      level: 'high',
      title: `Protéines ${protF}g/j (${pkg} g/kg) — insuffisant`,
      subtitle: `${protF}g/j sous la fourchette muscu (1,6-2,2 g/kg).`,
      advice: `<strong>À combler :</strong> apport sous la fourchette recommandée pour la muscu. Augmenter whey (+10g) ou la portion de viande/poisson au dîner.`
    };
  }
  if (protPerKg < 1.6) {
    return {
      level: 'medium',
      title: `Protéines ${protF}g/j (${pkg} g/kg) — limite`,
      subtitle: `${protF}g/j à la limite basse pour la muscu.`,
      advice: `<strong>Limite :</strong> apport sous la cible muscu (1,6-2,2 g/kg). Ajouter une portion de protéines pour optimiser la synthèse protéique.`
    };
  }
  return {
    level: 'low',
    title: 'Protéines — résolu ✅',
    subtitle: `${protF}g/j (${pkg} g/kg) en 3 prises. Whey 30g l'après-midi.`,
    advice: ''
  };
}

function vigArticulations(vitCTotal) {
  const vcF = fmt(vitCTotal);
  if (vitCTotal < 200) {
    return {
      level: 'medium',
      title: 'Articulations — vit C cofacteur insuffisant',
      subtitle: `Collagène 10g/j + Vit C ~${vcF}mg/j (viser ≥200mg en pic).`,
      advice: `Vit C actuelle ~${vcF}mg/j. Pour la conversion du collagène en tissu fonctionnel via prolyl/lysyl hydroxylase, viser ≥200mg en pic au moment de la prise (kiwi + ½ cp Innovit).`
    };
  }
  return {
    level: 'low',
    title: 'Articulations — résolu ✅',
    subtitle: `Collagène 10g/j type 1&3 + Vit C ~${vcF}mg/j`,
    advice: `Pris après kiwi (vit C en pic). Bénéfices articulaires documentés à 8-12 semaines. La taurine contribue aussi à la santé des tissus conjonctifs.`
  };
}

function updateVigilance() {
  const total = compute(Object.keys(foods));
  const w = profile.weight || 1;
  const water = profile.water || 0;
  const suppZinc = supplements.zinc ? supplements.zinc.qty : 0;
  const suppVitC = supplements.vitC ? supplements.vitC.qty : 0;
  const zincTotal = ZINC_FROM_FOOD + ZINC_FROM_MULTI + suppZinc;
  const noixBQty = foods.noixBresil ? foods.noixBresil.qty : 0;
  const seleniumFood = noixBQty * SELENIUM_PER_G_NOIX_BRESIL;
  const seleniumTotal = seleniumFood + SELENIUM_FROM_MULTI;
  const saltQty = foods.sel ? foods.sel.qty : 0;
  const naK = total.k > 0 ? total.na / total.k : 0;
  const protPerKg = total.prot / w;
  const vitCTotal = total.vitC + suppVitC;

  applyVigStatus('sodium',        vigSodium(saltQty, naK, total.na, total.k));
  applyVigStatus('zinc',          vigZinc(zincTotal));
  applyVigStatus('selenium',      vigSelenium(seleniumTotal, seleniumFood));
  applyVigStatus('creatine',      vigCreatine(water));
  applyVigStatus('girofle',       vigGirofle(w, foods.clousGirofle ? foods.clousGirofle.qty : 0));
  applyVigStatus('protein',       vigProtein(protPerKg, total.prot));
  applyVigStatus('articulations', vigArticulations(vitCTotal));

  // Les sous-titres reconstruits peuvent contenir <span data-supp-display="zinc"> :
  // re-injecter les valeurs après reconstruction.
  setAll('[data-supp-display="vitC"]', fmtFr(suppVitC, 0));
  setAll('[data-supp-display="zinc"]', fmtFr(suppZinc, 1));
}

// ==================== ADVISORY — Encadrés et listes contextuelles ====================
function setResolu(id, status) {
  // status: 'ok' | 'warn' | 'bad'
  const el = document.querySelector(`[data-resolu="${id}"]`);
  if (!el) return;
  el.classList.remove('resolu-warn','resolu-bad');
  if (status === 'warn') el.classList.add('resolu-warn');
  if (status === 'bad')  el.classList.add('resolu-bad');
  const icon = el.querySelector('[data-resolu-icon]');
  if (icon) icon.textContent = status === 'ok' ? '✅' : status === 'warn' ? '⚠️' : '❌';
}

const ADVICE_TONE_CLASSES = ['is-ok','is-info','is-warn','is-bad'];
function setAdviceBlock(id, html, tone = 'info', visible = true) {
  const el = document.querySelector(`[data-advice="${id}"]`);
  if (!el) return;
  el.style.display = visible ? '' : 'none';
  if (visible) el.innerHTML = html;
  el.classList.remove(...ADVICE_TONE_CLASSES);
  el.classList.add(`is-${tone}`);
}

// TDEE estimé (Mifflin-St Jeor, âge ~35 par défaut, NAP fonction de sportHours)
// sex : 'homme' (offset +5) ou 'femme' (offset -161)
function estimateTDEE(weight, height, sportHours, sex) {
  const offset = sex === 'femme' ? -161 : 5;
  const bmr = 10 * weight + 6.25 * height - 5 * 35 + offset;
  let napLow, napHigh;
  if (sportHours < 3)       { napLow = 1.40; napHigh = 1.55; }
  else if (sportHours < 7)  { napLow = 1.55; napHigh = 1.70; }
  else if (sportHours < 12) { napLow = 1.70; napHigh = 1.85; }
  else                      { napLow = 1.85; napHigh = 2.00; }
  return { bmr, napLow, napHigh, low: bmr * napLow, high: bmr * napHigh };
}

function updateAdvisory() {
  const total = compute(Object.keys(foods));
  const w = profile.weight || 1;
  const h = profile.height || 1;
  const sport = profile.sportHours || 0;
  const suppZinc = supplements.zinc ? supplements.zinc.qty : 0;
  const suppVitC = supplements.vitC ? supplements.vitC.qty : 0;
  const zincTotal = ZINC_FROM_FOOD + ZINC_FROM_MULTI + suppZinc;
  const noixBQty = foods.noixBresil ? foods.noixBresil.qty : 0;
  const seleniumFood = noixBQty * SELENIUM_PER_G_NOIX_BRESIL;
  const seleniumTotal = seleniumFood + SELENIUM_FROM_MULTI;
  const saltQty = foods.sel ? foods.sel.qty : 0;
  const protPerKg = total.prot / w;
  const vitCTotal = total.vitC + suppVitC;
  const dattesQty = foods.dattes ? foods.dattes.qty : 0;
  const kiwiVitC  = foods.kiwi ? foods.kiwi.vitC * foods.kiwi.qty : 0;

  // ---- "État actuel" — checks dynamiques ----
  setResolu('potassium',     total.k >= 3500 && total.k <= 4700 ? 'ok' : (total.k >= 3000 && total.k <= 5500 ? 'warn' : 'bad'));
  setResolu('protein',       protPerKg >= 1.6 ? 'ok' : protPerKg >= 1.2 ? 'warn' : 'bad');
  setResolu('collagene',     'ok');
  setResolu('b9b12',         'ok');
  setResolu('k2',            'ok');
  setResolu('zincMg',        'ok');
  setResolu('zincVitC',      (suppZinc > 0 && (kiwiVitC + suppVitC) >= 100) ? 'ok' : 'warn');
  setResolu('createTaurine', 'ok');
  setResolu('fructose',      dattesQty <= 5 ? 'ok' : dattesQty <= 8 ? 'warn' : 'bad');
  setResolu('gluc',          (total.gluc >= 180 && total.gluc <= 280) ? 'ok' : (total.gluc >= 120 && total.gluc <= 330) ? 'warn' : 'bad');

  // ---- Encadrés Nutrition ----
  // Zinc
  if (zincTotal < 11) {
    setAdviceBlock('zinc',
      `<strong>Zinc :</strong> ~${fmtFr(zincTotal,1)} mg/j — sous la RDA homme (11 mg). Augmenter zinc alimentaire (huîtres, viande rouge, oléagineux).`,
      'warn');
  } else if (zincTotal <= 25) {
    setAdviceBlock('zinc',
      `<strong>Zinc :</strong> ~${fmtFr(zincTotal,1)} mg/j — apports équilibrés (RDA 11 mg, UL 40 mg). Maintenir.`,
      'ok');
  } else if (zincTotal <= 37) {
    setAdviceBlock('zinc',
      `<strong>Zinc :</strong> ~${fmtFr(zincTotal,1)} mg/j — au-dessus de la RDA mais sous l'UL EFSA (40 mg). Bilan Zn/Cu sérique annuel recommandé.`,
      'info');
  } else if (zincTotal < 50) {
    setAdviceBlock('zinc',
      `<strong>Zinc :</strong> ~${fmtFr(zincTotal,1)} mg/j (proche UL 40 mg). Prendre le zinc WW 1j/2 les jours de viande rouge. Le multi Vit4ever contient du cuivre bisglycinate pour compenser.`,
      'warn');
  } else {
    setAdviceBlock('zinc',
      `<strong>Zinc :</strong> ~${fmtFr(zincTotal,1)} mg/j — au-delà UL EFSA (40 mg). Arrêter le zinc séparé. Bilan Zn/Cu sous 2 semaines.`,
      'bad');
  }

  // Sélénium
  const seF = fmt(seleniumTotal);
  const seFoodF = fmt(seleniumFood);
  if (seleniumTotal < 70) {
    setAdviceBlock('selenium',
      `<strong>Sélénium :</strong> ~${seF} µg/j — sous la RDA (70 µg). Ajouter 2-3 noix du Brésil par jour.`,
      'warn');
  } else if (seleniumTotal <= 200) {
    setAdviceBlock('selenium',
      `<strong>Sélénium :</strong> ~${seF} µg/j (UL = 300 µg). Noix du Brésil (${noixBQty}g = ~${seFoodF}µg) + multi (~55µg). Apports optimaux, aucune action.`,
      'ok');
  } else if (seleniumTotal <= 280) {
    setAdviceBlock('selenium',
      `<strong>Sélénium :</strong> ~${seF} µg/j (UL = 300 µg). Noix du Brésil (${noixBQty}g = ~${seFoodF}µg) + multi (~55µg) — fourchette haute, à surveiller. Ne pas augmenter au-delà de 8-10g/j.`,
      'info');
  } else if (seleniumTotal < 300) {
    setAdviceBlock('selenium',
      `<strong>Sélénium :</strong> ~${seF} µg/j — très proche de l'UL (300 µg). Réduire les noix du Brésil à 4-6g/j ou 1j/2.`,
      'warn');
  } else {
    setAdviceBlock('selenium',
      `<strong>Sélénium :</strong> ~${seF} µg/j — au-delà UL (300 µg). Réduire immédiatement les noix du Brésil. Surveiller : haleine aillée, perte de cheveux.`,
      'bad');
  }

  // Potassium
  const kF = fmt(total.k);
  if (total.k < 3500) {
    setAdviceBlock('potassium',
      `<strong>Potassium :</strong> ~${kF} mg/j — sous la cible (3500-4700). Ajouter avocat, banane, patate douce, légumes verts.`,
      'warn');
  } else if (total.k <= 4700) {
    setAdviceBlock('potassium',
      `<strong>Potassium :</strong> ~${kF} mg/j — dans la cible (3500-4700). Un avocat occasionnel l'après-midi remonterait à ~${fmt(total.k + 700)} mg.`,
      'ok');
  } else {
    setAdviceBlock('potassium',
      `<strong>Potassium :</strong> ~${kF} mg/j — au-dessus de la cible haute (4700). Réduire si pas d'activité sportive intense (sinon : OK).`,
      'info');
  }

  // TDEE
  const tdee = estimateTDEE(w, h, sport, profile.sex);
  const kcal = total.kcal;
  const tdeeMid = (tdee.low + tdee.high) / 2;
  let kcalVerdict, energyTone;
  if (kcal < tdee.low * 0.92) {
    kcalVerdict = `<strong>Apport actuel ~${fmt(kcal)} kcal — déficit (perte de gras attendue)</strong>`;
    energyTone = 'info';
  } else if (kcal > tdee.high * 1.08) {
    kcalVerdict = `<strong>Apport actuel ~${fmt(kcal)} kcal — surplus (prise de poids attendue)</strong>`;
    energyTone = 'warn';
  } else {
    kcalVerdict = `<strong>Apport actuel ~${fmt(kcal)} kcal — cohérent avec le maintien</strong>`;
    energyTone = 'ok';
  }
  const oleagIds = ['noix','noixBresil','noisettes','grainesCourge','amandes','nigelle'];
  const oleagTotal = oleagIds.reduce((s, id) => s + (foods[id] ? foods[id].qty : 0), 0);
  const oleagKcal = oleagIds.reduce((s, id) => s + (foods[id] ? foods[id].qty * (foods[id].kcal || 0) : 0), 0);
  const oleagPct = total.kcal > 0 ? (oleagKcal / total.kcal) * 100 : 0;
  setAdviceBlock('energy',
    `<strong>* Énergie — repère :</strong> ${fmt(w)} kg, ${fmt(h)} cm, ~${fmt(sport)}h sport/sem. TDEE estimé ~${fmt(tdee.low)}-${fmt(tdee.high)} kcal/j (BMR ~${fmt(tdee.bmr)} × NAP ${fmtFr(tdee.napLow,2)}-${fmtFr(tdee.napHigh,2)}). ${kcalVerdict}. Les ~${fmt(oleagKcal)} kcal des oléagineux concentrent ~${fmt(oleagPct)}% de la journée — surveiller la portion (${fmt(oleagTotal)}g) si prise de poids non désirée.`,
    energyTone);

  // ---- Symptômes — afficher uniquement les cartes pertinentes ----
  const sympCond = {
    zinc:     zincTotal      >= 30,    // déplétion cuivre devient pertinente au-dessus de la RDA
    selenium: seleniumTotal  >= 200,   // signes subtils dès 200-300µg
    sodium:   saltQty        >  5,     // au-dessus de la cible OMS
    vitC:     vitCTotal      >= 500,   // dose à laquelle l'effet osmotique peut apparaître
    ironVitC: vitCTotal      >= 400    // boost absorption fer non-héminique significatif
  };
  document.querySelectorAll('[data-symp-cond]').forEach(card => {
    const id = card.dataset.sympCond;
    const show = sympCond[id];
    card.dataset.sympInactive = show ? 'false' : 'true';
  });
}

function updateAll() {
  for (const id of Object.keys(foods)) updateRowStats(id);
  updateTimelineCards();
  updateTotals();
  updateDescriptions();
  updateDerived();
  updateVigilance();
  updateAdvisory();
  updateNutritionStats();
}

// ==================== NUTRITION — Stats globales (kcal split, prot sources, BCAA, oméga) ====================
function updateNutritionStats() {
  const total = compute(Object.keys(foods));
  const kcal  = total.kcal;
  const prot  = total.prot;
  const gluc  = total.gluc;

  // ---- Répartition énergétique : protéines / glucides / lipides ----
  // Préférer les lipides RÉELS (table MICRONUTRIENTS) si disponibles, sinon
  // estimer par solde énergétique (legacy).
  const kcalProt = prot * 4;
  const kcalGluc = gluc * 4;
  const lipReal  = (typeof MICRONUTRIENTS !== 'undefined' && total.lip > 0) ? total.lip : 0;
  let kcalLip, lipG;
  if (lipReal > 0) {
    lipG     = lipReal;
    kcalLip  = lipG * 9;
  } else {
    kcalLip  = Math.max(0, kcal - kcalProt - kcalGluc);
    lipG     = kcalLip / 9;
  }
  // Base = somme des macros (pas le kcal alimentaire saisi) → garantit P%+G%+L%=100
  const kcalBase = kcalProt + kcalGluc + kcalLip;
  const protPct  = kcalBase > 0 ? (kcalProt / kcalBase) * 100 : 0;
  const glucPct  = kcalBase > 0 ? (kcalGluc / kcalBase) * 100 : 0;
  const lipPct   = kcalBase > 0 ? (kcalLip  / kcalBase) * 100 : 0;

  setAll('[data-derived="kcalProt"]',    `~${fmt(kcalProt)}`);
  setAll('[data-derived="kcalGluc"]',    `~${fmt(kcalGluc)}`);
  setAll('[data-derived="kcalLip"]',     `~${fmt(kcalLip)}`);
  setAll('[data-derived="kcalProtPct"]', fmt(protPct));
  setAll('[data-derived="kcalGlucPct"]', fmt(glucPct));
  setAll('[data-derived="kcalLipPct"]',  fmt(lipPct));
  setAll('[data-derived="lipG"]',        fmt(lipG));
  document.querySelectorAll('[data-kcal-seg]').forEach(el => {
    const k = el.dataset.kcalSeg;
    const pct = k === 'prot' ? protPct : k === 'gluc' ? glucPct : lipPct;
    el.style.width = pct.toFixed(1) + '%';
  });
  // Coloration des % macros selon MACRO_SPLIT_TARGET (cible % éditable)
  const macroPctValues = { prot: protPct, gluc: glucPct, lip: lipPct };
  for (const macro of ['prot','gluc','lip']) {
    const t = MACRO_SPLIT_TARGET[macro];
    if (!t || !Array.isArray(t.good)) continue;
    const v = macroPctValues[macro];
    let status = 'ok';
    const [lo, hi] = t.good;
    if (v < lo || v > hi) {
      status = (t.warnLow !== undefined && v < t.warnLow) || (t.warnHigh !== undefined && v > t.warnHigh)
                ? 'bad' : 'warn';
    }
    applyStatusClass(`[data-derived="kcal${macro.charAt(0).toUpperCase()+macro.slice(1)}Pct"]`, status);
  }

  // ---- Sources de protéines ----
  const sourceTotals = PROT_SOURCES.map(src => ({
    name: src.name,
    color: src.color,
    grams: src.ids.reduce((s, id) => s + (foods[id] ? foods[id].qty * (foods[id].prot || 0) : 0), 0)
  }));
  const grandProt = sourceTotals.reduce((s, x) => s + x.grams, 0);
  const bar = document.querySelector('[data-prot-bar]');
  const list = document.querySelector('[data-prot-list]');
  if (bar) {
    bar.innerHTML = sourceTotals
      .filter(s => s.grams > 0.1)
      .map(s => `<div class="prot-bar-seg" title="${s.name} ~${fmtFr(s.grams,1)}g" style="width:${grandProt > 0 ? (s.grams/grandProt*100).toFixed(2) : 0}%;background:${s.color}"></div>`)
      .join('');
  }
  if (list) {
    list.innerHTML = sourceTotals
      .filter(s => s.grams > 0.1)
      .sort((a,b) => b.grams - a.grams)
      .map(s => `<div><span class="swatch" style="background:${s.color}"></span>${s.name} <span class="pl-val">~${fmtFr(s.grams,1)}g</span></div>`)
      .join('');
  }

  // ---- BCAA ----
  let bcaaTotal = 0;
  for (const id of Object.keys(foods)) {
    const f = foods[id];
    if (!f || !f.prot) continue;
    const protG = f.qty * f.prot;
    const pct = (BCAA_PCT[id] !== undefined) ? BCAA_PCT[id] : BCAA_PCT.default;
    bcaaTotal += protG * pct;
  }
  const leucine = bcaaTotal * LEUCINE_PCT_OF_BCAA;
  setAll('[data-derived="bcaaTotal"]', fmtFr(bcaaTotal, 1));
  setAll('[data-derived="leucine"]',   `~${fmtFr(leucine, 1)}`);

  // ---- Types de fibres ----
  let fibreSol = 0, fibreInsol = 0;
  for (const id of Object.keys(foods)) {
    const f = foods[id];
    if (!f || !f.fibre) continue;
    const fibreG = f.qty * f.fibre;
    const solPct = (FIBRE_SOL_PCT[id] !== undefined) ? FIBRE_SOL_PCT[id] : FIBRE_SOL_PCT.default;
    fibreSol   += fibreG * solPct;
    fibreInsol += fibreG * (1 - solPct);
  }
  const fibreTot = fibreSol + fibreInsol;
  const fibreSolPctV   = fibreTot > 0 ? (fibreSol   / fibreTot) * 100 : 0;
  const fibreInsolPctV = fibreTot > 0 ? (fibreInsol / fibreTot) * 100 : 0;
  // Mucilage : tout le soluble de chia + lin (ces fibres solubles sont quasi exclusivement du mucilage)
  const mucilage = MUCILAGE_FOODS.reduce((s, id) => {
    const f = foods[id];
    if (!f) return s;
    return s + f.qty * (f.fibre || 0) * ((FIBRE_SOL_PCT[id] !== undefined) ? FIBRE_SOL_PCT[id] : FIBRE_SOL_PCT.default);
  }, 0);
  // Pectines : ~50% du soluble dans pomme/kiwi/courgettes/banane
  const pectine = PECTINE_FOODS.reduce((s, id) => {
    const f = foods[id];
    if (!f) return s;
    return s + f.qty * (f.fibre || 0) * ((FIBRE_SOL_PCT[id] !== undefined) ? FIBRE_SOL_PCT[id] : FIBRE_SOL_PCT.default) * 0.5;
  }, 0);
  // β-glucanes : ~30% des fibres totales des champignons
  const betaGlucane = BETA_GLUCANE_FOODS.reduce((s, id) => {
    const f = foods[id];
    if (!f) return s;
    return s + f.qty * (f.fibre || 0) * 0.30;
  }, 0);
  setAll('[data-derived="fibreSol"]',         `~${fmtFr(fibreSol, 1)}`);
  setAll('[data-derived="fibreInsol"]',       `~${fmtFr(fibreInsol, 1)}`);
  setAll('[data-derived="fibreSolPct"]',      fmt(fibreSolPctV));
  setAll('[data-derived="fibreInsolPct"]',    fmt(fibreInsolPctV));
  setAll('[data-derived="fibreMucilage"]',    `~${fmtFr(mucilage, 1)}`);
  setAll('[data-derived="fibrePectine"]',     `~${fmtFr(pectine, 1)}`);
  setAll('[data-derived="fibreBetaGlucane"]', `~${fmtFr(betaGlucane, 2)}`);
  document.querySelectorAll('[data-fibre-seg]').forEach(el => {
    const k = el.dataset.fibreSeg;
    const pct = k === 'soluble' ? fibreSolPctV : fibreInsolPctV;
    el.style.width = pct.toFixed(1) + '%';
  });

  // ---- Oméga-6 / Oméga-3 ----
  let ala = 0, la = 0;
  for (const id of Object.keys(foods)) {
    const f = foods[id];
    const omega = OMEGA[id];
    if (!f || !omega) continue;
    ala += f.qty * (omega.ala || 0);
    la  += f.qty * (omega.la  || 0);
  }
  const epaDha = EPA_DHA_FOOD_G + EPA_DHA_SUPP_G;
  const omega3 = ala + epaDha;
  const ratio  = omega3 > 0 ? la / omega3 : 0;
  setAll('[data-derived="omegaLA"]',          fmtFr(la, 1));
  setAll('[data-derived="omegaALA"]',         fmtFr(ala, 1));
  setAll('[data-derived="omegaEpaDha"]',      fmtFr(epaDha, 1));
  setAll('[data-derived="omegaEpaDhaFood"]',  fmtFr(EPA_DHA_FOOD_G, 1));
  setAll('[data-derived="omegaEpaDhaSupp"]',  fmtFr(EPA_DHA_SUPP_G, 1));
  setAll('[data-derived="omega3Total"]',      fmtFr(omega3, 1));
  setAll('[data-derived="omegaRatio"]',       fmtFr(ratio, 1));
  document.querySelectorAll('[data-omega-ratio-class]').forEach(el => {
    el.classList.remove('omega-good','omega-warn','omega-bad');
    if (ratio <= 4)       el.classList.add('omega-good');
    else if (ratio <= 8)  el.classList.add('omega-warn');
    else                  el.classList.add('omega-bad');
  });
}

function resetFoods() {
  if (!confirm('Réinitialiser toutes les quantités (aliments + suppléments + mix oléagineux) aux valeurs par défaut ?')) return;
  foods = JSON.parse(JSON.stringify(defaultFoods));
  supplements = JSON.parse(JSON.stringify(defaultSupplements));
  mixOleagineux = JSON.parse(JSON.stringify(defaultMixOleagineux));
  try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
  try { localStorage.removeItem(SUPPLEMENTS_KEY); } catch(e) {}
  try { localStorage.removeItem(MIX_OLEAGINEUX_KEY); } catch(e) {}
  applyMixOleagineuxToFoods();
  renderAlimentsList();
  updateAll();
  showSaveStatus('✓ Réinitialisé');
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Lit dashboard-sante.html + assets/dashboard-sante-config.js en gérant file://
// et HTTP. En file:// + Chromium, on ouvre showDirectoryPicker (mode readwrite)
// pour pouvoir aussi écraser les fichiers en place. Renvoie un dirHandle non-null
// uniquement quand on peut écrire directement (file:// + FS API).
async function readSourcesForSaveAsDefaults() {
  if (location.protocol !== 'file:') {
    const [htmlText, configText] = await Promise.all([
      fetch('dashboard-sante.html', { cache:'no-store' }).then(r => { if (!r.ok) throw new Error('HTML introuvable'); return r.text(); }),
      fetch('assets/dashboard-sante-config.js', { cache:'no-store' }).then(r => { if (!r.ok) throw new Error('Config JS introuvable'); return r.text(); })
    ]);
    return { htmlText, configText, dirHandle: null };
  }
  if (!('showDirectoryPicker' in window)) {
    throw new Error('En file://, ce navigateur ne supporte pas l\'écriture directe. Lance un serveur local (python3 -m http.server) ou utilise Chromium.');
  }
  showSaveStatus('… Sélectionne le dossier "routines"');
  const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite', id: 'dashboard-sante-project' });
  // Localise dashboard-sante.html (à la racine choisie ou un niveau plus bas)
  let root = dirHandle;
  try { await root.getFileHandle('dashboard-sante.html'); }
  catch {
    let found = null;
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'directory') {
        try { await entry.getFileHandle('dashboard-sante.html'); found = entry; break; }
        catch {}
      }
    }
    if (!found) throw new Error('dashboard-sante.html introuvable dans le dossier choisi.');
    root = found;
  }
  const assets = await root.getDirectoryHandle('assets');
  const [htmlFile, configFile] = await Promise.all([
    root.getFileHandle('dashboard-sante.html').then(h => h.getFile()),
    assets.getFileHandle('dashboard-sante-config.js').then(h => h.getFile()),
  ]);
  const [htmlText, configText] = await Promise.all([htmlFile.text(), configFile.text()]);
  return { htmlText, configText, dirHandle: root, assetsHandle: assets };
}

async function writeFileToHandle(dirHandle, name, content) {
  const fh = await dirHandle.getFileHandle(name, { create: false });
  const w = await fh.createWritable();
  await w.write(content);
  await w.close();
}

async function saveAsDefaults() {
  if (!confirm(
    'Enregistrer les valeurs actuelles (aliments, suppléments, profil) comme nouveaux défauts ?\n\n'
    + (location.protocol === 'file:'
        ? 'En file:// : tu vas choisir le dossier "routines" et les deux fichiers seront RÉÉCRITS sur place (dashboard-sante.html + assets/dashboard-sante-config.js).\n\n'
        : 'Deux fichiers vont être téléchargés : dashboard-sante.html et dashboard-sante-config.js.\n')
    + 'Les nouveaux défauts seront utilisés au prochain chargement et lors d\'un « Réinitialiser ».'
  )) return;

  showSaveStatus('… Génération…');
  try {
    const { htmlText, configText, dirHandle, assetsHandle } = await readSourcesForSaveAsDefaults();

    // ---- 1. Patch CONFIG : defaultFoods / defaultSupplements / defaultProfile ----
    const escapeId = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let newConfig = configText;

    const allEntries = { ...foods, ...supplements };
    for (const id of Object.keys(allEntries)) {
      const re = new RegExp(`(\\b${escapeId(id)}\\s*:\\s*\\{[^}]*?\\bqty\\s*:\\s*)[\\d.]+`);
      newConfig = newConfig.replace(re, `$1${allEntries[id].qty}`);
    }

    newConfig = newConfig.replace(/(const\s+defaultProfile\s*=\s*\{)([\s\S]*?)(\n\};)/, (m, head, body, tail) => {
      let nb = body;
      for (const k of Object.keys(profile)) {
        const v = profile[k];
        if (typeof v === 'number') {
          const re = new RegExp(`(\\b${escapeId(k)}\\s*:\\s*)[\\d.]+`);
          nb = nb.replace(re, `$1${v}`);
        } else if (typeof v === 'string') {
          const re = new RegExp(`(\\b${escapeId(k)}\\s*:\\s*)(['"])[^'"]*\\2`);
          nb = nb.replace(re, `$1$2${v}$2`);
        }
      }
      return head + nb + tail;
    });

    // ---- 1 bis. Patch CONFIG : defaultMixOleagineux (total + parts) ----
    // Critique : applyMixOleagineuxToFoods() s'exécute à l'init et écrase
    // foods[noix/...].qty à partir de mixOleagineux. Sans ce patch, les qty
    // sauvegardées dans defaultFoods sont annulées au chargement suivant.
    newConfig = newConfig.replace(/(const\s+defaultMixOleagineux\s*=\s*\{)([\s\S]*?)(\n\};)/, (m, head, body, tail) => {
      let nb = body;
      nb = nb.replace(/(\btotal\s*:\s*)[\d.]+/, `$1${mixOleagineux.total}`);
      nb = nb.replace(/(\bparts\s*:\s*\{)([^}]*)(\})/, (m2, h2, b2, t2) => {
        let pb = b2;
        for (const id of MIX_OLEAGINEUX_IDS) {
          const v = mixOleagineux.parts[id];
          if (typeof v !== 'number') continue;
          const re = new RegExp(`(\\b${escapeId(id)}\\s*:\\s*)[\\d.]+`);
          if (re.test(pb)) {
            pb = pb.replace(re, `$1${v}`);
          } else {
            pb = pb.replace(/\s*$/, `, ${id}:${v}`);
          }
        }
        return h2 + pb + t2;
      });
      return head + nb + tail;
    });

    // ---- 1 ter. Patch CONFIG : TARGETS et MACRO_SPLIT_TARGET ----
    // Édités via clic-pour-éditer dans la UI (good:[lo,hi], warnLow, warnHigh).
    // Sans ce patch, les modifs d'objectifs vivent en localStorage et sont perdues
    // à l'export. unit est laissé tel quel (non éditable runtime).
    const patchTargetBlock = (txt, blockName, obj) => {
      const reTop = new RegExp(`(const\\s+${blockName}\\s*=\\s*\\{)([\\s\\S]*?)(\\n\\};)`);
      return txt.replace(reTop, (m, head, body, tail) => {
        let nb = body;
        for (const key of Object.keys(obj)) {
          const t = obj[key];
          if (!t || typeof t !== 'object') continue;
          const reBlock = new RegExp(`(\\b${escapeId(key)}\\s*:\\s*\\{)([^}]*)(\\})`);
          nb = nb.replace(reBlock, (mm, h, b, tt) => {
            let bb = b;
            if (Array.isArray(t.good) && t.good.length === 2
                && typeof t.good[0] === 'number' && typeof t.good[1] === 'number') {
              bb = bb.replace(
                /(\bgood\s*:\s*\[\s*)[\d.]+(\s*,\s*)[\d.]+(\s*\])/,
                `$1${t.good[0]}$2${t.good[1]}$3`
              );
            }
            if (typeof t.warnLow === 'number') {
              const re2 = /(\bwarnLow\s*:\s*)[\d.]+/;
              if (re2.test(bb)) bb = bb.replace(re2, `$1${t.warnLow}`);
            }
            if (typeof t.warnHigh === 'number') {
              const re3 = /(\bwarnHigh\s*:\s*)[\d.]+/;
              if (re3.test(bb)) bb = bb.replace(re3, `$1${t.warnHigh}`);
            }
            return h + bb + tt;
          });
        }
        return head + nb + tail;
      });
    };
    newConfig = patchTargetBlock(newConfig, 'TARGETS', TARGETS);
    newConfig = patchTargetBlock(newConfig, 'MACRO_SPLIT_TARGET', MACRO_SPLIT_TARGET);

    // ---- 2. Patch HTML : data-qty / data-edit / data-edit-food / data-supp-display ----
    const fmtFood   = q => Number.isInteger(q) ? String(q) : Number(q.toFixed(1)).toString();
    const fmtProf   = (k, v) => k === 'water'
      ? Number(v.toFixed(1)).toString().replace('.', ',')
      : Number(v.toFixed(0)).toString();
    const fmtFoodFr = q => Number(q.toFixed(1)).toString().replace(/[,.]0$/, '').replace('.', ',');
    const fmtSupp   = (id, q) => id === 'vitC'
      ? Number(q.toFixed(0)).toString()
      : Number(q.toFixed(1)).toString().replace(/[,.]0$/, '');

    const replaceAttr = (html, attr, getValue) =>
      html.replace(new RegExp(`(<[^>]*\\b${attr}="([^"]+)"[^>]*>)([^<]*)(<)`, 'g'),
        (m, openTag, key, oldVal, lt) => {
          const v = getValue(key);
          return v === null ? m : openTag + v + lt;
        });

    let newHtml = htmlText;
    newHtml = replaceAttr(newHtml, 'data-qty',          id  => foods[id]       ? fmtFood(foods[id].qty)        : null);
    newHtml = replaceAttr(newHtml, 'data-edit',         k   => (k in profile && typeof profile[k] === 'number') ? fmtProf(k, profile[k]) : null);
    newHtml = replaceAttr(newHtml, 'data-edit-text',    k   => (k in profile && typeof profile[k] === 'string') ? capitalize(profile[k]) : null);
    newHtml = replaceAttr(newHtml, 'data-edit-food',    id  => foods[id]       ? fmtFoodFr(foods[id].qty)       : null);
    newHtml = replaceAttr(newHtml, 'data-supp-display', id  => supplements[id] ? fmtSupp(id, supplements[id].qty) : null);

    // ---- 3. Écriture : directe via FS API (file://) ou téléchargement (HTTP) ----
    if (dirHandle && assetsHandle) {
      await writeFileToHandle(dirHandle,    'dashboard-sante.html',      newHtml);
      await writeFileToHandle(assetsHandle, 'dashboard-sante-config.js', newConfig);
      showSaveStatus('✓ Sources mises à jour sur disque');
    } else {
      downloadBlob(newHtml,   'dashboard-sante.html',         'text/html;charset=utf-8');
      setTimeout(() => downloadBlob(newConfig, 'dashboard-sante-config.js', 'application/javascript;charset=utf-8'), 250);
      showSaveStatus('✓ Fichiers téléchargés');
    }
  } catch (err) {
    showSaveStatus('✗ ' + err.message);
    alert('Erreur lors de la génération : ' + err.message);
  }
}

// Met à jour les pourcentages + qty dérivées affichés à droite des inputs de
// parts, sans re-rendre toute la liste (préserve le focus sur l'input actif).
function refreshMixDerivedDisplay() {
  const sum = mixPartsSum();
  const sumEl = document.querySelector('[data-mix-sum]');
  if (sumEl) sumEl.textContent = `somme parts : ${Math.round(sum * 10) / 10}`;
  for (const id of MIX_OLEAGINEUX_IDS) {
    const f = foods[id];
    if (!f) continue;
    const part = mixOleagineux.parts[id] || 0;
    const pct  = sum > 0 ? (part / sum * 100) : 0;
    const span = document.querySelector(`[data-mix-derived="${id}"]`);
    if (span) span.textContent = `${pct.toFixed(1)}% → ${f.qty}${f.unit}`;
  }
}

let saveDebounce = null;
let saveSuppDebounce = null;
let saveMixDebounce = null;
document.addEventListener('input', e => {
  if (!e.target.classList || !e.target.classList.contains('qty-input')) return;
  const t = e.target;
  const v = parseFloat(t.value);
  const safe = isFinite(v) && v >= 0 ? v : 0;

  // Mix oléagineux : total ou part → recalcule les qty dérivées + sauvegarde
  if (t.dataset.mixTotalInput !== undefined) {
    mixOleagineux.total = safe;
    applyMixOleagineuxToFoods();
    refreshMixDerivedDisplay();
    updateAll();
    clearTimeout(saveMixDebounce);
    saveMixDebounce = setTimeout(() => { saveMixOleagineux(); saveFoodsToStorage(); }, 300);
    return;
  }
  if (t.dataset.mixPartInput) {
    const id = t.dataset.mixPartInput;
    mixOleagineux.parts[id] = safe;
    applyMixOleagineuxToFoods();
    refreshMixDerivedDisplay();
    updateAll();
    clearTimeout(saveMixDebounce);
    saveMixDebounce = setTimeout(() => { saveMixOleagineux(); saveFoodsToStorage(); }, 300);
    return;
  }

  if (t.dataset.suppId) {
    supplements[t.dataset.suppId].qty = safe;
    updateAll();
    clearTimeout(saveSuppDebounce);
    saveSuppDebounce = setTimeout(saveSupplements, 300);
    return;
  }
  if (t.dataset.id) {
    foods[t.dataset.id].qty = safe;
    updateAll();
    clearTimeout(saveDebounce);
    saveDebounce = setTimeout(saveFoodsToStorage, 300);
  }
});

// ==================== CHECKLIST QUOTIDIENNE ====================
let checklist = { date: '', items: {} };

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

function todayLabel() {
  const d = new Date();
  return d.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' });
}

function loadChecklist() {
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.date && data.items) checklist = data;
    }
  } catch(err) {}
  // Auto-reset si nouveau jour
  if (checklist.date !== todayKey()) {
    checklist = { date: todayKey(), items: {} };
    saveChecklist();
  }
}

function saveChecklist() {
  try {
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(checklist));
  } catch(err) {}
}

function checklistTabs() {
  return REORDERABLE_TABS;
}

// Assigne un identifiant stable à chaque carte de timeline (par ordre DOM initial)
// pour que checklist + ordre persistent malgré les ré-ordonnancements.
// Compatible avec l'ancien schéma `${tabId}-${i}` (un compteur par onglet).
function ensureTlIds() {
  for (const tabId of REORDERABLE_TABS) {
    const tab = document.getElementById(tabId);
    if (!tab) continue;
    tab.querySelectorAll('.tl-card').forEach((card, i) => {
      if (!card.dataset.tlId) {
        card.dataset.tlId = `${tabId}-${i}`;
      }
    });
  }
}

function initChecklist() {
  for (const tabId of checklistTabs()) {
    const tab = document.getElementById(tabId);
    if (!tab) continue;
    tab.querySelectorAll('.tl-card').forEach(card => {
      const itemId = card.dataset.tlId;
      if (!itemId) return;
      card.dataset.checkId = itemId;
      if (!card.querySelector('.tl-check')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tl-check';
        btn.setAttribute('aria-label', 'Marquer comme fait');
        btn.innerHTML = '✓';
        btn.addEventListener('click', e => {
          e.stopPropagation();
          toggleCheck(itemId);
        });
        card.appendChild(btn);
      }
    });
  }
  // Date label
  document.querySelectorAll('[data-checklist-date]').forEach(el => {
    el.textContent = todayLabel();
  });
  renderChecklist();
}

function toggleCheck(itemId) {
  if (checklist.date !== todayKey()) {
    checklist = { date: todayKey(), items: {} };
  }
  checklist.items[itemId] = !checklist.items[itemId];
  saveChecklist();
  renderChecklist();
}

function renderChecklist() {
  document.querySelectorAll('.tl-card[data-check-id]').forEach(card => {
    const id = card.dataset.checkId;
    card.classList.toggle('tl-done', !!checklist.items[id]);
  });
  for (const tabId of checklistTabs()) {
    const tab = document.getElementById(tabId);
    if (!tab) continue;
    const cards = tab.querySelectorAll('.tl-card[data-check-id]');
    let done = 0;
    cards.forEach(c => { if (checklist.items[c.dataset.checkId]) done++; });
    const counter = tab.querySelector('[data-checklist-counter]');
    const fill = tab.querySelector('[data-checklist-fill]');
    if (counter) counter.textContent = `${done} / ${cards.length}`;
    if (fill && cards.length) fill.style.width = `${(done/cards.length)*100}%`;
  }
}

function resetChecklist(tabId) {
  if (!confirm('Réinitialiser la checklist du jour ?')) return;
  if (tabId) {
    const tab = document.getElementById(tabId);
    if (tab) {
      tab.querySelectorAll('.tl-card[data-check-id]').forEach(c => {
        delete checklist.items[c.dataset.checkId];
      });
    }
  } else {
    checklist.items = {};
  }
  checklist.date = todayKey();
  saveChecklist();
  renderChecklist();
  showSaveStatus('✓ Checklist réinitialisée');
}

// ==================== DRAG & DROP — Ordre des prises ====================
// Ordre persistant par timeline. Une timeline = un .timeline DOM dans un onglet
// réordonnable. La clé inclut l'index de la timeline (l'onglet "jeune" en a deux).

function timelineOrderKey(tabId, timelineIndex) {
  return `${ORDER_KEY_PREFIX}${tabId}-${timelineIndex}`;
}

function applyAllSavedOrders() {
  for (const tabId of REORDERABLE_TABS) {
    const tab = document.getElementById(tabId);
    if (!tab) continue;
    tab.querySelectorAll('.timeline').forEach((timeline, idx) => {
      let savedIds = null;
      try {
        const raw = localStorage.getItem(timelineOrderKey(tabId, idx));
        if (raw) savedIds = JSON.parse(raw);
      } catch (e) {}
      if (!Array.isArray(savedIds) || !savedIds.length) return;
      const items = Array.from(timeline.children).filter(el => el.classList && el.classList.contains('tl-item'));
      const byId = new Map();
      for (const it of items) {
        const card = it.querySelector('.tl-card');
        if (card && card.dataset.tlId) byId.set(card.dataset.tlId, it);
      }
      // Append dans l'ordre sauvegardé puis ce qui reste (cartes ajoutées depuis)
      for (const id of savedIds) {
        const it = byId.get(id);
        if (it) { timeline.appendChild(it); byId.delete(id); }
      }
      byId.forEach(it => timeline.appendChild(it));
    });
  }
}

function saveTimelineOrder(tabId, timelineIndex, timeline) {
  const ids = Array.from(timeline.children)
    .filter(el => el.classList && el.classList.contains('tl-item'))
    .map(it => {
      const card = it.querySelector('.tl-card');
      return card ? card.dataset.tlId : null;
    })
    .filter(Boolean);
  try {
    localStorage.setItem(timelineOrderKey(tabId, timelineIndex), JSON.stringify(ids));
    showSaveStatus('✓ Ordre sauvegardé');
  } catch (e) {
    showSaveStatus('✗ Sauvegarde impossible');
  }
}

function resetTimelineOrder(tabId) {
  if (!confirm("Restaurer l'ordre par défaut des prises ?")) return;
  const tab = document.getElementById(tabId);
  if (!tab) return;
  tab.querySelectorAll('.timeline').forEach((_, idx) => {
    try { localStorage.removeItem(timelineOrderKey(tabId, idx)); } catch (e) {}
  });
  // Recharger pour repartir de l'ordre HTML d'origine. Plus simple et fiable
  // que de reconstruire l'ordre initial à la main.
  location.reload();
}

function getDragAfterElement(container, y) {
  const items = Array.from(container.children)
    .filter(el => el.classList && el.classList.contains('tl-item') && !el.classList.contains('dragging'));
  let closest = { offset: Number.NEGATIVE_INFINITY, element: null };
  for (const child of items) {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) closest = { offset, element: child };
  }
  return closest.element;
}

function initDragDrop() {
  for (const tabId of REORDERABLE_TABS) {
    const tab = document.getElementById(tabId);
    if (!tab) continue;
    tab.querySelectorAll('.timeline').forEach((timeline, idx) => {
      Array.from(timeline.children)
        .filter(el => el.classList && el.classList.contains('tl-item'))
        .forEach(item => {
          item.draggable = true;
          item.addEventListener('dragstart', e => {
            // Ne pas démarrer un drag depuis un enfant interactif (case à cocher, input)
            if (e.target.closest('button, input, a, [contenteditable="true"]')) {
              e.preventDefault();
              return;
            }
            item.classList.add('dragging');
            if (e.dataTransfer) {
              e.dataTransfer.effectAllowed = 'move';
              const card = item.querySelector('.tl-card');
              try { e.dataTransfer.setData('text/plain', card ? card.dataset.tlId || '' : ''); } catch (_) {}
            }
          });
          item.addEventListener('dragend', () => {
            const moved = item.classList.contains('dragging');
            item.classList.remove('dragging');
            if (moved) saveTimelineOrder(tabId, idx, timeline);
          });
        });

      timeline.addEventListener('dragover', e => {
        const dragging = timeline.querySelector('.tl-item.dragging');
        if (!dragging || dragging.parentElement !== timeline) return;
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
        const after = getDragAfterElement(timeline, e.clientY);
        if (after == null) {
          if (timeline.lastElementChild !== dragging) timeline.appendChild(dragging);
        } else if (after !== dragging) {
          timeline.insertBefore(dragging, after);
        }
      });

      timeline.addEventListener('drop', e => { e.preventDefault(); });
    });
  }
}

loadProfile();
loadFoodsFromStorage();
loadSupplements();
loadChecklist();
loadMixOleagineux();
loadTargets();
applyMixOleagineuxToFoods();  // dérive qty[noix/...] depuis mixOleagineux
applyDefaultsMigration();
renderAlimentsList();
renderProfile();
renderTargets();
bindTargetEditors();
updateAll();
ensureTlIds();
applyAllSavedOrders();

// Migration ponctuelle : pour les utilisateurs qui ont un profil/supp. sauvegardé
// avec les anciens défauts, on bascule vers les nouveaux (sportHours 10→9, zinc 25→12.5).
// Ne touche QUE les valeurs qui correspondent encore exactement à l'ancien défaut.
function applyDefaultsMigration() {
  const KEY = 'dashboard-sante-migration-v2';
  if (localStorage.getItem(KEY)) return;
  let profileChanged = false;
  let suppChanged = false;
  if (profile.sportHours === 10) { profile.sportHours = 9; profileChanged = true; }
  if (supplements.zinc && supplements.zinc.qty === 25) { supplements.zinc.qty = 12.5; suppChanged = true; }
  try {
    if (profileChanged) localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    if (suppChanged) {
      const sd = {};
      for (const id of Object.keys(supplements)) sd[id] = supplements[id].qty;
      localStorage.setItem(SUPPLEMENTS_KEY, JSON.stringify(sd));
    }
    localStorage.setItem(KEY, '1');
  } catch (e) {}
}

// ==================== EXPORT MARKDOWN (analyse IA) ====================
// Bouton 📋 du header : copie tout le contenu du dashboard en markdown dans
// le presse-papiers, pour qu'une IA reçoive le contexte complet en un paste.
// Inclut : profil, totaux calculés, table aliments + suppléments, checklist
// du jour, ET le contenu intégral de chaque onglet (routine, nutrition,
// vigilance, optimisation, tests, interactions, symptômes, jeûne).

const MD_TAB_LABELS = {
  routine: 'Routine quotidienne', aliments: 'Aliments — quantités',
  supplements: 'Suppléments — détail des produits', nutrition: 'Nutrition',
  optimisation: 'Optimisation', vigilance: 'Vigilance', tests: 'Tests',
  interactions: 'Interactions', symptoms: 'Symptômes', jeune: 'Jeûne'
};

function condense(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

// Convertit un sous-arbre DOM en markdown. Visiteur récursif avec quelques
// cas spéciaux pour les cartes structurées du dashboard.
function nodeToMarkdown(root, depth = 2) {
  const lines = [];
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'INPUT', 'BUTTON', 'LABEL']);
  const SKIP_CLASSES = new Set([
    'tabs', 'checklist-header', 'aliment-actions', 'cl-actions',
    'icon-btn', 'tl-tags', 'vig-meter', 'vig-chevron', 'vig-severity',
    'supp-badge', 'stat-card-mini-wrap'
  ]);
  const skipById = new Set(['aliments-list']); // déjà en table dédiée

  function walk(node, hLevel) {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = condense(node.textContent);
      if (t) lines.push(t + ' ');
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (SKIP_TAGS.has(node.tagName)) return;
    if (node.id && skipById.has(node.id)) return;
    if (node.classList) {
      for (const cls of SKIP_CLASSES) if (node.classList.contains(cls)) return;
    }

    // Cartes spécialisées
    if (node.classList && node.classList.contains('tl-card')) {
      const time  = condense(node.querySelector('.tl-time')  && node.querySelector('.tl-time').textContent);
      const title = condense(node.querySelector('.tl-title') && node.querySelector('.tl-title').textContent);
      const desc  = condense(node.querySelector('.tl-desc')  && node.querySelector('.tl-desc').textContent);
      const tags  = Array.from(node.querySelectorAll('.tl-tags .tag')).map(t => condense(t.textContent)).join(' · ');
      const warn  = condense(node.querySelector('.warn-box') && node.querySelector('.warn-box').textContent);
      lines.push(`\n${'#'.repeat(hLevel + 1)} ${time}${time && title ? ' — ' : ''}${title}\n\n`);
      if (desc) lines.push(desc + '\n\n');
      if (warn) lines.push(`> ${warn}\n\n`);
      if (tags) lines.push(`*${tags}*\n\n`);
      return;
    }
    if (node.classList && node.classList.contains('vig-card')) {
      const titleEl = node.querySelector('.vig-card-head h4');
      const subEl   = node.querySelector('.vig-subtitle');
      const lvlEl   = node.querySelector('.vig-level');
      const bodyEl  = node.querySelector('.vig-body-inner') || node.querySelector('.vig-body');
      const title = condense(titleEl && titleEl.textContent);
      const subt  = condense(subEl && subEl.textContent);
      const lvl   = condense(lvlEl && lvlEl.textContent);
      lines.push(`\n${'#'.repeat(hLevel + 1)} ${title}${lvl ? ` *(niveau : ${lvl})*` : ''}\n\n`);
      if (subt) lines.push(subt + '\n\n');
      if (bodyEl) {
        const advice = bodyEl.querySelector('[data-vig-advice]');
        if (advice) lines.push(condense(advice.textContent) + '\n\n');
        // labels des meters
        bodyEl.querySelectorAll('.vig-meter-label').forEach(m => {
          lines.push(`- ${condense(m.textContent)}\n`);
        });
        if (bodyEl.querySelector('.vig-meter-label')) lines.push('\n');
      }
      return;
    }
    if (node.classList && node.classList.contains('supp-card')) {
      const name  = condense(node.querySelector('.supp-name')  && node.querySelector('.supp-name').textContent);
      const brand = condense(node.querySelector('.supp-brand') && node.querySelector('.supp-brand').textContent);
      lines.push(`\n${'#'.repeat(hLevel + 1)} ${name}${brand ? ` — *${brand}*` : ''}\n\n`);
      node.querySelectorAll('.supp-detail').forEach(d => {
        const dl = condense(d.querySelector('.dl') && d.querySelector('.dl').textContent);
        const dv = condense(d.querySelector('.dv') && d.querySelector('.dv').textContent);
        if (dl && dv) lines.push(`- **${dl}** : ${dv}\n`);
      });
      const reason = node.querySelector('.supp-reason');
      if (reason) lines.push(`\n${condense(reason.textContent)}\n\n`);
      else lines.push('\n');
      return;
    }
    if (node.classList && (node.classList.contains('info-box') || node.classList.contains('warn-box'))) {
      const marker = node.classList.contains('warn-box') ? '⚠️' : 'ℹ️';
      lines.push(`\n> ${marker} ${condense(node.textContent)}\n\n`);
      return;
    }
    if (node.classList && (
        node.classList.contains('stats-row') ||
        node.classList.contains('totals-bar')
    )) {
      // Snapshot inline des stat-cards (val + label)
      const cells = [];
      node.querySelectorAll('.stat-card, .t-cell').forEach(c => {
        const valEl = c.querySelector('.val, .t-val');
        const lblEl = c.querySelector('.label, .t-lbl');
        const v = condense(valEl && valEl.textContent);
        const l = condense(lblEl && lblEl.textContent);
        if (v && l) cells.push(`- **${l}** : ${v}`);
      });
      if (cells.length) lines.push('\n' + cells.join('\n') + '\n\n');
      return;
    }

    // Headings → markdown
    const tag = node.tagName;
    if (/^H[1-6]$/.test(tag)) {
      const lvl = Math.min(parseInt(tag[1], 10) + Math.max(0, hLevel - 2), 6);
      lines.push(`\n${'#'.repeat(lvl)} ${condense(node.textContent)}\n\n`);
      return;
    }
    if (tag === 'P') {
      const txt = condense(node.textContent);
      if (txt) lines.push(txt + '\n\n');
      return;
    }
    if (tag === 'UL' || tag === 'OL') {
      const items = Array.from(node.children).filter(c => c.tagName === 'LI');
      const ordered = tag === 'OL';
      items.forEach((li, i) => {
        lines.push(`${ordered ? `${i+1}.` : '-'} ${condense(li.textContent)}\n`);
      });
      lines.push('\n');
      return;
    }
    if (tag === 'TABLE') {
      const rows = Array.from(node.querySelectorAll('tr'));
      if (rows.length) {
        rows.forEach((row, i) => {
          const cells = Array.from(row.children).map(c => condense(c.textContent).replace(/\|/g, '\\|'));
          lines.push('| ' + cells.join(' | ') + ' |\n');
          if (i === 0) lines.push('|' + cells.map(() => '---').join('|') + '|\n');
        });
        lines.push('\n');
      }
      return;
    }
    if (tag === 'BR') { lines.push('\n'); return; }
    if (tag === 'STRONG' || tag === 'B') {
      const txt = condense(node.textContent);
      if (txt) lines.push(`**${txt}** `);
      return;
    }

    // Conteneur générique : récursion sur les enfants
    for (const child of node.childNodes) walk(child, hLevel);
  }

  walk(root, depth);
  return lines.join('').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function buildRoutineMarkdown() {
  const stamp = new Date().toISOString().slice(0, 10);
  const allIds = Object.keys(foods);
  const t = compute(allIds);
  const w = profile.weight || 1;
  const protPerKg = (t.prot / w).toFixed(2);

  const out = [];
  out.push(`# Routine Santé — ${stamp}`, '');

  // ── Profil ───────────────────────────────────────────────────────────────
  out.push('## Profil');
  out.push(`- Sexe : ${profile.sex}`);
  out.push(`- Poids : ${profile.weight} kg`);
  out.push(`- Taille : ${profile.height} cm`);
  out.push(`- Eau : ${profile.water} L/j`);
  out.push(`- Sport : ${profile.sportHours} h/semaine`);
  out.push('');

  // ── Totaux calculés ──────────────────────────────────────────────────────
  out.push('## Apports journaliers (totaux calculés)');
  out.push(`- Énergie : ~${fmt(t.kcal)} kcal`);
  out.push(`- Protéines : ~${fmt(t.prot, 1)} g (${protPerKg} g/kg)`);
  out.push(`- Glucides : ~${fmt(t.gluc, 1)} g`);
  out.push(`- Fibres : ~${fmt(t.fibre, 1)} g`);
  out.push(`- Potassium : ~${fmt(t.k)} mg`);
  out.push(`- Sodium : ~${fmt(t.na)} mg`);
  out.push(`- Vit C : ~${fmt(t.vitC)} mg`);
  out.push('');

  // ── Aliments par groupe (table) ──────────────────────────────────────────
  out.push('## Aliments — quantités configurées');
  out.push('');
  for (const group of foodGroups) {
    out.push(`### ${group.title}`);
    out.push('| Aliment | Quantité | Unité |');
    out.push('|---------|----------|-------|');
    for (const id of group.ids) {
      const f = foods[id];
      if (!f) continue;
      out.push(`| ${f.name} | ${f.qty} | ${f.unit} |`);
    }
    out.push('');
  }

  // ── Suppléments — table compacte ────────────────────────────────────────
  out.push('## Suppléments — doses / jour');
  out.push('| Supplément | Dose | Unité | Note |');
  out.push('|------------|------|-------|------|');
  for (const id of Object.keys(supplements)) {
    const s = supplements[id];
    const note = (s.hint || '').replace(/\|/g, '\\|');
    out.push(`| ${s.name} | ${s.qty} | ${s.unit}/j | ${note} |`);
  }
  out.push('');

  // ── Checklist du jour ────────────────────────────────────────────────────
  if (checklist && checklist.date === todayKey()) {
    const items = checklist.items || {};
    let totalDone = 0, totalAll = 0;
    const blocks = [];
    for (const tabId of REORDERABLE_TABS) {
      const tab = document.getElementById(tabId);
      if (!tab) continue;
      const cards = tab.querySelectorAll('.tl-card[data-check-id]');
      if (!cards.length) continue;
      const block = [`### ${tabId === 'routine' ? 'Routine' : 'Jeûne'}`];
      cards.forEach(card => {
        const id      = card.dataset.checkId;
        const timeEl  = card.querySelector('.tl-time');
        const titleEl = card.querySelector('.tl-title');
        const time    = timeEl  ? condense(timeEl.textContent)  : '';
        const title   = titleEl ? condense(titleEl.textContent) : '';
        const done    = !!items[id];
        if (done) totalDone++;
        totalAll++;
        block.push(`- [${done ? 'x' : ' '}] **${time}** — ${title}`);
      });
      blocks.push(block.join('\n'));
    }
    if (blocks.length) {
      out.push(`## Checklist du jour (${totalDone}/${totalAll})`);
      out.push('');
      out.push(blocks.join('\n\n'));
      out.push('');
    }
  }

  // ── Contenu intégral de chaque onglet ────────────────────────────────────
  out.push('---');
  out.push('# Contenu détaillé');
  out.push('');
  const tabsOrder = ['routine', 'supplements', 'nutrition', 'optimisation',
                     'vigilance', 'tests', 'interactions', 'symptoms', 'jeune'];
  for (const tabId of tabsOrder) {
    const tab = document.getElementById(tabId);
    if (!tab) continue;
    out.push(`## ${MD_TAB_LABELS[tabId] || tabId}`);
    out.push('');
    out.push(nodeToMarkdown(tab, 2));
    out.push('');
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

async function exportRoutineForAI() {
  const md = buildRoutineMarkdown();
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(md);
      showSaveStatus('✓ Routine copiée — colle dans une IA');
      return;
    }
  } catch (e) { /* fallback below */ }
  // Fallback : téléchargement
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `routine-sante-${new Date().toISOString().slice(0, 10)}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showSaveStatus('✓ Routine téléchargée (.md)');
}

initChecklist();
initDragDrop();
