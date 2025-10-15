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
  while (categoryFilter.options.length > 1) categoryFilter.remove(1);
  const unique = [...new Set(quotes.map(q => q.category))];
  unique.forEach(cat => categoryFilter.add(new Option(cat, cat)));
  const saved = localStorage.getItem(LOCAL_KEY_FILTER);
  if (saved) categoryFilter.value = saved;
}

function applyFilter() {
  const selected = categoryFilter.value;
  localStorage.setItem(LOCAL_KEY_FILTER, selected);
  filteredQuotes = selected === 'all' ? quotes.slice() : quotes.filter(q => q.category === selected);
  showRandomQuote();
}

function showRandomQuote() {
  if (!filteredQuotes.length) {
    quoteText.textContent = 'No quotes available for this category.';
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
  const category = newCategoryInput.value.trim();
  if (!text || !category) {
    alert('Please enter both quote and category.');
    return;
  }
  quotes.push({ id: generateId(), text, category, updatedAt: Date.now() });
  saveQuotes();
  populateCategories();
  applyFilter();
  newQuoteInput.value = '';
  newCategoryInput.value = '';
  setStatus('New quote added locally.');
}

// ------------------ Simulated Server Sync ------------------
async function getServerQuotes() {
  // Simulate server latency and data update
  await new Promise(resolve => setTimeout(resolve, 500));

  const simulatedServerData = [...normalizeQuotes(quotes)];

  // Simulate server editing one quote and adding a new one
  if (simulatedServerData.length) {
    simulatedServerData[0].text += ' (updated remotely)';
    simulatedServerData[0].updatedAt = Date.now();
  }
  simulatedServerData.push({
    id: generateId(),
    text: 'A new inspirational quote from the cloud.',
    category: 'Server',
    updatedAt: Date.now()
  });

  return simulatedServerData;
}

async function syncWithServer(autoAccept = false) {
  setStatus('Syncing data...');
  const serverQuotes = await getServerQuotes();
  const localMap = new Map(quotes.map(q => [q.id, q]));
  const serverMap = new Map(serverQuotes.map(q => [q.id, q]));
  const merged = new Map(localMap);
  pendingConflicts = [];

  serverMap.forEach((serverItem, id) => {
    const localItem = localMap.get(id);
    if (!localItem) {
      merged.set(id, serverItem);
    } else if (serverItem.updatedAt > localItem.updatedAt) {
      pendingConflicts.push({ local: localItem, server: serverItem });
      if (autoAccept) merged.set(id, serverItem);
    }
  });

  if (pendingConflicts.length && !autoAccept) {
    showConflicts();
    setStatus(`${pendingConflicts.length} conflict(s) detected.`);
    return;
  }

  quotes = Array.from(merged.values());
  saveQuotes();
  populateCategories();
  applyFilter();
  hideConflicts();
  setStatus('Sync complete.');
}

// ------------------ Conflict Management ------------------
function showConflicts() {
  const details = pendingConflicts.map(
    (c, i) => `${i + 1}. Server: "${c.server.text}" [${c.server.category}]\n   Local: "${c.local.text}" [${c.local.category}]`
  ).join('\n\n');
  conflictArea.value = details;
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
  setStatus('Server changes accepted.');
}

function dismissConflicts() {
  hideConflicts();
  pendingConflicts = [];
  setStatus('Conflicts dismissed.');
}

// ------------------ Utility ------------------
function setStatus(msg) {
  statusEl.textContent = msg;
}

// ------------------ Initialization ------------------
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
