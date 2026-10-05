/* ==========================================================
   PROGRESS (shared by every page)
   The player's profile, XP and level.

   - A finished run gives XP (see calculateRunXp).
   - Reading an explanation for the first time gives a little XP.
   - XP decides the level (see levelInfo), and every page shows a
     small badge with your avatar and level in the header.

   Everything is saved in the browser (localStorage), so it stays
   on this device. exportProgress() / importProgress() move it to
   another device.
   ========================================================== */


/* ==========================================================
   1. SETTINGS
   These numbers decide how fast players level up. Change them
   here to make levelling faster or slower.
   ========================================================== */

const PROFILE_KEY = 'profile';
const MAX_SAVED_NUMBER = 1e9;   // upper limit for any saved number (XP, runs, ...)
const AVATAR_IMAGE = 'images/avatar-hacker.svg';   // used if appearance.js is missing
const MAX_NAME_LENGTH = 20;

const XP_PER_WORD = 2;          // one "word" = 5 correct characters
const ACHIEVEMENT_XP = 100;     // bonus for a NEW achievement
const STUDY_XP = 5;             // first time you read a snippet's explanation

// Difficulty multiplies the XP of a run.
const DIFFICULTY_XP = { easy: 1, medium: 1.5, hard: 2, master: 3 };

// Flat bonus for the rank you reached (ids from the RANKS list).
const RANK_XP_BONUS = {
  grandma: 0, slow: 5, average: 10, good: 20, great: 35, master: 50
};

// Level titles. A title is used from its level until the next title.
const LEVEL_TITLES = [
  { level: 1,  title: 'Script Kiddie' },
  { level: 3,  title: 'Packet Sniffer' },
  { level: 6,  title: 'Debugger' },
  { level: 10, title: 'Hacker' },
  { level: 15, title: 'Code Breaker' },
  { level: 20, title: 'Root' },
  { level: 30, title: 'Zero-Day' },
  { level: 40, title: 'Kernel' },
  { level: 50, title: 'Architect' }
];


/* ==========================================================
   2. LEVELS
   Going from level L to L+1 costs 100 + 50 x (L - 1) XP:
   100, 150, 200, 250, ... so early levels come fast and later
   ones take longer.
   ========================================================== */

/* Total XP needed to REACH a level (level 1 needs 0).
   This is 100 + 150 + 200 + ... added up, which simplifies to
   25 x (level - 1) x (level + 2). */
function xpToReach(level) {
  return 25 * (level - 1) * (level + 2);
}


/* The title for a level, e.g. levelTitle(7) is "Debugger". */
function levelTitle(level) {
  let title = LEVEL_TITLES[0].title;

  LEVEL_TITLES.forEach((entry) => {
    if (level >= entry.level) title = entry.title;
  });

  return title;
}


/* Everything about a total XP value:
   { level, title, xp, intoLevel, needed, progress }
   intoLevel = XP gained inside this level, needed = XP this level
   takes in total, progress = intoLevel / needed (0 to 1). */
function levelInfo(xp) {
  // Keep the number in a safe range (huge values lose precision and the
  // corrections below could never finish).
  xp = Math.min(Math.max(0, xp), MAX_SAVED_NUMBER);

  // Solve 25 x m x (m + 3) <= xp for m = level - 1 (a quadratic equation),
  // then correct any rounding error. No loop over the levels is needed.
  let level = 1 + Math.max(0, Math.floor((-3 + Math.sqrt(9 + (4 * xp) / 25)) / 2));

  while (level > 1 && xpToReach(level) > xp) level--;
  while (xpToReach(level + 1) <= xp) level++;

  const start = xpToReach(level);
  const needed = xpToReach(level + 1) - start;

  return {
    level: level,
    title: levelTitle(level),
    xp: xp,
    intoLevel: xp - start,
    needed: needed,
    progress: (xp - start) / needed
  };
}


/* ==========================================================
   3. THE SAVED PROFILE
   ========================================================== */

/* Keeps only the expected fields, with the right types, so a
   damaged or edited save can never break the page. */
function normalizeProfile(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};

  const count = (value) =>
    Number.isFinite(value) && value > 0
      ? Math.floor(Math.min(value, MAX_SAVED_NUMBER))
      : 0;

  // { "python-hard-2": 3, ... }  (how many times each snippet was finished)
  const plays = {};
  // { "python-hard-2": true, ... }  (explanations already read)
  const studied = {};
  const idPattern = /^[a-z]+-[a-z]+-\d+$/;

  Object.keys(source.plays || {}).slice(0, 500).forEach((id) => {
    if (idPattern.test(id) && count(source.plays[id]) > 0) {
      plays[id] = count(source.plays[id]);
    }
  });

  Object.keys(source.studied || {}).slice(0, 500).forEach((id) => {
    if (idPattern.test(id) && source.studied[id]) studied[id] = true;
  });

  const name = typeof source.name === 'string' ? source.name.trim() : '';

  return {
    name: name ? name.slice(0, MAX_NAME_LENGTH).trim() : 'Anonymous',
    xp: count(source.xp),
    runs: count(source.runs),
    bestWpm: count(source.bestWpm),
    accuracySum: Number.isFinite(source.accuracySum) && source.accuracySum > 0
      ? Math.min(source.accuracySum, MAX_SAVED_NUMBER) : 0,
    chars: count(source.chars),
    plays: plays,
    studied: studied
  };
}


function loadProfile() {
  try {
    return normalizeProfile(JSON.parse(localStorage.getItem(PROFILE_KEY)));
  } catch (error) {
    return normalizeProfile(null);
  }
}


function saveProfile(profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    // Storage not available: progress just won't be remembered.
  }
}


/* Saves a new player name (cleaned and shortened). Returns the name. */
function setProfileName(name) {
  const profile = loadProfile();

  profile.name = normalizeProfile({ name: name }).name;
  saveProfile(profile);

  return profile.name;
}


/* ==========================================================
   4. XP FOR A FINISHED RUN
   ========================================================== */

/* How much XP a run gives, and why:

     words        = correct characters / 5
     base         = words x XP_PER_WORD x difficulty x accuracy^2 x repeat
     rank bonus   = bonus for the rank x repeat
     new achievement = +100 (not reduced by repeats)

   "repeat" is 1 the first time you finish a snippet, then 1/2, 1/3,
   1/4 ... down to 0.1, so repeating one snippet cannot be farmed.
   accuracy is a number from 0 to 1. */
function calculateRunXp(run) {
  const words = run.correctChars / 5;
  const difficulty = DIFFICULTY_XP[run.difficulty] || 1;
  const accuracyFactor = run.accuracy * run.accuracy;
  const repeat = Math.max(0.1, 1 / (1 + run.plays));

  const base = words * XP_PER_WORD * difficulty * accuracyFactor * repeat;
  const rankBonus = (RANK_XP_BONUS[run.rankId] || 0) * repeat;
  const achievement = run.newAchievement ? ACHIEVEMENT_XP : 0;

  return {
    total: Math.max(1, Math.round(base + rankBonus)) + achievement,
    words: Math.round(words),
    difficulty: difficulty,
    accuracyFactor: accuracyFactor,
    repeat: repeat,
    base: Math.round(base),
    rankBonus: Math.round(rankBonus),
    achievement: achievement
  };
}


/* Records a finished run: adds the XP and updates the statistics.
   run = { snippetId, difficulty, rankId, wpm, accuracy, correctChars,
           newAchievement }
   Returns { xpGained, breakdown, before, after, leveledUp }
   (before / after are levelInfo() of the XP before and after). */
function recordRun(run) {
  const profile = loadProfile();
  const plays = run.snippetId ? (profile.plays[run.snippetId] || 0) : 0;

  const breakdown = calculateRunXp({
    difficulty: run.difficulty,
    rankId: run.rankId,
    accuracy: run.accuracy,
    correctChars: run.correctChars,
    plays: plays,
    newAchievement: run.newAchievement
  });

  const before = levelInfo(profile.xp);

  profile.xp += breakdown.total;
  profile.runs += 1;
  profile.bestWpm = Math.max(profile.bestWpm, run.wpm);
  profile.accuracySum += run.accuracy;
  profile.chars += run.correctChars;

  if (run.snippetId) profile.plays[run.snippetId] = plays + 1;

  saveProfile(profile);

  const after = levelInfo(profile.xp);

  return {
    xpGained: breakdown.total,
    breakdown: breakdown,
    before: before,
    after: after,
    leveledUp: after.level > before.level
  };
}


/* Gives STUDY_XP the first time a snippet's explanation is read.
   Returns { xpGained, before, after, leveledUp }, or null if this
   snippet was already read before. */
function awardStudy(snippetId) {
  if (!snippetId) return null;

  const profile = loadProfile();

  if (profile.studied[snippetId]) return null;

  const before = levelInfo(profile.xp);

  profile.studied[snippetId] = true;
  profile.xp += STUDY_XP;
  saveProfile(profile);

  const after = levelInfo(profile.xp);

  return {
    xpGained: STUDY_XP,
    before: before,
    after: after,
    leveledUp: after.level > before.level
  };
}


/* Study XP plus the messages for it: a small notice, and the header
   badge is refreshed. Used when an explanation is opened. */
function grantStudyXp(snippetId) {
  const result = awardStudy(snippetId);

  if (!result) return;

  showToast('+' + result.xpGained + ' XP · first time reading this explanation');

  if (result.leveledUp) {
    showToast('Level up! Level ' + result.after.level + ' · ' + result.after.title);

    // New things to customize? (unlocksBetween is in appearance.js)
    if (typeof unlocksBetween === 'function') {
      const unlocked = unlocksBetween(result.before.level, result.after.level);

      if (unlocked.length > 0) showToast('New: ' + summarizeUnlocks(unlocked, 3));
    }
  }

  renderHeaderBadge(result.leveledUp);
}


/* The player's avatar as an image address. appearance.js draws it from
   the player's choices; without that file the default picture is used. */
function avatarImage() {
  return typeof avatarSrc === 'function' ? avatarSrc() : AVATAR_IMAGE;
}


/* ==========================================================
   5. SMALL NOTICES ("toasts")
   A short message at the bottom of the screen.
   ========================================================== */

function showToast(message) {
  let stack = document.getElementById('toast-stack');

  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'toast-stack';
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }

  const toast = document.createElement('div');

  toast.className = 'xp-toast';
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  stack.appendChild(toast);

  // A timer (not an animation event), so it is removed even when
  // animations are switched off.
  setTimeout(() => toast.remove(), 3200);
}


/* ==========================================================
   6. HEADER BADGE
   Avatar + level + a thin XP bar, in the header of every page.
   It links to the profile page. pulse = true plays a small
   animation (used when the level went up).
   ========================================================== */

function renderHeaderBadge(pulse) {
  const links = document.querySelector('.nav-links');

  if (!links) return;

  const info = levelInfo(loadProfile().xp);
  let badge = document.getElementById('profile-badge');

  if (!badge) {
    badge = document.createElement('a');
    badge.id = 'profile-badge';
    badge.className = 'profile-badge';
    badge.href = 'profile.html';

    badge.innerHTML =
      '<img class="profile-badge-img" alt="" width="30" height="30">' +
      '<span class="profile-badge-text">' +
        '<span class="profile-badge-level"></span>' +
        '<span class="profile-badge-bar"><i></i></span>' +
      '</span>';

    if (/profile\.html$/.test(window.location.pathname)) {
      badge.setAttribute('aria-current', 'page');
    }

    // Placed just before the theme button.
    links.insertBefore(badge, document.getElementById('theme-toggle'));
  }

  badge.querySelector('img').src = avatarImage();
  badge.querySelector('.profile-badge-level').textContent = 'Lv ' + info.level;
  badge.querySelector('.profile-badge-bar i').style.width =
    Math.round(info.progress * 100) + '%';

  badge.setAttribute(
    'aria-label',
    'Profile: level ' + info.level + ', ' + info.title + ', ' +
    info.intoLevel + ' of ' + info.needed + ' XP'
  );
  badge.title = 'Level ' + info.level + ' · ' + info.title;

  if (pulse) {
    badge.classList.remove('pulse');
    void badge.offsetWidth;   // lets the animation start again
    badge.classList.add('pulse');
  }
}


/* ==========================================================
   7. BACKUP (export / import)
   Progress lives in this browser only. The export code can be
   saved somewhere and imported in another browser or device.
   ========================================================== */

// The saved items that belong to the player (nothing else is touched).
const BACKUP_KEYS = ['profile', 'achievements', 'autoIndent', 'emojis', 'theme', 'appearance'];
const BACKUP_PREFIX = 'CT1.';


/* Returns a text code containing the player's progress and settings. */
function exportProgress() {
  const data = {};

  BACKUP_KEYS.forEach((key) => {
    try {
      const value = localStorage.getItem(key);

      if (value !== null) data[key] = value;
    } catch (error) {
      // ignore
    }
  });

  // btoa only handles Latin-1, so the text is converted first.
  return BACKUP_PREFIX + btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}


/* Restores progress from an export code.
   Returns { ok: true } or { ok: false, message }. */
function importProgress(code) {
  let data;

  try {
    const text = String(code).trim();

    if (!text.startsWith(BACKUP_PREFIX)) throw new Error('prefix');

    data = JSON.parse(decodeURIComponent(escape(atob(text.slice(BACKUP_PREFIX.length)))));
  } catch (error) {
    return { ok: false, message: 'That does not look like a CodeType backup code.' };
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, message: 'That does not look like a CodeType backup code.' };
  }

  // Only known keys, and only text values.
  const clean = {};

  for (const key of BACKUP_KEYS) {
    if (typeof data[key] === 'string') clean[key] = data[key];
  }

  if (Object.keys(clean).length === 0) {
    return { ok: false, message: 'The backup code is empty.' };
  }

  // The profile is rebuilt through normalizeProfile, so it is always valid.
  if (clean.profile !== undefined) {
    try {
      clean.profile = JSON.stringify(normalizeProfile(JSON.parse(clean.profile)));
    } catch (error) {
      return { ok: false, message: 'The profile in the backup is damaged.' };
    }
  }

  // Achievements: only keys like "average:hard" with a short date text.
  if (clean.achievements !== undefined) {
    try {
      const parsed = JSON.parse(clean.achievements);
      const safe = {};

      Object.keys(parsed).slice(0, 200).forEach((key) => {
        if (/^[a-z]+:[a-z]+$/.test(key) && typeof parsed[key] === 'string') {
          safe[key] = parsed[key].slice(0, 10);
        }
      });

      clean.achievements = JSON.stringify(safe);
    } catch (error) {
      return { ok: false, message: 'The achievements in the backup are damaged.' };
    }
  }

  // Appearance: rebuilt from known item ids only (appearance.js).
  if (clean.appearance !== undefined) {
    if (typeof sanitizeAppearance !== 'function') {
      delete clean.appearance;
    } else {
      try {
        clean.appearance = JSON.stringify(sanitizeAppearance(JSON.parse(clean.appearance)));
      } catch (error) {
        return { ok: false, message: 'The appearance in the backup is damaged.' };
      }
    }
  }

  // Settings only accept their known values.
  if (clean.theme !== undefined && !['dark', 'light'].includes(clean.theme)) {
    delete clean.theme;
  }

  ['autoIndent', 'emojis'].forEach((key) => {
    if (clean[key] !== undefined && !['on', 'off'].includes(clean[key])) {
      delete clean[key];
    }
  });

  try {
    Object.keys(clean).forEach((key) => localStorage.setItem(key, clean[key]));
  } catch (error) {
    return { ok: false, message: 'Could not save to this browser.' };
  }

  return { ok: true };
}


/* ==========================================================
   8. ACHIEVEMENTS (saved ranks)
   An achievement is "a rank reached on a difficulty", saved as
   "rank:difficulty" with the date, e.g. { "average:hard": "2026-10-04" }.

   A higher rank also unlocks every LOWER rank on the SAME difficulty:
   reaching Master on Hard unlocks all the other ranks on Hard, but
   nothing on Easy or Medium.
   ========================================================== */

const ACHIEVEMENTS_KEY = 'achievements';

// The ranks from lowest to highest (the same ids as RANKS in practice.html).
const RANK_ORDER = ['grandma', 'slow', 'average', 'good', 'great', 'master'];


/* Read / write the saved achievements (safe if storage is blocked). */
function loadAchievements() {
  try {
    const saved = JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY));

    return saved && typeof saved === 'object' ? saved : {};
  } catch (error) {
    return {};
  }
}


function saveAchievements(map) {
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(map));
  } catch (error) {
    // Storage not available: achievements just won't be remembered.
  }
}


/* For every unlocked rank, unlocks all lower ranks on the same difficulty
   (with the same date). Changes the object it is given and returns how
   many achievements were added. */
function addLowerRanks(saved) {
  let added = 0;

  Object.keys(saved).forEach((key) => {
    const [rankId, difficulty] = key.split(':');
    const rankIndex = RANK_ORDER.indexOf(rankId);

    for (let i = 0; i < rankIndex; i++) {
      const lowerKey = RANK_ORDER[i] + ':' + difficulty;

      if (!saved[lowerKey]) {
        saved[lowerKey] = saved[key];
        added++;
      }
    }
  });

  return added;
}


/* Unlocks a rank on a difficulty, and all lower ranks on it too.
   Returns { isNew, lowerCount }:
     isNew      = true only if THIS rank was not unlocked before
     lowerCount = how many lower ranks were unlocked by this call */
function unlockRankAchievement(rankId, difficulty) {
  const saved = loadAchievements();
  const key = rankId + ':' + difficulty;
  const isNew = !saved[key];

  if (isNew) {
    saved[key] = new Date().toISOString().slice(0, 10);   // e.g. 2026-10-04
  }

  const lowerCount = addLowerRanks(saved);

  if (isNew || lowerCount > 0) saveAchievements(saved);

  return { isNew: isNew, lowerCount: lowerCount };
}


/* Fixes achievements saved earlier: if a higher rank is unlocked, the
   lower ranks on that difficulty are added. Safe to run any time. */
function repairAchievements() {
  const saved = loadAchievements();

  if (addLowerRanks(saved) > 0) saveAchievements(saved);
}


// When a page loads this file: fix old achievements, put any choice that
// is still locked back to the free default, and show the badge.
repairAchievements();

if (typeof enforceAppearanceUnlocks === 'function') {
  enforceAppearanceUnlocks(levelInfo(loadProfile().xp).level);
}

renderHeaderBadge(false);