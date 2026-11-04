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

// Function 6: Opens gui.html in the default web browser
void openGui() {
    system("open gui.html || start gui.html || xdg-open gui.html");
}

// Function 7: Main entry point
int main() {
    loadFromFile(); // Load saved transactions at startup
    openGui();      // Open GUI in browser
    return 0;
}
