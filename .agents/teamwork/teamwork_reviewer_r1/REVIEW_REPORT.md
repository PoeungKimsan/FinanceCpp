> [!WARNING] **Skepticism Disclaimer**
> Verified across unit test execution, real-world headless Chrome CDP integration, and pixel-level bounding box arithmetic; however, behavior on legacy mobile browsers lacking both native `<dialog>` and modern CSS container queries relies on polyfill fallbacks.

## 1. What the prior attempt got wrong

1. **Fatal Functional Bug — `parseTxtContent` Line-Shifting on Empty Remarks:**
   - **Input:** `transactions.txt` containing any transaction record with an empty remark line (valid output from C++ backend `saveToFile()` when no remark is typed):
     `2\nIncome\n1500\n\nExpense\n300\nGroceries\n`
   - **Expected:** Parse 2 records: Income $1500 (remark: `""` or `"No description"`), Expense $300 (remark: `"Groceries"`).
   - **Actual:** Parsed only 1 record: Income $1500 with remark `"Expense"`. Transaction 2 was completely dropped because its type was consumed as the first record's remark, causing the subsequent amount to parse as `NaN`.
   - **Root Cause:** `parseTxtContent` used `.filter(l => l.length > 0)` across all lines, stripping empty remark lines and de-synchronizing the 3-line record stride (`type`, `amount`, `remark`).

2. **Action Button Hitbox Coordinate Misalignment:**
   - **Input:** User clicks the lower third of the visually rendered red "Expense" button (e.g. `y=220px, x=1675px` in a 1920x1080 stage) or the "Income" button.
   - **Expected:** Clicking anywhere within the pill-shaped button graphic in `WEB BACKGROUND.png` opens the record modal dialog.
   - **Actual:** Clicks on the lower ~30px of the button missed and fell through to the background image, while clicks in the empty sky above triggered the button.
   - **Root Cause:** `#btn-income` was positioned at `top: 4.81%`, `height: 5.93%` (true graphic in `WEB BACKGROUND.png` is at `top: 6.30%`, `height: 6.94%`), and `#btn-expense` was positioned at `top: 13.15%`, `height: 5.93%` (true graphic is at `top: 14.81%`, `height: 6.94%`).

3. **Legacy Browser Uncaught ReferenceError Crash:**
   - **Input:** Loading `gui.html` on legacy browsers (e.g., Safari < 15.4 or JS environments lacking native `<dialog>`).
   - **Expected:** Graceful degradation without crashing script execution.
   - **Actual:** Script threw `ReferenceError: HTMLDialogElement is not defined` when evaluating `!('closedBy' in HTMLDialogElement.prototype)`, crashing the entire script and leaving buttons inert. Furthermore, closed dialogs rendered visibly on page load because legacy browsers lack user-agent styling for `<dialog>`.
   - **Root Cause:** `HTMLDialogElement` was referenced directly without a `typeof` guard, and no `dialog:not([open]) { display: none; }` CSS rule was specified.

4. **Local File Protocol (`file:///`) CORS Desynchronization:**
   - **Input:** User modifies `transactions.txt` via C++ tracker or text editor, then opens `gui.html` directly via `file:///` in Chrome/Edge/Safari.
   - **Expected:** Ability to load and view the modified transactions.
   - **Actual:** Browser sandbox blocked `fetch('transactions.txt')` with CORS error; user was locked into hardcoded defaults with no way to import or load their file into the dashboard.
   - **Root Cause:** Lack of user-facing file import / drag-and-drop mechanism.

## 2. What I changed

- **`gui.html`**:
  - Rewrote `parseTxtContent()` into an index-based line parser matching C++ `loadFromFile()` semantics without wholesale line filtering, properly preserving empty remarks.
  - Re-aligned button CSS coordinates to pixel-accurate bounds: `#btn-income` (`top: 6.30%`, `left: 79.90%`, `height: 6.94%`, `width: 15.25%`), `#btn-expense` (`top: 14.81%`, `left: 79.58%`, `height: 6.94%`, `width: 15.25%`), and signpost (`top: 56.48%`, `left: 9.38%`).
  - Added scoped CSS rules `dialog:not([open]) { display: none; }` and `dialog[open] { display: block; }` alongside an `HTMLDialogElement` polyfill shim so legacy browsers hide inactive dialogs and support `showModal()` / `close()`.
  - Added guarded `typeof HTMLDialogElement !== 'undefined'` check for light-dismiss detection to prevent script crashes on older runtimes.
  - Added `container-type: inline-size` on `.stage-wrapper` and `font-size: clamp(14px, 2.1cqi, 40px)` with `vw` fallback to lock text scaling strictly to the stage container.
  - Added `📂 Load File` button in the transaction ledger dialog and full window `dragover`/`drop` listeners, enabling live local `transactions.txt` file loading under restrictive `file:///` CORS environments.
  - Added accessible in-DOM text `<span style="...">Name: POE</span>` inside `#signpost-hitbox`.
- **`test_dashboard.js`**:
  - Added automated unit test verifying `parseTxtContent()` resilience against empty remark lines.
  - Added assertions validating new fallback display rules, container query styles, file import inputs, and accessible POE name references.
- **`test_e2e_cdp.js`**:
  - Added Test 5 driving headless Chrome CDP to test rapid consecutive Income/Expense submissions within 200ms, proving clean timer cancellation, immediate sprite switching, and correct state reversion.

## 3. Verification Record

- **Deep Verification (ran actual tests):**
  - Ran `git diff main.cpp`: confirmed 0 diffs on C++ codebase.
  - Built & ran C++ tracker: `g++ -std=c++11 -Wall -Wextra main.cpp -o expense_tracker && ./expense_tracker` (Loaded 4 records, clean execution).
  - Executed `node --test test_dashboard.js`: 8/8 tests passed (non-regression, assets, parsing, calculations, state machine, empty remark handling, DOM presence, headless Chrome DOM dump).
  - Executed `node test_e2e_cdp.js`: 100% success across initial balance, Income flow, Happy sprite (2.5s), Expense flow, Broke state, signpost bubble, and rapid consecutive submission timer cancel/reset.
- **Shallow Verification (manual only):**
  - Analyzed bounding boxes and pixel RGBs against `WEB BACKGROUND.png` and `Final Product.png` using PIL/numpy scripts.
- **Unverified aspects:**
  - Physical interaction on actual mobile touchscreen hardware (emulated via headless Chromium CDP and responsive desktop window sizing).

## 4. Known Issues

- `Minor Robustness Risk`: If a user opens `gui.html` via `file:///` without drag-dropping or importing, browsers with strict local file CORS policies fall back to the embedded default records matching initial `transactions.txt`. This is now fully mitigated by the `📂 Load File` button and direct file drag-and-drop.

## 5. Remaining risk & next step

The gamified dashboard is complete, robust against edge cases, pixel-accurate to `Final Product.png`, and leaves `main.cpp` untouched. No further changes needed; ready for final demo.
