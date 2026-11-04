# Original User Request

## Initial Request — 2026-11-04T06:45:17Z

This is a single self-contained fix; keep it small and focused. The user requested: "small focused team, however dont make it too complicatd. this is just for a quick presentaion and demo". Replace the current GUI (gui.html) with a static gamified web dashboard matching Final Product.png using WEB BACKGROUND.png, while keeping core C++ logic untouched.

Working directory: /Users/macbookpro/Documents/Code/FinanceCpp
Integrity mode: development

Reference material: /Users/macbookpro/Documents/Code/FinanceCpp/Green and Blue Pixel Art Game Illustrative Group Project Presentation
- Final Product.png (Target UI design)
- WEB BACKGROUND.png (Foundation background)
- Neutral.png, Happy.png, Sad.png, Broke.png (Pet sprites)

## Requirements

### R1. Gamified Static Web GUI
Replace the current gui.html with a static web dashboard matching the layout and pixel art aesthetic of Final Product.png, using WEB BACKGROUND.png as the background. Display Balance, Income, and Spending indicators, top-right action buttons to record Income and Expense, and the pet name signpost ("POE"). When clicking Income or Expense, display an input popup/dialog for amount and optional description, updating Balance, Income, and Spending in real time. Maintain compatibility with transactions.txt by loading initial data on page load.

### R2. Reactive Pet State Management
Implement the pet dog character that dynamically reflects financial balance and user transactions using the provided sprites:
- Neutral (Neutral.png): Displayed when idle.
- Happy (Happy.png): Displayed temporarily for 2–3 seconds when an Income transaction is recorded, then returns to Neutral (or Broke if spending exceeds income).
- Sad (Sad.png): Displayed temporarily for 2–3 seconds when an Expense transaction is recorded, then returns to Neutral (or Broke if spending exceeds income).
- Broke (Broke.png): Displayed whenever total expenses exceed total income.

### R3. Core Logic Preservation
Do not modify the core C++ application logic (main.cpp). All backend algorithms, data structures, and file interactions must remain intact.

## Acceptance Criteria

### Visual Layout & Assets
- [ ] gui.html renders using WEB BACKGROUND.png and matches the visual layout shown in Final Product.png.
- [ ] Top-left card displays current Balance, Income, and Spending.
- [ ] Top-right buttons for "Income" and "Expense" are present and interactive.
- [ ] Bottom-left wooden signpost displays "Name: POE".
- [ ] Existing transactions from transactions.txt are loaded on initial page load.

### Interactive Pet Behavior
- [ ] Clicking "Income" prompts for an amount, adds to Income and Balance, and switches the pet sprite to Happy.png for 2–3 seconds before reverting.
- [ ] Clicking "Expense" prompts for an amount, adds to Spending, reduces Balance, and switches the pet sprite to Sad.png for 2–3 seconds before reverting.
- [ ] When total expenses exceed total income, the pet displays Broke.png.
- [ ] When idle and expenses do not exceed income, the pet displays Neutral.png.

### Non-regression
- [ ] main.cpp and core C++ logic are completely untouched.
