# CodeTyper V2

CodeType is a browser-based coding and typing practice app built primarily for
beginners. Its goal is to help learners explore coding basics, understand what
real code snippets do through explanations, and build confidence reading and
typing code. Users can also track their typing speed and accuracy and earn
rewards as they improve.

## Features

- Practise JavaScript, Python, Java, and SQL snippets across Easy, Medium,
  Hard, and Master difficulties.
- Browse the snippet library, filter by language and difficulty, and read
  explanations for supported snippets.
- Track WPM, accuracy, elapsed time, and errors while typing. Review a
  speed-over-time chart after each run.
- Use keyboard-focused typing controls, optional auto-indent, and visible
  feedback for mistakes, including incorrect Enter keys.
- Earn XP, levels, ranks, and achievements for practice. Reading a snippet
  explanation can also award XP.
- View your player profile, statistics, level progress, and unlocks.
- Customize your avatar, site theme, code font, font size, caret, and typed
  character styles. Some cosmetic choices unlock as you level up.
- Use light/dark mode and optional practice animations.
- Export a backup code for your progress and import it in another browser.

## Run locally

CodeType is a static website and does not need a build step or package
installation. Serve the project directory over HTTP so the browser can load
`snippets.json`:

1. Open the project folder in Visual Studio Code.
2. Start a local web server for the folder, for example with the Live Server
   extension.
3. Open `index.html` through that server.

Opening the HTML file directly with `file://` may prevent the snippet library
from loading.

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | Home page and app introduction |
| `practice.html` | Typing practice, results, ranks, and achievements |
| `snippets.html` | Searchable/filterable snippet library and explanations |
| `profile.html` | Player profile, statistics, levels, and progress backup |
| `customize.html` | Avatar and typing-appearance customization |
| `snippets.json` | Snippet content organized by language and difficulty |
| `highlight.js` | Syntax tokenization for code snippets |
| `snippet-tools.js` | Shared snippet loading and display helpers |
| `progress.js` | XP, levels, achievements, profile data, and backup tools |
| `appearance.js` | Appearance options, unlocks, and avatar rendering |
| `theme.js` | Light/dark mode |
| `style.css` | Shared site layout, components, and themes |
| `images/` | Image assets |

## Progress and accounts

Progress and preferences are currently saved in the browser's `localStorage`.
The profile backup code can be used to move that data between browsers or
devices. There is no server-side database, account system, or Google sign-in
currently; progress does not automatically sync between devices.

## Deployment

The current app is static and can be deployed using GitHub Pages or as a static
site on Render. Publish the project files together, including `snippets.json`,
the shared JavaScript files, the stylesheet, and the `images/` directory.

## Technology

- HTML
- CSS
- Vanilla JavaScript
- JSON snippet data
- Browser `localStorage` for local progress and preferences
