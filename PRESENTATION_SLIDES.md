# Personal Expense Tracker (C++) — Presentation Slide Deck Blueprint

> **Instructions for Slide-Generation Agent:**
> Create a clean, modern presentation deck (5–6 slides) from the structured sections below. Keep slide text concise with short bullet points, clear visual hierarchy, and simple beginner-friendly terminology.

---

## Slide 1: Title Slide

- **Title:** Personal Expense Tracker
- **Subtitle:** A Simple Financial Management Program in C++
- **Visual / Tagline:** Track income, control spending, build savings, and save records automatically.

---

## Slide 2: Project Idea
**What is the project about, and what problem does it solve?**

- **What It Is:**
  - A lightweight personal finance application built with C++ and a clean web-based GUI (`gui.html`).
  - Helps users record daily income, expenses, and savings with short remarks.
- **The Problem It Solves:**
  - Many people and students lose track of small daily expenses and don't know where their money goes each month.
  - Spreadsheets and complex banking apps can be overwhelming for quick daily tracking.
  - Without saving data to a file, normal beginner console programs lose all records as soon as the program closes.
- **Our Solution:**
  - An easy-to-use tracker that calculates balances automatically and saves every record into a plain text file (`transactions.txt`).

---

## Slide 3: Project Goals
**What do we aim to achieve?**

- **Record Money Movement Easily:**
  - Allow users to input **Income**, **Expenses**, and **Savings** along with a text remark/note.
- **Instant Balance Calculations:**
  - Automatically calculate **Total Income**, **Total Spending**, **Savings**, **Available Balance**, and **Total Balance**.
- **View Transaction History & Summary:**
  - Display a clean list of all past transactions and filter by category.
- **Permanent Data Storage:**
  - Save all transactions to `transactions.txt` and reload them automatically when the program starts.
- **Simple, Beginner-Friendly C++ Code:**
  - Build the entire backend using fundamental C++ concepts: **conditions, loops, functions, parallel arrays, and file I/O**.

---

## Slide 4: Algorithms & Core Logic
**Explain the main algorithms and logic used**

- **1. Adding Up Totals (Loop + Basic Addition)**
  - Uses a simple `for` loop to check transactions one by one.
  - If the category matches (like `"Expense"`), it adds the amount:
    `total = total + amounts[i]`
- **2. Calculating Balances (Simple Subtraction & Addition)**
  - **Available Balance:** `Income - Expenses - Savings` *(money left to spend)*
  - **Total Balance:** `Available Balance + Savings` *(all the money you own)*
- **3. Saving and Loading Data (Text File)**
  - **Saving:** Writes the total count first, then saves each item line-by-line into `transactions.txt`.
  - **Loading:** Reads the text file back into our arrays on startup so data is never lost when closing the app.
- **4. Storing New Entries (Parallel Arrays)**
  - Places the new category, amount, and note into the next empty array slot (`types[totalCount]`, `amounts[totalCount]`, `remarks[totalCount]`).
  - Adds 1 to the counter: `totalCount = totalCount + 1`.

---

## Slide 5: System Design
**Describe the main components and how they work together**

- **1. C++ Core Program (`main.cpp`)**
  - Stores data in memory using three parallel arrays (`types`, `amounts`, `remarks`).
  - Handles loading/saving data and calculating totals.
  - Automatically launches the graphical interface when `./expense_tracker` runs.
- **2. Data Storage File (`transactions.txt`)**
  - A plain-text file that acts as our simple database.
  - Keeps all financial records saved between sessions.
- **3. Graphical User Interface (`gui.html`)**
  - Clean visual dashboard that displays balance cards and the transaction history table.
  - Includes popup buttons (`Add Income` / `Add Expense`) and category filters (`All`, `Income`, `Expenses`, `Savings`).
- **How They Work Together (Workflow):**
  - **Step 1 (Startup):** Running `./expense_tracker` in C++ reads `transactions.txt` into the arrays and opens `gui.html`.
  - **Step 2 (Display & Input):** The GUI displays the balances and table, and lets the user add new income or expenses.
  - **Step 3 (Storage):** Records are stored in the `transactions.txt` format so data stays synced.

