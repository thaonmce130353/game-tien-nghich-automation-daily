// Dev hot-reload (dormant for normal users).
// Only active when extension/dev-reload.json exists. That file is git-ignored and written by
// scripts/build-content.js on every build. When its "hash" changes this worker
// reloads the EXTENSION only (chrome.runtime.reload). It does NOT refresh the game tabs: reload the game page yourself
// (then click "Vào game") when you want the new content.js to load.
const DEV_FILE = 'dev-reload.json';
const POLL_MS = 2000;

async function readDevFile() {
    try {
        const res = await fetch(chrome.runtime.getURL(DEV_FILE), { cache: 'no-store' });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        return null;
    }
}

let baselineHash = null;

async function poll() {
    // Any extension API call resets the service-worker idle timer, so the poll loop stays alive in dev.
    try { await chrome.runtime.getPlatformInfo(); } catch (e) { }
    const dev = await readDevFile();
    if (!dev) { baselineHash = null; return; }
    if (baselineHash === null) { baselineHash = dev.hash; return; }
    if (dev.hash !== baselineHash) {
        baselineHash = dev.hash;
        chrome.runtime.reload();
    }
}

setInterval(poll, POLL_MS);
poll();
