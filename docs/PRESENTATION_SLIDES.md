# Personal Expense Tracker (C++) — Presentation Slide Deck Blueprint

> **Instructions for Slide-Generation Agent:**
> Create a clean, modern presentation deck (5–6 slides) from the structured sections below. Keep slide text concise with short bullet points, clear visual hierarchy, and simple beginner-friendly terminology.

---

## Slide 1: Title Slide

- **Title:** Personal Expense Tracker
- **Subtitle:** A Gamified Financial Management Program in C++
- **Visual / Tagline:** Redesigned pixel-art interface with monthly budgeting, dynamic savings goals, and POE the corgi!

---

## Slide 2: Project Idea & Redesign
**What is the project about, and what problem does it solve?**

- **What It Is:**
  - A lightweight personal finance application built with beginner-friendly C++ logic and a pixel-art web GUI (`gui.html`).
  - Helps users record daily income, expenses, and savings with short remarks.
- **The Redesign:**
  - Updated with a dedicated monthly summary card (**November**) displaying Balance, Income, and Spending.
  - Features an **Overall Saving Goal ($10,000)** with a dynamic pixel progress bar.
- **Our Solution:**
  - Simple, approachable money management where leftover monthly money rolls automatically into long-term savings.

---

## Slide 3: Project Goals & Core Logic
**What do we aim to achieve?**

- **New App Logic:**
  - **Balance is Income minus Saving:** Your monthly spending budget is calculated by setting aside savings first (`Income - Saving`).
  - **Leftover Balance Transfers to Total Savings:** Any money unspent at the end of the month (`Balance - Expenses`) automatically deposits into **Total Savings**.
- **Savings Target ($10,000):**
  - Track real-time progress toward the $10,000 goal (`1500$ / 10000$`).
- **Interactive Commands:**
  - Supports `/goal` (check milestone progress), `/plan` (monthly budget breakdown), and `/boost` (savings accelerator).

---

## Slide 4: Algorithms & Beginner C++ Design
**Explain the main algorithms and logic used**

- **1. Adding Up Totals (Simple `for` Loop + Addition):**
  - Scans parallel arrays item by item to sum categories (`Income`, `Expense`, `Savings`).
- **2. Clear Financial Calculations:**
  - `getBalance()`: Calculates available cash as `income - spending`.
  - `getTotalSavings()`: Combines direct savings plus leftover balance (`totalSavings = initialSavings + leftoverBalance`).
- **3. Simple File Persistence (`data/transactions.txt`):**
  - `saveToFile()` and `loadFromFile()` store and reload records across runs.
- **4. Browser Integration:**
  - `openGui()` launches `gui.html` directly from C++ using `system()`.

---

## Slide 5: System Design & GUI Integration
**Describe the main components and how they work together**

- **1. C++ Backend (`main.cpp`):**
  - Manages in-memory parallel arrays (`types`, `amounts`, `remarks`).
  - Calculates financial metrics and launches `gui.html`.
- **2. Web Dashboard (`gui.html`):**
  - Features responsive pixel-art design with "November" monthly metrics and overall savings goal.
  - Interactive pet corgi (POE) dynamically reacts with Happy, Sad, or Broke states based on your transactions.
- **3. Data Synchronization:**
  - Both CLI and GUI read/write the identical `transactions.txt` format for complete cross-compatibility.
