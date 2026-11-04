import { spawn } from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';

const GUI_URL = `file://${path.resolve('gui.html')}`;
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;

async function run() {
  console.log('Starting headless Chrome on port', PORT);
  const chrome = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=/tmp/chrome-test-profile-e2e',
    GUI_URL
  ]);

  try {
    // Wait for Chrome CDP endpoint
    let wsUrl = null;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
        const targets = await res.json();
        const page = targets.find(t => t.type === 'page' && t.url.includes('gui.html'));
        if (page && page.webSocketDebuggerUrl) {
          wsUrl = page.webSocketDebuggerUrl;
          break;
        }
      } catch (e) {}
    }

    if (!wsUrl) {
      throw new Error('Failed to connect to Chrome debugging port for gui.html');
    }

    console.log('Connected to CDP at', wsUrl);
    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    let id = 1;
    function sendCommand(method, params = {}) {
      return new Promise((resolve, reject) => {
        const curId = id++;
        const handler = (evt) => {
          const msg = JSON.parse(evt.data);
          if (msg.id === curId) {
            ws.removeEventListener('message', handler);
            if (msg.error) reject(msg.error);
            else resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    async function evaluate(expression) {
      const res = await sendCommand('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      return res.result.value;
    }

    // Wait for page to initialize
    await new Promise(r => setTimeout(r, 1000));

    // Test 1: Initial state
    const initialBalance = await evaluate("document.getElementById('val-balance').textContent");
    const initialIncome = await evaluate("document.getElementById('val-income').textContent");
    const initialSpending = await evaluate("document.getElementById('val-spending').textContent");
    const initialSprite = await evaluate("document.getElementById('pet-sprite').src");

    console.log('Initial Balance:', initialBalance);
    console.log('Initial Income:', initialIncome);
    console.log('Initial Spending:', initialSpending);
    console.log('Initial Sprite:', initialSprite);

    assert.equal(initialBalance, '1500$', 'Initial balance must match transactions.txt (3200-1100-600)');
    assert.equal(initialIncome, '3200$', 'Initial income must match transactions.txt');
    assert.equal(initialSpending, '1100$', 'Initial spending must match transactions.txt (900+200)');
    assert.ok(initialSprite.includes('Neutral.png'), 'Pet sprite must initially be Neutral.png');

    // Test 2: Trigger Income
    console.log('Testing Record Income flow...');
    await evaluate("document.getElementById('btn-income').click()");
    const dialogOpen = await evaluate("document.getElementById('dialog-record').open");
    assert.equal(dialogOpen, true, 'Dialog should open upon clicking Income button');

    // Enter amount 500 and submit
    await evaluate(`
      document.getElementById('input-amount').value = '500';
      document.getElementById('input-desc').value = 'Consulting Bonus';
      document.getElementById('form-record').dispatchEvent(new Event('submit', { cancelable: true }));
    `);

    const incomeAfter = await evaluate("document.getElementById('val-income').textContent");
    const balanceAfter = await evaluate("document.getElementById('val-balance').textContent");
    const spriteAfterIncome = await evaluate("document.getElementById('pet-sprite').src");
    const bubbleAfterIncome = await evaluate("document.getElementById('bubble-text').textContent");

    console.log('Income after recording:', incomeAfter);
    console.log('Balance after recording:', balanceAfter);
    console.log('Sprite during Income reaction:', spriteAfterIncome);
    console.log('Bubble text:', bubbleAfterIncome);

    assert.equal(incomeAfter, '3700$', 'Income should increase from 3200$ to 3700$');
    assert.equal(balanceAfter, '2000$', 'Balance should increase from 1500$ to 2000$');
    assert.ok(spriteAfterIncome.includes('Happy.png'), 'Pet sprite must switch to Happy.png on Income');

    // Wait 2.7s for Happy reaction to revert to idle
    console.log('Waiting 2.7s for Happy reaction to complete...');
    await new Promise(r => setTimeout(r, 2700));

    const spriteRevertedIncome = await evaluate("document.getElementById('pet-sprite').src");
    console.log('Sprite after Happy revert:', spriteRevertedIncome);
    assert.ok(spriteRevertedIncome.includes('Neutral.png'), 'Pet must revert to Neutral.png because income > spending');

    // Test 3: Trigger Expense exceeding Income (triggering Broke condition)
    console.log('Testing Expense flow leading to Broke state...');
    await evaluate("document.getElementById('btn-expense').click()");
    await evaluate(`
      document.getElementById('input-amount').value = '4000';
      document.getElementById('input-desc').value = 'Huge Equipment Purchase';
      document.getElementById('form-record').dispatchEvent(new Event('submit', { cancelable: true }));
    `);

    const spendingAfterExpense = await evaluate("document.getElementById('val-spending').textContent");
    const balanceAfterExpense = await evaluate("document.getElementById('val-balance').textContent");
    const spriteDuringExpense = await evaluate("document.getElementById('pet-sprite').src");

    console.log('Spending after huge expense:', spendingAfterExpense);
    console.log('Balance after huge expense:', balanceAfterExpense);
    console.log('Sprite during Expense reaction:', spriteDuringExpense);

    assert.equal(spendingAfterExpense, '5100$', 'Spending should increase to 5100$');
    assert.equal(balanceAfterExpense, '-2000$', 'Balance should decrease to -2000$');
    assert.ok(spriteDuringExpense.includes('Sad.png'), 'Pet must switch to Sad.png on Expense');

    // Wait 2.7s for Sad reaction to revert to Broke
    console.log('Waiting 2.7s for Sad reaction to complete...');
    await new Promise(r => setTimeout(r, 2700));

    const spriteAfterBroke = await evaluate("document.getElementById('pet-sprite').src");
    console.log('Sprite after Broke revert:', spriteAfterBroke);
    assert.ok(spriteAfterBroke.includes('Broke.png'), 'Pet must revert to Broke.png when spending > income');

    // Test 4: Signpost interaction
    console.log('Testing Signpost POE interaction...');
    await evaluate("document.getElementById('signpost-hitbox').click()");
    const signpostBubble = await evaluate("document.getElementById('bubble-text').textContent");
    console.log('Signpost bubble:', signpostBubble);
    assert.ok(signpostBubble.includes('POE'), 'Signpost click must show POE speech bubble');

    // Test 5: Rapid consecutive submissions within <1 second
    console.log('Testing rapid consecutive submissions (<1s) to observe timer cancel/reset...');
    await evaluate("document.getElementById('btn-income').click()");
    await evaluate(`
      document.getElementById('input-amount').value = '1000';
      document.getElementById('input-desc').value = 'Quick Income 1';
      document.getElementById('form-record').dispatchEvent(new Event('submit', { cancelable: true }));
    `);
    const spriteRapidHappy = await evaluate("document.getElementById('pet-sprite').src");
    assert.ok(spriteRapidHappy.includes('Happy.png'), 'Pet must immediately show Happy');

    // Submit Expense 200ms later
    await new Promise(r => setTimeout(r, 200));
    await evaluate("document.getElementById('btn-expense').click()");
    await evaluate(`
      document.getElementById('input-amount').value = '500';
      document.getElementById('input-desc').value = 'Quick Expense 2';
      document.getElementById('form-record').dispatchEvent(new Event('submit', { cancelable: true }));
    `);
    const spriteRapidSad = await evaluate("document.getElementById('pet-sprite').src");
    const bubbleRapidSad = await evaluate("document.getElementById('bubble-text').textContent");
    console.log('Sprite during rapid second submission:', spriteRapidSad);
    console.log('Bubble during rapid second submission:', bubbleRapidSad);
    assert.ok(spriteRapidSad.includes('Sad.png'), 'Pet must cancel previous Happy and immediately switch to Sad');
    assert.ok(bubbleRapidSad.includes('Spent'), 'Bubble must reflect newest transaction');

    // Wait 2.7s for timer to revert cleanly
    console.log('Waiting 2.7s for rapid timer to expire...');
    await new Promise(r => setTimeout(r, 2700));
    const spriteRapidRevert = await evaluate("document.getElementById('pet-sprite').src");
    console.log('Sprite after rapid timer revert:', spriteRapidRevert);
    // Income is 3700+1000 = 4700. Spending is 5100+500 = 5600. Spending > Income, so Broke
    assert.ok(spriteRapidRevert.includes('Broke.png'), 'Pet must revert to Broke state after rapid timer expiry');

    // Test 6: Form validation with invalid amounts
    console.log('Testing Form Validation with invalid inputs...');
    await evaluate("document.getElementById('btn-income').click()");
    await evaluate(`
      document.getElementById('input-amount').value = '0';
      document.getElementById('form-record').dispatchEvent(new Event('submit', { cancelable: true }));
    `);
    const errorVisible0 = await evaluate("document.getElementById('record-error').style.display");
    const dialogStillOpen0 = await evaluate("document.getElementById('dialog-record').open");
    assert.equal(errorVisible0, 'block', 'Error message must be displayed on 0 amount');
    assert.equal(dialogStillOpen0, true, 'Dialog must remain open when amount is 0');

    // Test with negative amount
    await evaluate(`
      document.getElementById('input-amount').value = '-100';
      document.getElementById('form-record').dispatchEvent(new Event('submit', { cancelable: true }));
    `);
    const errorVisibleNeg = await evaluate("document.getElementById('record-error').style.display");
    assert.equal(errorVisibleNeg, 'block', 'Error message must be displayed on negative amount');

    // Close dialog
    await evaluate("document.getElementById('btn-modal-cancel').click()");

    // Test 7: Pet Keyboard Interaction (Enter / Space)
    console.log('Testing Pet keyboard interaction (Enter key)...');
    await evaluate(`
      const pet = document.getElementById('pet-container');
      pet.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    `);
    const petKeyBubble = await evaluate("document.getElementById('bubble-text').textContent");
    console.log('Pet bubble via keyboard:', petKeyBubble);
    assert.ok(petKeyBubble.length > 0, 'Pet must respond with speech bubble to Enter key');

    // Test 8: Mobile viewport scaling and no overlapping text
    console.log('Testing mobile viewport sizing (375x667)...');
    await sendCommand('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 1,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 300));
    const bRect = JSON.parse(await evaluate("JSON.stringify(document.getElementById('val-balance').getBoundingClientRect())"));
    const iRect = JSON.parse(await evaluate("JSON.stringify(document.getElementById('val-income').getBoundingClientRect())"));
    const sRect = JSON.parse(await evaluate("JSON.stringify(document.getElementById('val-spending').getBoundingClientRect())"));
    console.log('Mobile rects -> Balance bottom:', bRect.bottom, 'Income top:', iRect.top, 'Spending top:', sRect.top);
    assert.ok(bRect.bottom <= iRect.top + 1, 'Balance text must not collide with Income text on mobile');
    assert.ok(iRect.bottom <= sRect.top + 1, 'Income text must not collide with Spending text on mobile');

    // Reset device metrics
    await sendCommand('Emulation.clearDeviceMetricsOverride');

    // Test 9: Zero record loading
    console.log('Testing loading 0 records via parseTxtContent...');
    await evaluate(`
      parseTxtContent("0\\n");
    `);
    const zeroBalance = await evaluate("document.getElementById('val-balance').textContent");
    const zeroIncome = await evaluate("document.getElementById('val-income').textContent");
    const zeroSpending = await evaluate("document.getElementById('val-spending').textContent");
    const zeroSprite = await evaluate("document.getElementById('pet-sprite').src");
    console.log('Zero records state -> Balance:', zeroBalance, 'Income:', zeroIncome, 'Spending:', zeroSpending, 'Sprite:', zeroSprite);
    assert.equal(zeroBalance, '0$', 'Balance must be 0$ when 0 records loaded');
    assert.equal(zeroIncome, '0$', 'Income must be 0$ when 0 records loaded');
    assert.equal(zeroSpending, '0$', 'Spending must be 0$ when 0 records loaded');
    assert.ok(zeroSprite.includes('Neutral.png'), 'Pet must be Neutral when expenses (0) <= income (0)');

    console.log('====================================');
    console.log('ALL E2E CDP TESTS PASSED WITH 100% SUCCESS!');
    console.log('====================================');
    ws.close();
  } finally {
    chrome.kill();
  }
}

run().catch(err => {
  console.error('E2E TEST FAILURE:', err);
  process.exit(1);
});
