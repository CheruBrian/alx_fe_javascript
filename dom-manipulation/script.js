// Dynamic Quote Generator with Quote Display, Category Filtering, and Web Storage

// Default Quotes
const DEFAULT_QUOTES = [
  { text: "The best way to predict your future is to create it.", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { text: "Success is not final; failure is not fatal.", category: "Perseverance" },
  { text: "Do what you can, with what you have, where you are.", category: "Wisdom" }
];

// DOM References
const quoteText = document.getElementById('quoteText');
const quoteCategory = document.getElementById('quoteCategory');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const newQuoteInput = document.getElementById('newQuoteText');
const newCategoryInput = document.getElementById('newQuoteCategory');
const categoryFilter = document.getElementById('categoryFilter');
const statusEl = document.getElementById('status');

// Storage Keys
const LOCAL_KEY_QUOTES = 'quotes_storage';
const LOCAL_KEY_FILTER = 'last_filter';
const SESSION_KEY_LAST_QUOTE = 'last_quote_index';

// Initialize data
let quotes = loadQuotes();
let filteredQuotes = quotes.slice();

// ------------------- Storage Functions -------------------

function loadQuotes() {
  try {
    const stored = localStorage.getItem(LOCAL_KEY_QUOTES);
    if (!stored) {
      localStorage.setItem(LOCAL_KEY_QUOTES, JSON.stringify(DEFAULT_QUOTES));
      return DEFAULT_QUOTES.slice();
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : DEFAULT_QUOTES.slice();
  } catch {
    return DEFAULT_QUOTES.slice();
  }
}

function saveQuotes() {
  localStorage.setItem(LOCAL_KEY_QUOTES, JSON.stringify(quotes));
}

// ------------------- Quote Display -------------------

function showQuoteByIndex(index) {
  if (!filteredQuotes.length) {
    quoteText.textContent = "No quotes available for this category.";
    quoteCategory.textContent = "";
    return;
  }
  const idx = index % filteredQuotes.length;
  const q = filteredQuotes[idx];
  quoteText.textContent = `"${q.text}"`;
  quoteCategory.textContent = `Category: ${q.category}`;
  sessionStorage.setItem(SESSION_KEY_LAST_QUOTE, idx);
}

function showRandomQuote() {
  if (!filteredQuotes.length) {
    quoteText.textContent = "No quotes to display.";
    quoteCategory.textContent = "";
    return;
  }
  const idx = Math.floor(Math.random() * filteredQuotes.length);
  showQuoteByIndex(idx);
}

// ------------------- Add Quote -------------------

function addQuote() {
  const text = newQuoteInput.value.trim();
  const cat = newCategoryInput.value.trim();
  if (!text || !cat) {
    alert("Please fill both fields before adding a quote.");
    return;
  }

  quotes.push({ text, category: cat });
  saveQuotes();
  populateCategories(); // Update filter options
  filterQuotes(); // Refresh list if current filter matches
  newQuoteInput.value = "";
  newCategoryInput.value = "";
  setStatus("Quote added successfully!");
}

// ------------------- Category Filtering -------------------

function populateCategories() {
  // Clear old options (keep "All Categories")
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }

  // Unique categories from quotes
  const uniqueCats = [...new Set(quotes.map(q => q.category))];
  uniqueCats.forEach(cat => {
    const option = new Option(cat, cat);
    categoryFilter.add(option);
  });

  // Restore last selected filter
  const savedFilter = localStorage.getItem(LOCAL_KEY_FILTER);
  if (savedFilter && savedFilter !== "all") {
    categoryFilter.value = savedFilter;
  }
}

function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem(LOCAL_KEY_FILTER, selected);

  filteredQuotes = selected === "all"
    ? quotes.slice()
    : quotes.filter(q => q.category === selected);

  if (filteredQuotes.length) showRandomQuote();
  else {
    quoteText.textContent = "No quotes available for this category.";
    quoteCategory.textContent = "";
  }
}

// ------------------- Utility -------------------

function setStatus(msg) {
  statusEl.textContent = msg;
}

// ------------------- Initialization -------------------

function init() {
  populateCategories();

  // Restore last filter and last quote
  const lastFilter = localStorage.getItem(LOCAL_KEY_FILTER);
  const lastQuoteIndex = parseInt(sessionStorage.getItem(SESSION_KEY_LAST_QUOTE), 10);

  if (lastFilter && lastFilter !== "all") {
    categoryFilter.value = lastFilter;
    filterQuotes();
  } else {
    filteredQuotes = quotes.slice();
  }

  if (!isNaN(lastQuoteIndex)) showQuoteByIndex(lastQuoteIndex);
  else showRandomQuote();
}

// ------------------- Event Listeners -------------------

newQuoteBtn.addEventListener('click', showRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);
categoryFilter.addEventListener('change', filterQuotes);

// Initialize on page load
init();
