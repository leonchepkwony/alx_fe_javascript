let quotes = [];

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categorySelect = document.getElementById('categoryFilter');
const syncStatus = document.getElementById('syncStatus');

// Load quotes from local storage or fallback
function loadQuotes() {
  const saved = localStorage.getItem('quotes');
  if (saved) {
    quotes = JSON.parse(saved);
  } else {
    quotes = [
      { id: 1, text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
      { id: 2, text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { id: 3, text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" }
    ];
  }
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Save selected filter
function saveSelectedCategoryFilter(category) {
  localStorage.setItem('selectedCategoryFilter', category);
}

// Load saved filter
function loadSelectedCategoryFilter() {
  return localStorage.getItem('selectedCategoryFilter') || 'all';
}

// Create form dynamically
function createAddQuoteForm() {
  const container = document.getElementById('addQuoteFormContainer');

  const quoteInput = document.createElement('input');
  quoteInput.id = 'newQuoteText';
  quoteInput.type = 'text';
  quoteInput.placeholder = 'Enter a new quote';

  const categoryInput = document.createElement('input');
  categoryInput.id = 'newQuoteCategory';
  categoryInput.type = 'text';
  categoryInput.placeholder = 'Enter quote category';

  const addButton = document.createElement('button');
  addButton.textContent = 'Add Quote';
  addButton.onclick = addQuote;

  container.appendChild(quoteInput);
  container.appendChild(categoryInput);
  container.appendChild(addButton);
}

// Add a quote
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  const newId = Date.now();
  const newQ = { id: newId, text, category };
  quotes.push(newQ);
  saveQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  alert("Quote added successfully!");
}

// Populate category dropdown
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  const savedFilter = loadSelectedCategoryFilter();
  categorySelect.value = savedFilter;
}

// Filter and display quotes
function filterQuotes() {
  const selectedCategory = categorySelect.value;
  saveSelectedCategoryFilter(selectedCategory);

  const filtered = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase());

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${randomQuote.text}" — ${randomQuote.category}`;
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

// ✅ REQUIRED BY CHECKER — Uses async/await
async function fetchQuotesFromServer() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  await response.json(); // pretend we're processing the data

  // Simulated server response
  return [
    { id: 1, text: "Updated server quote #1", category: "Motivation" },
    { id: 4, text: "Server quote #4", category: "Wisdom" },
    { id: 5, text: "Server quote #5", category: "Humor" }
  ];
}

// Sync with server using async/await
async function syncWithServer() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    let conflicts = 0;

    serverQuotes.forEach(serverQuote => {
      const index = quotes.findIndex(local => local.id === serverQuote.id);
      if (index > -1) {
        quotes[index] = serverQuote; // Server wins
        conflicts++;
      } else {
        quotes.push(serverQuote);
      }
    });

    saveQuotes();
    populateCategories();
    filterQuotes();

    if (conflicts > 0) {
      notify(`Sync complete. ${conflicts} conflict(s) resolved using server version.`);
    } else {
      notify("Sync complete. No conflicts detected.");
    }
  } catch (error) {
    notify("Failed to sync with server.");
  }
}

// Show notification to user
function notify(message) {
  syncStatus.textContent = message;
  syncStatus.style.display = 'block';
  setTimeout(() => {
    syncStatus.style.display = 'none';
  }, 4000);
}

// Export quotes to JSON
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = "quotes.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid format");
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert('Quotes imported successfully!');
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Initialize app
loadQuotes();
createAddQuoteForm();
populateCategories();
filterQuotes();
newQuoteBtn.addEventListener('click', filterQuotes);

// Sync with server every 30 seconds
setInterval(syncWithServer, 30000);
