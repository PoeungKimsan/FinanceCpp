import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';

const ROOT_DIR = path.resolve(import.meta.dirname, '..');
const GUI_PATH = path.join(ROOT_DIR, 'gui.html');
const SVG_PATH = path.join(ROOT_DIR, 'assets', 'images', 'background-pixel.svg');
const PRESENTATION_SVG = path.join(
  ROOT_DIR,
  'docs',
  'presentation',
  'background-pixel.svg'
);

function getChromePath() {
  if (process.platform === 'win32') {
    const candidates = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
    ];
    for (const c of candidates) {
      if (c && fs.existsSync(c)) return c;
    }
  } else if (process.platform === 'darwin') {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  }
  return 'google-chrome';
}

test('Scalable Pixel Background: SVG asset existence and structure', () => {
  assert.ok(fs.existsSync(SVG_PATH), 'background-pixel.svg must exist in assets/images');
  assert.ok(fs.existsSync(PRESENTATION_SVG), 'background-pixel.svg must exist in docs/presentation');

  const svgContent = fs.readFileSync(SVG_PATH, 'utf-8');
  assert.ok(svgContent.includes('viewBox="0 0 1920 1080"'), 'SVG must define 1920x1080 16:9 viewBox');
  assert.ok(svgContent.includes('preserveAspectRatio="none"'), 'SVG must specify preserveAspectRatio="none" for full-width responsive scaling');
  assert.ok(svgContent.includes('Minecraftia'), 'SVG must embed and use Minecraftia font');
  assert.ok(svgContent.includes('shape-rendering="crispEdges"'), 'SVG must enforce crispEdges shape rendering');
  assert.ok(svgContent.includes('image-rendering:pixelated') || svgContent.includes('image-rendering: pixelated'), 'SVG must specify pixelated image rendering');
  assert.ok(svgContent.includes('id="svg-signpost"'), 'SVG must include wooden signpost element');
  assert.ok(svgContent.includes('id="svg-card"'), 'SVG must include financial card container');
  assert.ok(svgContent.includes('id="svg-buttons"'), 'SVG must include action buttons');
  assert.ok(svgContent.includes('id="svg-pine-flower"'), 'SVG must preserve pine tree pink blossom flower');
  assert.ok(svgContent.includes('Name:'), 'Signpost must contain Name: label');
  assert.ok(svgContent.includes('POE'), 'Signpost must contain POE name');
  assert.ok(svgContent.includes('Income'), 'Must contain Income button text');
  assert.ok(svgContent.includes('Expense'), 'Must contain Expense button text');
  assert.ok(svgContent.includes('Balance:'), 'Must contain Balance: label');
  assert.ok(svgContent.includes('Income:'), 'Must contain Income: label');
  assert.ok(svgContent.includes('Spending:'), 'Must contain Spending: label');
  assert.ok(svgContent.includes('Distant Rolling Hills'), 'SVG must include distant hills for scenery depth');
});

test('gui.html integration: CSS pixelation and fallback cascade', () => {
  const html = fs.readFileSync(GUI_PATH, 'utf-8');

  // Verify scalable background integration
  assert.ok(html.includes('background-pixel.svg'), 'gui.html must reference background-pixel.svg');
  assert.ok(html.includes('WEB BACKGROUND.png'), 'gui.html must retain WEB BACKGROUND.png as fallback');
  assert.ok(html.includes('image-rendering: pixelated;'), 'Must specify pixelated image-rendering');
  assert.ok(html.includes('image-rendering: -moz-crisp-edges;'), 'Must specify -moz-crisp-edges image-rendering');
  assert.ok(html.includes('image-rendering: crisp-edges;'), 'Must specify crisp-edges image-rendering');
  assert.ok(html.includes('width: 100vw;'), 'Must span full viewport width without side bars');
  assert.ok(html.includes('height: 100vh;'), 'Must span full viewport height');
  assert.ok(html.includes('Minecraftia'), 'gui.html must embed and use Minecraftia font');
});

test('Responsive Zoom In / Out Validation across multiple resolutions via Headless Chrome', async () => {
  const chromePath = getChromePath();
  if (!fs.existsSync(chromePath)) {
    console.log(`Chrome binary not found at ${chromePath}, skipping headless resolution tests`);
    return;
  }

  const testResolutions = [
    { name: '50% zoom', width: 640, height: 360 },
    { name: '100% standard', width: 1280, height: 720 },
    { name: '150% full HD', width: 1920, height: 1080 },
    { name: '200% QHD', width: 2560, height: 1440 },
    { name: '300% 4K UHD', width: 3840, height: 2160 }
  ];

  const tmpProfileDir = path.join(os.tmpdir(), 'chrome-profile-bg-test');

  for (const res of testResolutions) {
    const dump = execSync(
      `"${chromePath}" --headless --disable-gpu --no-first-run --no-default-browser-check --user-data-dir="${tmpProfileDir}" --window-size=${res.width},${res.height} --dump-dom "file://${GUI_PATH}"`,
      { encoding: 'utf-8' }
    );

    assert.ok(dump.includes('id="val-balance"'), `${res.name} must render #val-balance`);
    assert.ok(dump.includes('id="btn-income"'), `${res.name} must render #btn-income`);
    assert.ok(dump.includes('id="btn-expense"'), `${res.name} must render #btn-expense`);
    assert.ok(dump.includes('id="signpost-hitbox"'), `${res.name} must render #signpost-hitbox`);
    assert.ok(dump.includes('id="pet-sprite"'), `${res.name} must render #pet-sprite`);
  }
});
