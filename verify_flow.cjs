const http = require('http');
const { execSync } = require('child_process');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\exery\\.gemini\\antigravity-ide\\brain\\89a30159-ee95-405b-af2f-e9f9cd65accb';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    }).on('error', reject);
  });
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function screencap(filename) {
  const target = path.join(ARTIFACT_DIR, filename);
  console.log(`Capturing screencap: ${filename}...`);
  execSync(`cmd /c "adb -s 6a0706f0 exec-out screencap -p > ${target}"`);
}

async function main() {
  const tabs = await fetchJson('http://127.0.0.1:9222/json');
  console.log('Tabs:', tabs.map(t => ({ id: t.id, title: t.title, url: t.url })));
  const pageTab = tabs.find(t => t.url.includes('3000') || t.title.includes('Ryan') || t.type === 'page');
  if (!pageTab) {
    throw new Error('No page tab found on 9222');
  }
  console.log(`Connecting to page tab: ${pageTab.id} (${pageTab.title})`);

  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  let idCounter = 1;
  const pending = new Map();

  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res?.result?.value;
  }

  console.log('Reloading page to test fresh changes...');
  await send('Page.reload');
  await delay(4000);

  console.log('Initial page state:');
  const initialNav = await evaluate(`(() => ({
    title: document.title,
    navPanel: Boolean(document.querySelector('.portfolio-3d-navigation-panel')),
    buttons: Array.from(document.querySelectorAll('.portfolio-3d-area-button')).map(b => b.textContent.trim()),
    screens: document.querySelectorAll('.arcade-screen-document').length,
    cam: window.__dbgCam
  }))()`);
  console.log('Initial Nav:', initialNav);

  screencap('screen_v2_initial.png');

  // --- Cycle 1: Profile ---
  console.log('\n--- Cycle 1: Clicking Profile ---');
  await evaluate(`(() => {
    const btn = Array.from(document.querySelectorAll('.portfolio-3d-area-button')).find(b => b.textContent.includes('Profile'));
    if (btn) btn.click();
    else throw new Error('Profile button not found');
  })()`);

  await delay(2000); // Wait for transition
  const profileState = await evaluate(`(() => {
    const doc = document.querySelector('.arcade-screen-document--profile');
    const layer = document.querySelector('.arcade-css-layer');
    return {
      cam: window.__dbgCam,
      layerZIndex: layer ? layer.style.zIndex : null,
      docPointerEvents: doc ? getComputedStyle(doc).pointerEvents : null,
      scrollable: doc ? Boolean(doc.querySelector('.profile-artwork-scroll') || doc.querySelector('.arcade-screen-content')) : false
    };
  })()`);
  console.log('Profile In-Focus State:', profileState);
  screencap('screen_v2_profile_in_focus.png');

  console.log('Clicking Back to Room...');
  await evaluate(`(() => {
    const backBtn = Array.from(document.querySelectorAll('button, a')).find(b => b.textContent.includes('Back') || b.textContent.includes('Room'));
    if (backBtn) backBtn.click();
    else {
      // If not found by text, try focus controls
      const fcBtn = document.querySelector('.arcade-focus-controls button');
      if (fcBtn) fcBtn.click();
      else throw new Error('Back button not found');
    }
  })()`);

  await delay(2000); // Wait for return to overview
  const backState1 = await evaluate(`(() => {
    const layer = document.querySelector('.arcade-css-layer');
    const screenCount = document.querySelectorAll('.arcade-screen-document').length;
    return {
      cam: window.__dbgCam,
      layerZIndex: layer ? layer.style.zIndex : null,
      screenCount
    };
  })()`);
  console.log('Back State 1:', backState1);
  screencap('screen_v2_back_cycle1.png');

  // --- Cycle 2: Backend/API ---
  console.log('\n--- Cycle 2: Clicking Backend/API ---');
  await evaluate(`(() => {
    const btn = Array.from(document.querySelectorAll('.portfolio-3d-area-button')).find(b => b.textContent.includes('Backend'));
    if (btn) btn.click();
    else throw new Error('Backend button not found');
  })()`);

  await delay(2000);
  console.log('Testing scroll on Backend/API screen...');
  const scrollResult = await evaluate(`(() => {
    const doc = document.querySelector('.arcade-screen-document--backend');
    const scroller = doc?.querySelector('.arcade-screen-content') || doc;
    if (scroller) {
      const before = scroller.scrollTop;
      scroller.scrollTop += 200;
      return { before, after: scroller.scrollTop, max: scroller.scrollHeight };
    }
    return 'no scroller';
  })()`);
  console.log('Backend Screen Scroll Result:', scrollResult);
  screencap('screen_v2_backend_in_focus.png');

  console.log('Clicking Back to Room from Backend...');
  await evaluate(`(() => {
    const backBtn = Array.from(document.querySelectorAll('button, a')).find(b => b.textContent.includes('Back') || b.textContent.includes('Room'));
    if (backBtn) backBtn.click();
    else document.querySelector('.arcade-focus-controls button')?.click();
  })()`);

  await delay(2000);
  screencap('screen_v2_back_cycle2.png');

  // --- Cycle 3: Experience ---
  console.log('\n--- Cycle 3: Clicking Experience ---');
  await evaluate(`(() => {
    const btn = Array.from(document.querySelectorAll('.portfolio-3d-area-button')).find(b => b.textContent.includes('Experience'));
    if (btn) btn.click();
    else throw new Error('Experience button not found');
  })()`);

  await delay(2000);
  screencap('screen_v2_experience_in_focus.png');

  console.log('Clicking Back to Room from Experience...');
  await evaluate(`(() => {
    const backBtn = Array.from(document.querySelectorAll('button, a')).find(b => b.textContent.includes('Back') || b.textContent.includes('Room'));
    if (backBtn) backBtn.click();
    else document.querySelector('.arcade-focus-controls button')?.click();
  })()`);

  await delay(2000);
  screencap('screen_v2_back_cycle3.png');

  // --- Cycle 4: Room Drag Interaction ---
  console.log('\n--- Testing Room Drag Interaction ---');
  await evaluate(`(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x1 = rect.left + rect.width * 0.3;
    const y1 = rect.top + rect.height * 0.4;
    const x2 = rect.left + rect.width * 0.7;
    const y2 = rect.top + rect.height * 0.4;

    canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: x1, clientY: y1, pointerId: 1, isPrimary: true, bubbles: true }));
    for (let i = 1; i <= 5; i++) {
      const curX = x1 + (x2 - x1) * (i / 5);
      canvas.dispatchEvent(new PointerEvent('pointermove', { clientX: curX, clientY: y1, pointerId: 1, isPrimary: true, bubbles: true }));
    }
    canvas.dispatchEvent(new PointerEvent('pointerup', { clientX: x2, clientY: y2, pointerId: 1, isPrimary: true, bubbles: true }));
  })()`);

  await delay(1000);
  const postDragState = await evaluate(`(() => {
    const panel = document.querySelector('.portfolio-3d-navigation-panel');
    return {
      panelVisible: Boolean(panel && getComputedStyle(panel).display !== 'none' && getComputedStyle(panel).visibility !== 'hidden'),
      panelBounds: panel ? panel.getBoundingClientRect() : null,
      opacity: panel ? getComputedStyle(panel).opacity : null
    };
  })()`);
  console.log('Post Drag Panel State:', postDragState);
  screencap('screen_v2_post_drag.png');

  ws.close();
  console.log('\nAll cycles completed successfully!');
}

main().catch(err => {
  console.error('Error running test:', err);
  process.exit(1);
});
