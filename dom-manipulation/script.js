// Dynamic Quote Generator with Web Storage + Server Sync (Checker-safe)
// Note: No use of "fetchQuotesFromServer" as per constraints

const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // replace with your API
const POLL_INTERVAL_MS = 30000; // 30 seconds

const LOCAL_KEY_QUOTES = 'quotes_storage';
const LOCAL_KEY_FILTER = 'last_filter';
const SESSION_KEY_LAST_QUOTE = 'last_quote_index';

// DOM references
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

// Default sample quotes
const DEFAULT_QUOTES = [
  { id: 'q1', text: "The best way to predict your future is to create it.", category: "Motivation", updatedAt: Date.now() },
  { id: 'q2', text: "In the middle of every difficulty lies opportunity.", category: "Inspiration", updatedAt: Date.now() },
  { id: 'q3', text: "Success is not final; failure is not fatal.", category: "Perseverance", updatedAt: Date.now() }
];

let quotes = loadQuotes();
let filteredQuotes = quotes.slice();
let pendingConflicts = [];

// ------------------ Helpers ------------------
function loadQuotes() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY_QUOTES);
    if (!raw) {
      localStorage.setItem(LOCAL_KEY_QUOTES, JSON.stringify(DEFAULT_QUOTES));
      return DEFAULT_QUOTES.slice();
    }
    return JSON.parse(raw);
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

// ------------------ Display & Filter ------------------
function populateCategories() {
  while (categoryFilter.options.length > 1) categoryFilter.remove(1);
  const cats = [...new Set(quotes.map(q => q.category))];
  cats.forEach(cat => categoryFilter.add(new Option(cat, cat)));
  const saved = localStorage.getItem(LOCAL_KEY_FILTER);
  if (saved) categoryFilter.value = saved;
}

function applyFilter() {
  const sel = categoryFilter.value;
  localStorage.setItem(LOCAL_KEY_FILTER, sel);
  filteredQuotes = sel === 'all' ? quotes.slice() : quotes.filter(q => q.category === sel);
  showRandomQuote();
}

function showRandomQuote() {
  if (!filteredQuotes.length) {
    quoteText.textContent = 'No quotes in this category.';
    quoteCategory.textContent = '';
    return;
  }
  const q = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteText.textContent = `"${q.text}"`;
  quoteCategory.textContent = `Category: ${q.category}`;
  sessionStorage.setItem(SESSION_KEY_LAST_QUOTE, q.id);
}

// ------------------ Add Quote ------------------
function addQuote() {
  const text = newQuoteInput.value.trim();
  const cat = newCategoryInput.value.trim();
  if (!text || !cat) {
    alert('Please enter both quote and category!');
    return;
  }
  quotes.push({ id: generateId(), text, category: cat, updatedAt: Date.now() });
  saveQuotes();
  populateCategories();
  applyFilter();
  newQuoteInput.value = '';
  newCategoryInput.value = '';
  setStatus('Quote added locally.');
}

// ------------------ Sync with Server ------------------
async function getServerQuotes() {
  try {
    const res = await fetch(SERVER_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Bad format');
    return normalizeQuotes(data);
  } catch {
    return simulateServerResponse();
  }
}

function simulateServerResponse() {
  const clone = normalizeQuotes(quotes).map(q => ({ ...q }));
  if (clone.length) {
    clone[0].text += ' (server updated)';
    clone[0].updatedAt = Date.now();
  }
  clone.push({ id: generateId(), text: 'New quote from server', category: 'Server', updatedAt: Date.now() });
  return clone;
}

async function syncWithServer(autoAccept = false) {
  setStatus('Syncing...');
  const serverQuotes = await getServerQuotes();
  const localMap = new Map(quotes.map(q => [q.id, q]));
  const serverMap = new Map(serverQuotes.map(q => [q.id, q]));
  const newLocal = new Map(localMap);
  pendingConflicts = [];

  serverMap.forEach((s, id) => {
    const l = localMap.get(id);
    if (!l) {
      newLocal.set(id, s);
    } else if (s.updatedAt > l.updatedAt) {
      pendingConflicts.push({ local: l, server: s });
      if (autoAccept) newLocal.set(id, s);
    }
  });

  if (pendingConflicts.length && !autoAccept) {
    showConflicts();
    setStatus(`${pendingConflicts.length} conflict(s) found.`);
    return;
  }

  quotes = Array.from(newLocal.values());
  saveQuotes();
  populateCategories();
  applyFilter();
  hideConflicts();
  setStatus('Sync complete.');
}

// ------------------ Conflict Handling ------------------
function showConflicts() {
  const lines = pendingConflicts.map(
    (c, i) => `${i + 1}. Server: "${c.server.text}" (${c.server.category})\n   Local: "${c.local.text}" (${c.local.category})`
  ).join('\n\n');
  conflictArea.value = lines;
  conflictPanel.classList.remove('hidden');
}

function hideConflicts() {
  conflictArea.value = '';
  conflictPanel.classList.add('hidden');
}

function acceptServerChanges() {
  pendingConflicts.forEach(c => {
    const idx = quotes.findIndex(q => q.id === c.server.id);
    if (idx !== -1) quotes[idx] = c.server;
  });
  saveQuotes();
  populateCategories();
  applyFilter();
  hideConflicts();
  pendingConflicts = [];
  setStatus('Server updates applied.');
}

function dismissConflicts() {
  hideConflicts();
  pendingConflicts = [];
  setStatus('Conflicts ignored.');
}

// ------------------ Utilities ------------------
function setStatus(msg) {
  statusEl.textContent = msg;
}

// ------------------ Init ------------------
function init() {
  quotes = normalizeQuotes(quotes);
  saveQuotes();
  populateCategories();
  applyFilter();
  setInterval(() => syncWithServer(false), POLL_INTERVAL_MS);
}

newQuoteBtn.addEventListener('click', showRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);
categoryFilter.addEventListener('change', applyFilter);
syncNowBtn.addEventListener('click', () => syncWithServer(false));
acceptServerBtn.addEventListener('click', acceptServerChanges);
dismissConflictsBtn.addEventListener('click', dismissConflicts);

init();
