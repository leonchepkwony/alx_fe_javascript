let quotes = [];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categorySelect = document.getElementById('categorySelect');

// Load from localStorage on startup
function loadQuotes() {
  const saved = localStorage.getItem('quotes');
  if (saved) {
    quotes = JSON.parse(saved);
  } else {
    quotes = [
      { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" }
    ];
  }
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Save last quote to sessionStorage
function saveLastViewedQuote(quote) {
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// Restore last viewed quote from sessionStorage
function loadLastViewedQuote() {
  const last = sessionStorage.getItem('lastViewedQuote');
  if (last) {
    const q = JSON.parse(last);
    quoteDisplay.textContent = `"${q.text}" — ${q.category}`;
  }
}

// Create add quote form dynamically
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

  const newQ = { text, category };
  quotes.push(newQ);
  saveQuotes();
  loadCategories();

  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  alert("Quote added successfully!");
}

// Load categories
function loadCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = '<option value="all">All</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// Show random quote
function showRandomQuote() {
  const selected = categorySelect.value;
  const filtered = selected === 'all'
    ? quotes
    : quotes.filter(q => q.category.toLowerCase() === selected.toLowerCase());

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes in this category.";
    return;
  }

  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${randomQuote.text}" — ${randomQuote.category}`;
  saveLastViewedQuote(randomQuote);
}

// Export to JSON
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

// Import from JSON
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid format");
      quotes.push(...importedQuotes);
      saveQuotes();
      loadCategories();
      alert('Quotes imported successfully!');
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Init
loadQuotes();
loadCategories();
createAddQuoteForm();
loadLastViewedQuote();
newQuoteBtn.addEventListener('click', showRandomQuote);
