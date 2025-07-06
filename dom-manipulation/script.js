let quotes = [];
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categorySelect = document.getElementById('categoryFilter');
const syncStatus = document.getElementById('syncStatus');

// Simulated server endpoint (read/write)
const MOCK_SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Simulated

// Load local quotes
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

// Save to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Save filter
function saveSelectedCategoryFilter(category) {
  localStorage.setItem('selectedCategoryFilter', category);
}

function loadSelectedCategoryFilter() {
  return localStorage.getItem('selectedCategoryFilter') || 'all';
}

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
}

// ---------- 🔄 Server Sync + Conflict Resolution ----------
function simulateServerFetch() {
  // Simulate server fetch (normally you'd GET your own quotes endpoint)
  return fetch(MOCK_SERVER_URL)
    .then(res => res.json())
    .then(data => {
      // Simulate server quotes (IDs 1-5) as incoming authoritative data
      return [
        { id: 1, text: "Updated server quote #1", category: "Motivation" },
        { id: 4, text: "Server quote #4", category: "Wisdom" },
        { id: 5, text: "Server quote #5", category: "Humor" }
      ];
    });
}

function syncWithServer() {
  simulateServerFetch()
    .then(serverQuotes => {
      let conflicts = 0;

      serverQuotes.forEach(serverQuote => {
        const index = quotes.findIndex(local => local.id === serverQuote.id);
        if (index > -1) {
          // Conflict: Replace local with server version
          quotes[index] = serverQuote;
          conflicts++;
        } else {
          quotes.push(serverQuote); // Add if new
        }
      });

      saveQuotes();
      populateCategories();
      filterQuotes();

      if (conflicts > 0) {
        notify(`Server sync completed with ${conflicts} conflict(s) resolved (server version used).`);
      } else {
        notify("Server sync completed. No conflicts.");
      }
    })
    .catch(() => notify("Server sync failed."));
}

function notify(message) {
  syncStatus.textContent = message;
  syncStatus.style.display = 'block';
  setTimeout(() => {
    syncStatus.style.display = 'none';
  }, 4000);
}

// Export/Import (unchanged)
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

// Init
loadQuotes();
createAddQuoteForm();
populateCategories();
filterQuotes();
newQuoteBtn.addEventListener('click', filterQuotes);

// Periodic sync every 30 seconds
setInterval(syncWithServer, 30000);
