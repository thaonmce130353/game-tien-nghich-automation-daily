// Prints the source of selected methods of one controller from the local game bundle, so the
// 11 MB file never has to be opened. Local, read-only reference use; the output is not for committing.
// Usage: node scripts/bundle-method.js <ControllerName> <method> [method...] [--max=1200]
const fs = require('node:fs');
const path = require('node:path');

const bundlePath = path.resolve(__dirname, '..', 'docs', 'game-client', 'main.min_eef72ae3.js');
const args = process.argv.slice(2);
const maxArg = args.find((a) => a.startsWith('--max='));
const max = maxArg ? Number(maxArg.slice(6)) : 1200;
const [ctrl, ...methods] = args.filter((a) => !a.startsWith('--'));

if (!ctrl || !methods.length) {
    console.error('Usage: node scripts/bundle-method.js <ControllerName> <method> [method...] [--max=1200]');
    process.exit(1);
}

const src = fs.readFileSync(bundlePath, 'utf8');
const assign = src.indexOf(`window.${ctrl}=`);
if (assign < 0) {
    console.error(`Controller not found in bundle: ${ctrl}`);
    process.exit(1);
}
const starts = [...src.matchAll(/function\(t,e\)\{var i=function\(t\)\{function e\(\)/g)].map((x) => x.index);
const start = [...starts].reverse().find((s) => s < assign);
const moduleSrc = src.slice(start, assign);

function readBody(from) {
    let depth = 0;
    for (let i = from; i < moduleSrc.length; i++) {
        const ch = moduleSrc[i];
        if (ch === '"' || ch === "'") {
            i++;
            while (i < moduleSrc.length && moduleSrc[i] !== ch) { if (moduleSrc[i] === '\\') i++; i++; }
        } else if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) return moduleSrc.slice(from, i + 1); }
    }
    return '';
}

for (const name of methods) {
    const m = new RegExp(`\\be\\.prototype\\.${name}=function\\(([^)]*)\\)\\{`).exec(moduleSrc);
    if (!m) { console.log(`${ctrl}.${name}: not defined in this controller (inherited or missing)\n`); continue; }
    const text = `function(${m[1]})${readBody(m.index + m[0].length - 1)}`;
    console.log(`${ctrl}.${name} =>`, text.length > max ? `${text.slice(0, max)} ...[${text.length - max} more chars]` : text, '\n');
}
