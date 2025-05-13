const fs = require('fs-extra');
const path = require('path');

const itemsFilePath = path.join(__dirname, '../data/db.json');

// Read items from the JSON file
const getItems = async () => {
  try {
    const items = await fs.readJson(itemsFilePath);
    return items || [];
  } catch (err) {
    return [];
  }
};

// Write items to the JSON file
const saveItems = async (items) => {
  await fs.writeJson(itemsFilePath, items);
};

// Filter out expired items
const filterExpiredItems = (items) => {
  const currentTime = new Date();
  return items.filter(item => new Date(item.expires_at) > currentTime);
};

// Clean up expired items every 60 seconds
const cleanupExpiredItems = async () => {
  let items = await getItems();
  items = filterExpiredItems(items);
  await saveItems(items);
};

module.exports = { getItems, saveItems, filterExpiredItems, cleanupExpiredItems };
