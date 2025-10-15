// Step 1: Define quote data
let quotes = [
  { text: "The best way to predict your future is to create it.", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { text: "Success is not final; failure is not fatal.", category: "Perseverance" },
  { text: "Do what you can, with what you have, where you are.", category: "Wisdom" }
];

// Step 2: Reference DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const quoteText = document.getElementById("quoteText");
const quoteCategory = document.getElementById("quoteCategory");
const newQuoteBtn = document.getElementById("newQuote");
const formContainer = document.getElementById("formContainer");

// Step 3: Display a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteText.textContent = "No quotes available. Please add one below!";
    quoteCategory.textContent = "";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const selectedQuote = quotes[randomIndex];

  quoteText.textContent = `"${selectedQuote.text}"`;
  quoteCategory.textContent = `Category: ${selectedQuote.category}`;
}

// Step 4: Create form dynamically (no innerHTML)
function createAddQuoteForm() {
  // Clear existing child elements safely
  whi
