// Server simulation using JSONPlaceholder or localStorage as mock server
        const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';
        const MOCK_SERVER_KEY = 'mockServerQuotes';
        
        // Initialize quotes array with default quotes
        let quotes = [
            { 
                id: generateId(),
                text: "The only way to do great work is to love what you do.", 
                author: "Steve Jobs", 
                categories: ["Motivation", "Work"],
                lastUpdated: Date.now()
            },
            { 
                id: generateId(),
                text: "Innovation distinguishes between a leader and a follower.", 
                author: "Steve Jobs", 
                categories: ["Leadership", "Innovation"],
                lastUpdated: Date.now()
            },
            { 
                id: generateId(),
                text: "Your time is limited, don't waste it living someone else's life.", 
                author: "Steve Jobs", 
                categories: ["Life", "Time Management"],
                lastUpdated: Date.now()
            }
        ];

        // Initialize categories array
        let categories = ["Motivation", "Work", "Leadership", "Innovation", "Life", "Time Management", "Wisdom", "Perseverance", "Action"];

        // Current filter state
        let currentFilters = {
            category: 'all',
            search: ''
        };

        // Sync state
        let syncState = {
            lastSync: null,
            isSyncing: false,
            hasConflicts: false,
            pendingChanges: false
        };

        // DOM Elements
        let quoteText, quoteAuthor, quoteCategories, generateBtn, addQuoteBtn, addQuoteForm;
        let quoteInput, authorInput, categorySelect, newCategoryInput, saveQuoteBtn, cancelBtn;
        let categoryFilter, searchInput, applyFilters, clearFilters, activeFilters;
        let localCount, categoryCount, serverCount, lastSync, exportBtn, importBtn;
        let fileInputContainer, importFile, processImportBtn, cancelImportBtn, notification, quotesContainer;
        let statusIndicator, statusText, syncNowBtn, viewConflictsBtn, forceServerBtn, forceLocalBtn;
        let conflictResolution, localOption, serverOption, closeConflictBtn, cancelConflictBtn, resolveConflictBtn;
        let localConflictCount, serverConflictCount;

        // Initialize the application
        function init() {
            // Initialize DOM elements
            initializeDOMElements();
            
            // Load quotes and categories from local storage if available
            loadFromLocalStorage();
            
            // Initialize mock server with default data if empty
            initializeMockServer();
            
            // Perform initial sync with server
            syncWithServer();
            
            // Set up periodic sync (every 30 seconds)
            setInterval(syncWithServer, 30000);
            
            // Populate categories in the filter and form
            populateCategories();
            
            // Update quote counters
            updateQuoteCounters();
            
            // Display all quotes
            displayQuotes();
            
            // Add event listeners
            setupEventListeners();
            
            // Generate initial quote
            generateRandomQuote();
        }

        // Initialize all DOM elements
        function initializeDOMElements() {
            quoteText = document.getElementById('quoteText');
            quoteAuthor = document.getElementById('quoteAuthor');
            quoteCategories = document.getElementById('quoteCategories');
            generateBtn = document.getElementById('generateBtn');
            addQuoteBtn = document.getElementById('addQuoteBtn');
            addQuoteForm = document.getElementById('addQuoteForm');
            quoteInput = document.getElementById('quoteInput');
            authorInput = document.getElementById('authorInput');
            categorySelect = document.getElementById('categorySelect');
            newCategoryInput = document.getElementById('newCategoryInput');
            saveQuoteBtn = document.getElementById('saveQuoteBtn');
            cancelBtn = document.getElementById('cancelBtn');
            categoryFilter = document.getElementById('categoryFilter');
            searchInput = document.getElementById('searchInput');
            applyFilters = document.getElementById('applyFilters');
            clearFilters = document.getElementById('clearFilters');
            activeFilters = document.getElementById('activeFilters');
            localCount = document.getElementById('localCount');
            categoryCount = document.getElementById('categoryCount');
            serverCount = document.getElementById('serverCount');
            lastSync = document.getElementById('lastSync');
            exportBtn = document.getElementById('exportBtn');
            importBtn = document.getElementById('importBtn');
            fileInputContainer = document.getElementById('fileInputContainer');
            importFile = document.getElementById('importFile');
            processImportBtn = document.getElementById('processImportBtn');
            cancelImportBtn = document.getElementById('cancelImportBtn');
            notification = document.getElementById('notification');
            quotesContainer = document.getElementById('quotesContainer');
            statusIndicator = document.getElementById('statusIndicator');
            statusText = document.getElementById('statusText');
            syncNowBtn = document.getElementById('syncNowBtn');
            viewConflictsBtn = document.getElementById('viewConflictsBtn');
            forceServerBtn = document.getElementById('forceServerBtn');
            forceLocalBtn = document.getElementById('forceLocalBtn');
            conflictResolution = document.getElementById('conflictResolution');
            localOption = document.getElementById('localOption');
            serverOption = document.getElementById('serverOption');
            closeConflictBtn = document.getElementById('closeConflictBtn');
            cancelConflictBtn = document.getElementById('cancelConflictBtn');
            resolveConflictBtn = document.getElementById('resolveConflictBtn');
            localConflictCount = document.getElementById('localConflictCount');
            serverConflictCount = document.getElementById('serverConflictCount');
        }

        // Set up all event listeners
        function setupEventListeners() {
            generateBtn.addEventListener('click', generateRandomQuote);
            addQuoteBtn.addEventListener('click', toggleAddQuoteForm);
            saveQuoteBtn.addEventListener('click', saveNewQuote);
            cancelBtn.addEventListener('click', toggleAddQuoteForm);
            applyFilters.addEventListener('click', applyFilter);
            clearFilters.addEventListener('click', clearFilter);
            exportBtn.addEventListener('click', exportToJson);
            importBtn.addEventListener('click', showImportFileInput);
            processImportBtn.addEventListener('click', importFromJson);
            cancelImportBtn.addEventListener('click', hideImportFileInput);
            syncNowBtn.addEventListener('click', syncWithServer);
            viewConflictsBtn.addEventListener('click', showConflictResolution);
            forceServerBtn.addEventListener('click', forceServerVersion);
            forceLocalBtn.addEventListener('click', forceLocalVersion);
            closeConflictBtn.addEventListener('click', hideConflictResolution);
            cancelConflictBtn.addEventListener('click', hideConflictResolution);
            resolveConflictBtn.addEventListener('click', resolveConflict);
            
            // Conflict resolution option selection
            localOption.addEventListener('click', () => selectConflictOption('local'));
            serverOption.addEventListener('click', () => selectConflictOption('server'));
        }

        // Generate a unique ID for quotes
        function generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        // Initialize mock server with default data
        function initializeMockServer() {
            const serverQuotes = getServerQuotes();
            if (!serverQuotes || serverQuotes.length === 0) {
                // Initialize server with default quotes
                setServerQuotes(quotes);
            }
        }

        // Get quotes from mock server
        function getServerQuotes() {
            try {
                const serverData = localStorage.getItem(MOCK_SERVER_KEY);
                return serverData ? JSON.parse(serverData) : [];
            } catch (error) {
                console.error('Error reading server quotes:', error);
                return [];
            }
        }

        // Save quotes to mock server
        function setServerQuotes(quotesToSave) {
            try {
                localStorage.setItem(MOCK_SERVER_KEY, JSON.stringify(quotesToSave));
                return true;
            } catch (error) {
                console.error('Error saving server quotes:', error);
                return false;
            }
        }

        // Simulate server API call with delay
        function simulateServerCall(data, action) {
            return new Promise((resolve, reject) => {
                // Simulate network delay
                setTimeout(() => {
                    try {
                        let result;
                        if (action === 'get') {
                            result = getServerQuotes();
                        } else if (action === 'post') {
                            result = setServerQuotes(data);
                        }
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                }, 1000 + Math.random() * 2000); // 1-3 second delay
            });
        }

        // Sync with server
        async function syncWithServer() {
            if (syncState.isSyncing) {
                showNotification('Sync already in progress', 'warning');
                return;
            }
            
            setSyncStatus('syncing', 'Syncing with server...');
            
            try {
                // Get server data
                const serverQuotes = await simulateServerCall(null, 'get');
                
                // Detect conflicts and changes
                const { conflicts, localChanges, serverChanges } = detectChanges(quotes, serverQuotes);
                
                if (conflicts.length > 0) {
                    // We have conflicts that need resolution
                    syncState.hasConflicts = true;
                    viewConflictsBtn.style.display = 'inline-block';
                    setSyncStatus('error', `Sync completed with ${conflicts.length} conflicts`);
                    showNotification(`Found ${conflicts.length} conflicts during sync`, 'warning');
                    
                    // Store conflict data for resolution
                    syncState.conflictData = {
                        serverQuotes,
                        conflicts,
                        localChanges,
                        serverChanges
                    };
                    
                } else if (localChanges.length > 0 || serverChanges.length > 0) {
                    // We have changes but no conflicts - merge automatically
                    const mergedQuotes = mergeQuotes(quotes, serverQuotes);
                    quotes = mergedQuotes;
                    saveToLocalStorage();
                    
                    // Update server with merged data
                    await simulateServerCall(mergedQuotes, 'post');
                    
                    setSyncStatus('success', 'Synced with server');
                    showNotification(`Sync completed: ${localChanges.length} local changes, ${serverChanges.length} server changes`);
                    
                    // Update UI
                    updateQuoteCounters();
                    displayQuotes();
                    
                } else {
                    // No changes
                    setSyncStatus('success', 'Synced with server');
                    showNotification('Already in sync with server');
                }
                
                syncState.lastSync = new Date();
                updateLastSyncDisplay();
                
            } catch (error) {
                console.error('Sync error:', error);
                setSyncStatus('error', 'Sync failed');
                showNotification('Failed to sync with server', 'error');
            } finally {
                syncState.isSyncing = false;
            }
        }

        // Detect changes between local and server data
        function detectChanges(localQuotes, serverQuotes) {
            const conflicts = [];
            const localChanges = [];
            const serverChanges = [];
            
            // Create maps for easier lookup
            const localMap = new Map(localQuotes.map(q => [q.id, q]));
            const serverMap = new Map(serverQuotes.map(q => [q.id, q]));
            
            // Check for conflicts (same quote ID but different content)
            for (const [id, localQuote] of localMap) {
                const serverQuote = serverMap.get(id);
                if (serverQuote && 
                    (localQuote.text !== serverQuote.text || 
                     localQuote.author !== serverQuote.author ||
                     JSON.stringify(localQuote.categories) !== JSON.stringify(serverQuote.categories))) {
                    // This is a conflict
                    conflicts.push({
                        id,
                        local: localQuote,
                        server: serverQuote
                    });
                }
            }
            
            // Check for local changes (quotes not on server or newer than server)
            for (const localQuote of localQuotes) {
                const serverQuote = serverMap.get(localQuote.id);
                if (!serverQuote || localQuote.lastUpdated > serverQuote.lastUpdated) {
                    localChanges.push(localQuote);
                }
            }
            
            // Check for server changes (quotes not local or newer than local)
            for (const serverQuote of serverQuotes) {
                const localQuote = localMap.get(serverQuote.id);
                if (!localQuote || serverQuote.lastUpdated > localQuote.lastUpdated) {
                    serverChanges.push(serverQuote);
                }
            }
            
            return { conflicts, localChanges, serverChanges };
        }

        // Merge quotes from local and server (automatic conflict resolution)
        function mergeQuotes(localQuotes, serverQuotes) {
            const quoteMap = new Map();
            
            // Add all local quotes
            localQuotes.forEach(quote => {
                quoteMap.set(quote.id, { ...quote });
            });
            
            // Add/update with server quotes, keeping the newer version
            serverQuotes.forEach(serverQuote => {
                const localQuote = quoteMap.get(serverQuote.id);
                
                if (!localQuote) {
                    // Quote doesn't exist locally, add it
                    quoteMap.set(serverQuote.id, { ...serverQuote });
                } else if (serverQuote.lastUpdated > localQuote.lastUpdated) {
                    // Server version is newer, update local
                    quoteMap.set(serverQuote.id, { ...serverQuote });
                }
                // If local is newer, we keep the local version (already in map)
            });
            
            return Array.from(quoteMap.values());
        }

        // Set sync status UI
        function setSyncStatus(status, message) {
            statusIndicator.className = 'status-indicator';
            statusText.textContent = message;
            
            if (status === 'syncing') {
                statusIndicator.classList.add('syncing');
                syncState.isSyncing = true;
            } else if (status === 'error') {
                statusIndicator.classList.add('error');
                syncState.isSyncing = false;
            } else if (status === 'success') {
                syncState.isSyncing = false;
                syncState.hasConflicts = false;
                viewConflictsBtn.style.display = 'none';
            }
        }

        // Update last sync display
        function updateLastSyncDisplay() {
            if (syncState.lastSync) {
                lastSync.textContent = syncState.lastSync.toLocaleTimeString();
            } else {
                lastSync.textContent = 'Never';
            }
        }

        // Show conflict resolution dialog
        function showConflictResolution() {
            if (!syncState.conflictData) return;
            
            const { serverQuotes, conflicts } = syncState.conflictData;
            
            localConflictCount.textContent = quotes.length;
            serverConflictCount.textContent = serverQuotes.length;
            
            // Reset selection
            localOption.classList.remove('selected');
            serverOption.classList.remove('selected');
            
            conflictResolution.classList.add('active');
        }

        // Hide conflict resolution dialog
        function hideConflictResolution() {
            conflictResolution.classList.remove('active');
        }

        // Select conflict resolution option
        function selectConflictOption(option) {
            localOption.classList.toggle('selected', option === 'local');
            serverOption.classList.toggle('selected', option === 'server');
        }

        // Resolve conflict based on user selection
        async function resolveConflict() {
            const selectedLocal = localOption.classList.contains('selected');
            const selectedServer = serverOption.classList.contains('selected');
            
            if (!selectedLocal && !selectedServer) {
                showNotification('Please select an option', 'warning');
                return;
            }
            
            if (selectedLocal) {
                // Use local version and push to server
                await simulateServerCall(quotes, 'post');
                showNotification('Local version applied to server');
            } else {
                // Use server version
                const serverQuotes = getServerQuotes();
                quotes = serverQuotes;
                saveToLocalStorage();
                showNotification('Server version applied locally');
                
                // Update UI
                updateQuoteCounters();
                displayQuotes();
                generateRandomQuote();
            }
            
            // Clear conflict state
            syncState.hasConflicts = false;
            syncState.conflictData = null;
            viewConflictsBtn.style.display = 'none';
            setSyncStatus('success', 'Synced with server');
            
            hideConflictResolution();
        }

        // Force server version (override local)
        async function forceServerVersion() {
            if (confirm('This will overwrite all local changes with the server version. Continue?')) {
                const serverQuotes = await simulateServerCall(null, 'get');
                quotes = serverQuotes;
                saveToLocalStorage();
                
                // Update UI
                updateQuoteCounters();
                displayQuotes();
                generateRandomQuote();
                
                showNotification('Server version applied');
                setSyncStatus('success', 'Synced with server');
            }
        }

        // Force local version (push to server)
        async function forceLocalVersion() {
            if (confirm('This will overwrite the server with your local changes. Continue?')) {
                const success = await simulateServerCall(quotes, 'post');
                if (success) {
                    showNotification('Local version pushed to server');
                    setSyncStatus('success', 'Synced with server');
                } else {
                    showNotification('Failed to push local version to server', 'error');
                }
            }
        }

        // The rest of the functions (loadFromLocalStorage, saveToLocalStorage, populateCategories, 
        // generateRandomQuote, displayQuotes, etc.) remain the same as in the previous implementation
        // but are included in the full code for completeness

        // Load quotes and categories from local storage
        function loadFromLocalStorage() {
            const storedQuotes = localStorage.getItem('quotes');
            const storedCategories = localStorage.getItem('categories');
            
            if (storedQuotes) {
                try {
                    const parsedQuotes = JSON.parse(storedQuotes);
                    if (Array.isArray(parsedQuotes)) {
                        quotes = parsedQuotes;
                    }
                } catch (error) {
                    console.error('Error parsing quotes from local storage:', error);
                }
            }
            
            if (storedCategories) {
                try {
                    const parsedCategories = JSON.parse(storedCategories);
                    if (Array.isArray(parsedCategories)) {
                        categories = parsedCategories;
                    }
                } catch (error) {
                    console.error('Error parsing categories from local storage:', error);
                }
            }
        }

        // Save quotes and categories to local storage
        function saveToLocalStorage() {
            try {
                localStorage.setItem('quotes', JSON.stringify(quotes));
                localStorage.setItem('categories', JSON.stringify(categories));
                updateQuoteCounters();
            } catch (error) {
                console.error('Error saving data to local storage:', error);
                showNotification('Error saving data to local storage', 'error');
            }
        }

        // Update quote counters
        function updateQuoteCounters() {
            localCount.textContent = quotes.length;
            categoryCount.textContent = categories.length;
            
            // Update server count
            const serverQuotes = getServerQuotes();
            serverCount.textContent = serverQuotes.length;
        }

        // Populate categories in the filter dropdown and form
        function populateCategories() {
            // Clear existing options (except the first one in filter)
            while (categoryFilter.children.length > 1) {
                categoryFilter.removeChild(categoryFilter.lastChild);
            }
            
            // Clear category select in form
            categorySelect.innerHTML = '';
            
            // Add categories to both dropdowns
            categories.forEach(category => {
                // Add to filter dropdown
                const filterOption = document.createElement('option');
                filterOption.value = category;
                filterOption.textContent = category;
                categoryFilter.appendChild(filterOption);
                
                // Add to form select
                const formOption = document.createElement('option');
                formOption.value = category;
                formOption.textContent = category;
                categorySelect.appendChild(formOption);
            });
        }

        // Generate a random quote
        function generateRandomQuote() {
            if (quotes.length === 0) {
                quoteText.textContent = "No quotes available. Add some quotes first!";
                quoteAuthor.textContent = "";
                quoteCategories.innerHTML = "";
                return;
            }
            
            // Filter quotes based on current filters
            const filteredQuotes = filterQuotes(quotes);
            
            if (filteredQuotes.length === 0) {
                quoteText.textContent = "No quotes match your current filters. Try changing your filters.";
                quoteAuthor.textContent = "";
                quoteCategories.innerHTML = "";
                return;
            }
            
            const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
            const randomQuote = filteredQuotes[randomIndex];
            
            updateQuoteDisplay(randomQuote);
        }

        // Update the quote display with a given quote
        function updateQuoteDisplay(quote) {
            quoteText.textContent = `"${quote.text}"`;
            quoteAuthor.textContent = `- ${quote.author}`;
            
            // Display categories
            quoteCategories.innerHTML = '';
            if (quote.categories && quote.categories.length > 0) {
                quote.categories.forEach(cat => {
                    const categorySpan = document.createElement('span');
                    categorySpan.className = 'quote-category';
                    categorySpan.textContent = cat;
                    quoteCategories.appendChild(categorySpan);
                });
            }
        }

        // Filter quotes based on current filters
        function filterQuotes(quotesToFilter) {
            return quotesToFilter.filter(quote => {
                // Category filter
                if (currentFilters.category !== 'all') {
                    if (!quote.categories || !quote.categories.includes(currentFilters.category)) {
                        return false;
                    }
                }
                
                // Search filter
                if (currentFilters.search) {
                    const searchTerm = currentFilters.search.toLowerCase();
                    const quoteText = quote.text.toLowerCase();
                    const author = quote.author.toLowerCase();
                    
                    if (!quoteText.includes(searchTerm) && !author.includes(searchTerm)) {
                        return false;
                    }
                }
                
                return true;
            });
        }

        // Display all quotes (with filtering)
        function displayQuotes() {
            quotesContainer.innerHTML = '';
            
            const filteredQuotes = filterQuotes(quotes);
            
            if (filteredQuotes.length === 0) {
                quotesContainer.innerHTML = '<p>No quotes match your current filters.</p>';
                return;
            }
            
            filteredQuotes.forEach(quote => {
                const quoteItem = document.createElement('div');
                quoteItem.className = 'quote-item';
                
                const quoteHeader = document.createElement('div');
                quoteHeader.className = 'quote-item-header';
                
                const quoteText = document.createElement('p');
                quoteText.className = 'quote-text';
                quoteText.textContent = `"${quote.text}"`;
                
                const quoteAuthor = document.createElement('p');
                quoteAuthor.className = 'quote-author';
                quoteAuthor.textContent = `- ${quote.author}`;
                
                const quoteCategories = document.createElement('div');
                quoteCategories.className = 'quote-item-categories';
                
                if (quote.categories && quote.categories.length > 0) {
                    quote.categories.forEach(cat => {
                        const categorySpan = document.createElement('span');
                        categorySpan.className = 'quote-category';
                        categorySpan.textContent = cat;
                        quoteCategories.appendChild(categorySpan);
                    });
                }
                
                const lastUpdated = document.createElement('p');
                lastUpdated.className = 'last-updated';
                lastUpdated.textContent = `Last updated: ${new Date(quote.lastUpdated).toLocaleString()}`;
                
                quoteHeader.appendChild(quoteText);
                quoteItem.appendChild(quoteHeader);
                quoteItem.appendChild(quoteAuthor);
                quoteItem.appendChild(quoteCategories);
                quoteItem.appendChild(lastUpdated);
                
                quotesContainer.appendChild(quoteItem);
            });
        }

        // Apply filters
        function applyFilter() {
            currentFilters.category = categoryFilter.value;
            currentFilters.search = searchInput.value.trim();
            
            // Update active filters display
            updateActiveFilters();
            
            // Regenerate random quote and display quotes
            generateRandomQuote();
            displayQuotes();
            
            showNotification('Filters applied!');
        }

        // Clear filters
        function clearFilter() {
            categoryFilter.value = 'all';
            searchInput.value = '';
            currentFilters.category = 'all';
            currentFilters.search = '';
            
            // Update active filters display
            updateActiveFilters();
            
            // Regenerate random quote and display quotes
            generateRandomQuote();
            displayQuotes();
            
            showNotification('Filters cleared!');
        }

        // Update active filters display
        function updateActiveFilters() {
            activeFilters.innerHTML = '';
            
            if (currentFilters.category !== 'all') {
                const categoryTag = document.createElement('div');
                categoryTag.className = 'filter-tag';
                categoryTag.innerHTML = `Category: ${currentFilters.category} <span class="remove" onclick="removeCategoryFilter()">×</span>`;
                activeFilters.appendChild(categoryTag);
            }
            
            if (currentFilters.search) {
                const searchTag = document.createElement('div');
                searchTag.className = 'filter-tag';
                searchTag.innerHTML = `Search: "${currentFilters.search}" <span class="remove" onclick="removeSearchFilter()">×</span>`;
                activeFilters.appendChild(searchTag);
            }
        }

        // Remove category filter
        function removeCategoryFilter() {
            categoryFilter.value = 'all';
            currentFilters.category = 'all';
            applyFilter();
        }

        // Remove search filter
        function removeSearchFilter() {
            searchInput.value = '';
            currentFilters.search = '';
            applyFilter();
        }

        // Toggle the add quote form visibility
        function toggleAddQuoteForm() {
            if (addQuoteForm.style.display === 'none') {
                addQuoteForm.style.display = 'block';
                addQuoteBtn.textContent = 'Hide Form';
            } else {
                addQuoteForm.style.display = 'none';
                addQuoteBtn.textContent = 'Add New Quote';
                // Clear form
                quoteInput.value = '';
                authorInput.value = '';
                categorySelect.selectedIndex = -1;
                newCategoryInput.value = '';
            }
        }

        // Save a new quote
        function saveNewQuote() {
            const text = quoteInput.value.trim();
            const author = authorInput.value.trim();
            const newCategory = newCategoryInput.value.trim();
            
            if (!text || !author) {
                showNotification('Please fill in both the quote and author fields', 'error');
                return;
            }
            
            // Get selected categories
            const selectedCategories = Array.from(categorySelect.selectedOptions).map(option => option.value);
            
            // Add new category if provided
            if (newCategory && !categories.includes(newCategory)) {
                categories.push(newCategory);
                selectedCategories.push(newCategory);
            }
            
            const newQuote = { 
                id: generateId(),
                text, 
                author, 
                categories: selectedCategories,
                lastUpdated: Date.now()
            };
            
            quotes.push(newQuote);
            
            // Save to local storage
            saveToLocalStorage();
            
            // Update categories dropdowns
            populateCategories();
            
            // Clear form and hide it
            quoteInput.value = '';
            authorInput.value = '';
            categorySelect.selectedIndex = -1;
            newCategoryInput.value = '';
            toggleAddQuoteForm();
            
            // Update quotes display
            displayQuotes();
            
            // Mark that we have pending changes to sync
            syncState.pendingChanges = true;
            
            showNotification('Quote added successfully!');
        }

        // Export quotes to JSON file
        function exportToJson() {
            if (quotes.length === 0) {
                showNotification('No quotes to export', 'error');
                return;
            }
            
            try {
                const data = {
                    quotes: quotes,
                    categories: categories
                };
                
                const dataStr = JSON.stringify(data, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'quotes.json';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                showNotification('Quotes exported successfully!');
            } catch (error) {
                console.error('Error exporting quotes:', error);
                showNotification('Error exporting quotes', 'error');
            }
        }

        // Show import file input
        function showImportFileInput() {
            fileInputContainer.style.display = 'block';
            importBtn.style.display = 'none';
        }

        // Hide import file input
        function hideImportFileInput() {
            fileInputContainer.style.display = 'none';
            importBtn.style.display = 'inline-block';
            importFile.value = '';
        }

        // Import quotes from JSON file
        function importFromJson() {
            const file = importFile.files[0];
            
            if (!file) {
                showNotification('Please select a JSON file to import', 'error');
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(event) {
                try {
                    const importedData = JSON.parse(event.target.result);
                    
                    if (!importedData.quotes || !Array.isArray(importedData.quotes)) {
                        throw new Error('Invalid format: Expected an object with a quotes array');
                    }
                    
                    // Add imported quotes to our quotes array
                    importedData.quotes.forEach(quote => {
                        // Ensure each quote has an ID and timestamp
                        if (!quote.id) quote.id = generateId();
                        if (!quote.lastUpdated) quote.lastUpdated = Date.now();
                        quotes.push(quote);
                    });
                    
                    // Add new categories if provided
                    if (importedData.categories && Array.isArray(importedData.categories)) {
                        importedData.categories.forEach(cat => {
                            if (!categories.includes(cat)) {
                                categories.push(cat);
                            }
                        });
                    }
                    
                    // Save to local storage
                    saveToLocalStorage();
                    
                    // Update categories dropdowns
                    populateCategories();
                    
                    // Update quotes display
                    displayQuotes();
                    
                    // Mark that we have pending changes to sync
                    syncState.pendingChanges = true;
                    
                    // Hide import UI
                    hideImportFileInput();
                    
                    showNotification(`Successfully imported ${importedData.quotes.length} quotes!`);
                } catch (error) {
                    console.error('Error importing quotes:', error);
                    showNotification(`Error importing quotes: ${error.message}`, 'error');
                }
            };
            
            reader.onerror = function() {
                showNotification('Error reading file', 'error');
            };
            
            reader.readAsText(file);
        }

        // Show notification
        function showNotification(message, type = 'success') {
            notification.textContent = message;
            notification.className = 'notification';
            
            if (type === 'error') {
                notification.classList.add('error');
            } else if (type === 'warning') {
                notification.classList.add('warning');
            }
            
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        // Initialize the application when the DOM is loaded
        document.addEventListener('DOMContentLoaded', init);
