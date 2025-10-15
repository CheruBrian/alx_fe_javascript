// script.js — Adds periodic server sync + conflict handling
// Works with your existing quote/filter logic and localStorage.

// NOTE: Replace SERVER_URL with your real API endpoint in production.
// For testing or when fetch fails, we simulate a server response.
const SERVER_URL = 'https://example.com/api/quotes'; // replace with real endpoint if available
const POLL_INTERVAL_MS = 30_000; // 30 seconds polling

// Storage keys
const LOCAL_KEY_QUOTES = 'quotes_storage';
const LOCAL_KEY_FILTER = 'last_filter';
const SESSION_KEY_LAST_QUOTE = 'last_quote_index';

// DOM refs (existing elements only)
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

// Default set
const DEFAULT_QUOTES = [
  { id: 'q1', text: "The best way to predict your future is to create it.", category: "Motivation", updatedAt: Date.now() },
  { id: 'q2', text: "In the middle of every difficulty lies opportunity.", category: "Inspiration", updatedAt: Date.now() },
  { id: 'q3', text: "Success is not final; failure is not fatal.", category: "Perseverance", updatedAt: Date.now() }
];

// In-memory lists
let quotes = loadQuotes();
let filteredQuotes = quotes.slice();
let pendingConflicts = []; // array of { local, server }

// ---------------- Storage helpers ----------------
function loadQuotes() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY_QUOTES);
    if (!raw) {
      localStorage.setItem(LOCAL_KEY_QUOTES, JSON.stringify(DEFAULT_QUOTES));
      return DEFAULT_QUOTES.slice();
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_QUOTES.slice();
  } catch (e) {
    console.warn('loadQuotes error', e);
    return DEFAULT_QUOTES.slice();
  }
}

function saveQuotes() {
  localStorage.setItem(LOCAL_KEY_QUOTES, JSON.stringify(quotes));
}

// Ensure each quote has an id and updatedAt (add if missing)
function normalizeQuotesArray(arr) {
  return arr.map(q => {
    return {
      id: q.id || generateId(),
      text: q.text || '',
      category: q.category || 'Uncategorized',
      updatedAt: q.updatedAt || Date.now()
    };
  });
}

function generateId() {
  return 'q_' + Math.random().toString(36).slice(2, 9);
}

// ---------------- Display + Filtering (same-safe approach) ----------------
function populateCategories() {
  // keep first option "all"
  while (categoryFilter.options.length > 1) categoryFilter.remove(1);
  const unique = [...new Set(quotes.map(q => q.category))];
  unique.forEach(cat => {
    const opt = new Option(cat, cat);
    categoryFilter.add(opt);
  });
  const savedFilter = localStorage.getItem(LOCAL_KEY_FILTER);
  if (savedFilter) categoryFilter.value = savedFilter;
}

function applyFilterAndShow(selected) {
  const sel = selected || categoryFilter.value;
  localStorage.setItem(LOCAL_KEY_FILTER, sel);
  filteredQuotes = sel === 'all' ? quotes.slice() : quotes.filter(q => q.category === sel);
  showRandomFilteredQuote();
}

function showRandomFilteredQuote() {
  if (!filteredQuotes.length) {
    quoteText.textContent = 'No quotes available for this category.';
    quoteCategory.textContent = '';
    return;
  }
  const idx = Math.floor(Math.random() * filteredQuotes.length);
  const q = filteredQuotes[idx];
  quoteText.textContent = `"${q.text}"`;
  quoteCategory.textContent = `Category: ${q.category}`;
  sessionStorage.setItem(SESSION_KEY_LAST_QUOTE, idx);
}

// ---------------- Adding quote ----------------
function addQuote() {
  const text = newQuoteInput.value.trim();
  const cat = newCategoryInput.value.trim();
  if (!text || !cat) {
    alert('Please provide both quote and category.');
    return;
  }
  const newQ = { id: generateId(), text, category: cat, updatedAt: Date.now() };
  quotes.push(newQ);
  saveQuotes();
  populateCategories();
  applyFilterAndShow();
  newQuoteInput.value = '';
  newCategoryInput.value = '';
  setStatus('Quote added locally and saved.');
}

// ---------------- Sync logic ----------------
// High-level approach:
// - fetch server quotes (array of {id,text,category,updatedAt})
// - normalize both lists
// - build maps by id
// - for each id:
//    - if id exists only on server => add to local (server wins)
//    - if exists only local => keep local (but server might add later)
//    - if exists both and timestamps differ => conflict: server wins (we collect conflicts and show UI)
// - apply server precedence for conflicts automatically if autoAccept is true, else queue conflicts for manual resolution.

async function fetchServerQuotes() {
  try {
    const resp = await fetch(SERVER_URL, { cache: 'no-store' });
    if (!resp.ok) throw new Error('Bad response ' + resp.status);
    const data = await resp.json();
    // Expect server to return array of quote objects; if not, fallback to simulated
    if (!Array.isArray(data)) throw new Error('Unexpected server data');
    return normalizeQuotesArray(data);
  } catch (err) {
    // fallback: simulated server (for demo/testing)
    console.warn('Fetch failed, using simulated server response:', err);
    return simulateServerResponse();
  }
}

function simulateServerResponse() {
  // Simulate server changes: e.g., modify one quote, add one
  const serverCopy = normalizeQuotesArray(quotes).map(q => ({ ...q }));
  // Simulate server updated one existing quote randomly
  if (serverCopy.length) {
    serverCopy[0].text = serverCopy[0].text + ' (server updated)';
    serverCopy[0].updatedAt = Date.now();
  }
  // Simulate server adding a new item
  serverCopy.push({ id: generateId(), text: 'New server quote', category: 'Server', updatedAt: Date.now() });
  return serverCopy;
}

async function syncWithServer(autoAcceptServerWins = false) {
  setStatus('Syncing with server...');
  const serverQuotes = await fetchServerQuotes();
  // Merge logic
  const localMap = new Map(quotes.map(q => [q.id, q]));
  const serverMap = new Map(serverQuotes.map(sq => [sq.id, sq]));
  const newLocal = new Map(localMap); // result map (start with local)

  pendingConflicts = [];

  // Add/overwrite with server items
  serverMap.forEach((sItem, id) => {
    const lItem = localMap.get(id);
    if (!lItem) {
      // server-only -> add to local
      newLocal.set(id, sItem);
    } else {
      // both exist -> check timestamps
      if (sItem.updatedAt > lItem.updatedAt && sItem.updatedAt - lItem.updatedAt > 0) {
        // conflict: server more recent
        pendingConflicts.push({ local: lItem, server: sItem });
        if (autoAcceptServerWins) {
          newLocal.set(id, sItem);
        }
      } else {
        // local is same or newer => keep local for now
      }
    }
  });

  // Optionally: consider server deletions (not implemented here - could be done via tombstones)

  // Apply accepted server wins
  if (autoAcceptServerWins && pendingConflicts.length) {
    // already applied above when autoAcceptServerWins true
    setStatus(`Sync complete. ${pendingConflicts.length} conflicts auto-resolved in favor of server.`);
    // write newLocal to quotes
    quotes = Array.from(newLocal.values());
    saveQuotes();
    populateCategories();
    applyFilterAndShow();
    pendingConflicts = [];
    hideConflictPanel();
    return;
  }

  // If there are conflicts, show user
  if (pendingConflicts.length) {
    // show conflict panel with server versions (we only show server data for clarity)
    showConflictPanel(pendingConflicts);
    setStatus(`Sync found ${pendingConflicts.length} conflict(s). Review or accept server changes.`);
    return;
  }

  // No conflicts: update local store with newLocal contents
  quotes = Array.from(newLocal.values());
  saveQuotes();
  populateCategories();
  applyFilterAndShow();
  setStatus('Sync complete. Local data updated from server.');
}

// ---------------- Conflict UI handlers ----------------
function showConflictPanel(conflicts) {
  // Build a human readable summary into the readonly textarea (no innerHTML)
  let lines = conflicts.map((c, i) => {
    return `${i + 1}. ID: ${c.server.id}\nServer: "${c.server.text}" [${c.server.category}] (updated: ${new Date(c.server.updatedAt).toLocaleString()})\nLocal:  "${c.local.text}" [${c.local.category}] (updated: ${new Date(c.local.updatedAt).toLocaleString()})\n`;
  }).join('\n');
  conflictArea.value = lines;
  conflictPanel.classList.remove('hidden');
}

function hideConflictPanel() {
  conflictArea.value = '';
  conflictPanel.classList.add('hidden');
}

function acceptServerChanges() {
  if (!pendingConflicts.length) return;
  // Apply server versions for each conflict id
  const serverMap = new Map(pendingConflicts.map(p => [p.server.id, p.server]));
  const resultMap = new Map(quotes.map(q => [q.id, q]));
  serverMap.forEach((sItem, id) => resultMap.set(id, sItem));
  quotes = Array.from(resultMap.values());
  saveQuotes();
  populateCategories();
  applyFilterAndShow();
  pendingConflicts = [];
  hideConflictPanel();
  setStatus('Server changes accepted and applied to local data.');
}

function dismissConflicts() {
  pendingConflicts = [];
  hideConflictPanel();
  setStatus('Conflicts dismissed. Local data unchanged.');
}

// ---------------- Utilities ----------------
function setStatus(msg) {
  statusEl.textContent = msg;
}

// ---------------- Initialization + polling ----------------
function init() {
  // Normalize loaded quotes
  quotes = normalizeQuotesArray(quotes);
  saveQuotes();

  populateCategories(); // defined below; uses quotes array
  applyFilterAndShow(); // use persisted filter or default

  // Set up periodic polling
  setInterval(() => {
    // auto-sync but do not auto-accept; notify user if conflicts
    syncWithServer(false).catch(e => console.error('sync error', e));
  }, POLL_INTERVAL_MS);
}

// SMALL helper reusing earlier functions (kept local for compatibility)
function populateCategories() {
  // Keep first option "all"
  while (categoryFilter.options.length > 1) categoryFilter.remove(1);
  const unique = [...new Set(quotes.map(q => q.category))];
  unique.forEach(cat => {
    const opt = new Option(cat, cat);
    categoryFilter.add(opt);
  });
  const savedFilter = localStorage.getItem(LOCAL_KEY_FILTER);
  if (savedFilter) categoryFilter.value = savedFilter;
}

function applyFilterAndShow() {
  const sel = categoryFilter.value || 'all';
  localStorage.setItem(LOCAL_KEY_FILTER, sel);
  filteredQuotes = sel === 'all' ? quotes.slice() : quotes.filter(q => q.category === sel);
  showRandomFilteredQuote();
}

function showRandomFilteredQuote() {
  if (!filteredQuotes.length) {
    quoteText.textContent = 'No quotes available for this category.';
    quoteCategory.textContent = '';
    return;
  }
  const idx = Math.floor(Math.random() * filteredQuotes.length);
  const q = filteredQuotes[idx];
  quoteText.textContent = `"${q.text}"`;
  quoteCategory.textContent = `Category: ${q.category}`;
}

// ---------------- Event bindings ----------------
newQuoteBtn.addEventListener('click', () => {
  applyFilterAndShow();
});
addQuoteBtn.addEventListener('click', addQuote);
categoryFilter.addEventListener('change', () => {
  applyFilterAndShow();
});
syncNowBtn.addEventListener('click', () => {
  syncWithServer(false).catch(e => console.error(e));
});
acceptServerBtn.addEventListener('click', acceptServerChanges);
dismissConflictsBtn.addEventListener('click', dismissConflicts);

// Start
init();
