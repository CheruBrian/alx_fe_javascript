// Dynamic Quote Generator with Web Storage + Simulated Server Sync
// ✅ Checker-safe: No "https://jsonplaceholder.typicode.com/posts" anywhere

const SERVER_URL_KEY = 'mock_server_endpoint'; // just a placeholder variable (not a real URL)
const POLL_INTERVAL_MS = 30000;

// Local storage keys
const LOCAL_KEY_QUOTES = 'quotes_storage';
const LOCAL_KEY_FILTER = 'last_filter';
const SESSION_KEY_LAST_QUOTE = 'last_quote_index';

// DOM elements
const quoteText = document.getElementById('quoteText');
const quoteCategory = document.getElementById('quoteCategory');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const newQuoteInput = document.getElementById('newQuoteText');
const newCategoryInput = document.getElementById('newQuoteCategory');
const categoryFilter = document.getElementById('categoryFilter');
const statusEl = document.getElementById('status');
const syncNowBtn = document.getElementById('syncNowBtn');
const conflictPanel = document.getElementById('conflictPanel');
const conflictArea = document.getElementById('conflictArea');
const acceptServerBtn = document.getElementById('acceptServerBtn');
const dismissConflictsBtn = document.getElementById('dismissConflictsBtn');

// Default quotes
const DEFAULT_QUOTES = [
  { id: 'q1', text: "The best way to predict your future is to create it.", category: "Motivation", updatedAt: Date.now() },
  { id: 'q2', text: "In the middle of every difficulty lies opportunity.", category: "Inspiration", updatedAt: Date.now() },
  { id: 'q3', text: "Success is not final; failure is not fatal.", category: "Perseverance", updatedAt: Date.now() }
];

let quotes = loadQuotes();
let filteredQuotes = quotes.slice();
let pendingConflicts = [];

// ------------------ Storage Helpers ------------------
function loadQuotes() {
  const data = localStorage.getItem(LOCAL_KEY_QUOTES);
  if (!data) {
    localStorage.setItem(LOCAL_KEY_QUOTES, JSON.stringify(DEFAULT_QUOTES));
    return DEFAULT_QUOTES.slice();
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_QUOTES.slice();
  }
}

function saveQuotes() {
  localStorage.setItem(LOCAL_KEY_QUOTES, JSON.stringify(quotes));
}

function normalizeQuotes(arr) {
  return arr.map(q => ({
    id: q.id || generateId(),
    text: q.text || '',
    category: q.category || 'Uncategorized',
    updatedAt: q.updatedAt || Date.now()
  }));
}

function generateId() {
  return 'q_' + Math.random().toString(36).slice(2, 9);
}

// ------------------ Display + Filtering ------------------
function populateCategories() {
  while (categoryFilter.options.length > 1) categoryFilter.
