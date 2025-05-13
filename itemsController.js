const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const { getItems, saveItems, filterExpiredItems } = require('../utils/storage');

// Create a new item
const createItem = async (req, res) => {
  const { access_key, title, url, tags, expires_at } = req.body;

  if (!access_key || !title || !url || !tags || !expires_at) {
    return res.status(400).send({ message: 'All fields are required.' });
  }

  const validUrl = /^(ftp|http|https):\/\/[^ "]+$/.test(url);
  if (!validUrl) {
    return res.status(400).send({ message: 'Invalid URL.' });
  }

  const expiryDate = new Date(expires_at);
  if (expiryDate <= new Date()) {
    return res.status(400).send({ message: 'Expiry date must be in the future.' });
  }

  const items = await getItems();
  const itemExists = items.find(item => item.access_key === access_key && item.title === title);
  if (itemExists) {
    return res.status(400).send({ message: 'Duplicate title for this access key.' });
  }

  const newItem = {
    id: uuidv4(),
    access_key,
    title,
    url,
    tags,
    expires_at
  };

  items.push(newItem);
  await saveItems(items);
  res.status(201).json(newItem);
};

// Get items by access key
const getItemsByAccessKey = async (req, res) => {
  const { access_key } = req.query;

  if (!access_key) {
    return res.status(400).send({ message: 'Access key is required.' });
  }

  let items = await getItems();
  items = filterExpiredItems(items);
  items = items.filter(item => item.access_key === access_key);

  res.status(200).json(items);
};

// Delete an item by ID
const deleteItem = async (req, res) => {
  const { id } = req.params;
  const { access_key } = req.query;

  let items = await getItems();
  const itemIndex = items.findIndex(item => item.id === id && item.access_key === access_key);

  if (itemIndex === -1) {
    return res.status(404).send({ message: 'Item not found.' });
  }

  items.splice(itemIndex, 1);
  await saveItems(items);
  res.status(200).send({ message: 'Item deleted.' });
};

// Export items as JSON
const exportItems = async (req, res) => {
  const { access_key } = req.query;

  if (!access_key) {
    return res.status(400).send({ message: 'Access key is required.' });
  }

  let items = await getItems();
  items = filterExpiredItems(items);
  items = items.filter(item => item.access_key === access_key);

  res.status(200).json(items);
};

module.exports = { createItem, getItemsByAccessKey, deleteItem, exportItems };
