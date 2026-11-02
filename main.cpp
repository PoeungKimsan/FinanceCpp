#include <iostream>  // For console input (cin) and output (cout)
#include <fstream>   // For reading and writing files (ifstream, ofstream)
#include <string>    // For string text variables
#include <iomanip>   // For output formatting like setw() and setprecision()
#include <cstdlib>   // For system() to open gui.html in default browser
using namespace std; // Avoids having to type std:: before cout, cin, string

// Parallel arrays: stores up to 100 transactions without using classes
string types[100];    // Stores category: "Income", "Expense", or "Savings"
double amounts[100];  // Stores money amounts (e.g. 50.00)
string remarks[100];  // Stores description note (e.g. "Groceries")
int totalCount = 0;   // Tracks how many transactions are currently stored

// Function 1: Saves all stored transactions into "transactions.txt"
void saveToFile() {
    ofstream file("transactions.txt"); // Open file for writing
    file << totalCount << "\n";         // Write total count on the first line
    for (int i = 0; i < totalCount; i++) { // Loop through all recorded items
        file << types[i] << "\n" << amounts[i] << "\n" << remarks[i] << "\n"; // Save type, amount, remark
    }
    file.close(); // Close file after writing
}

// Function 2: Loads previously saved transactions from "transactions.txt"
void loadFromFile() {
    ifstream file("transactions.txt"); // Open file for reading
    if (file >> totalCount) {          // Read total count from first line (if file exists)
        for (int i = 0; i < totalCount; i++) { // Loop to read each saved item
            file >> types[i] >> amounts[i];    // Read type and amount
            file.ignore();                     // Clear leftover newline character
            getline(file, remarks[i]);         // Read full remark line (supports spaces)
        }
    }
    file.close(); // Close file after reading
}

// Function 3: Calculates total sum for a category using basic addition
double getTotal(string category) {
    double total = 0.0; // Start sum at 0
    for (int i = 0; i < totalCount; i++) { // Loop through array
        if (types[i] == category) {        // If category matches (e.g. "Expense")
            total = total + amounts[i];    // Basic addition to accumulate total
        }
    }
    return total; // Return the calculated sum
}

// Function 4: Available spending balance = Income - Expenses - Savings
double getBalance() {
    return getTotal("Income") - getTotal("Expense") - getTotal("Savings");
}

// Function 5: Total net balance = Available Balance + Savings (or Income - Expenses)
double getTotalBalance() {
    return getBalance() + getTotal("Savings");
}

// Function 6: Reusable function to let user enter an Income, Expense, or Savings
void addTransaction(string type) {
    if (totalCount >= 100) return; // Stop if array reached limit of 100 items

    double amount; // Variable to store money amount
    string remark; // Variable to store description note

    cout << "Enter " << type << " amount ($): ";
    cin >> amount; // Read dollar amount

    cout << "Enter remark: ";
    cin.ignore();             // Clear leftover Enter key from input buffer
    getline(cin, remark);     // Read full remark text with spaces

    types[totalCount] = type;       // Save category into array at current index
    amounts[totalCount] = amount;   // Save amount into array
    remarks[totalCount] = remark;   // Save remark into array
    totalCount = totalCount + 1;    // Increase count by 1

    saveToFile(); // Auto-save updated data to transactions.txt
    cout << type << " recorded and saved to transactions.txt!\n";
}

// Function 7: Displays all financial balance metrics on screen
void checkBalances() {
    cout << fixed << setprecision(2); // Set 2 decimal places for cents ($X.XX)
    cout << "\n--- BALANCES ---\n"
         << "Total Income:   $" << getTotal("Income") << "\n"   // Shows total earnings
         << "Total Spending: $" << getTotal("Expense") << "\n"  // Shows total expenses
         << "Total Savings:  $" << getTotal("Savings") << "\n"  // Shows money set aside
         << "Available:      $" << getBalance() << "\n"          // Shows spending cash left
         << "Total Balance:  $" << getTotalBalance() << "\n";    // Shows total net worth
}

// Function 8: Displays formatted table of all recorded transactions
void displayTransactions() {
    cout << fixed << setprecision(2); // Format output to 2 decimal places
    cout << "\nID | TYPE    | AMOUNT     | REMARK\n----------------------------------------\n";
    for (int i = 0; i < totalCount; i++) { // Loop and print each transaction row
        cout << (i + 1) << "  | " << setw(7) << types[i] // Prints ID and aligned type
             << " | $" << setw(8) << amounts[i]          // Prints aligned amount
             << " | " << remarks[i] << "\n";             // Prints user note
    }
}

// Function 9: Launches the separate gui.html dashboard in default web browser
void openGui() {
    system("open gui.html || start gui.html || xdg-open gui.html"); // Runs OS command to open browser
}

// Function 10: Main entry point of the C++ program
int main() {
    loadFromFile(); // Load saved transactions from transactions.txt at startup

    int choice = 0; // Variable to store user menu choice

    while (choice != 8) { // Keep running menu loop until user chooses 8 (Exit)
        cout << "\n=== EXPENSE TRACKER ===\n"
             << "1. Input Income    2. Input Expense    3. Input Savings\n"
             << "4. Check Balances  5. Display History  6. Full Summary\n"
             << "7. Open GUI Window 8. Exit\nChoice (1-8): ";

        if (!(cin >> choice)) { // Check if user typed invalid input (like letters)
            cin.clear();        // Reset error state
            cin.ignore(100, '\n'); // Clear invalid input from buffer
            continue;           // Restart menu loop
        }

        if (choice == 1) addTransaction("Income");       // Add income record
        else if (choice == 2) addTransaction("Expense"); // Add expense record
        else if (choice == 3) addTransaction("Savings"); // Add savings record
        else if (choice == 4) checkBalances();           // Display balances
        else if (choice == 5) displayTransactions();      // Display transaction table
        else if (choice == 6) { checkBalances(); displayTransactions(); } // Full summary
        else if (choice == 7) openGui();                 // Open graphical GUI in browser
    }

    cout << "Data saved to transactions.txt. Goodbye!\n"; // Exit message
    return 0; // Return 0 indicates program ended successfully
}
