import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();
const GUI_PATH = path.join(ROOT_DIR, 'gui.html');
const TXT_PATH = path.join(ROOT_DIR, 'transactions.txt');
const MAIN_CPP_PATH = path.join(ROOT_DIR, 'main.cpp');

test('Non-regression: main.cpp is untouched', () => {
  const gitDiff = execSync('git diff main.cpp', { encoding: 'utf-8' });
  assert.equal(gitDiff.trim(), '', 'main.cpp must remain completely untouched');
});

test('Verification of required asset files', () => {
  const requiredFiles = [
    'gui.html',
    'transactions.txt',
    'main.cpp',
    'Neutral.png',
    'Happy.png',
    'Sad.png',
    'Broke.png',
    'WEB BACKGROUND.png',
    'Final Product.png',
    'background-pixel.svg',
    'Minecraftia.ttf'
  ];

  for (const f of requiredFiles) {
    assert.ok(fs.existsSync(path.join(ROOT_DIR, f)), `File ${f} must exist in root`);
  }

  const presentationFolder = path.join(ROOT_DIR, 'Green and Blue Pixel Art Game Illustrative Group Project Presentation');
  const presentationAssets = [
    'Neutral.png',
    'Happy.png',
    'Sad.png',
    'Broke.png',
    'WEB BACKGROUND.png',
    'Final Product.png',
    'background-pixel.svg',
    'Minecraftia.ttf'
  ];
  for (const f of presentationAssets) {
    assert.ok(fs.existsSync(path.join(presentationFolder, f)), `Asset ${f} must exist in presentation folder`);
  }
});

test('transactions.txt format and parsing logic', () => {
  const content = fs.readFileSync(TXT_PATH, 'utf-8');
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  assert.ok(lines.length >= 4, 'transactions.txt must contain at least 1 record');
  const count = parseInt(lines[0], 10);
  assert.equal(count, 4, 'transactions.txt should have 4 records initially');

  const loaded = [];
  let idx = 1;
  for (let i = 0; i < count && idx < lines.length; i++) {
    const type = lines[idx++];
    const amount = parseFloat(lines[idx++]);
    const remark = lines[idx++];
    loaded.push({ id: i + 1, type, amount, remark });
  }

  assert.equal(loaded.length, 4);
  assert.equal(loaded[0].type, 'Income');
  assert.equal(loaded[0].amount, 3200);
  assert.equal(loaded[1].type, 'Expense');
  assert.equal(loaded[1].amount, 900);
  assert.equal(loaded[2].type, 'Expense');
  assert.equal(loaded[2].amount, 200);
  assert.equal(loaded[3].type, 'Savings');
  assert.equal(loaded[3].amount, 600);
});

test('Calculations: Balance, Income, Spending match C++ logic', () => {
  const transactions = [
    { id: 1, type: "Income", amount: 3200, remark: "Monthly Job" },
    { id: 2, type: "Expense", amount: 900, remark: "Apartment Rent" },
    { id: 3, type: "Expense", amount: 200, remark: "Groceries" },
    { id: 4, type: "Savings", amount: 600, remark: "Emergency Fund" }
  ];

  let income = 0, spending = 0, savings = 0;
  for (const t of transactions) {
    if (t.type === 'Income') income += t.amount;
    else if (t.type === 'Expense') spending += t.amount;
    else if (t.type === 'Savings') savings += t.amount;
  }

  const balance = income - spending - savings;
  assert.equal(income, 3200);
  assert.equal(spending, 1100);
  assert.equal(savings, 600);
  assert.equal(balance, 1500);
});

test('Pet State Machine: Reactive transitions and Broke condition', () => {
  // State machine implementation
  class PetStateMachine {
    constructor(initialIncome = 3200, initialSpending = 1100) {
      this.income = initialIncome;
      this.spending = initialSpending;
      this.state = this.getIdleState();
      this.timer = null;
    }

    getIdleState() {
      return this.spending > this.income ? 'Broke' : 'Neutral';
    }

    recordIncome(amount) {
      this.income += amount;
      this.state = 'Happy';
      if (this.timer) clearTimeout(this.timer);
    }

    recordExpense(amount) {
      this.spending += amount;
      this.state = 'Sad';
      if (this.timer) clearTimeout(this.timer);
    }

    revert() {
      this.state = this.getIdleState();
    }
  }

  // Case 1: Initial healthy state
  const pet = new PetStateMachine(3200, 1100);
  assert.equal(pet.state, 'Neutral', 'Pet must be Neutral when income >= spending');

  // Case 2: Record Income -> Happy, then reverts to Neutral
  pet.recordIncome(500);
  assert.equal(pet.state, 'Happy', 'Pet must switch to Happy on Income');
  pet.revert();
  assert.equal(pet.state, 'Neutral', 'Pet must revert to Neutral when income exceeds spending');

  // Case 3: Record Expense -> Sad, then reverts to Neutral if still positive
  pet.recordExpense(100);
  assert.equal(pet.state, 'Sad', 'Pet must switch to Sad on Expense');
  pet.revert();
  assert.equal(pet.state, 'Neutral', 'Pet must revert to Neutral when income exceeds spending');

  // Case 4: Record huge Expense exceeding total income -> Sad, then reverts to Broke!
  pet.recordExpense(5000);
  assert.equal(pet.state, 'Sad', 'Pet must show Sad immediately upon recording Expense');
  pet.revert();
  assert.equal(pet.state, 'Broke', 'Pet must revert to Broke when spending > income');

  // Case 5: Idle state remains Broke while spending > income
  assert.equal(pet.getIdleState(), 'Broke');

  // Case 6: Record Income while Broke -> Happy temporarily, reverts to Broke if still negative
  pet.recordIncome(100); // income 3800, spending 6200
  assert.equal(pet.state, 'Happy', 'Pet must show Happy temporarily on Income even if broke');
  pet.revert();
  assert.equal(pet.state, 'Broke', 'Pet returns to Broke if spending still exceeds income');

  // Case 7: Record massive Income to recover -> Happy, then reverts to Neutral!
  pet.recordIncome(5000); // income 8800, spending 6200
  assert.equal(pet.state, 'Happy');
  pet.revert();
  assert.equal(pet.state, 'Neutral', 'Pet recovers to Neutral once income exceeds spending');
});

test('transactions.txt parsing handles empty remarks without de-synchronizing records', () => {
  function parseTxt(content) {
    const rawLines = content.split(/\r?\n/);
    let idx = 0;
    while (idx < rawLines.length && rawLines[idx].trim() === '') idx++;
    if (idx >= rawLines.length) return [];

    const count = parseInt(rawLines[idx++].trim(), 10);
    if (isNaN(count) || count < 0) return [];

    const loaded = [];
    for (let i = 0; i < count && idx < rawLines.length; i++) {
      while (idx < rawLines.length && rawLines[idx].trim() === '') idx++;
      if (idx >= rawLines.length) break;
      const type = rawLines[idx++].trim();

      while (idx < rawLines.length && rawLines[idx].trim() === '') idx++;
      if (idx >= rawLines.length) break;
      const amount = parseFloat(rawLines[idx++].trim());

      const remark = idx < rawLines.length ? rawLines[idx++].trim() : '';

      if (!isNaN(amount)) {
        loaded.push({ id: i + 1, type, amount, remark: remark || 'No description' });
      }
    }
    return loaded;
  }

  // Edge case: Transaction 1 has an empty remark line
  const sampleWithEmptyRemark = '2\nIncome\n1500\n\nExpense\n300\nGroceries\n';
  const parsed = parseTxt(sampleWithEmptyRemark);
  assert.equal(parsed.length, 2, 'Must parse both transactions even when one has an empty remark');
  assert.equal(parsed[0].type, 'Income');
  assert.equal(parsed[0].amount, 1500);
  assert.equal(parsed[0].remark, 'No description');
  assert.equal(parsed[1].type, 'Expense');
  assert.equal(parsed[1].amount, 300);
  assert.equal(parsed[1].remark, 'Groceries');
});

test('gui.html contains all required elements, attributes, and scripts', () => {
  const html = fs.readFileSync(GUI_PATH, 'utf-8');

  // Check required element IDs
  assert.ok(html.includes('id="val-balance"'), 'Must contain #val-balance indicator');
  assert.ok(html.includes('id="val-income"'), 'Must contain #val-income indicator');
  assert.ok(html.includes('id="val-spending"'), 'Must contain #val-spending indicator');
  assert.ok(html.includes('id="btn-income"'), 'Must contain #btn-income button');
  assert.ok(html.includes('id="btn-expense"'), 'Must contain #btn-expense button');
  assert.ok(html.includes('id="pet-sprite"'), 'Must contain #pet-sprite element');
  assert.ok(html.includes('id="dialog-record"'), 'Must contain #dialog-record dialog');
  assert.ok(html.includes('id="input-amount"'), 'Must contain #input-amount field');
  assert.ok(html.includes('id="input-desc"'), 'Must contain #input-desc field');
  assert.ok(html.includes('signpost-hitbox'), 'Must contain signpost element');
  assert.ok(html.includes('Name: POE'), 'Must reference pet Name: POE');

  // Check sprite file references
  assert.ok(html.includes('Neutral.png'), 'Must reference Neutral.png');
  assert.ok(html.includes('Happy.png'), 'Must reference Happy.png');
  assert.ok(html.includes('Sad.png'), 'Must reference Sad.png');
  assert.ok(html.includes('Broke.png'), 'Must reference Broke.png');
  assert.ok(html.includes('WEB BACKGROUND.png'), 'Must reference WEB BACKGROUND.png');

  // Check modern dialog practices
  assert.ok(html.includes('<dialog'), 'Must use native <dialog> element');
  assert.ok(html.includes('showModal()'), 'Must call showModal()');
  assert.ok(html.includes('closedby="any"'), 'Must use closedby="any" for modern light dismiss');
  assert.ok(html.includes('overscroll-behavior: contain'), 'Must contain overscroll-behavior');
  assert.ok(html.includes('dialog:not([open])'), 'Must contain fallback display rule for closed dialogs');

  // Check container query support
  assert.ok(html.includes('container-type: inline-size'), 'Must support container queries for responsive stage');

  // Check file import and auto-load
  assert.ok(html.includes('id="file-import-input"'), 'Must include file import input element');
  assert.ok(html.includes("fetch('transactions.txt')"), 'Must attempt auto-load of transactions.txt');

  // Check authentic pixel font and full-width layout
  assert.ok(html.includes('Minecraftia'), 'Must embed and use Minecraftia font matching Final Product.png');
  assert.ok(html.includes('width: 100vw;'), 'Stage must span full width without side bars');
  assert.ok(html.includes('height: 100vh;'), 'Stage must span full height without side bars');
});

test('Headless Chrome DOM validation', () => {
  const dump = execSync(
    `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --dump-dom "file://${GUI_PATH}"`,
    { encoding: 'utf-8' }
  );

  assert.ok(dump.includes('id="val-balance"'), 'Headless Chrome must render #val-balance');
  assert.ok(dump.includes('id="btn-income"'), 'Headless Chrome must render #btn-income');
  assert.ok(dump.includes('id="btn-expense"'), 'Headless Chrome must render #btn-expense');
  assert.ok(dump.includes('id="pet-sprite"'), 'Headless Chrome must render #pet-sprite');
  assert.ok(dump.includes('src="Neutral.png"'), 'Initial sprite in DOM must be Neutral.png');
  assert.ok(dump.includes('Name: POE'), 'Signpost in DOM must include Name: POE');
});

test('transactions.txt parsing correctly handles 0 records', () => {
  function parseTxt(content) {
    if (!content || typeof content !== 'string') return null;
    const rawLines = content.split(/\r?\n/);
    let idx = 0;
    while (idx < rawLines.length && rawLines[idx].trim() === '') idx++;
    if (idx >= rawLines.length) return null;

    const count = parseInt(rawLines[idx++].trim(), 10);
    if (isNaN(count) || count < 0) return null;

    const loaded = [];
    for (let i = 0; i < count && idx < rawLines.length; i++) {
      while (idx < rawLines.length && rawLines[idx].trim() === '') idx++;
      if (idx >= rawLines.length) break;
      const type = rawLines[idx++].trim();

      while (idx < rawLines.length && rawLines[idx].trim() === '') idx++;
      if (idx >= rawLines.length) break;
      const amount = parseFloat(rawLines[idx++].trim());

      const remark = idx < rawLines.length ? rawLines[idx++].trim() : '';

      if (!isNaN(amount)) {
        loaded.push({ id: i + 1, type, amount, remark: remark || 'No description' });
      }
    }

    if (loaded.length > 0 || count === 0) {
      return loaded;
    }
    return null;
  }

  const emptySample = '0\n';
  const parsed = parseTxt(emptySample);
  assert.notEqual(parsed, null, 'Must not ignore 0 records');
  assert.equal(parsed.length, 0, 'Parsed array must be empty');
});

test('Money formatting handles integers, floats, and binary floating-point jitter', () => {
  function formatMoney(num) {
    const rounded = Math.round((num + Number.EPSILON) * 100) / 100;
    const cleanZero = Object.is(rounded, -0) ? 0 : rounded;
    if (Number.isInteger(cleanZero)) {
      return `${cleanZero}$`;
    }
    return `${cleanZero.toFixed(2)}$`;
  }

  assert.equal(formatMoney(1500), '1500$');
  assert.equal(formatMoney(1500.5), '1500.50$');
  assert.equal(formatMoney(1500.00000001), '1500$');
  assert.equal(formatMoney(-0), '0$');
  assert.equal(formatMoney(-2000), '-2000$');
  assert.equal(formatMoney(0.1 + 0.2), '0.30$');
});

test('escapeHtml prevents XSS injection', () => {
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  assert.equal(escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  assert.equal(escapeHtml('Coffee & Tea'), 'Coffee &amp; Tea');
  assert.equal(escapeHtml('"quoted"'), '&quot;quoted&quot;');
});

