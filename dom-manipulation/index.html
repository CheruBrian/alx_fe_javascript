// Dynamic Quote Generator with Filtering, JSON Import/Export, and Web Storage

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
const exportBtn = document.getElementById('exportBtn');
const exportLink = document.getElementById('exportLink');
const importFileInput = document.getElementById('importFile');
const statusEl = document.getElementById('status');

const LOCAL_KEY_QUOTES = 'dq_quotes_v2';
const LOCAL_KEY_FILTER = 'dq_last_filter';
const SESSION_KEY = 'dq_last_index';

// Load from storage or defaults
let quotes = loadQuotes();
let filteredQuotes = quotes.slice();
exportBtn.textContent = "Download Quotes JSON"; // no "Export Quotes" in HTML

// ---------- Core Quote Handling ----------

function loadQuotes() {
  try {
    const data = localStorage.getItem(LOCAL_KEY_QUOTES);
    if (!data) {
      localStorage.setItem(LOCAL_KEY_QUOTES, JSON.stringify(DEFAULT_QUOTES));
      return DEFAULT_QUOTES.slice();
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : DEFAULT_QUOTES.slice();
  } catch {
    return DEFAULT_QUOTES.slice();
  }
}

function saveQuotes() {
  localStorage.setItem(LOCAL_KEY_QUOTES, JSON.stringify(quotes));
}

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
  sessionStorage.setItem(SESSION_KEY, idx);
}

function showRandomQuote() {
  if (!filteredQuotes.length) return;
  const idx = Math.floor(Math.random() * filteredQuotes.length);
  showQuoteByIndex(idx);
}

// ---------- Add Quote ----------
function addQuote() {
  const text = newQuoteInput.value.trim();
  const cat = newCategoryInput.value.trim();
  if (!text || !cat) {
    alert("Please fill both fields.");
    return;
  }

  quotes.push({ text, category: cat });
  saveQuotes();
  populateCategories();
  filterQuotes(); // Update filter dynamically
  newQuoteInput.value = "";
  newCategoryInput.value = "";
  alert("Quote added successfully!");
}

// ---------- Category Filtering ----------
function populateCategories() {
  // Clear existing options (keep "All Categories" as first)
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }

  // Collect unique categories
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  // Add them as options
  uniqueCategories.forEach(cat => {
    const opt = new Option(cat, cat);
    categoryFilter.add(opt);
  });

  // Restore last selected category if available
  const lastFilter = localStorage.getItem(LOCAL_KEY_FILTER);
  if (lastFilter) {
    categoryFilter.value = lastFilter;
    filterQuotes();
  }
}

function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem(LOCAL_KEY_FILTER, selected); // remember last filter

  if (selected === "all") {
    filteredQuotes = quotes.slice();
  } else {
    filteredQuotes = quotes.filter(q => q.category === selected);
  }

  showRandomQuote();
}

// ---------- JSON Import/Export ----------
function exportQuotesAsJson() {
  const json = JSON.stringify(quotes, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  exportLink.href = url;
  exportLink.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importFromJsonFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      }
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
}

// ---------- Initialization ----------
function init() {
  populateCategories();
  const lastFilter = localStorage.getItem(LOCAL_KEY_FILTER);
  if (lastFilter && lastFilter !== "all") filterQuotes();
  else showRandomQuote();
}

// ---------- Event Listeners ----------
newQuoteBtn.addEventListener('click', showRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);
categoryFilter.addEventListener('change', filterQuotes);
exportBtn.addEventListener('click', exportQuotesAsJson);
importFileInput.addEventListener('change', (e) => importFromJsonFile(e.target.files[0]));

// Run on load
init();
