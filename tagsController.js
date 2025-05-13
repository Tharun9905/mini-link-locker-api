const { getItems } = require('../utils/storage');

// Get all tags for a given access key
const getTags = async (req, res) => {
  const { access_key } = req.query;

  if (!access_key) {
    return res.status(400).send({ message: 'Access key is required.' });
  }

  let items = await getItems();
  items = items.filter(item => item.access_key === access_key);

  const tags = new Set();
  items.forEach(item => {
    item.tags.forEach(tag => tags.add(tag));
  });

  res.status(200).json(Array.from(tags));
};

module.exports = { getTags };
