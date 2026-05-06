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
const defaultFoods = {
  oeufs:         { name:'Œufs bio',                  qty:3,   unit:'pièce', step:1,   kcal:70,    prot:6,     k:65,    fibre:0,     vitC:0,     na:62,   gluc:0.4    },
  patateDouce:   { name:'Patate douce',              qty:100, unit:'g',     step:10,  kcal:0.86,  prot:0.016, k:3.37,  fibre:0.030, vitC:0.024, na:0.55, gluc:0.207  },
  champignons:   { name:'Champignons de Paris',      qty:50, unit:'g',     step:10,  kcal:0.22,  prot:0.031, k:3.18,  fibre:0.010, vitC:0.02,  na:0.05, gluc:0.033  },
  courgettes:    { name:'Courgettes',                qty:66, unit:'g',     step:10,  kcal:0.17,  prot:0.012, k:2.61,  fibre:0.011, vitC:0.179, na:0.08, gluc:0.031  },
  huileOlivePD:  { name:"Huile d'olive (matin)",     qty:12,  unit:'g',     step:1,   kcal:9,     prot:0,     k:0,     fibre:0,     vitC:0,     na:0,    gluc:0      },
  chia:          { name:'Graines de chia',           qty:15,  unit:'g',     step:5,   kcal:4.86,  prot:0.17,  k:0.04,  fibre:0.34,  vitC:0,     na:0.16, gluc:0.42   },
  linMoulu:      { name:'Graines de lin moulues',    qty:15,  unit:'g',     step:1,   kcal:5.34,  prot:0.18,  k:8.13,  fibre:0.27,  vitC:0,     na:0.30, gluc:0.29   },
  dattes:        { name:'Dattes Medjool',            qty:3,   unit:'pièce', step:1,   kcal:27,    prot:0.2,   k:167,   fibre:0.6,   vitC:0,              gluc:8      },
  noix:          { name:'Noix',                      qty:50,  unit:'g',     step:5,   kcal:6.54,  prot:0.15,  k:4.41,  fibre:0.067, vitC:0,              gluc:0.137  },
  noixBresil:    { name:'Noix du Brésil',            qty:8,   unit:'g',     step:1,   kcal:6.56,  prot:0.14,  k:6.59,  fibre:0.075, vitC:0,              gluc:0.122  },
  noisettes:     { name:'Noisettes',                 qty:10,  unit:'g',     step:1,   kcal:6.28,  prot:0.15,  k:6.80,  fibre:0.097, vitC:0,              gluc:0.169  },
  grainesCourge: { name:'Graines de courge',         qty:20,  unit:'g',     step:1,   kcal:5.59,  prot:0.30,  k:8.09,  fibre:0.06,  vitC:0,              gluc:0.107  },
  amandes:       { name:'Amandes',                   qty:10,  unit:'g',     step:1,   kcal:5.79,  prot:0.21,  k:7.33,  fibre:0.125, vitC:0,              gluc:0.216  },
  nigelle:       { name:'Nigelle',                   qty:3,   unit:'g',     step:1,   kcal:4,     prot:0.16,  k:0,     fibre:0,     vitC:0,              gluc:0.52   },
  huileOliveOl:  { name:"Huile d'olive (oléag.)",    qty:12,  unit:'g',     step:1,   kcal:9,     prot:0,     k:0,     fibre:0,     vitC:0,              gluc:0      },
  chocolat70:    { name:'Chocolat noir 70%',         qty:20,  unit:'g',     step:5,   kcal:5.46,  prot:0.078, k:7.15,  fibre:0.11,  vitC:0,              gluc:0.46   },
  banane:        { name:'Banane (après-midi)',       qty:120, unit:'g',     step:10,  kcal:0.89,  prot:0.011, k:3.58,  fibre:0.026, vitC:0.087,          gluc:0.228  },
  kiwi:          { name:'Kiwi',                      qty:1,   unit:'pièce', step:1,   kcal:42,    prot:0.8,   k:215,   fibre:2,     vitC:64,             gluc:11     },
  whey:          { name:'Whey',                      qty:20,  unit:'g',     step:5,   kcal:4,     prot:0.8,   k:1.5,   fibre:0,     vitC:0,              gluc:0.05   },
  collagene:     { name:'Collagène hydrolysé',       qty:10,  unit:'g',     step:1,   kcal:3.6,   prot:0.9,   k:0,     fibre:0,     vitC:0,              gluc:0      },
  viandePoisson: { name:'Viande / poisson',          qty:200, unit:'g',     step:10,  kcal:1.65,  prot:0.25,  k:2.5,   fibre:0,     vitC:0,     na:0.7,  gluc:0      },
  legumesDiner:  { name:'Légumes (dîner mix)',       qty:400, unit:'g',     step:10,  kcal:0.5,   prot:0.02,  k:2.5,   fibre:0.025, vitC:0.15,  na:0.5,  gluc:0.09   },
  pomme:         { name:'Pomme (soir)',              qty:150, unit:'g',     step:10,  kcal:0.52,  prot:0.003, k:1.07,  fibre:0.024, vitC:0.046,          gluc:0.138  },
  amandesCoucher:{ name:'Amandes (coucher)',         qty:5,   unit:'g',     step:1,   kcal:5.79,  prot:0.21,  k:7.33,  fibre:0.125, vitC:0,              gluc:0.216  },
  sel:           { name:'Sel ajouté (total / jour)', qty:3,  unit:'g',     step:0.5, kcal:0,     prot:0,     k:0,     fibre:0,     vitC:0,     na:387,  gluc:0      },
  clousGirofle:  { name:'Clous de girofle',          qty:2,   unit:'pièce', step:1,   kcal:0.3,   prot:0.003, k:0.5,   fibre:0.017, vitC:0,     na:0.014,gluc:0.033  }
};

// Regroupement pour l'affichage dans l'onglet « Aliments »
const foodGroups = [
  { title:'Petit-déjeuner',    ids:['oeufs','patateDouce','champignons','courgettes','huileOlivePD'] },
  { title:'Hydratation matin', ids:['linMoulu','chia'] },
  { title:'Clous de girofle',  ids:['clousGirofle'] },
  { title:'Créneau créatine',  ids:['dattes'] },
  { title:'Mix oléagineux',    ids:['noix','noixBresil','noisettes','grainesCourge','amandes','nigelle','huileOliveOl','chocolat70'] },
  { title:'Fruits & kiwi',     ids:['banane','kiwi'] },
  { title:'Whey + Collagène',  ids:['whey','collagene'] },
  { title:'Dîner',             ids:['viandePoisson','legumesDiner'] },
  { title:'Soir & coucher',    ids:['pomme','amandesCoucher'] },
  { title:'Sel ajouté',        ids:['sel'] }
];

// ---------- 3) SUPPLÉMENTS ----------
const defaultSupplements = {
  zinc: { name:'Zinc (WeightWorld)',   qty:12.5, unit:'mg', step:0.5, hint:'25 = 1j/1, 12,5 = 1j/2, 0 = pause' },
  vitC: { name:'Vit C (½ cp Innovit)', qty:500,  unit:'mg', step:50,  hint:'500 = ½ cp, 250 = ¼ cp, 0 = pause' }
};

// Apports zinc qui ne passent pas par defaultSupplements
const ZINC_FROM_FOOD  = 8;   // mg/j estimé via alimentation
const ZINC_FROM_MULTI = 8;   // mg/j depuis le multi Vit4ever Premium

// ---------- 4) APPORTS DE RÉFÉRENCE (AJR / UL / cibles) ----------
const NA_AJR_MAX               = 2300;  // mg sodium AJR OMS
const SALT_TARGET_MAX          = 5;     // g sel ajouté / j (≈ 1 càc)
const K_TARGET_HIGH            = 4700;  // mg potassium cible haute
const ZINC_UL                  = 40;    // mg zinc UL EFSA
const SELENIUM_UL              = 300;   // µg sélénium UL
const SELENIUM_FROM_MULTI      = 55;    // µg sélénium / j depuis le multi
const SELENIUM_PER_G_NOIX_BRESIL = 21;  // µg sélénium / g noix du Brésil

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
  kcal:  { good:[2300, 2900], warnLow:1800,  warnHigh:3300 },  // kcal / j
  prot:  { good:[90,   130],  warnLow:70,    warnHigh:160  },  // g protéines / j
  gluc:  { good:[180,  280],  warnLow:120,   warnHigh:330  },  // g glucides / j
  fibre: { good:[25,   45],   warnLow:18,    warnHigh:60   },  // g fibres / j
  vitC:  { good:[110,  1000], warnLow:75,    warnHigh:2000 },  // mg vit C alim / j
  k:     { good:[3500, 4700], warnLow:3000,  warnHigh:5500 },  // mg potassium / j
  na:    { good:[0,    2300],                warnHigh:3000 }   // mg sodium / j
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
  { name:'Oléagineux',       ids:['noix','noixBresil','noisettes','grainesCourge','amandes','nigelle','amandesCoucher','chocolat70'], color:'#4fd1a5' },
  { name:'Légumes',          ids:['patateDouce','champignons','courgettes','legumesDiner'],                                       color:'#7adfa4' },
  { name:'Graines / lin',    ids:['chia','linMoulu'],                                                                             color:'#9aa0e8' },
  { name:'Fruits',           ids:['dattes','banane','kiwi','pomme'],                                                              color:'#e8a7d3' }
];
