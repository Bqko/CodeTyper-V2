/* ==========================================================
   SNIPPET TOOLS (shared by practice.html and snippets.html)
   Names, difficulties, and helpers for loading snippets.json
   and showing a snippet's explanation text.
   ========================================================== */

/* Display names of the languages (also their order in lists). */
const LANGUAGE_NAMES = {
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  sql: 'SQL'
};


/* The difficulty levels, from easiest to hardest. */
const DIFFICULTIES = [
  { id: 'easy',   label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard',   label: 'Hard' },
  { id: 'master', label: 'Master' }
];


function difficultyLabel(id) {
  const found = DIFFICULTIES.find(d => d.id === id);

  return found ? found.label : id;
}


/* Turns one entry of snippets.json into { code, title, summary, points }.
   An entry may be a plain list of lines (no explanation) or an object. */
function normalizeSnippet(entry) {
    if (Array.isArray(entry)) {
        return { code: entry.join('\n') };
    }

    return {
        code: entry.code.join('\n'),
        title: entry.title,
        summary: entry.summary,
        points: entry.points || []
    };
}


/* Loads snippets.json and returns
   { language: { difficulty: [ { code, title, summary, points } ] } }
   Throws an error if the file cannot be loaded. */
async function fetchSnippetLibrary() {
  const response = await fetch('snippets.json');

  if (!response.ok) {
    throw new Error('HTTP ' + response.status);
  }

  const data = await response.json();
  const library = {};

  for (const [language, levels] of Object.entries(data)) {
    library[language] = {};

    for (const [level, snippets] of Object.entries(levels)) {
      library[language][level] = snippets.map(normalizeSnippet);
    }
  }

  return library;
}


/* Small helper: create an element with a class and plain text. */
function makeElement(tag, className, text) {
  const element = document.createElement(tag);

  element.className = className;
  if (text) element.textContent = text;

  return element;
}


/* Adds text to an element. Text between `backticks` becomes <code>.
   It is built with textContent, so nothing in snippets.json can
   inject HTML into the page. */
function addFormattedText(parent, text) {
  text.split('`').forEach((part, index) => {
    if (!part) return;

    if (index % 2 === 1) {
      const code = document.createElement('code');

      code.textContent = part;
      parent.appendChild(code);
    } else {
      parent.appendChild(document.createTextNode(part));
    }
  });
}