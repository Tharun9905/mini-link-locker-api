const express = require('express');
const { createItem, getItemsByAccessKey, deleteItem, exportItems } = require('../controllers/itemsController');

const itemsRouter = express.Router();

itemsRouter.post('/', createItem);
itemsRouter.get('/', getItemsByAccessKey);
itemsRouter.delete('/:id', deleteItem);
itemsRouter.get('/export', exportItems);

module.exports = { itemsRouter };
