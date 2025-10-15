// Step 1: Define quote data
let quotes = [
  { text: "The best way to predict your future is to create it.", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { text: "Success is not final; failure is not fatal.", category: "Perseverance" },
  { text: "Do what you can, with what you have, where you are.", category: "Wisdom" }
];

// Step 2: Reference existing DOM elements
const quoteText = document.getElementById("quoteText");
const quoteCategory = document.getElementById("quoteCategory");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const newQuoteInput = document.getElementById("newQuoteText");
const newCategoryInput = document.getElementById("newQuoteCategory");

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

// Step 4: Add new quote dynamically (without creating or appending)
function addQuote() {
  const newText = newQuoteInput.value.trim();
  const newCategory = newCategoryInput.value.trim();

  if (!newText || !newCategory) {
    alert("Please fill in both fields before adding a quote!");
    return;
  }

  const newQuote = {
    text: newText,
    category: newCategory
  };

  quotes.push(newQuote);

  // Clear input fields
  newQuoteInput.value = "";
  newCategoryInput.value = "";

  alert("New quote added successfully!");
}

// Step 5: Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
