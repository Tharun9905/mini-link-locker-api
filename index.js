const express = require('express');
const fs = require('fs-extra');

// Initialize the app
const app = express();
const port = 3000;

app.use(express.json());

// Sample in-memory data storage (replace with your actual storage or file)
const dataFilePath = './data.json';

let items = [];

// Function to load items from the JSON file
const loadItems = async () => {
    try {
        items = await fs.readJson(dataFilePath);
    } catch (err) {
        items = [];  // If no data file or error, initialize as empty array
    }
};

// Function to save items to the JSON file
const saveItems = async () => {
    await fs.writeJson(dataFilePath, items, { spaces: 2 });
};

// Function to retrieve items by access_key
function getItemsByAccessKey(accessKey) {
    return items.filter(item => item.access_key === accessKey && new Date(item.expires_at) > new Date());
}

// Function to clean up expired items
function cleanupExpiredItems() {
    const now = new Date();
    items = items.filter(item => new Date(item.expires_at) > now);
    console.log("Expired items cleaned up!");
}

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the Mini Link Locker API!');
});

// Route to get items by access key
app.get('/items', async (req, res) => {
    const { access_key } = req.query;
    if (!access_key) {
        return res.status(400).json({ message: "Access key is required." });
    }

    const itemsByKey = getItemsByAccessKey(access_key);
    return res.json(itemsByKey);
});

// Route to create a new item
app.post('/items', async (req, res) => {
    const { access_key, title, url, tags, expires_at } = req.body;

    // Basic validation
    if (!access_key || !title || !url || !tags || !expires_at) {
        return res.status(400).json({ message: "All fields are required." });
    }

    // Check for duplicate title within the same access key
    const existingItem = items.find(item => item.access_key === access_key && item.title === title);
    if (existingItem) {
        return res.status(400).json({ message: "Duplicate title for this access key." });
    }

    const newItem = {
        id: `${Date.now()}`,  // Generate unique ID based on timestamp
        access_key,
        title,
        url,
        tags,
        expires_at,
    };

    items.push(newItem);
    await saveItems(); // Save to file after adding new item
    return res.status(201).json(newItem);
});

// Route to delete an item by ID
app.delete('/items/:id', async (req, res) => {
    const { id } = req.params;
    const { access_key } = req.query;

    const itemIndex = items.findIndex(item => item.id === id && item.access_key === access_key);
    if (itemIndex !== -1) {
        items.splice(itemIndex, 1);
        await saveItems(); // Save to file after deleting item
        return res.json({ message: "Item deleted." });
    } else {
        return res.status(404).json({ message: "Item not found." });
    }
});

// Route to get tags for a specific access key
app.get('/tags', async (req, res) => {
    const { access_key } = req.query;
    if (!access_key) {
        return res.status(400).json({ message: "Access key is required." });
    }

    const tags = new Set();
    items.forEach(item => {
        if (item.access_key === access_key) {
            item.tags.forEach(tag => tags.add(tag));
        }
    });

    return res.json(Array.from(tags));
});

// Export links as JSON
app.get('/export', async (req, res) => {
    const accessKey = req.query.access_key;
    if (!accessKey) {
        return res.status(400).json({ message: "Access key is required." });
    }

    const itemsByAccessKey = getItemsByAccessKey(accessKey);
    return res.json(itemsByAccessKey);
});

// Background task to remove expired items every minute
setInterval(() => {
    cleanupExpiredItems();
    saveItems(); // Save to file after cleaning up expired items
}, 60000); // Cleanup expired items every 60 seconds

// Start the server
app.listen(port, async () => {
    await loadItems(); // Load data from file when the server starts
    console.log(`Mini Link Locker API running at http://localhost:${port}`);
});
