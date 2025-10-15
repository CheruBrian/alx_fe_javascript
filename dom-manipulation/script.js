// script.js - Dynamic Quote Generator with Web Storage & Category Filtering

// Initialize quotes array with default quotes
let quotes = [
    { 
        text: "The only way to do great work is to love what you do.", 
        author: "Steve Jobs", 
        categories: ["Motivation", "Work"] 
    },
    { 
        text: "Innovation distinguishes between a leader and a follower.", 
        author: "Steve Jobs", 
        categories: ["Leadership", "Innovation"] 
    },
    { 
        text: "Your time is limited, don't waste it living someone else's life.", 
        author: "Steve Jobs", 
        categories: ["Life", "Time Management"] 
    },
    { 
        text: "Stay hungry, stay foolish.", 
        author: "Steve Jobs", 
        categories: ["Motivation", "Wisdom"] 
    },
    { 
        text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", 
        author: "Nelson Mandela", 
        categories: ["Perseverance", "Life"] 
    },
    { 
        text: "The way to get started is to quit talking and begin doing.", 
        author: "Walt Disney", 
        categories: ["Action", "Motivation"] 
    },
    { 
        text: "If life were predictable it would cease to be life, and be without flavor.", 
        author: "Eleanor Roosevelt", 
        categories: ["Life", "Wisdom"] 
    }
];

// Initialize categories array
let categories = ["Motivation", "Work", "Leadership", "Innovation", "Life", "Time Management", "Wisdom", "Perseverance", "Action"];

// Current filter state
let currentFilters = {
    category: 'all',
    search: ''
};

// DOM Elements
let quoteText, quoteAuthor, quoteCategories, generateBtn, addQuoteBtn, addQuoteForm;
let quoteInput, authorInput, categorySelect, newCategoryInput, saveQuoteBtn, cancelBtn;
let categoryFilter, searchInput, applyFilters, clearFilters, activeFilters;
let localCount, categoryCount, sessionInfo, filterInfo, exportBtn, importBtn;
let fileInputContainer, importFile, processImportBtn, cancelImportBtn, notification, quotesContainer;

// Initialize the application
function init() {
    // Initialize DOM elements
    initializeDOMElements();
    
    // Load quotes and categories from local storage if available
    loadFromLocalStorage();
    
    // Check if there's a last viewed quote in session storage
    loadLastQuoteFromSessionStorage();
    
    // Check if there's a last filter in session storage
    loadLastFilterFromSessionStorage();
    
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
    sessionInfo = document.getElementById('sessionInfo');
    filterInfo = document.getElementById('filterInfo');
    exportBtn = document.getElementById('exportBtn');
    importBtn = document.getElementById('importBtn');
    fileInputContainer = document.getElementById('fileInputContainer');
    importFile = document.getElementById('importFile');
    processImportBtn = document.getElementById('processImportBtn');
    cancelImportBtn = document.getElementById('cancelImportBtn');
    notification = document.getElementById('notification');
    quotesContainer = document.getElementById('quotesContainer');
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
}

// Load quotes and categories from local storage
function loadFromLocalStorage() {
    const storedQuotes = localStorage.getItem('quotes');
    const storedCategories = localStorage.getItem('categories');
    
    if (storedQuotes) {
        try {
            const parsedQuotes = JSON.parse(storedQuotes);
            if (Array.isArray(parsedQuotes)) {
                quotes = parsedQuotes;
                showNotification('Quotes loaded from local storage!');
            }
        } catch (error) {
            console.error('Error parsing quotes from local storage:', error);
            showNotification('Error loading quotes from local storage', true);
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
        showNotification('Data saved to local storage!');
    } catch (error) {
        console.error('Error saving data to local storage:', error);
        showNotification('Error saving data to local storage', true);
    }
}

// Load last quote from session storage
function loadLastQuoteFromSessionStorage() {
    const lastQuote = sessionStorage.getItem('lastQuote');
    if (lastQuote) {
        try {
            const quote = JSON.parse(lastQuote);
            updateQuoteDisplay(quote);
            sessionInfo.textContent = `Last viewed: "${quote.text}" by ${quote.author}`;
        } catch (error) {
            console.error('Error parsing last quote from session storage:', error);
        }
    }
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

// Load last filter from session storage
function loadLastFilterFromSessionStorage() {
    const lastFilter = sessionStorage.getItem('lastFilter');
    if (lastFilter) {
        try {
            const filter = JSON.parse(lastFilter);
            currentFilters = filter;
            
            // Apply the filter
            categoryFilter.value = filter.category;
            searchInput.value = filter.search;
            
            // Update active filters display
            updateActiveFilters();
            
            filterInfo.textContent = `Last filter: ${filter.category !== 'all' ? filter.category : 'All categories'}${filter.search ? `, search: "${filter.search}"` : ''}`;
        } catch (error) {
            console.error('Error parsing last filter from session storage:', error);
        }
    }
}

// Save current quote to session storage
function saveCurrentQuoteToSessionStorage(quote) {
    try {
        sessionStorage.setItem('lastQuote', JSON.stringify(quote));
    } catch (error) {
        console.error('Error saving quote to session storage:', error);
    }
}

// Save current filter to session storage
function saveCurrentFilterToSessionStorage() {
    try {
        sessionStorage.setItem('lastFilter', JSON.stringify(currentFilters));
    } catch (error) {
        console.error('Error saving filter to session storage:', error);
    }
}

// Update quote counters
function updateQuoteCounters() {
    localCount.textContent = quotes.length;
    categoryCount.textContent = categories.length;
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
    
    // Save to session storage
    saveCurrentQuoteToSessionStorage(randomQuote);
    sessionInfo.textContent = `Last viewed: "${randomQuote.text}" by ${randomQuote.author}`;
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
        
        quoteHeader.appendChild(quoteText);
        quoteItem.appendChild(quoteHeader);
        quoteItem.appendChild(quoteAuthor);
        quoteItem.appendChild(quoteCategories);
        
        quotesContainer.appendChild(quoteItem);
    });
}

// Apply filters
function applyFilter() {
    currentFilters.category = categoryFilter.value;
    currentFilters.search = searchInput.value.trim();
    
    // Save to session storage
    saveCurrentFilterToSessionStorage();
    
    // Update active filters display
    updateActiveFilters();
    
    // Regenerate random quote and display quotes
    generateRandomQuote();
    displayQuotes();
    
    filterInfo.textContent = `Last filter: ${currentFilters.category !== 'all' ? currentFilters.category : 'All categories'}${currentFilters.search ? `, search: "${currentFilters.search}"` : ''}`;
    
    showNotification('Filters applied!');
}

// Clear filters
function clearFilter() {
    categoryFilter.value = 'all';
    searchInput.value = '';
    currentFilters.category = 'all';
    currentFilters.search = '';
    
    // Save to session storage
    saveCurrentFilterToSessionStorage();
    
    // Update active filters display
    updateActiveFilters();
    
    // Regenerate random quote and display quotes
    generateRandomQuote();
    displayQuotes();
    
    filterInfo.textContent = 'No filter saved in session';
    
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
        showNotification('Please fill in both the quote and author fields', true);
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
        text, 
        author, 
        categories: selectedCategories 
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
    
    showNotification('Quote added successfully!');
}

// Export quotes to JSON file
function exportToJson() {
    if (quotes.length === 0) {
        showNotification('No quotes to export', true);
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
        showNotification('Error exporting quotes', true);
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
        showNotification('Please select a JSON file to import', true);
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);
            
            if (!importedData.quotes || !Array.isArray(importedData.quotes)) {
                throw new Error('Invalid format: Expected an object with a quotes array');
            }
            
            // Validate each quote has text and author
            for (let i = 0; i < importedData.quotes.length; i++) {
                if (!importedData.quotes[i].text || !importedData.quotes[i].author) {
                    throw new Error(`Invalid quote at index ${i}: Missing text or author`);
                }
            }
            
            // Add imported quotes to our quotes array
            quotes.push(...importedData.quotes);
            
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
            
            // Hide import UI
            hideImportFileInput();
            
            showNotification(`Successfully imported ${importedData.quotes.length} quotes!`);
        } catch (error) {
            console.error('Error importing quotes:', error);
            showNotification(`Error importing quotes: ${error.message}`, true);
        }
    };
    
    reader.onerror = function() {
        showNotification('Error reading file', true);
    };
    
    reader.readAsText(file);
}

// Show notification
function showNotification(message, isError = false) {
    notification.textContent = message;
    notification.className = 'notification';
    
    if (isError) {
        notification.classList.add('error');
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
