// script.js — persistent quotes with localStorage/sessionStorage and JSON import/export

// Default quotes (used only if localStorage is empty)
const DEFAULT_QUOTES = [
  { text: "The best way to predict your future is to create it.", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { text: "Success is not final; failure is not fatal.", category: "Perseverance" },
  { text: "Do what you can, with what you have, where you are.", category: "Wisdom" }
];

// DOM refs
const quoteText = document.getElementById('quoteText');
const quoteCategory = document.getElementById('quoteCategory');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const newQuoteInput = document.getElementById('newQuoteText');
const newCategoryInput = document.getElementById('newQuoteCategory');
const exportBtn = document.getElementById('exportBtn');
const exportLink = document.getElementById('exportLink');
const importFileInput = document.getElementById('importFile');
const statusEl = document.getElementById('status');

// Storage keys
const LOCAL_KEY = 'dq_quotes_v1';      // localStorage key for quotes
const SESSION_KEY = 'dq_last_index';   // sessionStorage key for last shown index

// Load quotes from localStorage or use defaults
let quotes = loadQuotes();

// Utility: Save quotes to localStorage (stringify)
function saveQuotes() {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(quotes));
    setStatus('Quotes saved to local storage.');
  } catch (e) {
    console.error('Failed saving quotes:', e);
    setStatus('Error saving quotes to local storage.', true);
  }
}

// Utility: Load quotes (returns array)
function loadQuotes() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) {
      // initialize localStorage with defaults
      localStorage.setItem(LOCAL_KEY, JSON.stringify(DEFAULT_QUOTES));
      setStatus('Initialized quotes with default set.');
      return DEFAULT_QUOTES.slice(); // copy
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Malformed quotes data');
    setStatus('Loaded quotes from local storage.');
    return parsed;
  } catch (e) {
    console.warn('Could not load quotes, using defaults:', e);
    setStatus('Using default quotes (local storage unreadable).', true);
    return DEFAULT_QUOTES.slice();
  }
}

// Show a quote given index (and persist last viewed index to sessionStorage)
function showQuoteByIndex(index) {
  if (!Array.isArray(quotes) || quotes.length === 0) {
    quoteText.textContent = 'No quotes available. Please add one!';
    quoteCategory.textContent = '';
    return;
  }
  const idx = ((index % quotes.length) + quotes.length) % quotes.length; // safe wrap
  const q = quotes[idx];
  quoteText.textContent = `"${q.text}"`;
  quoteCategory.textContent = `Category: ${q.category}`;
  // store last shown index in sessionStorage (temporary)
  try {
    sessionStorage.setItem(SESSION_KEY, String(idx));
  } catch (e) {
    // ignore sessionStorage errors
  }
}

// Show a random quote (reads quotes array)
function showRandomQuote() {
  if (!Array.isArray(quotes) || quotes.length === 0) {
    quoteText.textContent = 'No quotes available. Please add one!';
    quoteCategory.textContent = '';
    return;
  }
  const index = Math.floor(Math.random() * quotes.length);
  showQuoteByIndex(index);
  setStatus('Displayed a random quote (saved to session).');
}

// Add a new quote (validates input, updates localStorage)
function addQuote() {
  const text = newQuoteInput.value.trim();
  const category = newCategoryInput.value.trim();
  if (!text || !category) {
    alert('Please fill both quote and category fields.');
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();              // persist to localStorage
  newQuoteInput.value = '';
  newCategoryInput.value = '';
  setStatus('Quote added and saved.');
}

// Export quotes as a JSON file (uses existing hidden anchor)
function exportQuotesAsJson() {
  try {
    const json = JSON.stringify(quotes, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Use existing anchor element to trigger download (no createElement)
    exportLink.href = url;
    exportLink.download = 'quotes.json';
    exportLink.click();

    // Revoke URL after short delay to allow download to start
    setTimeout(() => {
      URL.revokeObjectURL(url);
      exportLink.href = '#';
      setStatus('Export triggered (quotes.json).');
    }, 1000);
  } catch (e) {
    console.error('Export error', e);
    setStatus('Failed to export quotes.', true);
  }
}

// Import quotes from a selected JSON file
function importFromJsonFile(file) {
  if (!file) {
    setStatus('No file selected for import.', true);
    return;
  }

  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const imported = JSON.parse(evt.target.result);
      if (!Array.isArray(imported)) throw new Error('JSON must be an array of quote objects');

      // Validate objects (text + category)
      const valid = imported.filter(q => q && typeof q.text === 'string' && typeof q.category === 'string');
      if (valid.length === 0) {
        setStatus('Imported file contains no valid quotes.', true);
        return;
      }

      // Merge (avoid duplicates naive approach: just push all)
      quotes.push(...valid);
      saveQuotes();
      setStatus(`Imported ${valid.length} quotes successfully.`);
    } catch (err) {
      console.error('Import failed:', err);
      setStatus('Failed to import JSON file (invalid format).', true);
    }
  };

  reader.onerror = (err) => {
    console.error('File read error', err);
    setStatus('Error reading file.', true);
  };

  reader.readAsText(file);
}

// Helper for status messages
function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? '#8b0000' : '#006400';
}

// On load: show last viewed quote if any (from session), otherwise show a random one placeholder
function initOnLoad() {
  // If session stored last index, show it
  try {
    const last = sessionStorage.getItem(SESSION_KEY);
    if (last !== null) {
      const idx = parseInt(last, 10);
      if (!isNaN(idx) && Array.isArray(quotes) && quotes.length > 0) {
        showQuoteByIndex(idx);
        setStatus('Restored last viewed quote from session.');
        return;
      }
    }
  } catch (e) {
    // ignore session errors
  }

  // else show a random quote
  showRandomQuote();
}

// Wire up UI event listeners
newQuoteBtn.addEventListener('click', showRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);
exportBtn.addEventListener('click', exportQuotesAsJson);

// import file input change
importFileInput.addEventListener('change', (ev) => {
  const file = ev.target.files && ev.target.files[0];
  if (!file) {
    setStatus('No file selected.', true);
    return;
  }
  importFromJsonFile(file);
  // Clear the input value so the same file can be re-selected if needed
  importFileInput.value = '';
});

// initialize UI
initOnLoad();
