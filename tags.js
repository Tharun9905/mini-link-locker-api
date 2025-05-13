const express = require('express');
const { getTags } = require('../controllers/tagsController');

const tagsRouter = express.Router();

tagsRouter.get('/', getTags);

module.exports = { tagsRouter };
