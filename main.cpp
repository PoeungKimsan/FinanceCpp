#include <iostream>  // For console output (cout)
#include <fstream>   // For reading and writing files (ifstream, ofstream)
#include <string>    // For string text variables
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

// Function 6: Launches the separate gui.html dashboard in default web browser
void openGui() {
    system("open gui.html || start gui.html || xdg-open gui.html"); // Runs OS command to open browser
}

// Function 7: Main entry point - auto-opens GUI when running ./expense_tracker
int main() {
    loadFromFile(); // Load saved transactions from transactions.txt at startup
    openGui();      // Auto-open GUI window in default web browser

    cout << "\n========================================\n";
    cout << "  PERSONAL EXPENSE TRACKER GUI LAUNCHED \n";
    cout << "========================================\n";
    cout << "Loaded " << totalCount << " record(s) from transactions.txt.\n";
    cout << "The graphical interface is now open in your browser.\n\n";

    return 0; // Program finishes successfully
}
