const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const extensionRoot = path.join(root, 'extension');
const sourceRoot = path.join(extensionRoot, 'src', 'content');
const outputPath = path.join(extensionRoot, 'content.js');
const allSourceFiles = [
    'bootstrap.js',
    'ui-init.js',
    'ui-styles.js',
    'ui-markup.js',
    'ui-settings.js',
    'ui-events.js',
    'features/exposure-probe-ui.js',
    'features/banner-gifts-ui.js',
    'features/auto-reconnect.js',
    'game-bridge.js',
    'game-hooks.js',
    'features/tong-tian-tower.js',
    'features/daily-dungeons.js',
    'features/underworld-abyss.js',
    'features/arena.js',
    'features/four-spirit-camp.js',
    'features/sweep-dungeons.js',
    'features/war-order.js',
    'features/extreme-yin.js',
    'features/ma-dao.js',
    'features/xian-yuan.js',
    'features/tower-and-tu-linh.js',
    'features/daily-and-bi-canh.js',
    'features/sect-defense.js',
    'features/uyen-nhi.js',
    'features/co-than-dia.js',
    'features/other-trials.js',
    'features/immortal-relic.js',
    'features/bi-canh-tu-quoc.js',
    'features/memory-minigame.js',
    'features/dragon-minigame.js',
    'features/daily-routines.js',
    'features/exposure-probe.js',
    'features/banner-gifts.js',
    'features/banner-workflow.js',
    'features/thai-co-thu-ha.js',
    'features/quick-run.js',
    'features/scheduler.js'
];

// Every build includes ALL listed files, the Probe too; a missing file is a hard error (see createContentBundle).
const sourceFiles = allSourceFiles;

function createContentBundle() {
    const fragments = sourceFiles.map((fileName) => {
        const filePath = path.join(sourceRoot, fileName);
        const fragment = fs.readFileSync(filePath);
        if (fragment.length === 0) {
            throw new Error(`Source fragment is empty: ${filePath}`);
        }
        return fragment;
    });

    return Buffer.concat(fragments);
}

function validateContent(bundle = createContentBundle()) {
    const result = spawnSync(process.execPath, ['--check', '-'], {
        input: bundle,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024
    });

    if (result.error) {
        throw new Error(`Unable to run the JavaScript syntax check: ${result.error.message}`);
    }

    if (result.status !== 0) {
        const details = (result.stderr || result.stdout || 'Unknown syntax error').trim();
        throw new Error(`Generated content.js has syntax errors:\n${details}`);
    }

    console.log('Content source syntax is valid.');
    return bundle;
}

function buildContent() {
    const bundle = validateContent(createContentBundle());
    fs.writeFileSync(outputPath, bundle);
    const builtAt = new Date().toLocaleString();
    // Every build also signals the dev hot-reload worker (extension/background.js).
    const hash = require('node:crypto').createHash('sha1').update(bundle).digest('hex');
    fs.writeFileSync(path.join(extensionRoot, 'dev-reload.json'), JSON.stringify({ hash, builtAt }) + '\n');
    console.log(`[${builtAt}] Built ${path.relative(root, outputPath)} from ${sourceFiles.length} ordered source files.`);
}

if (require.main === module) {
    buildContent();
}

module.exports = { buildContent, createContentBundle, validateContent, sourceRoot, sourceFiles };
