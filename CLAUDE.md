# AWS SAA-C03 Studio

A static study site for the AWS Solutions Architect Associate (SAA-C03) exam. Features:

- **Practice quizzes** from four question banks.
- **Progress overview** combining all the banks.
- **Ten cheat sheets.**
- **Eight infographics:** one-page visual summaries of the most-tested topics.
- **Architecture diagrams page.**
- **Mind map** of every service by category, with each service's exam domain, exam cues and quiz progress.

Everything lives in `docs/`, which GitHub Pages serves as is. There is no framework, bundler or package.json.

## Layout

| Path | What it is |
|---|---|
| `docs/index.html` | The whole quiz app in one file: overview, practice dashboard, quizzes, score estimators, Gist sync. |
| `docs/sets/{alpha,beta,gamma,delta}.json` | Question banks: an array of questions. The file name is the bank key in `BANKS`. |
| `docs/sets/priority-map.json` | The study order: `{ bank, id, priority }` for every question, and `top`, how many of them the Top list covers (100). The overview's ★ Top card and `top.html` read it, so changing `top` is the only edit a new size needs. |
| `docs/cheatsheet/top.html` | The top questions of the priority map, one card each in the Studio quiz's colours (it sets app.css's tokens to the Studio's values): the full question with its key phrases highlighted, its TL;DR, difficulty, exam domain and section chips, your status and last answer, and the right option(s) in a fold. Filters by set, status, section (in the cheat sheets' order) and difficulty, sorts, and a Show answers switch; on phones the filters move into a bottom sheet behind a Filters button, with the active ones as removable chips. Its head starts fetching the map and the four sets at once. Opened from the Top card's View list link. |
| `docs/cheatsheet/index.html` | Cheat sheet hub. |
| `docs/cheatsheet/01-…10-*.html` | Domain pages. Each one loads `icons.js` and `app.js`, then calls `App.start(config)`. |
| `docs/cheatsheet/app.css` | Shared styles and colour tokens (`--accent`, `--aws`, `--ink`, `--muted`, `--line`, `--surface`…), with light and dark values. |
| `docs/cheatsheet/icons.js` | AWS service icons as SVG strings (`window.AWS_ICONS`). Use them through `App.iconURL(key)`. |
| `docs/cheatsheet/architectures.html` | 32 architecture diagrams, mostly generated (see below), shown one at a time from a contents of cards. |
| `scripts/build-architectures.js` | Generates diagrams 3–32, the contents list and the jump panel into `architectures.html`. |
| `docs/cheatsheet/mindmap.html` | Interactive mind map: category → service → feature, with each service's question count. Its data is generated (see below). |
| `scripts/build-mindmap.js` + `mindmap-cues.json` | Generates the mind map data from the vocabulary, the cues, the four banks and the diagrams page. |
| `docs/cheatsheet/infographic-*.html` | Eight infographics, generated whole (see below). |
| `docs/cheatsheet/infographics.css` | Styles shared by the infographics, loaded after `app.css`. |
| `scripts/build-infographics.js` + `scripts/infographics/<key>.js` | Generates each infographic from its module, with counts and one worked example taken from the banks. |
| `scripts/check-tags.js` + `tag-vocabulary.json` | Validates every question's `services` tags. |
| `scripts/build-glossary.js` + `glossary.json` | Generates `docs/glossary.json` for the quiz's Services button: a plain definition of each AWS service and, per question, the services its text and options name (see below). |
| `.github/workflows/deploy.yml` | On push to `develop`: checks tags, checks the glossary is up to date, stamps the version, deploys Pages. |

## Commands

```sh
node scripts/check-tags.js            # must pass, or the deploy fails
node scripts/build-architectures.js   # after any change to the diagram specs
node scripts/build-mindmap.js         # after changing cues, the vocabulary, questions or tags, or diagrams
node scripts/build-infographics.js    # after changing an infographic module, questions or tags
node scripts/build-glossary.js        # after changing the glossary or any question's text or options
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
- **Cheat-sheet menu:** every cheat-sheet page has a menu button (`#menuBtn`) in its top bar, and `app.js` builds the menu from it: Studio links, every sheet, the infographics, the diagrams, the mind map, and the light/dark switch. The sheets and the infographics each fold into one row, which starts open only on a page of that group; the fold state isn't saved. There is no separate theme button any more. On phones the menu is a bottom sheet that closes like the mind map's panel: tap the backdrop or the handle, or drag the sheet down. A new page needs that button and must load `app.js`. A new domain sheet goes in `SHEETS` in `app.js`, which the hub reads too.
- **Top bar title:** every cheat-sheet page's bar reads "AWS SAA-C03 Studio · <page>" in the Studio's look: semibold, 16px (14px on phones), the 32px logo, and a 56px bar. The logo and "AWS SAA-C03 Studio" link to the Studio. The page's name, in `--muted`, links to its hub. On phones only the page's name shows, and none at all on a sheet with section tabs. Tab titles read "<page> · AWS SAA-C03 Studio". `build-mindmap.js` reads the sheets' names from those tab titles, and `build-infographics.js` copies the hub's logo link, so keep both formats.
- **Tooltips:** `app.js` draws one themed tooltip (`.tip` in `app.css`) for anything with a `title` on a page that loads it, on mouse hover and keyboard focus. `index.html` has its own copy of that code (`.title-tip`), and its charts' tooltip (`.ov-tip`) uses the same `--tip-*` colours, set for each theme. Give new controls a `title` rather than building a tooltip of their own.
- **No pull-to-refresh:** pulling down at the top of a page does nothing on any page (`overscroll-behavior-y: none` on `html` and `body`). The Studio's ↻ button beside the menu syncs and redraws, and so does the mind map's.
- **One domain order:** the Studio's sections, the cheat sheets and the mind map's categories all list the ten domains most important on the exam first. The order is kept in three places that must change together: `DOMAIN_ORDER` in `index.html`, `SHEETS` in `app.js`, and the category order in `tag-vocabulary.json` (then rebuild the mind map). The sheet files keep their old numbers so that links keep working.
- **Theme with tokens:** use the `app.css` variables or the existing Tailwind palette, never one-off colours, and check both themes.
- **localStorage keys:**
  - `saa_` prefixes app-wide keys;
  - each bank has its own prefix (`set_alpha_`, …);
  - the theme key is `saa_theme`.
- **Gist sync:**
  - **Answers are merged, never replaced** (`mergeBank` in `index.html`). Each question keeps the answers of both copies, matched by time, up to `ATTEMPTS_KEPT` (the first and the latest 19, as `recordAttempt` keeps them). So two devices can practise the same bank without losing answers.
  - **Resets:** a reset stores its time in `<prefix>reset`, and a merge leaves out every answer from before the latest reset on either side.
  - **Newest-wins:** the mistakes and flagged lists, and the settings section, come from whichever copy changed last. When adding a setting that should sync, add it to that settings section.
  - **The active bank:** a sync rewrites it only while no quiz needs it, and every caller of `syncNow` re-reads it (`reloadActiveBank`) when that happens. Otherwise the page would save its old copy over the merge.
  - **First connection** still replaces this browser's copy of each bank the gist already has, as its dialog says.

## Question banks

- **Fields:**
  - identification and classification: `id`, `domain`, `exam_domain`, `task`, `difficulty`, `services`, `pillars`;
  - question text: `question`, `hint`, `keywords`, `options`;
  - answer: `correct_answer`, `explanation`, `tldr`, `wrong_reasons`.
- **Tags:** `services` holds 1–4 tags from `scripts/tag-vocabulary.json`, either `"Service"` or `"Service › Feature"`, joined by ` › `. Its `rules` say what to tag: what the correct answer depends on, most decisive first.
- **After a question or its tags change,** run `check-tags.js`.
- **Review rule** (`standingOf` in `index.html`, one rule for the Due for review list, the Smart quiz and subject quizzes): a question whose latest answer is wrong is to redo now; one right once falls due from the start of the `REVIEW_DAYS` (3) calendar day after that answer; one whose latest two answers are right, whenever given, is retired from review until it is next got wrong. The Smart quiz picks retired ones only when nothing else is left. "Done" (latest answer right) is a separate measure and doesn't use this rule.
- **Top:** the overview's ★ Top card, after What to do next, shows where the `top` questions ranked highest in `priority-map.json` stand: all banks together, then a full-width done / missed / unseen bar per bank. Each bank's ▶ starts its Top quiz: those not done yet first, each part in priority order (done means the latest answer is right). The quiz runs in the set itself, so its answers count there like any other. The card stays hidden if the file can't be read.

## Services glossary

- **What it does:** each quiz question shows a **Services (n)** button next to Show hint. It lists every AWS service named in the question and its options, in the order they appear, each with its icon and one plain sentence on what it is.
- **How it opens:**
  - **Wide screens:** a 520px dialog in the middle of the window over the dimmed page. Escape, the × or a click on the dimmed page closes it.
  - **Phones:** a bottom sheet that closes like the mind map's panel: tap the backdrop or the handle, drag it down, or press Back.
  - **Size:** it grows to fit, up to 60% of the window (520px at most) on wide screens or 72% of the screen on phones (the mind map sheet's height). Past that, its heading stays put and the list scrolls.
- **Icons:** each entry's `icon` is a key in `docs/cheatsheet/icons.js`. Where AWS has no icon for an entry, it borrows the closest related service's icon (AMI uses EC2's, the Systems Manager tools use Systems Manager's). With `null`, the entry shows a plain cube instead. The quiz loads `icons.js` the first time the drawer opens, not with the page.
- **Where to edit:** `scripts/glossary.json`, then run `build-glossary.js`. Never hand-edit `docs/glossary.json`.
  - **Every entry:** `name`, `icon`, `match` (the names to find, case-sensitive) and `what`.
  - **Some entries:** `full` for an abbreviated name, and `formerly` for an old name questions may still use.
- **Matching:** names match longest first. A name that starts with "AWS" or "Amazon" must appear with that prefix, which keeps ordinary words (Backup, Batch, Config, RAM) from matching; any other name also matches with either prefix in front. Features fold into their service (storage classes into S3, DynamoDB Streams into DynamoDB), but a product that behaves like a service of its own gets an entry (DAX, Lambda@Edge, Site-to-Site VPN, the FSx file systems, the Systems Manager tools).
- **The build checks itself.** It fails when:
  - a question names an "AWS …" or "Amazon …" service that has no entry (put a phrase that isn't a service in `ignore`);
  - two entries claim the same name;
  - an icon key isn't in `icons.js`.

  The deploy runs it with `--check`, so a glossary left out of date fails the deploy.
- **Definitions say what a service is, never when the exam wants it,** so opening the drawer gives nothing away. Reading it doesn't count as a hint, and the question's clock stands still while it is open.
- **Same accuracy rule as the diagrams:** definitions must match current AWS behaviour, and prices or limits that change often are left out.

## Architecture diagrams

- **Where to edit:** change `scripts/build-architectures.js`, then rebuild. Never hand-edit between the `GENERATED:…` markers in `architectures.html`. Diagrams 1 and 2 are hand-drawn SVG directly in the page, outside the markers.
- **Adding a diagram:** call `add(groupId, spec)`. Numbering follows page order and renumbers itself.
- **Required spec fields:**
  - a one-line `takeaway`;
  - a `check: { q, opts[4], answer, why }` self-test, written so the explanation never refers to option letters.
- **Jump panel icon:** each new diagram needs an entry in `JUMP_ICONS`. The contents cards use the same icon.
- **One diagram at a time:** the page opens on the contents, a card per diagram with its icon, number, title and `takeaway` (for diagrams 1 and 2, the build reads the rule from the page). A diagram's address (`#hybrid-dns`) shows only that diagram, with its group, "6 of 32", All diagrams and Previous / Next above it, and its neighbours below; ← → step through. A group's address (`#g-network`) opens the contents at that group. Every view change is a hash change, so Back and links from the mind map work. Wide screens get a sticky side list of every diagram in place of the top bar's jump button.
- **Edge colours keep one meaning everywhere:**
  - green solid (`in`) = request or private path;
  - orange dashed (`out`) = through NAT or the internet, or billed;
  - ink (`data`) = data;
  - muted dotted (`alt`) = control, failover, DNS or automatic actions.
- **Exam accuracy matters more than anything else on this page.** Facts must match current AWS behaviour, and prices or limits that change often are better left out.

## Infographics

- **Where to edit:** each page has a module in `scripts/infographics/<key>.js` that returns its title, intro, rule and body. Edit the module and rebuild. Never hand-edit `infographic-*.html`, since the build rewrites the whole file.
- **The page list:** `INFOGRAPHICS` in `app.js` gives the order, names, icons and hub blurbs. The menu's Infographics group, the hub's Infographics section and each page's "More infographics" row all read it. The build fails if that list and the modules disagree, so a new page needs both.
- **Order:** the exam phrase decoder first, then the same domain order as the cheat sheets.
- **The build checks itself:** it fails on an unknown icon key, on a service name that isn't in the vocabulary, or when the worked example (ALPHA-002) no longer has the phrases the decoder marks.
- **Class names:** every class in `infographics.css` starts with `ig-` (page) or `s-` (SVG drawing), so nothing collides with `app.css`. Keep that for new styles.
- **Drawing:** the modules draw SVG with the build's helpers: `T` (text), `I` (icon), `L` (edge) and `svg`. Edge colours mean what they mean on the diagrams page.
- **Phone width:** a wide drawing sits in `ig-scroll` with a `min-width`, so it scrolls inside its panel and the page doesn't. `ig-scroll` has themed scrollbars, using the theme tokens. Any new scroll area must use it or match it.
- **Quiz me:** a switch under each page's rule hides every element marked `ig-hide` until it is tapped: trap answers (the `traps` helper marks them), exam cues, look-alike answers, and the other answer cells. Mark the answer half of any new prompt-and-answer content with `ig-hide`. The switch's state is a view preference in `saa_infographic_quiz`, not synced.
- **Practice links:** a module may return `practice`, a list of vocabulary tags (`"Service"` or `"Service › Feature"`). The build adds a "Practise this page" section with one `index.html#/practice/<bank>/<tag>` link per set, like the mind map's. It fails on a tag that isn't in the vocabulary or that no question has.
- **Same accuracy rule as the diagrams:** facts must match current AWS behaviour, and prices or limits that change often are left out.

## Mind map

- **Where to edit:** service content lives in `scripts/mindmap-cues.json`, with one entry per vocabulary service (`cue`, `traps`, `twins`, `sheet`, `icon`, `icons`, `domain`). Rebuild after editing; never hand-edit between the `GENERATED:DATA` markers in `mindmap.html`.
- **The build checks itself:** it fails if a vocabulary service has no cue, or if a cue names an unknown service, icon, cheat-sheet topic or diagram. A new vocabulary service therefore needs a cue before the map will rebuild.
- **Services with no questions are left out:** a vocabulary service that no question is tagged with (today, Timestream) is dropped from the map and from other services' twins, and the build names it. It returns once a question is tagged with it, so keep its cue.
- **Structure:** the first level is the vocabulary's categories, each listed once, in the same order as the cheat sheets. Only one category is open at a time: opening one folds the others, and Expand all is the exception. Expand all and Collapse all share one button: it folds back to the categories while any category is open, and opens everything otherwise.
- **Question counts:** each service and feature shows, in plain grey, the number of practice questions tagged with it across the four sets, and each category card gives its total (a question tagged with two of its services counts once). A service's count includes questions tagged with the service alone, so its features' counts add up to less; the panel's Features section says how the total splits. With the progress overlay on, the % done takes the count's place.
- **Exam domain:** each service belongs to the exam domain where most of its tagged questions are. The cue's `domain` is used only for a tie, or when there are no questions. The service panel names it, and the chips across the top highlight one domain's services; that choice is not saved.
- **Practice links:** a service panel links to `index.html#/practice/<bank>/<service>`, once per set that has questions for that service, and opens it in a new tab. The Studio selects that set, as its menu would, and starts a `service` quiz using the same outstanding-first order as the section quizzes (`outstandingFirst`). The Studio runs one set at a time, which is why there is one link per set.
- **Back and the address:** every panel opening is a browser history step, with the service in the hash (`#SQS`, `#SQS/FIFO%20queues`). Back returns to the previous service, then closes the panel, then leaves the map. × and Escape unwind those steps with `history.go(-depth)`, and so do the other ways of closing: a click on the dimmed map behind the panel, and on phones the handle (tap it or drag the sheet down; it replaces × there). When changing how the panel opens or closes, keep this working.
- **Refresh:** the ↻ button left of the menu reads the gist when the Studio's Sync with GitHub token is in this browser (`saa_gist_token`). It shows the gist's answers merged into the map (per question, the copy with the newer latest answer, after the latest reset) and says how many questions that changed. It writes nothing; the Studio brings those answers into the browser at its next sync.
- **Progress overlay:** it reads each bank's `<prefix>attempts` from localStorage (latest answer per question). Each bubble shows the share of its tagged questions done, where done means the latest answer is right (the Studio's rule), and its colour follows that share with the Studio's steps: green from 69% (the pass line), amber from 50%, red below. Only the % chip on each bubble takes that colour, on every level; the nodes keep their normal border. It never writes quiz data. There is no legend, and nodes have no tooltips: a service's panel gives its counts. Its own keys are `saa_mindmap_overlay` and `saa_mindmap_open`, both view preferences and not synced.
- **Node colours:** emerald is kept for the root (a soft tint with an emerald border), hover and selection, and green, amber and red for progress. Category cards are neutral (`--surface-2`), set apart by size and weight, and each shows its cheat sheet's icon from `SHEETS` in `app.js`. Every node border is solid.
- **Same accuracy rule as the diagrams:** keep cues true to current AWS behaviour, and leave out prices and limits that change often.

## Gotchas (Windows, Git Bash)

- Bash heredocs and `node -e` mangle backslashes and backticks. Write multi-line edit scripts to a file instead.
- In JS edit scripts, use a function replacement, `s.replace(a, () => b)`. A string replacement treats `$'` and `$&` specially.
- Some files have CRLF line endings. Exact string matching across lines can fail, and `build-architectures.js` preserves each file's line endings.
- `position: fixed` breaks inside an ancestor with a `transform` or `backdrop-filter` (e.g. the top bar). Put popovers and panels outside it.
- Grid and flex children that hold wide content (SVG, tables, nowrap labels) need `min-width: 0`, or the page scrolls sideways on phones.
