# Line-by-Line Guide for `main.cpp` (Auto-GUI Launch, No Options 1–6)

This guide explains **every single line of the new simplified `main.cpp`**.
When you run `./expense_tracker`, it automatically loads `transactions.txt` and immediately launches the graphical interface in your browser!

---

## Lines 1–6: Libraries & Namespace
```cpp
1  #include <iostream>  // For console output (cout)
2  #include <fstream>   // For reading and writing files (ifstream, ofstream)
3  #include <string>    // For string text variables
4  #include <iomanip>   // For output formatting like setprecision()
5  #include <cstdlib>   // For system() to open gui.html in default browser
6  using namespace std; // Avoids having to type std:: before cout, cin, string
```
- **Line 1 (`#include <iostream>`)**: Allows us to use `cout` to print the launch status message.
- **Line 2 (`#include <fstream>`)**: Imports file tools: `ofstream` (write) and `ifstream` (read).
- **Line 3 (`#include <string>`)**: Enables using `string` to store categories ("Income", "Expense") and notes ("Groceries").
- **Line 4 (`#include <iomanip>`)**: Used for numerical formatting (cents/decimals).
- **Line 5 (`#include <cstdlib>`)**: Provides the `system()` function so C++ can run the OS command to open `gui.html` in your browser.
- **Line 6 (`using namespace std;`)**: Lets us write standard names like `cout` and `string` directly.

---

## Lines 8–11: Parallel Arrays (Data Storage)
```cpp
8   // Parallel arrays: stores up to 100 transactions without using classes
9   string types[100];    // Stores category: "Income", "Expense", or "Savings"
10  double amounts[100];  // Stores money amounts (e.g. 50.00)
11  string remarks[100];  // Stores description note (e.g. "Groceries")
12  int totalCount = 0;   // Tracks how many transactions are currently stored
```
- **Line 9 (`string types[100];`)**: Stores the category of each transaction (`"Income"`, `"Expense"`, or `"Savings"`).
- **Line 10 (`double amounts[100];`)**: Stores the dollar amounts with decimal places.
- **Line 11 (`string remarks[100];`)**: Stores the description note for each transaction.
- **Line 12 (`int totalCount = 0;`)**: Integer counter tracking how many records exist.

---

## Lines 14–20: `saveToFile()` Function
```cpp
14  void saveToFile() {
15      ofstream file("transactions.txt"); // Open file for writing
16      file << totalCount << "\n";         // Write total count on the first line
17      for (int i = 0; i < totalCount; i++) { // Loop through all recorded items
18          file << types[i] << "\n" << amounts[i] << "\n" << remarks[i] << "\n"; // Save type, amount, remark
19      }
20      file.close(); // Close file after writing
21  }
```
- Opens `"transactions.txt"`, writes `totalCount` on line 1, and writes each record across 3 lines (`type`, `amount`, `remark`).

---

## Lines 23–33: `loadFromFile()` Function
```cpp
23  void loadFromFile() {
24      ifstream file("transactions.txt"); // Open file for reading
25      if (file >> totalCount) {          // Read total count from first line (if file exists)
26          for (int i = 0; i < totalCount; i++) { // Loop to read each saved item
27              file >> types[i] >> amounts[i];    // Read type and amount
28              file.ignore();                     // Clear leftover newline character
29              getline(file, remarks[i]);         // Read full remark line (supports spaces)
30          }
31      }
32      file.close(); // Close file after reading
33  }
```
- Reads the count of stored transactions from `transactions.txt`, then reads each record back into the arrays.
- `file.ignore()` clears the newline before `getline()` so multi-word remarks with spaces are preserved.

---

## Lines 35–48: Financial Calculations (Basic Addition Syntax)
```cpp
35  // Function 3: Calculates total sum for a category using basic addition
36  double getTotal(string category) {
37      double total = 0.0; // Start sum at 0
38      for (int i = 0; i < totalCount; i++) { // Loop through array
39          if (types[i] == category) {        // If category matches (e.g. "Expense")
40              total = total + amounts[i];    // Basic addition to accumulate total
41          }
42      }
43      return total; // Return the calculated sum
44  }
45  
46  // Function 4: Available spending balance = Income - Expenses - Savings
47  double getBalance() {
48      return getTotal("Income") - getTotal("Expense") - getTotal("Savings");
49  }
50  
51  // Function 5: Total net balance = Available Balance + Savings (or Income - Expenses)
52  double getTotalBalance() {
53      return getBalance() + getTotal("Savings");
54  }
```
- `getTotal(category)`: Uses a basic `for` loop to accumulate matching transactions using simple addition (`total = total + amounts[i]`).
- `getBalance()`: Computes `Total Income - Total Expenses - Total Savings`.
- `getTotalBalance()`: Computes `Available Balance + Savings` (Net Worth).

---

## Lines 56–58: `openGui()` Function
```cpp
56  void openGui() {
57      system("open gui.html || start gui.html || xdg-open gui.html"); // Runs OS command to open browser
58  }
```
- Calls the operating system's native command (`open` on Mac, `start` on Windows, `xdg-open` on Linux) to open `gui.html` in your default browser.

---

## Lines 60–70: `main()` Function
```cpp
60  // Function 7: Main entry point - auto-opens GUI when running ./expense_tracker
61  int main() {
62      loadFromFile(); // Load saved transactions from transactions.txt at startup
63      openGui();      // Auto-open GUI window in default web browser
64  
65      cout << "\n========================================\n";
66      cout << "  PERSONAL EXPENSE TRACKER GUI LAUNCHED \n";
67      cout << "========================================\n";
68      cout << "Loaded " << totalCount << " record(s) from transactions.txt.\n";
69      cout << "The graphical interface is now open in your browser.\n\n";
70  
71      return 0; // Program finishes successfully
72  }
```
- When you run `./expense_tracker`, it executes `loadFromFile()`, then immediately calls `openGui()` to display your dashboard, prints the confirmation message, and exits cleanly!

