// Checks every question's `services` tags against tag-vocabulary.json, and that the NotebookLM
// copies carry the same tags. Exits non-zero on any problem, so the deploy workflow stops.
// Usage: node scripts/check-tags.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const MIN_TAGS = 1;
const MAX_TAGS = 4;

const vocabulary = JSON.parse(fs.readFileSync(path.join(__dirname, 'tag-vocabulary.json'), 'utf8'));
const SEP = vocabulary.separator;
const known = new Set();
for (const category of vocabulary.categories) {
  for (const service of category.services) {
    known.add(service.name);
    for (const feature of service.features) known.add(service.name + SEP + feature);
  }
}

const problems = [];
let questionCount = 0;

for (const file of fs.readdirSync(DOCS).filter(f => /^set-[a-z]+-v\d+\.json$/.test(f))) {
  const bank = /^set-([a-z]+)-/.exec(file)[1];
  const questions = JSON.parse(fs.readFileSync(path.join(DOCS, file), 'utf8'));
  const label = id => bank + '#' + id;

  for (const q of questions) {
    questionCount++;
    const tags = q.services;
    if (!Array.isArray(tags)) {
      problems.push(label(q.id) + ': no services list');
      continue;
    }
    if (tags.length < MIN_TAGS || tags.length > MAX_TAGS) {
      problems.push(label(q.id) + ': has ' + tags.length + ' tags, expected ' + MIN_TAGS + '-' + MAX_TAGS);
    }
    if (new Set(tags).size !== tags.length) problems.push(label(q.id) + ': repeats a tag');
    for (const tag of tags) {
      if (!known.has(tag)) problems.push(label(q.id) + ': unknown tag "' + tag + '"');
      const service = tag.split(SEP)[0];
      if (tag !== service && tags.includes(service)) {
        problems.push(label(q.id) + ': has both "' + service + '" and "' + tag + '"');
      }
    }
  }

  // The Markdown copy lists the same tags on a **Services:** line under each question heading.
  const mdPath = path.join(DOCS, 'notebooklm', 'set-' + bank + '.md');
  if (!fs.existsSync(mdPath)) continue;
  const mdTags = {};
  let current = null;
  for (const line of fs.readFileSync(mdPath, 'utf8').split(/\r?\n/)) {
    const heading = /^## [A-Z]+-(\d+):/.exec(line);
    if (heading) current = parseInt(heading[1], 10);
    const services = /^\*\*Services:\*\* (.*)$/.exec(line);
    if (services && current !== null) mdTags[current] = services[1];
  }
  for (const q of questions) {
    const expected = (q.services || []).join(', ');
    if (mdTags[q.id] !== expected) {
      problems.push(path.basename(mdPath) + ' ' + label(q.id) + ': Services line does not match the JSON');
    }
  }
}

if (problems.length) {
  console.error(problems.length + ' tag problem(s):\n' + problems.join('\n'));
  process.exit(1);
}
console.log('Tags OK: ' + questionCount + ' questions');
