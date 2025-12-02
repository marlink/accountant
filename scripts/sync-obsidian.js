#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const TRAE = path.join(ROOT, '.trae', 'documents');
const ISO_DATE = new Date().toISOString().slice(0, 10);

function listMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...listMarkdownFiles(p));
    else if (e.isFile() && e.name.endsWith('.md')) files.push(p);
  }
  return files;
}

function readFileSafe(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}

function writeFileSafe(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, 'utf8');
}

function updateFrontmatterLastUpdated(content, filePath) {
  const fmRegex = /^---\n([\s\S]*?)\n---\n?/;
  const match = content.match(fmRegex);
  const src = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (match) {
    let fm = match[1];
    fm = fm.replace(/last_updated:\s*.*/i, `last_updated: ${ISO_DATE}`);
    if (!/source_path:\s*/.test(fm)) fm += `\nsource_path: ${src}`;
    const updated = `---\n${fm}\n---\n` + content.slice(match[0].length);
    return updated;
  } else {
    const fm = `---\nlast_updated: ${ISO_DATE}\nsource_path: ${src}\n---\n`;
    return fm + content;
  }
}

function generateDocsIndex() {
  const items = [
    'PRD', 'Process', 'Product-Requirements', 'Stack', 'Technical', 'Timeline',
    'features/External-Features-Summary', 'features/MVP', 'features/Phase-2', 'features/Phase-3',
    'specs/Index', 'UX/Index'
  ];
  const lines = items.map(i => `- [[${i}]]`).join('\n');
  const fm = `---\ntitle: Docs Index\ntags: [index]\nversion: 1.0\nlast_updated: ${ISO_DATE}\nsource_path: docs/Index.md\nstatus: reviewed\n---\n\n`;
  writeFileSafe(path.join(DOCS, 'Index.md'), fm + lines + '\n');
}

function generateSpecsIndex() {
  const specsDir = path.join(DOCS, 'specs');
  const entries = fs.existsSync(specsDir) ? fs.readdirSync(specsDir) : [];
  const pages = entries.filter(f => f.endsWith('.md') && f !== 'Index.md').map(f => `- [[${f.replace(/\.md$/, '')}]]`).join('\n');
  const fm = `---\ntitle: Specs Index\ntags: [index, spec]\nversion: 1.0\nlast_updated: ${ISO_DATE}\nsource_path: docs/specs/Index.md\nstatus: reviewed\n---\n\n`;
  writeFileSafe(path.join(specsDir, 'Index.md'), fm + pages + '\n');
}

function generateUXIndex() {
  const fm = `---\ntitle: UX Index\ntags: [index, ux]\nversion: 1.0\nlast_updated: ${ISO_DATE}\nsource_path: docs/UX/Index.md\nstatus: reviewed\n---\n\n`;
  const base = [
    '- [[UserJourneys]]',
    '- [[Wireframes]]',
    '',
    '- Wireframes assets:'
  ];
  const wireDir = path.join(DOCS, 'UX', 'wireframes');
  const wire = fs.existsSync(wireDir) ? fs.readdirSync(wireDir).filter(f => f.endsWith('.svg')).map(f => `  - [[UX/wireframes/${f}]]`) : [];
  const protoDir = path.join(DOCS, 'UX', 'prototype');
  const protoHdr = wire.length ? ['- Prototype pages:'] : ['- Prototype pages:'];
  const proto = fs.existsSync(protoDir) ? fs.readdirSync(protoDir).filter(f => f.endsWith('.html')).map(f => `  - [[UX/prototype/${f}]]`) : [];
  const content = [fm, ...base, ...wire, ...protoHdr, ...proto, '\n'].join('\n');
  writeFileSafe(path.join(DOCS, 'UX', 'Index.md'), content);
}

function generateTraeIndex() {
  const fm = `---\ntitle: Trae Documents Index\ntags: [index, planning]\nversion: 1.0\nlast_updated: ${ISO_DATE}\nsource_path: .trae/documents/Index.md\nstatus: reviewed\n---\n\n`;
  const items = fs.existsSync(TRAE) ? fs.readdirSync(TRAE).filter(f => f.endsWith('.md') && f !== 'Index.md').map(f => `- [[${f.replace(/\.md$/, '')}]]`) : [];
  writeFileSafe(path.join(TRAE, 'Index.md'), fm + items.join('\n') + '\n');
}

function refreshFrontmatter() {
  const files = [...listMarkdownFiles(DOCS), ...listMarkdownFiles(TRAE)];
  for (const f of files) {
    const content = readFileSafe(f);
    if (!content) continue;
    const updated = updateFrontmatterLastUpdated(content, f);
    if (updated !== content) writeFileSafe(f, updated);
  }
}

function runOnce() {
  refreshFrontmatter();
  generateDocsIndex();
  generateSpecsIndex();
  generateUXIndex();
  generateTraeIndex();
}

function watch() {
  runOnce();
  const watchDirs = [DOCS, TRAE].filter(d => fs.existsSync(d));
  for (const d of watchDirs) {
    fs.watch(d, { recursive: true }, (_evt, _name) => {
      try {
        refreshFrontmatter();
        generateDocsIndex();
        generateSpecsIndex();
        generateUXIndex();
        generateTraeIndex();
      } catch (e) {
        // silent
      }
    });
  }
  console.log('Sync watcher running.');
}

if (require.main === module) {
  const mode = process.argv[2] || 'once';
  if (mode === 'watch') watch(); else runOnce();
}

