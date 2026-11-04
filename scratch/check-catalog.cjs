// Run with: node scratch/check-catalog.cjs
// Uses the locally installed Chrome or Edge; no npm dependencies required.
const { spawn } = require('node:child_process');
const { createServer } = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');

async function main() {
    const root = path.resolve(__dirname, '..');
    const browserPath = process.env.BROWSER_PATH || [
        'C:/Program Files/Google/Chrome/Application/chrome.exe',
        'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
    ].find(file => fs.existsSync(file));
    assert.ok(browserPath, 'Set BROWSER_PATH to a Chromium browser executable.');
    const server = createServer((req, res) => {
        const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
        if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
        const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg' };
        fs.readFile(file, (error, data) => {
            res.writeHead(error ? 404 : 200, { 'Content-Type': (types[path.extname(file)] || 'application/octet-stream') + (['.html', '.js', '.css'].includes(path.extname(file)) ? '; charset=utf-8' : '') });
            res.end(error ? 'Not found' : data);
        });
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'total-catalog-test-'));
    let browser;
    let socket;
    try {
        browser = spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true });
        const debuggerUrl = await new Promise((resolve, reject) => {
            let output = '';
            const timeout = setTimeout(() => reject(new Error('Browser startup timed out')), 20000);
            browser.on('error', error => { clearTimeout(timeout); reject(error); });
            browser.stderr.on('data', chunk => {
                output += chunk;
                const match = output.match(/DevTools listening on (ws:\/\/\S+)/);
                if (match) { clearTimeout(timeout); resolve(match[1]); }
            });
        });
        const endpoint = new URL(debuggerUrl);
        const pages = await (await fetch(`http://${endpoint.host}/json/list`)).json();
        socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
        await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
        let nextId = 0;
        const pending = new Map();
        const errors = [];
        socket.addEventListener('message', event => {
            const data = JSON.parse(event.data);
            if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.text);
            if (pending.has(data.id)) {
                const { resolve, reject, timer } = pending.get(data.id);
                clearTimeout(timer);
                pending.delete(data.id);
                data.error ? reject(new Error(data.error.message)) : resolve(data.result);
            }
        });
        const command = (method, params = {}) => new Promise((resolve, reject) => {
            const id = ++nextId;
            const timer = setTimeout(() => { pending.delete(id); reject(new Error(`${method} timed out`)); }, 15000);
            pending.set(id, { resolve, reject, timer });
            socket.send(JSON.stringify({ id, method, params }));
        });
        const evaluate = async expression => {
            const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
            if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
            return result.result.value;
        };
        await command('Runtime.enable');
        await command('Page.enable');
        await command('Network.enable');
        await command('Network.setBlockedURLs', { urls: ['https://*', 'http://fonts.*'] });
        await command('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/index.html` });
        for (let i = 0; i < 100; i++) {
            if (await evaluate("document.readyState === 'complete' && !!document.querySelector('.product-share')")) break;
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        const results = await evaluate(`(async () => {
            const passed = [];
            const check = (condition, label) => { if (!condition) throw new Error(label); passed.push(label); };
            const tick = () => new Promise(resolve => setTimeout(resolve, 50));
            const card = document.querySelector('.product-card-v5');
            check(!!card.id && !!card.querySelector('.product-favorite'), 'Catalog initializes');
            const wrapper = card.closest('.carousel-wrapper');
            const visible = () => [...wrapper.querySelectorAll('.product-card-v5')].filter(c => c.style.display !== 'none');
            check(visible().length === 6, 'Initial pagination displays six products');
            wrapper.querySelector('.catalog-show-more').click();
            check(visible().length === 12, 'Show more expands pagination');
            filterCatalog('no-product-matches-12345');
            check(document.getElementById('catalog-no-results').style.display === 'block', 'Search empty state');
            resetCatalogSearch();
            card.querySelector('.product-favorite').click();
            document.getElementById('favorites-filter').click();
            check(visible().length === 1, 'Favorites filter');
            card.querySelector('.product-favorite').click();
            check(!document.getElementById('favorites-empty').hidden, 'Removing last favorite displays empty state');
            switchCarousel('iphone');
            const dot = card.querySelectorAll('.color-dot')[1];
            dot.click();
            const source = card.querySelector('.card-image-wrap img');
            const selectedSource = source.src;
            check(decodeURIComponent(selectedSource).includes('Prateado'), 'Selected color updates image immediately');
            const capacity = card.querySelector('.card-capacity');
            capacity.selectedIndex = 1;
            capacity.dispatchEvent(new Event('change'));
            const message = new URL(card.querySelector('.btn-consult').href).searchParams.get('text');
            check(message.includes('Prateado') && message.includes(capacity.value), 'WhatsApp includes selected color and capacity');
            card.querySelector('.product-photo-open').click();
            check(document.getElementById('product-photo-preview').src === selectedSource, 'Photo dialog matches selected color');
            document.getElementById('product-photo-dialog').close();
            await tick();
            const legalLink = [...document.querySelectorAll('[onclick]')].find(el => el.getAttribute('onclick').includes("openLegalModal") && el.getAttribute('onclick').includes('privacy'));
            legalLink.focus();
            legalLink.click();
            const modal = document.getElementById('legal-modal');
            check(modal.open && modal.contains(document.activeElement), 'Legal dialog opens with keyboard focus');
            closeLegalModal();
            await tick();
            check(document.activeElement === legalLink, 'Legal dialog restores focus');
            document.body.style.overflow = 'hidden';
            closeLegalModal();
            check(document.body.style.overflow === 'hidden', 'Closing inactive legal dialog preserves scroll lock');
            document.body.style.overflow = '';
            const deepCard = wrapper.querySelectorAll('.product-card-v5')[8];
            location.hash = deepCard.id;
            openSharedProduct();
            check(deepCard.style.display !== 'none' && document.activeElement === deepCard, 'Shared link reveals and focuses product beyond first page');
            check(!document.getElementById('recently-viewed').hidden, 'Recently viewed history appears');
            document.getElementById('clear-viewed-products').click();
            check(document.getElementById('recently-viewed').hidden, 'Recently viewed history clears');
            return passed;
        })()`);
        assert.deepEqual(errors, [], 'No uncaught browser errors');
        console.log(results.map(result => `PASS ${result}`).join('\n'));
        console.log('PASS No uncaught browser errors');
        await command('Browser.close');
    } finally {
        socket?.close();
        browser?.kill();
        server.closeAllConnections();
        server.close();
        // Keep the isolated temporary profile; the browser may still hold files.
    }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
