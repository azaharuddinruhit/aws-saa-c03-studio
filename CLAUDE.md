# AWS SAA-C03 Studio

A static study site for the AWS Solutions Architect Associate (SAA-C03) exam. Features:

- **Practice quizzes** from three question banks.
- **Progress overview** combining all the banks.
- **Ten cheat sheets.**
- **Architecture diagrams page.**
- **Mind map** of every service by exam domain, with exam cues and quiz progress.

Everything lives in `docs/`, which GitHub Pages serves as is. There is no framework, bundler or package.json.

## Layout

| Path | What it is |
|---|---|
| `docs/index.html` | The whole quiz app in one file: overview, practice dashboard, quizzes, score estimators, Gist sync. |
| `docs/set-{alpha,beta,gamma}-v1.json` | Question banks: an array of questions. |
| `docs/notebooklm/set-*.md` | Markdown copies of the banks for NotebookLM. They must carry the same `services` tags as the JSON. |
| `docs/cheatsheet/index.html` | Cheat sheet hub. |
| `docs/cheatsheet/01-…10-*.html` | Domain pages. Each one loads `icons.js` and `app.js`, then calls `App.start(config)`. |
| `docs/cheatsheet/app.css` | Shared styles and colour tokens (`--accent`, `--aws`, `--ink`, `--muted`, `--line`, `--surface`…), with light and dark values. |
| `docs/cheatsheet/icons.js` | AWS service icons as SVG strings (`window.AWS_ICONS`). Use them through `App.iconURL(key)`. |
| `docs/cheatsheet/architectures.html` | 32 architecture diagrams, mostly generated (see below). |
| `scripts/build-architectures.js` | Generates diagrams 3–32, the contents list and the jump panel into `architectures.html`. |
| `docs/cheatsheet/mindmap.html` | Interactive mind map: exam domain → category → service → feature. Its data is generated (see below). |
| `scripts/build-mindmap.js` + `mindmap-cues.json` | Generates the mind map data from the vocabulary, the cues, the three banks and the diagrams page. |
| `scripts/check-tags.js` + `tag-vocabulary.json` | Validates every question's `services` tags. |
| `.github/workflows/deploy.yml` | On push to `develop`: checks tags, stamps the version, deploys Pages. |

## Commands

```sh
node scripts/check-tags.js            # must pass, or the deploy fails
node scripts/build-architectures.js   # after any change to the diagram specs
node scripts/build-mindmap.js         # after changing cues, the vocabulary, questions or tags, or diagrams
cd docs && python -m http.server 8000 # local preview at http://localhost:8000
```

There is no test suite. Verify UI changes by rendering the page, e.g. with puppeteer-core and the installed Chrome. Check the following:

- light and dark themes;
- a 390px phone width, with no horizontal page scroll;
- no console errors.

## Deploying and git

- **Branches:** pushing to `develop` deploys the live site. `main` is the PR target.
- **Commit messages:** imperative and sentence case, with no type prefix (e.g. "Add a jump menu to the architecture diagrams page").
- **Version placeholders:** `docs/index.html` keeps `__APP_VERSION__` and `__DEPLOYED_AT__` in the committed file. The workflow replaces them with `v1.<run number>` and the deployment time. Never hard-code a version, and don't show a commit hash.

## Rules

- **Gist token:** the GitHub Gist token is typed once per browser and kept in `localStorage`. It must never be written into any file. `GIST_ID` in `index.html` is fine.
- **Tailwind is precompiled** into a `<style>` in `index.html`. A Tailwind class that isn't already used there won't exist. Either write plain CSS for new UI, or regenerate it with the steps in the comment at the top of `index.html`.
- **Theme with tokens:** use the `app.css` variables or the existing Tailwind palette, never one-off colours, and check both themes.
- **localStorage keys:**
  - `saa_` prefixes app-wide keys;
  - each bank has its own prefix (`set_alpha_`, …);
  - the theme key is `saa_theme`.
- **Gist sync:** it merges each bank and the settings section newest-wins. When adding a setting that should sync, add it to that settings section.

## Question banks

- **Fields:**
  - identification and classification: `id`, `domain`, `exam_domain`, `task`, `difficulty`, `services`, `pillars`;
  - question text: `question`, `hint`, `keywords`, `options`;
  - answer: `correct_answer`, `explanation`, `tldr`, `wrong_reasons`.
- **Tags:** `services` holds 1–4 tags from `scripts/tag-vocabulary.json`, either `"Service"` or `"Service › Feature"`, joined by ` › `. Its `rules` say what to tag: what the correct answer depends on, most decisive first.
- **Keep the copies in sync:** when a question or its tags change, update the matching `docs/notebooklm/set-*.md` entry too, then run `check-tags.js`.

## Architecture diagrams

- **Where to edit:** change `scripts/build-architectures.js`, then rebuild. Never hand-edit between the `GENERATED:…` markers in `architectures.html`. Diagrams 1 and 2 are hand-drawn SVG directly in the page, outside the markers.
- **Adding a diagram:** call `add(groupId, spec)`. Numbering follows page order and renumbers itself.
- **Required spec fields:**
  - a one-line `takeaway`;
  - a `check: { q, opts[4], answer, why }` self-test, written so the explanation never refers to option letters.
- **Jump panel icon:** each new diagram needs an entry in `JUMP_ICONS`.
- **Edge colours keep one meaning everywhere:**
  - green solid (`in`) = request or private path;
  - orange dashed (`out`) = through NAT or the internet, or billed;
  - ink (`data`) = data;
  - muted dotted (`alt`) = control, failover, DNS or automatic actions.
- **Exam accuracy matters more than anything else on this page.** Facts must match current AWS behaviour, and prices or limits that change often are better left out.

## Mind map

- **Where to edit:** service content lives in `scripts/mindmap-cues.json`, with one entry per vocabulary service (`cue`, `traps`, `twins`, `sheet`, `icon`, `icons`, `domain`). Rebuild after editing; never hand-edit between the `GENERATED:DATA` markers in `mindmap.html`.
- **The build checks itself:** it fails if a vocabulary service has no cue, or if a cue names an unknown service, icon, cheat-sheet topic or diagram. A new vocabulary service therefore needs a cue before the map will rebuild.
- **Placement:** each service sits under the exam domain where most of its tagged questions are. The cue's `domain` is used only for a tie, or when there are no questions.
- **Practice links:** a service panel links to `index.html#/practice/<bank>/<service>`, once per set that has questions for that service, and opens it in a new tab. The Studio selects that set, as its menu would, and starts a `service` quiz using the same outstanding-first order as the section quizzes (`outstandingFirst`). The Studio runs one set at a time, which is why there is one link per set.
- **Back and the address:** every panel opening is a browser history step, with the service in the hash (`#SQS`, `#SQS/FIFO%20queues`). Back returns to the previous service, then closes the panel, then leaves the map. × and Escape unwind those steps with `history.go(-depth)`. When changing how the panel opens or closes, keep this working.
- **Progress overlay:** it reads each bank's `<prefix>attempts` from localStorage (latest answer per question). It never writes quiz data. Its own keys are `saa_mindmap_overlay`, `saa_mindmap_open` and `saa_mindmap_legend` (the i button's legend toggle). All three are view preferences and are not synced.
- **Same accuracy rule as the diagrams:** keep cues true to current AWS behaviour, and leave out prices and limits that change often.

## Gotchas (Windows, Git Bash)

- Bash heredocs and `node -e` mangle backslashes and backticks. Write multi-line edit scripts to a file instead.
- In JS edit scripts, use a function replacement, `s.replace(a, () => b)`. A string replacement treats `$'` and `$&` specially.
- Some files have CRLF line endings. Exact string matching across lines can fail, and `build-architectures.js` preserves each file's line endings.
- `position: fixed` breaks inside an ancestor with a `transform` or `backdrop-filter` (e.g. the top bar). Put popovers and panels outside it.
- Grid and flex children that hold wide content (SVG, tables, nowrap labels) need `min-width: 0`, or the page scrolls sideways on phones.
