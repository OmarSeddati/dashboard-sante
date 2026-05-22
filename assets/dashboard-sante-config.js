// =============================================================================
// CONFIGURATION — Valeurs par défaut éditables à la main
// =============================================================================
// Modifiez ce fichier pour ajuster les défauts du dashboard. La logique du
// dashboard est dans `dashboard-sante.js` et n'a normalement pas besoin d'être
// modifiée pour ajuster les apports.
//
// IMPORTANT — priorité localStorage :
// Tant que vous avez des valeurs sauvegardées dans le navigateur (cache local),
// elles écrasent ces défauts. Pour repartir des nouveaux défauts :
//   • onglet « Aliments » → bouton « Réinitialiser » (réinitialise aliments + suppléments)
//   • pour le profil : cliquer sur la valeur affichée (poids, taille, sport, eau, sel) et l'éditer
//   • ou : ouvrir la console du navigateur et taper `localStorage.clear()` puis recharger
// =============================================================================

// ---------- 1) PROFIL ----------
const defaultProfile = {
  sex:        'homme', // 'homme' ou 'femme' — change le calcul du BMR (Mifflin-St Jeor)
  weight:     64,    // kg
  height:     176,   // cm
  water:      3.5,   // L / jour
  sportHours: 9      // h / semaine
};

// ---------- 2) ALIMENTS ----------
// Champs : name (libellé), qty (quantité par défaut), unit ('g' ou 'pièce'),
// step (pas de l'input numérique), kcal/prot/k/fibre/vitC/na/gluc (densités
// nutritionnelles **par unité** : par g pour 'g', par pièce pour 'pièce').
//
// CONVENTION GLUCIDES (important) : `gluc` suit la convention CIQUAL / EU
// (Règlement UE 1169/2011) = glucides disponibles, **excluant les fibres**.
// Différent de l'USDA "carbohydrate, by difference" qui inclut les fibres.
// Pour passer de USDA à CIQUAL : gluc_ciqual = carbs_usda − fibre_usda.
// Exemple : chia USDA carbs 42 g/100g − fibre 34 g = 8 g de glucides nets
// (la masse fibreuse est comptée séparément dans `fibre`).
const defaultFoods = {
  oeufs:         { name:'Œufs bio',                  qty:3,   unit:'pièce', step:1,   kcal:70,    prot:6,     k:65,    fibre:0,     vitC:0,     na:62,   gluc:0.4    },
  patateDouce:   { name:'Patate douce',              qty:150, unit:'g',     step:10,  kcal:0.86,  prot:0.016, k:3.37,  fibre:0.030, vitC:0.024, na:0.55, gluc:0.207  },
  champignons:   { name:'Champignons de Paris',      qty:50, unit:'g',     step:10,  kcal:0.22,  prot:0.031, k:3.18,  fibre:0.010, vitC:0.02,  na:0.05, gluc:0.033  },
  courgettes:    { name:'Courgettes',                qty:80, unit:'g',     step:10,  kcal:0.17,  prot:0.012, k:2.61,  fibre:0.011, vitC:0.179, na:0.08, gluc:0.031  },
  huileOlivePD:  { name:"Huile d'olive (matin)",     qty:12,  unit:'g',     step:1,   kcal:9,     prot:0,     k:0,     fibre:0,     vitC:0,     na:0,    gluc:0      },
  chia:          { name:'Graines de chia',           qty:15,  unit:'g',     step:5,   kcal:4.86,  prot:0.17,  k:4.07,  fibre:0.34,  vitC:0,     na:0.16, gluc:0.077  },
  linMoulu:      { name:'Graines de lin moulues',    qty:15,  unit:'g',     step:1,   kcal:5.34,  prot:0.18,  k:8.13,  fibre:0.27,  vitC:0,     na:0.30, gluc:0.016  },
  dattes:        { name:'Dattes (Deglet Nour)',      qty:0,  unit:'g',     step:5,   kcal:2.82,  prot:0.0245,k:6.56,  fibre:0.08,  vitC:0.004,          gluc:0.67   },
  noix:          { name:'Noix',                      qty:43.2,  unit:'g',     step:5,   kcal:6.54,  prot:0.15,  k:4.41,  fibre:0.067, vitC:0,              gluc:0.069  },
  noixBresil:    { name:'Noix du Brésil',            qty:8.6,   unit:'g',     step:1,   kcal:6.56,  prot:0.14,  k:6.59,  fibre:0.075, vitC:0,              gluc:0.053  },
  noisettes:     { name:'Noisettes',                 qty:4.3,  unit:'g',     step:1,   kcal:6.28,  prot:0.15,  k:6.80,  fibre:0.097, vitC:0,              gluc:0.072  },
  grainesCourge: { name:'Graines de courge',         qty:8.6,  unit:'g',     step:1,   kcal:5.59,  prot:0.30,  k:8.09,  fibre:0.06,  vitC:0,              gluc:0.045  },
  amandes:       { name:'Amandes',                   qty:4.3,  unit:'g',     step:1,   kcal:5.79,  prot:0.21,  k:7.33,  fibre:0.125, vitC:0,              gluc:0.095  },
  nigelle:       { name:'Nigelle',                   qty:2.2,   unit:'g',     step:1,   kcal:4,     prot:0.23,  k:8.08,  fibre:0.06,  vitC:0,              gluc:0.23   },
  sesame:        { name:'Sésame complet (moulu)',    qty:8.6,  unit:'g',     step:1,   kcal:5.73,  prot:0.177, k:4.68,  fibre:0.118, vitC:0,              gluc:0.098  },
  huileOliveOl:  { name:"Huile d'olive (oléag.)",    qty:12,  unit:'g',     step:1,   kcal:9,     prot:0,     k:0,     fibre:0,     vitC:0,              gluc:0      },
  chocolat70:    { name:'Chocolat noir 70%',         qty:20,  unit:'g',     step:5,   kcal:5.46,  prot:0.078, k:7.15,  fibre:0.11,  vitC:0,              gluc:0.35   },
  banane:        { name:'Banane (après-midi)',       qty:180, unit:'g',     step:10,  kcal:0.89,  prot:0.011, k:3.58,  fibre:0.026, vitC:0.087,          gluc:0.197  },
  kiwi:          { name:'Kiwi',                      qty:1,   unit:'pièce', step:1,   kcal:42,    prot:0.8,   k:215,   fibre:2,     vitC:64,             gluc:7.7    },
  whey:          { name:'Whey',                      qty:20,  unit:'g',     step:5,   kcal:4,     prot:0.8,   k:1.5,   fibre:0,     vitC:0,              gluc:0.05   },
  collagene:     { name:'Collagène hydrolysé',       qty:10,  unit:'g',     step:1,   kcal:3.6,   prot:0.9,   k:0,     fibre:0,     vitC:0,              gluc:0      },
  viandePoisson: { name:'Viande / poisson',          qty:200, unit:'g',     step:10,  kcal:1.65,  prot:0.25,  k:2.5,   fibre:0,     vitC:0,     na:0.7,  gluc:0      },
  legumesDiner:  { name:'Légumes (dîner mix)',       qty:250, unit:'g',     step:10,  kcal:0.5,   prot:0.02,  k:2.5,   fibre:0.025, vitC:0.15,  na:0.5,  gluc:0.09   },
  pomme:         { name:'Pomme (soir)',              qty:75, unit:'g',     step:10,  kcal:0.52,  prot:0.003, k:1.07,  fibre:0.024, vitC:0.046,          gluc:0.113  },
  amandesCoucher:{ name:'Amandes (coucher)',         qty:5,   unit:'g',     step:1,   kcal:5.79,  prot:0.21,  k:7.33,  fibre:0.125, vitC:0,              gluc:0.095  },
  sel:           { name:'Sel ajouté (total / jour)', qty:3,  unit:'g',     step:0.5, kcal:0,     prot:0,     k:0,     fibre:0,     vitC:0,     na:387,  gluc:0      },
  clousGirofle:  { name:'Clous de girofle',          qty:2,   unit:'pièce', step:1,   kcal:0.3,   prot:0.003, k:0.5,   fibre:0.017, vitC:0,     na:0.014,gluc:0.033  }
};

// Regroupement pour l'affichage dans l'onglet « Aliments »
const foodGroups = [
  { title:'Petit-déjeuner',    ids:['oeufs','patateDouce','champignons','courgettes','huileOlivePD'] },
  { title:'Hydratation matin', ids:['linMoulu','chia'] },
  { title:'Clous de girofle',  ids:['clousGirofle'] },
  { title:'Créneau créatine',  ids:['dattes'] },
  { title:'Mix oléagineux',    ids:['noix','noixBresil','noisettes','grainesCourge','amandes','nigelle','sesame','huileOliveOl','chocolat70'] },
  { title:'Fruits & kiwi',     ids:['banane','kiwi'] },
  { title:'Whey + Collagène',  ids:['whey','collagene'] },
  { title:'Dîner',             ids:['viandePoisson','legumesDiner'] },
  { title:'Soir & coucher',    ids:['pomme','amandesCoucher'] },
  { title:'Sel ajouté',        ids:['sel'] }
];

// ---------- 2 bis) MIX OLÉAGINEUX (proportion-based) ----------
// L'utilisateur définit une dose journalière TOTALE et les "parts" relatives
// de chaque composant. Les qty individuels de defaultFoods[noix etc.] sont
// recalculés à partir de ça : qty[id] = (parts[id] / Σparts) × total.
// Permet de scaler tout le mix d'un coup ou de rééquilibrer les proportions
// sans toucher aux 6 inputs un par un.
const MIX_OLEAGINEUX_IDS = ['noix','noixBresil','noisettes','grainesCourge','amandes','nigelle','sesame'];
const defaultMixOleagineux = {
  total: 80,                   // g/jour pour les 7 oléagineux
  parts: { noix:300, noixBresil:60, noisettes:30, grainesCourge:60, amandes:30, nigelle:15, sesame:60 }
};

// ---------- 3) SUPPLÉMENTS ----------
const defaultSupplements = {
  zinc: { name:'Zinc (WeightWorld)',   qty:8, unit:'mg', step:0.5, hint:'25 = 1j/1, 12,5 = 1j/2, 0 = pause' },
  vitC: { name:'Vit C (½ cp Innovit)', qty:500,  unit:'mg', step:50,  hint:'500 = ½ cp, 250 = ¼ cp, 0 = pause' }
};

// Apports zinc qui ne passent pas par defaultSupplements
const ZINC_FROM_FOOD  = 8;   // mg/j estimé via alimentation
const ZINC_FROM_MULTI = 8;   // mg/j depuis le multi Vit4ever Premium

// ---------- 4) APPORTS DE RÉFÉRENCE (AJR / UL / cibles) ----------
// Liste des clés micronutriments calculées dynamiquement depuis MICRONUTRIENTS.
// Couvre santé globale : énergie (Bs, Fe, Mg), immunité (Zn, Se, vitD, vitA, vitC),
// cerveau (oméga-3, B12, choline, Fe, Mg, iode), peau/cheveux (biotine B7, Zn, vitE,
// vitC, vitA, carotenoïdes), longévité (sélénium, polyphénols indirects, K2, antioxydants).
const MICRO_KEYS = [
  // Minéraux
  'ca','fe','cu','mn','p','zn','mg','se','iode',
  // Vitamines liposolubles
  'vitE','vitEg','vitA','vitD','vitK1','vitK2',
  // Vitamines B (complexe complet)
  'b1','b2','b3','b5','b6','b7','b9','b12',
  // Autres
  'choline',
  // Caroténoïdes (yeux, peau, longévité)
  'betaCarotene','luteinZea','lycopene',
  // Lipides détaillés
  'lip','satFat','mufa','pufa'
];

// Cibles de répartition macros (% des kcal) — éditables comme les TARGETS
const MACRO_SPLIT_TARGET = {
  prot: { good:[16, 30],  warnLow:12, warnHigh:35 },
  gluc: { good:[30, 50],  warnLow:20, warnHigh:60 },
  lip:  { good:[25, 40],  warnLow:20, warnHigh:50 }
};

const NA_AJR_MAX               = 2300;  // mg sodium AJR OMS
const SALT_TARGET_MAX          = 5;     // g sel ajouté / j (≈ 1 càc)
const K_TARGET_HIGH            = 4700;  // mg potassium cible haute
const ZINC_UL                  = 40;    // mg zinc UL EFSA
const SELENIUM_UL              = 300;   // µg sélénium UL
const SELENIUM_FROM_MULTI      = 55;    // µg sélénium / j depuis le multi
const SELENIUM_PER_G_NOIX_BRESIL = 21;  // µg sélénium / g noix du Brésil

// ---------- 3 bis) MICRONUTRIMENTS (densités par unité d'aliment) ----------
// Densités USDA SR / CIQUAL — champs par unité (par g pour 'g', par pièce pour
// 'pièce', cohérent avec defaultFoods). Unités :
//   • Minéraux (ca, fe, cu, mn, p, zn, mg) : mg
//   • iode, se, vitA (µg ER/RAE), vitD, vitK1, vitK2, b9 (folates), b7 (biotine),
//     b12, betaCarotene, luteinZea, lycopene : µg
//   • Vitamines E (α + γ), B1, B2, B3, B5, B6, choline : mg
//   • lip / satFat / mufa / pufa : g lipides
// Les aliments absents de cette table contribuent 0 à tous les micros.
const MICRONUTRIENTS = {
  // par pièce (œuf bio ~50g)
  oeufs: {
    ca:28, fe:0.88, cu:0.036, mn:0.014, p:99, zn:0.65, mg:6, se:15, iode:12,
    vitE:0.52, vitEg:0.3, vitA:80, vitD:1.0, vitK1:0.15, vitK2:7,
    b1:0.020, b2:0.229, b3:0.038, b5:0.767, b6:0.085, b7:10, b9:23, b12:0.45,
    choline:147, betaCarotene:5, luteinZea:175, lycopene:0,
    lip:5, satFat:1.55, mufa:1.9, pufa:0.95
  },
  patateDouce: {
    ca:0.30, fe:0.0061, cu:0.0014, mn:0.0026, p:0.47, zn:0.003, mg:0.25, se:0.006, iode:0,
    vitE:0.0026, vitEg:0, vitA:7.09, vitD:0, vitK1:0.018, vitK2:0,
    b1:0.00078, b2:0.00061, b3:0.00557, b5:0.008, b6:0.0021, b7:0.015, b9:0.11, b12:0,
    choline:0.123, betaCarotene:94, luteinZea:0, lycopene:0,
    lip:0.0005, satFat:0, mufa:0, pufa:0.0001
  },
  champignons: {
    ca:0.03, fe:0.005, cu:0.0032, mn:0.0005, p:0.86, zn:0.005, mg:0.09, se:0.093, iode:0.18,
    vitE:0.0001, vitEg:0, vitA:0, vitD:0.002, vitK1:0.001, vitK2:0,
    b1:0.00081, b2:0.00402, b3:0.03607, b5:0.01497, b6:0.001, b7:0.16, b9:0.17, b12:0.0004,
    choline:0.176, betaCarotene:0, luteinZea:0, lycopene:0,
    lip:0.003, satFat:0.0005, mufa:0, pufa:0.0015
  },
  courgettes: {
    ca:0.16, fe:0.0037, cu:0.0005, mn:0.0018, p:0.38, zn:0.0032, mg:0.18, se:0.002, iode:0,
    vitE:0.0012, vitEg:0, vitA:0.10, vitD:0, vitK1:0.043, vitK2:0,
    b1:0.00045, b2:0.00094, b3:0.00451, b5:0.00204, b6:0.0016, b7:0.024, b9:0.24, b12:0,
    choline:0.094, betaCarotene:1.2, luteinZea:21, lycopene:0,
    lip:0.0032, satFat:0.0007, mufa:0.0003, pufa:0.0014
  },
  huileOlivePD: {
    ca:0.01, fe:0.0056, cu:0.0001, mn:0, p:0.011, zn:0, mg:0, se:0, iode:0,
    vitE:0.143, vitEg:0, vitA:0, vitD:0, vitK1:0.6, vitK2:0,
    b1:0, b2:0, b3:0, b5:0, b6:0, b7:0, b9:0, b12:0,
    choline:0, betaCarotene:2, luteinZea:0.3, lycopene:0,
    lip:1, satFat:0.14, mufa:0.73, pufa:0.11
  },
  chia: {
    ca:6.31, fe:0.077, cu:0.0092, mn:0.026, p:8.6, zn:0.046, mg:3.35, se:0.552, iode:0,
    vitE:0.005, vitEg:0, vitA:0.03, vitD:0, vitK1:0, vitK2:0,
    b1:0.0062, b2:0.0017, b3:0.0883, b5:0.0094, b6:0, b7:0.08, b9:0.49, b12:0,
    choline:0.69, betaCarotene:0.5, luteinZea:1.6, lycopene:0,
    lip:0.31, satFat:0.034, mufa:0.023, pufa:0.239
  },
  linMoulu: {
    ca:2.55, fe:0.057, cu:0.012, mn:0.026, p:6.42, zn:0.044, mg:3.92, se:0.254, iode:0,
    vitE:0.0031, vitEg:0.1, vitA:0, vitD:0, vitK1:0.043, vitK2:0,
    b1:0.01644, b2:0.00161, b3:0.0308, b5:0.00985, b6:0.005, b7:0.06, b9:0.87, b12:0,
    choline:0.787, betaCarotene:0, luteinZea:0, lycopene:0,
    lip:0.422, satFat:0.037, mufa:0.075, pufa:0.288
  },
  // par gramme (dattes séchées Deglet Nour — USDA SR Legacy)
  dattes: {
    ca:0.39, fe:0.010, cu:0.0021, mn:0.00262, p:0.62, zn:0.0029, mg:0.43, se:0.030, iode:0,
    vitE:0.0005, vitEg:0, vitA:0, vitD:0, vitK1:0.027, vitK2:0,
    b1:0.00052, b2:0.00066, b3:0.01274, b5:0.00589, b6:0.00165, b7:0.015, b9:0.19, b12:0,
    choline:0.063, betaCarotene:0.05, luteinZea:0.23, lycopene:0,
    lip:0.0039, satFat:0.00032, mufa:0.00036, pufa:0.00019
  },
  noix: {
    ca:0.98, fe:0.029, cu:0.016, mn:0.034, p:3.46, zn:0.031, mg:1.58, se:0.049, iode:0,
    vitE:0.007, vitEg:0.21, vitA:0.01, vitD:0, vitK1:0.027, vitK2:0,
    b1:0.00341, b2:0.0015, b3:0.01125, b5:0.0057, b6:0.005, b7:0.19, b9:0.98, b12:0,
    choline:0.394, betaCarotene:0.1, luteinZea:0.09, lycopene:0,
    lip:0.654, satFat:0.061, mufa:0.089, pufa:0.472
  },
  noixBresil: {
    ca:1.60, fe:0.024, cu:0.017, mn:0.012, p:7.25, zn:0.041, mg:3.76, se:19.17, iode:0,
    vitE:0.057, vitEg:0.075, vitA:0, vitD:0, vitK1:0, vitK2:0,
    b1:0.00617, b2:0.00035, b3:0.00295, b5:0.00184, b6:0.001, b7:0.18, b9:0.22, b12:0,
    choline:0.286, betaCarotene:0, luteinZea:0, lycopene:0,
    lip:0.66, satFat:0.151, mufa:0.243, pufa:0.207
  },
  noisettes: {
    ca:1.14, fe:0.047, cu:0.017, mn:0.062, p:2.90, zn:0.025, mg:1.63, se:0.024, iode:0,
    vitE:0.150, vitEg:0.005, vitA:0.01, vitD:0, vitK1:0.14, vitK2:0,
    b1:0.00643, b2:0.00113, b3:0.018, b5:0.00918, b6:0.005, b7:0.75, b9:1.13, b12:0,
    choline:0.453, betaCarotene:0.1, luteinZea:0.9, lycopene:0,
    lip:0.61, satFat:0.045, mufa:0.459, pufa:0.078
  },
  grainesCourge: {
    ca:0.46, fe:0.088, cu:0.013, mn:0.045, p:12.33, zn:0.078, mg:5.92, se:0.094, iode:0,
    vitE:0.006, vitEg:0.35, vitA:0.01, vitD:0, vitK1:0.51, vitK2:0,
    b1:0.00273, b2:0.00153, b3:0.04987, b5:0.0075, b6:0.001, b7:0.07, b9:0.58, b12:0,
    choline:0.63, betaCarotene:1.3, luteinZea:0.75, lycopene:0,
    lip:0.49, satFat:0.087, mufa:0.162, pufa:0.207
  },
  amandes: {
    ca:2.69, fe:0.037, cu:0.010, mn:0.022, p:4.81, zn:0.031, mg:2.70, se:0.041, iode:0,
    vitE:0.260, vitEg:0.006, vitA:0, vitD:0, vitK1:0, vitK2:0,
    b1:0.00205, b2:0.01138, b3:0.03618, b5:0.00471, b6:0.001, b7:0.64, b9:0.50, b12:0,
    choline:0.521, betaCarotene:0, luteinZea:0.1, lycopene:0,
    lip:0.50, satFat:0.038, mufa:0.316, pufa:0.122
  },
  nigelle: {
    ca:1.85, fe:0.18, cu:0.009, mn:0.012, p:5.4, zn:0.048, mg:2.65, se:0.12, iode:0,
    vitE:0.030, vitEg:0, vitA:0, vitD:0, vitK1:0, vitK2:0,
    b1:0.015, b2:0.0036, b3:0.057, b5:0.0061, b6:0, b7:0.05, b9:0.60, b12:0,
    choline:0, betaCarotene:0.6, luteinZea:0.95, lycopene:0,
    lip:0.35, satFat:0.045, mufa:0.083, pufa:0.200
  },
  sesame: {
    ca:9.75, fe:0.146, cu:0.041, mn:0.025, p:6.29, zn:0.078, mg:3.51, se:0.344, iode:0,
    vitE:0.003, vitEg:0.0028, vitA:0.005, vitD:0, vitK1:0, vitK2:0,
    b1:0.00791, b2:0.00247, b3:0.04515, b5:0.0005, b6:0.008, b7:0.11, b9:0.97, b12:0,
    choline:0.252, betaCarotene:0.05, luteinZea:0, lycopene:0,
    lip:0.50, satFat:0.070, mufa:0.190, pufa:0.220
  },
  huileOliveOl: {
    ca:0.01, fe:0.0056, cu:0.0001, mn:0, p:0.011, zn:0, mg:0, se:0, iode:0,
    vitE:0.143, vitEg:0, vitA:0, vitD:0, vitK1:0.6, vitK2:0,
    b1:0, b2:0, b3:0, b5:0, b6:0, b7:0, b9:0, b12:0,
    choline:0, betaCarotene:2, luteinZea:0.3, lycopene:0,
    lip:1, satFat:0.14, mufa:0.73, pufa:0.11
  },
  chocolat70: {
    ca:0.73, fe:0.119, cu:0.018, mn:0.020, p:3.08, zn:0.033, mg:2.28, se:0.068, iode:0,
    vitE:0.006, vitEg:0, vitA:0.02, vitD:0, vitK1:0.073, vitK2:0,
    b1:0.00034, b2:0.00078, b3:0.01054, b5:0.00418, b6:0.0004, b7:0.06, b9:0.25, b12:0.0028,
    choline:0.46, betaCarotene:0.2, luteinZea:0.3, lycopene:0,
    lip:0.428, satFat:0.247, mufa:0.130, pufa:0.013
  },
  banane: {
    ca:0.05, fe:0.0026, cu:0.00078, mn:0.0027, p:0.22, zn:0.0015, mg:0.27, se:0.01, iode:0,
    vitE:0.001, vitEg:0, vitA:0.03, vitD:0, vitK1:0.005, vitK2:0,
    b1:0.00031, b2:0.00073, b3:0.00665, b5:0.00334, b6:0.0037, b7:0.055, b9:0.20, b12:0,
    choline:0.098, betaCarotene:0.25, luteinZea:0.22, lycopene:0,
    lip:0.0033, satFat:0.0011, mufa:0.0003, pufa:0.0007
  },
  // par pièce (kiwi ~70g)
  kiwi: {
    ca:24, fe:0.21, cu:0.09, mn:0.07, p:24, zn:0.10, mg:11.9, se:0.14, iode:0,
    vitE:1.0, vitEg:0, vitA:3, vitD:0, vitK1:27.8, vitK2:0,
    b1:0.019, b2:0.0175, b3:0.239, b5:0.128, b6:0.04, b7:1.19, b9:17, b12:0,
    choline:5.2, betaCarotene:35, luteinZea:84, lycopene:0,
    lip:0.36, satFat:0.02, mufa:0.03, pufa:0.19
  },
  whey: {
    ca:5, fe:0.005, cu:0, mn:0, p:4, zn:0.05, mg:0.60, se:0.25, iode:0,
    vitE:0, vitEg:0, vitA:0, vitD:0, vitK1:0, vitK2:0,
    b1:0.009, b2:0.01, b3:0.116, b5:0.058, b6:0.005, b7:0.25, b9:1, b12:0.035,
    choline:0.5, betaCarotene:0, luteinZea:0, lycopene:0,
    lip:0.03, satFat:0.02, mufa:0.005, pufa:0.005
  },
  collagene: {
    ca:0.1, fe:0, cu:0, mn:0, p:0.05, zn:0, mg:0.02, se:0.01, iode:0,
    vitE:0, vitEg:0, vitA:0, vitD:0, vitK1:0, vitK2:0,
    b1:0, b2:0, b3:0, b5:0, b6:0, b7:0, b9:0, b12:0,
    choline:0, betaCarotene:0, luteinZea:0, lycopene:0,
    lip:0.001, satFat:0, mufa:0, pufa:0
  },
  viandePoisson: {
    ca:0.10, fe:0.015, cu:0.001, mn:0.0001, p:2.0, zn:0.030, mg:0.27, se:0.35, iode:0.5,
    vitE:0.005, vitEg:0, vitA:0.5, vitD:0.055, vitK1:0.01, vitK2:0.05,
    b1:0.0015, b2:0.0013, b3:0.115, b5:0.007, b6:0.005, b7:0.07, b9:0.05, b12:0.012,
    choline:0.85, betaCarotene:0, luteinZea:0, lycopene:0,
    lip:0.05, satFat:0.015, mufa:0.018, pufa:0.012
  },
  legumesDiner: {
    ca:0.30, fe:0.008, cu:0.001, mn:0.002, p:0.50, zn:0.003, mg:0.38, se:0.006, iode:0,
    vitE:0.003, vitEg:0, vitA:20, vitD:0, vitK1:1.0, vitK2:0,
    b1:0.00063, b2:0.00122, b3:0.00622, b5:0.00336, b6:0.003, b7:0.035, b9:0.40, b12:0,
    choline:0.20, betaCarotene:21, luteinZea:32, lycopene:7.5,
    lip:0.005, satFat:0.001, mufa:0.001, pufa:0.002
  },
  pomme: {
    ca:0.06, fe:0.0012, cu:0.00027, mn:0.00035, p:0.11, zn:0.0004, mg:0.05, se:0, iode:0,
    vitE:0.0018, vitEg:0, vitA:0.03, vitD:0, vitK1:0.022, vitK2:0,
    b1:0.00017, b2:0.00026, b3:0.00091, b5:0.00061, b6:0.00041, b7:0.013, b9:0.03, b12:0,
    choline:0.034, betaCarotene:0.25, luteinZea:0.3, lycopene:0,
    lip:0.0017, satFat:0.0003, mufa:0.00007, pufa:0.0005
  },
  amandesCoucher: {
    ca:2.69, fe:0.037, cu:0.010, mn:0.022, p:4.81, zn:0.031, mg:2.70, se:0.041, iode:0,
    vitE:0.260, vitEg:0.006, vitA:0, vitD:0, vitK1:0, vitK2:0,
    b1:0.00205, b2:0.01138, b3:0.03618, b5:0.00471, b6:0.001, b7:0.64, b9:0.50, b12:0,
    choline:0.521, betaCarotene:0, luteinZea:0.1, lycopene:0,
    lip:0.50, satFat:0.038, mufa:0.316, pufa:0.122
  },
  sel: {
    ca:0.024, fe:0.0003, cu:0, mn:0, p:0, zn:0.0001, mg:0.01, se:0.001, iode:0,
    vitE:0, vitEg:0, vitA:0, vitD:0, vitK1:0, vitK2:0,
    b1:0, b2:0, b3:0, b5:0, b6:0, b7:0, b9:0, b12:0,
    choline:0, betaCarotene:0, luteinZea:0, lycopene:0,
    lip:0, satFat:0, mufa:0, pufa:0
  },
  // par pièce (clou de girofle séché ~0.1 g)
  clousGirofle: {
    ca:0.6, fe:0.012, cu:0.0023, mn:0.06, p:0.91, zn:0.023, mg:0.259, se:0.0072, iode:0,
    vitE:0.083, vitEg:0, vitA:0.13, vitD:0, vitK1:1.42, vitK2:0,
    b1:0.000158, b2:0.00022, b3:0.00156, b5:0.000509, b6:0.0039, b7:0.017, b9:0.25, b12:0,
    choline:0.37, betaCarotene:0.1, luteinZea:0.46, lycopene:0,
    lip:0.13, satFat:0.04, mufa:0.009, pufa:0.025
  }
};

// Apports estimés des suppléments en micronutriments — éditables si tu connais
// les dosages exacts de ton multi (Vit4ever Premium A-Z 26 actifs). Valeurs
// par défaut : ~100 % AJR pour les vitamines/minéraux du multi standard.
// Unités cohérentes avec MICRONUTRIENTS (mg sauf vitA µg ER, b9 µg, vitK1 µg, iode µg).
const SUPPLEMENT_CONTRIBUTIONS = {
  // ----- Minéraux -----
  ca:      120,   // mg (multi)
  fe:      14,    // mg (multi)
  cu:      1,     // mg (multi — bisglycinate)
  mn:      2,     // mg (multi)
  p:       0,
  zn:      8,     // mg (multi) — Zn WW ajouté séparément dans le calcul
  mg:      410,   // mg = 100 (multi) + 310 (Vit4ever Bisglycinate)
  se:      55,    // µg (multi) — noix Brésil ajouté séparément
  iode:    150,   // µg (multi)
  // ----- Vitamines liposolubles -----
  vitE:    24,    // mg α-tocophérol (multi)
  vitEg:   0,
  vitA:    800,   // µg ER (multi)
  vitD:    130,   // µg = 5 (multi) + 125 (Vit4ever Depot 5000 IU)
  vitK1:   0,     // K1 pas dans multi typique
  vitK2:   200,   // µg MK-7 (D3+K2 Vit4ever Depot + ~75µg multi)
  // ----- Vitamines B (toutes formes actives dans Vit4ever Premium A-Z) -----
  b1:      1.4,   // mg thiamine
  b2:      1.6,   // mg riboflavine
  b3:      18,    // mg niacine (souvent nicotinamide)
  b5:      6,     // mg ac. pantothénique
  b6:      1.4,   // mg P-5-P
  b7:      150,   // µg biotine (multi)
  b9:      400,   // µg L-5-MTHF (Magnafolate Pro, multi)
  b12:     25,    // µg méthylcobalamine (multi — dosage souvent élevé)
  // ----- Autres -----
  choline: 0,     // pas dans multi standard
  betaCarotene: 0, // µg — pas de carot. supplémenté (vitA déjà couverte)
  luteinZea: 0,
  lycopene: 0,
  lip:     0,
  satFat:  0,
  mufa:    0,
  pufa:    0
};

// ---------- 4 bis) INTERVALLES OBJECTIFS (coloration des stats) ----------
// Pilote la coloration des cartes en haut de page et de la barre des totaux
// dans l'onglet Aliments. Pour chaque métrique :
//   • good       : [min, max] de la zone verte (apports OK)
//   • warnLow    : valeur minimale tolérée (en dessous → rouge). Omettre si pas
//                  de seuil bas (ex. sodium).
//   • warnHigh   : valeur maximale tolérée (au-dessus → rouge). Omettre si pas
//                  de seuil haut.
//   Entre good et warnLow/warnHigh → orange (à surveiller).
//
// Modifier ces valeurs change uniquement la coloration, pas les calculs.
const TARGETS = {
  // ----- Macros & énergie -----
  kcal:    { good:[2000, 2500], warnLow:1800,  warnHigh:3300, unit:'kcal' },
  prot:    { good:[90,   130],  warnLow:70,    warnHigh:160,  unit:'g'    },
  gluc:    { good:[50,  180],  warnLow:35,   warnHigh:330,  unit:'g'    },
  lip:     { good:[60,   150],  warnLow:40,    warnHigh:200,  unit:'g'    },
  fibre:   { good:[40,   60],   warnLow:18,    warnHigh:78,   unit:'g'    },
  // ----- Électrolytes -----
  vitC:    { good:[110,  1000], warnLow:75,    warnHigh:2000, unit:'mg'   },
  k:       { good:[4000, 4700], warnLow:3000,  warnHigh:5500, unit:'mg'   },
  na:      { good:[0,    2300],                warnHigh:3000, unit:'mg'   },
  // ----- Minéraux -----
  ca:      { good:[1000, 2000], warnLow:700,   warnHigh:2500, unit:'mg'   },
  fe:      { good:[8,    18],   warnLow:6,     warnHigh:25,   unit:'mg'   },
  cu:      { good:[0.9,  3],    warnLow:0.7,   warnHigh:5,    unit:'mg'   },
  mn:      { good:[2.3,  6],    warnLow:1.8,   warnHigh:11,   unit:'mg'   },
  p:       { good:[700,  1500], warnLow:550,   warnHigh:4000, unit:'mg'   },
  zn:      { good:[11,   25],   warnLow:8,     warnHigh:40,   unit:'mg'   },
  mg:      { good:[400,  600],  warnLow:300,   warnHigh:700,  unit:'mg'   },  // RDA 400-420 H, 310-320 F. UL suppl alone 250mg/j EU.
  se:      { good:[55,   250],  warnLow:40,    warnHigh:300,  unit:'µg'   },  // UL EFSA 300, attention noix Brésil
  iode:    { good:[150,  600],  warnLow:100,   warnHigh:1100, unit:'µg'   },
  // ----- Vitamines liposolubles -----
  vitE:    { good:[12,   50],   warnLow:8,     warnHigh:300,  unit:'mg'   },
  vitA:    { good:[700,  3000], warnLow:500,   warnHigh:3000, unit:'µg'   },
  vitD:    { good:[20,   75],   warnLow:15,    warnHigh:100,  unit:'µg'   },  // 800-3000 IU. UL 100µg EFSA.
  vitK1:   { good:[70,   500],  warnLow:50,                   unit:'µg'   },
  vitK2:   { good:[90,   250],  warnLow:50,    warnHigh:500,  unit:'µg'   },
  // ----- Vitamines B (complexe complet) -----
  b1:      { good:[1.2,  50],   warnLow:0.9,                  unit:'mg'   },  // RDA 1.1-1.2 mg, hydrosoluble, pas d'UL
  b2:      { good:[1.3,  50],   warnLow:1,                  unit:'mg'   },  // RDA 1.1-1.3 mg, pas d'UL
  b3:      { good:[14,   60],   warnLow:11,    warnHigh:900,  unit:'mg'   },  // RDA 14-16 mg. UL 35 mg = acide nicotinique (flushing) ; nicotinamide UL ~900 mg. Diète riche en niacine de viande/graines = normal d'être au-dessus 35.
  b5:      { good:[5,    50],   warnLow:3,                    unit:'mg'   },  // AI 5 mg, pas d'UL
  b6:      { good:[1.3,  10],   warnLow:1,     warnHigh:25,   unit:'mg'   },
  b7:      { good:[30,   5000], warnLow:20,                   unit:'µg'   },  // AI 30 µg, pas d'UL, fortement sécuritaire
  b9:      { good:[400,  800],  warnLow:250,   warnHigh:1000, unit:'µg'   },
  b12:     { good:[4,    1000], warnLow:2.4,                  unit:'µg'   },  // EFSA AR 4 µg, pas d'UL, hydrosoluble
  // ----- Autres -----
  choline: { good:[425,  1500], warnLow:300,   warnHigh:3500, unit:'mg'   },
  // ----- Caroténoïdes (yeux, peau, longévité) -----
  betaCarotene: { good:[3000, 15000], warnLow:1500, warnHigh:30000, unit:'µg' }, // 3-15 mg/j cible antioxydant
  luteinZea:    { good:[6000, 20000], warnLow:2000,                  unit:'µg' }, // 6-10 mg/j protection macula (AREDS2)
  lycopene:     { good:[6000, 15000], warnLow:2000,                  unit:'µg' }, // 6-10 mg/j cardio/prostate (sources: tomate, pastèque)
  // (sélénium gardé séparément sous nom court — alias pour rétrocompat)
  selenium:{ good:[55,   250],  warnLow:40,    warnHigh:300,  unit:'µg'   }
};

// ---------- 5) OMÉGA-3 / OMÉGA-6 ----------
// Densités ALA (oméga-3) et LA (oméga-6) — g par unité d'aliment (par g pour 'g',
// par pièce pour 'pièce'). Sources : USDA / CIQUAL.
const OMEGA = {
  chia:           { ala: 0.178,  la: 0.058  },
  linMoulu:       { ala: 0.228,  la: 0.059  },
  noix:           { ala: 0.091,  la: 0.381  },
  noixBresil:     { ala: 0,      la: 0.240  },
  noisettes:      { ala: 0.001,  la: 0.079  },
  grainesCourge:  { ala: 0.002,  la: 0.207  },
  amandes:        { ala: 0,      la: 0.123  },
  amandesCoucher: { ala: 0,      la: 0.123  },
  nigelle:        { ala: 0,      la: 0.250  },
  sesame:         { ala: 0.004,  la: 0.214  },
  huileOlivePD:   { ala: 0.008,  la: 0.098  },
  huileOliveOl:   { ala: 0.008,  la: 0.098  },
  oeufs:          { ala: 0.02,   la: 0.7    }, // par pièce (~50 g/œuf)
  chocolat70:     { ala: 0,      la: 0.005  },
  viandePoisson:  { ala: 0.001,  la: 0.008  },
  patateDouce:    { ala: 0,      la: 0.0001 }
};
const EPA_DHA_SUPP_G = 1.5;   // g/j depuis l'oméga-3 IFOS Zenement (1000 EPA + 500 DHA)
const EPA_DHA_FOOD_G = 0.3;   // estimation moyenne via le mix viande/poisson

// ---------- 6) BCAA ----------
// % de BCAA dans la protéine, par source. Default ~16 % pour le reste.
const BCAA_PCT = {
  whey:          0.25,
  oeufs:         0.20,
  viandePoisson: 0.20,
  collagene:     0.03,
  default:       0.16
};
const LEUCINE_PCT_OF_BCAA = 0.42;  // ~42 % de la masse BCAA est de la leucine

// ---------- 7) FIBRES ----------
// Fraction soluble dans la fibre totale d'un aliment (le reste est insoluble).
// Sources : USDA / CIQUAL. Default 0,25 si non spécifié.
const FIBRE_SOL_PCT = {
  chia:           0.21,
  linMoulu:       0.26,
  patateDouce:    0.33,
  champignons:    0.30,
  courgettes:     0.30,
  dattes:         0.19,
  noix:           0.22,
  noixBresil:     0.07,
  noisettes:      0.15,
  grainesCourge:  0.17,
  amandes:        0.12,
  amandesCoucher: 0.12,
  nigelle:        0.20,
  sesame:         0.20,
  chocolat70:     0.10,
  banane:         0.27,
  kiwi:           0.24,
  pomme:          0.42,
  legumesDiner:   0.30,
  default:        0.25
};
// Sous-catégories remarquables
const MUCILAGE_FOODS     = ['chia','linMoulu'];                    // tout le soluble = mucilage
const PECTINE_FOODS      = ['pomme','kiwi','courgettes','banane']; // pectine ~50 % du soluble
const BETA_GLUCANE_FOODS = ['champignons'];                        // β-glucanes ~30 % de la fibre totale

// ---------- 8) RÉPARTITION PROTÉINES ----------
// Sources de protéines pour la barre « breakdown » de l'onglet Nutrition.
const PROT_SOURCES = [
  { name:'Œufs',             ids:['oeufs'],                                                                                       color:'#f0a45d' },
  { name:'Viande / poisson', ids:['viandePoisson'],                                                                               color:'#e06060' },
  { name:'Whey',             ids:['whey'],                                                                                        color:'#a78bfa' },
  { name:'Collagène',        ids:['collagene'],                                                                                   color:'#5dadec' },
  { name:'Oléagineux',       ids:['noix','noixBresil','noisettes','grainesCourge','amandes','nigelle','sesame','amandesCoucher','chocolat70'], color:'#4fd1a5' },
  { name:'Légumes',          ids:['patateDouce','champignons','courgettes','legumesDiner'],                                       color:'#7adfa4' },
  { name:'Graines / lin',    ids:['chia','linMoulu'],                                                                             color:'#9aa0e8' },
  { name:'Fruits',           ids:['dattes','banane','kiwi','pomme'],                                                              color:'#e8a7d3' }
];
