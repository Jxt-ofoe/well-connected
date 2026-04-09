const categories = [];

exports.getCategories = (req, res) => {
  res.json(categories);
};

exports.createCategory = (req, res) => {
  const { name } = req.body;
  let imageUrl = null;
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  }
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const newCategory = { id: Date.now(), name, image: imageUrl };
  categories.push(newCategory);
  res.status(201).json(newCategory);
};
