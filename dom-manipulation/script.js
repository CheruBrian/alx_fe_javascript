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
  while (formContainer.firstChild) {
    formContainer.removeChild(formContainer.firstChild);
  }

  // Create input for quote text
  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  // Create input for category
  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  // Create button to add quote
  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  // Append all to form container
  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);
}

// Step 5: Add new quote dynamically
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!newQuoteText || !newQuoteCategory) {
    alert("Please fill in both fields before adding a quote!");
    return;
  }

  const newQuote = {
    text: newQuoteText,
    category: newQuoteCategory
  };

  quotes.push(newQuote);

  // Clear input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("New quote added successfully!");
}

// Step 6: Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);

// Step 7: Initialize the form
createAddQuoteForm();
