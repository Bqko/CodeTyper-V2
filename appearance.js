/* ==========================================================
   APPEARANCE (shared by every page, loaded in the <head>)
   Everything the player can customize, and the level at which
   each item unlocks:

     - avatar: hoodie, background, glow, accessory
     - skin (the colours of the whole site)
     - typing font, font size, typed-letter style, caret shape/colour

   The choices are saved in the browser (localStorage) and applied
   to the page as soon as it loads, so there is no flash of the
   wrong colours. The Customize page (customize.html) changes them.
   ========================================================== */

const APPEARANCE_KEY = 'appearance';


/* ==========================================================
   1. THE CATALOG
   Every item has an id, a name and the level it unlocks at.
   Level 1 items are free from the start. To change when
   something unlocks, change its "level".
   ========================================================== */

/* ---------- Avatar ---------- */

const HOODIES = [
  { id: 'navy',     name: 'Navy',     level: 1,  hoodTop: '#1A2744', hoodBottom: '#0E1730', body: '#101A32', bodyStroke: '#2A4175', hoodStroke: '#34508F', strings: '#9DB4E6' },
  { id: 'charcoal', name: 'Charcoal', level: 2,  hoodTop: '#2A2D33', hoodBottom: '#16181C', body: '#181A1F', bodyStroke: '#3A3E46', hoodStroke: '#4A4F59', strings: '#C9CED6' },
  { id: 'crimson',  name: 'Crimson',  level: 5,  hoodTop: '#4A1522', hoodBottom: '#2A0B14', body: '#240A12', bodyStroke: '#7A2438', hoodStroke: '#A0334D', strings: '#F0A8B8' },
  { id: 'forest',   name: 'Forest',   level: 8,  hoodTop: '#153A2A', hoodBottom: '#0B2018', body: '#0A1C14', bodyStroke: '#25664A', hoodStroke: '#2F8A62', strings: '#A6E8C6' },
  { id: 'violet',   name: 'Violet',   level: 12, hoodTop: '#3A1F63', hoodBottom: '#1E0F38', body: '#1A0E31', bodyStroke: '#5B3699', hoodStroke: '#7A4DC4', strings: '#CDB4FF' },
  { id: 'gold',     name: 'Gold',     level: 25, hoodTop: '#5A4310', hoodBottom: '#2F2308', body: '#2A1F07', bodyStroke: '#9A7A1E', hoodStroke: '#C9A32E', strings: '#FFE59A' }
];

const BACKGROUNDS = [
  { id: 'blue',     name: 'Deep blue', level: 1,  stops: ['#1F3F77', '#112A55', '#091630'], ring: '#3B5CA8' },
  { id: 'purple',   name: 'Purple',    level: 3,  stops: ['#4A2A86', '#2A1757', '#120A2A'], ring: '#6B45B8' },
  { id: 'matrix',   name: 'Matrix',    level: 6,  stops: ['#0C3A1E', '#072412', '#020A05'], ring: '#1E7A40' },
  { id: 'twilight', name: 'Twilight',  level: 10, stops: ['#8A2F5B', '#4C1D52', '#1B0E2E'], ring: '#B04A7A' },
  { id: 'stars',    name: 'Starfield', level: 18, stops: ['#1A2550', '#0E1536', '#050816'], ring: '#3A4A8A' }
];

const GLOWS = [
  { id: 'cyan',    name: 'Cyan',    level: 1,  color: '#47D6FF' },
  { id: 'green',   name: 'Green',   level: 3,  color: '#5CFF8A' },
  { id: 'magenta', name: 'Magenta', level: 7,  color: '#FF4FD8' },
  { id: 'gold',    name: 'Gold',    level: 14, color: '#FFD54A' }
];

const ACCESSORIES = [
  { id: 'none',       name: 'None',          level: 1 },
  { id: 'headphones', name: 'Headphones',    level: 4 },
  { id: 'eyes',       name: 'Glowing eyes',  level: 9 },
  { id: 'laptop',     name: 'Laptop',        level: 13 },
  { id: 'crown',      name: 'Crown',         level: 30 }
];


/* ---------- Skins (the colour sets are in style.css, section 2B) ---------- */

// swatch = [background, surface, accent] only used for the little preview.
const SKINS = [
  { id: 'classic',  name: 'Classic',  level: 1,  note: 'Light or dark mode', swatch: ['#FFFFFF', '#F1EFE8', '#3F6D4E'] },
  { id: 'midnight', name: 'Midnight', level: 2,  note: 'Deep blue',          swatch: ['#0A1428', '#101C36', '#4CC2FF'] },
  { id: 'paper',    name: 'Paper',    level: 3,  note: 'Warm and light',     swatch: ['#F4EEDF', '#FFFBF2', '#9A5B2E'] },
  { id: 'terminal', name: 'Terminal', level: 5,  note: 'Green on black',     swatch: ['#050805', '#0B120B', '#3DFF7A'] },
  { id: 'sunset',   name: 'Sunset',   level: 8,  note: 'Warm dark purple',   swatch: ['#1A0F1F', '#251528', '#FF7A59'] },
  { id: 'neon',     name: 'Neon',     level: 12, note: 'Magenta and cyan',   swatch: ['#07060F', '#0F0B1E', '#FF3DCB'] },
  { id: 'royal',    name: 'Royal',    level: 20, note: 'Purple and gold',    swatch: ['#120B24', '#1B1236', '#E6B84A'] }
];


/* ---------- Typing ---------- */

// family = CSS font name, url = the Google Fonts name (loaded only when
// needed), scale = makes fonts that look big or small the same size.
const FONTS = [
  { id: 'jetbrains', name: 'JetBrains Mono', level: 1,  family: "'JetBrains Mono'", url: '',                                   scale: 1 },
  { id: 'fira',      name: 'Fira Code',      level: 2,  family: "'Fira Code'",      url: 'Fira+Code:wght@400;500;600',         scale: 1 },
  { id: 'source',    name: 'Source Code Pro', level: 3, family: "'Source Code Pro'", url: 'Source+Code+Pro:wght@400;500;600',   scale: 1 },
  { id: 'roboto',    name: 'Roboto Mono',    level: 4,  family: "'Roboto Mono'",    url: 'Roboto+Mono:wght@400;500;600',       scale: 1 },
  { id: 'plex',      name: 'IBM Plex Mono',  level: 6,  family: "'IBM Plex Mono'",  url: 'IBM+Plex+Mono:wght@400;500;600',     scale: 1 },
  { id: 'space',     name: 'Space Mono',     level: 9,  family: "'Space Mono'",     url: 'Space+Mono:wght@400;700',            scale: 0.95 },
  { id: 'courier',   name: 'Courier Prime',  level: 12, family: "'Courier Prime'",  url: 'Courier+Prime:wght@400;700',         scale: 1.05 },
  { id: 'vt323',     name: 'VT323',          level: 14, family: "'VT323'",          url: 'VT323',                              scale: 1.3 },
  { id: 'press',     name: 'Press Start 2P', level: 18, family: "'Press Start 2P'", url: 'Press+Start+2P',                     scale: 0.65 }
];

// Sizes are free for everyone (readability should never be locked).
const FONT_SIZES = [
  { id: 'small',  name: 'Small',  level: 1, scale: 0.9 },
  { id: 'medium', name: 'Medium', level: 1, scale: 1 },
  { id: 'large',  name: 'Large',  level: 1, scale: 1.15 },
  { id: 'huge',   name: 'Huge',   level: 1, scale: 1.3 }
];

const LETTERS = [
  { id: 'normal', name: 'Normal', level: 1,  note: 'Typed letters stay plain' },
  { id: 'bold',   name: 'Bold',   level: 2,  note: 'Typed letters turn bold' },
  { id: 'glow',   name: 'Glow',   level: 4,  note: 'Typed letters glow softly' },
  { id: 'fade',   name: 'Focus',  level: 7,  note: 'Typed letters fade away' },
  { id: 'neon',   name: 'Neon',   level: 11, note: 'Bright glowing letters' }
];

const CARET_STYLES = [
  { id: 'bar',       name: 'Bar',       level: 1 },
  { id: 'underline', name: 'Underline', level: 3 },
  { id: 'block',     name: 'Block',     level: 6 }
];

// css = null means "use the accent colour of the current skin".
const CARET_COLORS = [
  { id: 'accent',  name: 'Skin colour', level: 1,  css: null },
  { id: 'white',   name: 'White',       level: 2,  css: '#FFFFFF' },
  { id: 'cyan',    name: 'Cyan',        level: 5,  css: '#47D6FF' },
  { id: 'gold',    name: 'Gold',        level: 8,  css: '#FFD54A' },
  { id: 'magenta', name: 'Magenta',     level: 10, css: '#FF4FD8' }
];


/* All the groups, in the order they appear on the Customize page.
   path = where the choice is stored inside the saved appearance,
   def = the free item every player starts with. */
const CUSTOMIZE_GROUPS = [
  { key: 'hoodie',     section: 'avatar', label: 'Hoodie',        noun: 'hoodie',       path: ['avatar', 'hoodie'],     items: HOODIES,      def: 'navy' },
  { key: 'background', section: 'avatar', label: 'Background',    noun: 'background',   path: ['avatar', 'background'], items: BACKGROUNDS,  def: 'blue' },
  { key: 'glow',       section: 'avatar', label: 'Glow',          noun: 'glow',         path: ['avatar', 'glow'],       items: GLOWS,        def: 'cyan' },
  { key: 'accessory',  section: 'avatar', label: 'Accessory',     noun: '',             path: ['avatar', 'accessory'],  items: ACCESSORIES,  def: 'none' },
  { key: 'skin',       section: 'skin',   label: 'Skin',          noun: 'skin',         path: ['skin'],                 items: SKINS,        def: 'classic' },
  { key: 'font',       section: 'typing', label: 'Font',          noun: 'font',         path: ['font'],                 items: FONTS,        def: 'jetbrains' },
  { key: 'fontSize',   section: 'typing', label: 'Font size',     noun: '',             path: ['fontSize'],             items: FONT_SIZES,   def: 'medium' },
  { key: 'letters',    section: 'typing', label: 'Typed letters', noun: 'letters',      path: ['letters'],              items: LETTERS,      def: 'normal' },
  { key: 'caret',      section: 'typing', label: 'Caret shape',   noun: 'caret',        path: ['caret'],                items: CARET_STYLES, def: 'bar' },
  { key: 'caretColor', section: 'typing', label: 'Caret colour',  noun: 'caret colour', path: ['caretColor'],           items: CARET_COLORS, def: 'accent' }
];


/* ==========================================================
   2. READING AND WRITING THE SAVED CHOICES
   ========================================================== */

function findItem(list, id) {
  return list.find(item => item.id === id);
}


/* Reads the item id stored at a path such as ['avatar', 'hoodie']. */
function readPath(object, path) {
  return path.reduce((value, key) => (value ? value[key] : undefined), object);
}


function writePath(object, path, value) {
  let target = object;

  path.slice(0, -1).forEach((key) => {
    if (!target[key] || typeof target[key] !== 'object') target[key] = {};
    target = target[key];
  });

  target[path[path.length - 1]] = value;
}


/* A complete appearance where everything is the free default. */
function defaultAppearance() {
  const appearance = { seenLevel: 1 };

  CUSTOMIZE_GROUPS.forEach(group => writePath(appearance, group.path, group.def));

  return appearance;
}


/* Keeps only known ids (anything else becomes the default), so a damaged
   or edited save can never put strange text into the page. */
function sanitizeAppearance(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const appearance = defaultAppearance();

  CUSTOMIZE_GROUPS.forEach((group) => {
    const id = readPath(source, group.path);

    if (typeof id === 'string' && findItem(group.items, id)) {
      writePath(appearance, group.path, id);
    }
  });

  const seen = Number(source.seenLevel);

  appearance.seenLevel = Number.isFinite(seen) && seen >= 1
    ? Math.min(Math.floor(seen), 1000) : 1;

  return appearance;
}


function loadAppearance() {
  try {
    return sanitizeAppearance(JSON.parse(localStorage.getItem(APPEARANCE_KEY)));
  } catch (error) {
    return defaultAppearance();
  }
}


function saveAppearance(appearance) {
  try {
    localStorage.setItem(APPEARANCE_KEY, JSON.stringify(appearance));
  } catch (error) {
    // Storage not available: choices just won't be remembered.
  }
}


/* ==========================================================
   3. UNLOCKS
   ========================================================== */

/* "Paper skin", "Fira Code font", "Headphones" ... */
function unlockLabel(group, item) {
  return group.noun ? item.name + ' ' + group.noun : item.name;
}


/* Everything that unlocks when you go from one level to another,
   as a list of readable names, e.g. ["Paper skin", "Fira Code font"]. */
function unlocksBetween(fromLevel, toLevel) {
  const labels = [];

  CUSTOMIZE_GROUPS.forEach((group) => {
    group.items.forEach((item) => {
      if (item.level > fromLevel && item.level <= toLevel) {
        labels.push(unlockLabel(group, item));
      }
    });
  });

  return labels;
}


/* "Paper skin, Fira Code font +3 more" (for the short banners). */
function summarizeUnlocks(labels, max) {
  const shown = labels.slice(0, max || 2).join(', ');
  const rest = labels.length - (max || 2);

  return rest > 0 ? shown + ' +' + rest + ' more' : shown;
}


/* The next level that unlocks something: { level, labels } or null. */
function nextUnlock(level) {
  let next = null;

  CUSTOMIZE_GROUPS.forEach((group) => {
    group.items.forEach((item) => {
      if (item.level > level && (next === null || item.level < next)) {
        next = item.level;
      }
    });
  });

  return next === null
    ? null
    : { level: next, labels: unlocksBetween(next - 1, next) };
}


/* How many items are unlocked at a level, and how many exist. */
function countUnlockedItems(level) {
  let unlocked = 0;
  let total = 0;

  CUSTOMIZE_GROUPS.forEach((group) => {
    group.items.forEach((item) => {
      total++;
      if (item.level <= level) unlocked++;
    });
  });

  return { unlocked: unlocked, total: total };
}


/* Puts every choice that is still locked at this level back to the free
   default (for example after importing a backup or resetting progress).
   Saves and applies the result if anything changed. */
function enforceAppearanceUnlocks(level) {
  const appearance = loadAppearance();
  let changed = false;

  CUSTOMIZE_GROUPS.forEach((group) => {
    const item = findItem(group.items, readPath(appearance, group.path));

    if (item && item.level > level) {
      writePath(appearance, group.path, group.def);
      changed = true;
    }
  });

  if (changed) {
    saveAppearance(appearance);
    applyAppearance();
  }
}


/* ==========================================================
   4. APPLYING THE CHOICES TO THE PAGE
   ========================================================== */

/* Loads a Google font only when it is needed. */
function loadFont(font) {
  if (!font.url || document.getElementById('font-' + font.id)) return;

  const link = document.createElement('link');

  link.id = 'font-' + font.id;
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=' + font.url + '&display=swap';
  document.head.appendChild(link);
}


/* Sets the attributes and CSS variables that style.css uses. */
function applyAppearance() {
  const root = document.documentElement;
  const appearance = loadAppearance();

  const font = findItem(FONTS, appearance.font);
  const size = findItem(FONT_SIZES, appearance.fontSize);
  const caretColor = findItem(CARET_COLORS, appearance.caretColor);

  // Skin. "Classic" uses light or dark mode (saved by theme.js);
  // every other skin brings its own colours and replaces the mode.
  if (appearance.skin === 'classic') {
    root.removeAttribute('data-skin');

    let theme = null;

    try { theme = localStorage.getItem('theme'); } catch (error) { /* ignore */ }

    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  } else {
    root.setAttribute('data-skin', appearance.skin);
    root.removeAttribute('data-theme');
  }

  // Typed letters and caret.
  root.setAttribute('data-letters', appearance.letters);
  root.setAttribute('data-caret', appearance.caret);

  if (caretColor.css) {
    root.style.setProperty('--caret-color', caretColor.css);
  } else {
    root.style.removeProperty('--caret-color');
  }

  // Font and size of the code.
  root.style.setProperty(
    '--code-font',
    font.family + ", 'JetBrains Mono', 'SF Mono', Consolas, monospace"
  );
  root.style.setProperty('--font-scale', font.scale);
  root.style.setProperty('--code-scale', size.scale);
  loadFont(font);

  // Lets other scripts (the theme button) know that something changed.
  document.dispatchEvent(new CustomEvent('appearancechange'));
}


/* ==========================================================
   5. THE AVATAR
   The avatar is drawn from the choices above (it is an SVG built in
   JavaScript). With the default choices it looks the same as
   images/avatar-hacker.svg.
   ========================================================== */

/* Small star shapes for the Starfield background: x, y, radius. */
const STAR_POINTS = [
  [22, 30, 1.4], [40, 18, 1], [58, 40, 1.2], [118, 24, 1.5], [136, 46, 1],
  [26, 70, 1], [134, 80, 1.3], [18, 104, 1], [142, 110, 1.4], [34, 134, 1.2],
  [126, 138, 1], [100, 12, 1], [84, 150, 1.2], [60, 148, 1]
];


/* Extra decoration drawn over a background. */
function backgroundExtras(background) {
  if (background.id === 'matrix') {
    // Faint falling lines of "code".
    let lines = '';

    [16, 34, 52, 70, 88, 106, 124, 142].forEach((x, i) => {
      lines += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="160" stroke="#2BFF7A" ' +
        'stroke-opacity="0.2" stroke-width="2" stroke-dasharray="3 8" stroke-dashoffset="' + (i * 5) + '"/>';
    });

    return lines;
  }

  if (background.id === 'stars') {
    return STAR_POINTS.map(([x, y, r]) =>
      '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#FFFFFF" opacity="0.85"/>'
    ).join('');
  }

  if (background.id === 'twilight') {
    // A low, warm glow on the horizon.
    return '<ellipse cx="80" cy="150" rx="90" ry="30" fill="#FF8A5C" opacity="0.25"/>';
  }

  return '';
}


/* Builds the avatar as an SVG text.
   avatar = { hoodie, background, glow, accessory } (item ids). */
function buildAvatarSvg(avatar) {
  const hood = findItem(HOODIES, avatar.hoodie) || HOODIES[0];
  const bg = findItem(BACKGROUNDS, avatar.background) || BACKGROUNDS[0];
  const glow = findItem(GLOWS, avatar.glow) || GLOWS[0];
  const accessory = avatar.accessory;

  const out = [];

  out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">');

  // Gradients and the circular clip.
  out.push(
    '<defs>' +
      '<radialGradient id="bg" cx="50%" cy="40%" r="75%">' +
        '<stop offset="0" stop-color="' + bg.stops[0] + '"/>' +
        '<stop offset="0.6" stop-color="' + bg.stops[1] + '"/>' +
        '<stop offset="1" stop-color="' + bg.stops[2] + '"/>' +
      '</radialGradient>' +
      '<linearGradient id="hood" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + hood.hoodTop + '"/>' +
        '<stop offset="1" stop-color="' + hood.hoodBottom + '"/>' +
      '</linearGradient>' +
      '<linearGradient id="void" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#000000"/>' +
        '<stop offset="1" stop-color="#04091A"/>' +
      '</linearGradient>' +
      '<radialGradient id="glow" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0" stop-color="' + glow.color + '" stop-opacity="0.45"/>' +
        '<stop offset="1" stop-color="' + glow.color + '" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<clipPath id="c"><circle cx="80" cy="80" r="76"/></clipPath>' +
    '</defs>'
  );

  out.push('<circle cx="80" cy="80" r="76" fill="url(#bg)"/>');
  out.push('<g clip-path="url(#c)">');

  out.push(backgroundExtras(bg));

  // Faint light from a screen below.
  out.push('<ellipse cx="80" cy="150" rx="62" ry="26" fill="url(#glow)"/>');

  // Shoulders and pocket.
  out.push(
    '<path d="M14 160 C16 124 46 110 80 110 C114 110 144 124 146 160 Z" fill="' + hood.body +
      '" stroke="' + hood.bodyStroke + '" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<path d="M52 152 C64 138 96 138 108 152" fill="none" stroke="' + hood.bodyStroke +
      '" stroke-width="2.5" stroke-linecap="round"/>'
  );

  // The hood, and the face: only darkness.
  out.push(
    '<path d="M40 116 C32 70 48 30 80 28 C112 30 128 70 120 116 C106 106 54 106 40 116 Z" ' +
      'fill="url(#hood)" stroke="' + hood.hoodStroke + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M58 100 C51 70 60 48 80 48 C100 48 109 70 102 100 C94 109 66 109 58 100 Z" fill="url(#void)"/>'
  );

  // Glowing eyes (the face stays hidden: just two points of light).
  if (accessory === 'eyes') {
    out.push(
      '<circle cx="71" cy="76" r="7" fill="' + glow.color + '" opacity="0.22"/>' +
      '<circle cx="89" cy="76" r="7" fill="' + glow.color + '" opacity="0.22"/>' +
      '<ellipse cx="71" cy="76" rx="3.2" ry="2.4" fill="' + glow.color + '"/>' +
      '<ellipse cx="89" cy="76" rx="3.2" ry="2.4" fill="' + glow.color + '"/>'
    );
  }

  // Light on the edge of the hood.
  out.push(
    '<path d="M44 108 C38 72 50 38 80 33" fill="none" stroke="' + glow.color +
      '" stroke-width="2" stroke-linecap="round" opacity="0.55"/>' +
    '<path d="M116 108 C122 72 110 38 80 33" fill="none" stroke="' + glow.color +
      '" stroke-width="2" stroke-linecap="round" opacity="0.3"/>'
  );

  // Drawstrings.
  out.push(
    '<path d="M70 108 L67 130" stroke="' + hood.strings + '" stroke-width="2.2" stroke-linecap="round"/>' +
    '<path d="M90 108 L93 130" stroke="' + hood.strings + '" stroke-width="2.2" stroke-linecap="round"/>' +
    '<circle cx="67" cy="131" r="2.6" fill="' + hood.strings + '"/>' +
    '<circle cx="93" cy="131" r="2.6" fill="' + hood.strings + '"/>'
  );

  // A laptop in front of the hacker, lit from the lid.
  if (accessory === 'laptop') {
    out.push(
      '<rect x="42" y="136" width="76" height="40" rx="5" fill="#0B1222" stroke="#3A4F85" stroke-width="2.5"/>' +
      '<circle cx="80" cy="152" r="9" fill="' + glow.color + '" opacity="0.2"/>' +
      '<circle cx="80" cy="152" r="4.5" fill="' + glow.color + '"/>'
    );
  }

  // Headphones over the hood.
  if (accessory === 'headphones') {
    out.push(
      '<path d="M37 78 C33 26 127 26 123 78" fill="none" stroke="#CFD6E6" stroke-width="5" stroke-linecap="round"/>' +
      '<rect x="27" y="68" width="16" height="30" rx="6" fill="#2B3550" stroke="#9DB4E6" stroke-width="2.5"/>' +
      '<rect x="117" y="68" width="16" height="30" rx="6" fill="#2B3550" stroke="#9DB4E6" stroke-width="2.5"/>' +
      '<rect x="31" y="76" width="8" height="14" rx="3" fill="' + glow.color + '" opacity="0.6"/>' +
      '<rect x="121" y="76" width="8" height="14" rx="3" fill="' + glow.color + '" opacity="0.6"/>'
    );
  }

  // A crown on top of the hood.
  if (accessory === 'crown') {
    out.push(
      '<path d="M56 36 L60 18 L71 28 L80 12 L89 28 L100 18 L104 36 Z" fill="#F7C948" ' +
        'stroke="#A9741B" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<circle cx="60" cy="18" r="3" fill="#FFF3C4" stroke="#A9741B" stroke-width="1.5"/>' +
      '<circle cx="80" cy="12" r="3" fill="#FFF3C4" stroke="#A9741B" stroke-width="1.5"/>' +
      '<circle cx="100" cy="18" r="3" fill="#FFF3C4" stroke="#A9741B" stroke-width="1.5"/>' +
      '<circle cx="80" cy="30" r="3" fill="#E5533D"/>'
    );
  }

  out.push('</g>');
  out.push('<circle cx="80" cy="80" r="76" fill="none" stroke="' + bg.ring + '" stroke-width="3"/>');
  out.push('</svg>');

  return out.join('');
}


/* The avatar as an image address that can be used in <img src="...">. */
function avatarSrcFor(avatar) {
  return 'data:image/svg+xml,' + encodeURIComponent(buildAvatarSvg(avatar));
}


/* The player's current avatar. */
function avatarSrc() {
  return avatarSrcFor(loadAppearance().avatar);
}


// Apply the saved choices as soon as this file is loaded (it is in the
// <head>, so the page never shows the wrong colours first).
applyAppearance();