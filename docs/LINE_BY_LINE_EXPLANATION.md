# Line-by-Line Guide for `main.cpp` (Personal Finance & Expense Tracker)

This guide explains **every single function and beginner logic flow in `main.cpp`** (~98 lines).
When you run `./expense_tracker`, it loads your transactions from `data/transactions.txt`, displays the monthly summary, and launches `gui.html`.

---

## 1. Libraries, Namespace, & Global Storage
```cpp
#include <iostream>  // For console output (cout, cin)
#include <fstream>   // For reading and writing files (ifstream, ofstream)
#include <string>    // For string text variables
#include <cstdlib>   // For system() to open gui.html in default browser
using namespace std; // Avoids having to type std:: before cout, cin, string

// Parallel arrays: stores up to 100 transactions without using classes
string types[100];    // Category: "Income", "Expense", or "Savings"
double amounts[100];  // Amount of money (e.g. 50.00)
string remarks[100];  // Description (e.g. "Groceries")
int totalCount = 0;   // Number of transactions currently stored
```
- **Parallel Arrays**: 3 simple beginner arrays (`types`, `amounts`, `remarks`) store up to 100 records without complex OOP, classes, or dynamic memory pointers.

---

## 2. File Persistence: `saveToFile()` and `loadFromFile()`
```cpp
// Function 1: Saves all stored transactions into "data/transactions.txt"
void saveToFile() {
    ofstream file("data/transactions.txt");
    if (!file.is_open()) {
        file.open("transactions.txt"); // Fallback to root directory
    }
    file << totalCount << "\n";
    for (int i = 0; i < totalCount; i++) {
        file << types[i] << "\n" << amounts[i] << "\n" << remarks[i] << "\n";
    }
    file.close();
}

// Function 2: Loads transactions from "data/transactions.txt"
void loadFromFile() {
    ifstream file("data/transactions.txt");
    if (!file.is_open()) {
        file.open("transactions.txt"); // Fallback to root directory
    }
    if (file >> totalCount) {
        for (int i = 0; i < totalCount; i++) {
            file >> types[i] >> amounts[i];
            file.ignore(); // Clear leftover newline
            getline(file, remarks[i]);
        }
    }
    file.close();
}
```
- Writes records line-by-line into `data/transactions.txt` (with fallback to `transactions.txt`).
- `loadFromFile()` reads total count first, then loops to read `type`, `amount`, and `remark` using `getline()`.

---

## 3. Core App Logic: `getTotal()`, `getBalance()`, and `getTotalSavings()`
```cpp
// Function 3: Calculates total sum for a category using a simple loop
double getTotal(string category) {
    double total = 0.0;
    for (int i = 0; i < totalCount; i++) {
        if (types[i] == category) {
            total = total + amounts[i];
        }
    }
    return total;
}

// Function 4: Core logic: Balance = Income - Spending (Expense)
double getBalance() {
    double income = getTotal("Income");
    double spending = getTotal("Expense");
    return income - spending;
}

// Function 5: Total savings including leftover monthly balance
double getTotalSavings() {
    double initialSavings = getTotal("Savings");
    double leftoverBalance = getBalance();
    double totalSavings = initialSavings;
    if (leftoverBalance > 0.0) {
        totalSavings = initialSavings + leftoverBalance;
    }
    return totalSavings;
}

// Retain getTotalBalance for backward compatibility
double getTotalBalance() {
    return getTotalSavings();
}
```
- **Rule 1: Balance is Income minus Spending**: Calculates available monthly cash using straightforward subtraction (`income - spending`).
- **Rule 2: Leftover balance rolls into Total Savings**: If positive, remaining monthly balance deposits into total savings (`initialSavings + leftoverBalance`).

---

## 4. Web Dashboard Launcher & Main Entry Point
```cpp
// Function 6: Opens gui.html in the default web browser
void openGui() {
    system("open gui.html || start gui.html || xdg-open gui.html");
}

// Function 7: Main entry point
int main() {
    loadFromFile(); // Load saved transactions at startup
    openGui();      // Open GUI in browser

    cout << "\n========================================\n";
    cout << "   PERSONAL FINANCE & EXPENSE TRACKER   \n";
    cout << "========================================\n";
    cout << "Loaded " << totalCount << " record(s) from transactions.txt.\n";
    cout << "Total Income:   $" << getTotal("Income") << "\n";
    cout << "Total Spending: $" << getTotal("Expense") << "\n";
    cout << "Balance:        $" << getBalance() << "\n";
    cout << "Total Savings:  $" << getTotalSavings() << "\n";
    cout << "========================================\n";
    cout << "The graphical interface is open in your browser.\n\n";

    return 0;
}
```
- Reads stored transactions at launch, displays a neat summary in the console, opens the graphical browser dashboard, and exits cleanly.
