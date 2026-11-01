const fs = require('node:fs');
const path = require('node:path');
const { buildContent, sourceRoot, sourceFiles } = require('./build-content');

const POLL_INTERVAL_MS = 500;

function readSourceSnapshot() {
    return sourceFiles.map((fileName) => {
        const filePath = path.join(sourceRoot, fileName);
        return `${fileName}\0${fs.readFileSync(filePath).toString('base64')}`;
    }).join('\n');
}

function startWatcher() {
    buildContent();
    let lastAttemptedSnapshot = readSourceSnapshot();
    console.log(`Watching ${path.relative(process.cwd(), sourceRoot)} for changes. Press Ctrl+C to stop.`);

    setInterval(() => {
        try {
            const snapshot = readSourceSnapshot();
            if (snapshot === lastAttemptedSnapshot) return;

            lastAttemptedSnapshot = snapshot;
            try {
                buildContent();
            } catch (error) {
                console.error('Content validation/build failed; fix a source file to retry:', error.message);
            }
        } catch (error) {
            console.error('Unable to read content source files:', error.message);
        }
    }, POLL_INTERVAL_MS);
}

startWatcher();
