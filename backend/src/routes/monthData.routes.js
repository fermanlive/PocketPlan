const express = require('express');
const router = express.Router();
const monthDataService = require('../services/monthDataService');

router.get('/month-data', async (req, res) => {
  try {
    const data = await monthDataService.getAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/month-data/:id', async (req, res) => {
  try {
    const data = await monthDataService.getById(req.params.id);
    if (!data) {
      return res.status(404).json({ error: 'Month data not found' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/month-data/year/:year', async (req, res) => {
  try {
    const data = await monthDataService.getByYear(parseInt(req.params.year));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/month-data/year/:year/month/:month', async (req, res) => {
  try {
    const data = await monthDataService.getByYearMonth(
      parseInt(req.params.year),
      parseInt(req.params.month)
    );
    if (!data) {
      return res.status(404).json({ error: 'Month data not found' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/month-data/:id/categories', async (req, res) => {
  try {
    const categories = await monthDataService.getCategoriesByMonth(req.params.id);
    if (!categories) {
      return res.status(404).json({ error: 'Month data not found' });
    }
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/month-data/:id/categories/:categoryId', async (req, res) => {
  try {
    const category = await monthDataService.getCategoryById(
      req.params.id,
      req.params.categoryId
    );
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/month-data/:id/expenses', async (req, res) => {
  try {
    const expenses = await monthDataService.getExpensesByMonth(req.params.id);
    if (!expenses) {
      return res.status(404).json({ error: 'Month data not found' });
    }
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/month-data/:id/weekly-budgets', async (req, res) => {
  try {
    const budgets = await monthDataService.getWeeklyBudgetsByMonth(req.params.id);
    if (!budgets) {
      return res.status(404).json({ error: 'Month data not found' });
    }
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/month-data/:id/savings', async (req, res) => {
  try {
    const savings = await monthDataService.getSavingsByMonth(req.params.id);
    if (!savings) {
      return res.status(404).json({ error: 'Month data not found' });
    }
    res.json(savings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/month-data/:monthId/categories/:categoryId/items/:itemId', async (req, res) => {
  try {
    const { monthId, categoryId, itemId } = req.params;
    const { name, amount } = req.body;
    
    if (amount !== undefined && (typeof amount !== 'number' || amount < 0)) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const item = await monthDataService.updateItem(monthId, categoryId, itemId, { name, amount });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/month-data/:monthId/categories/:categoryId/items/:itemId', async (req, res) => {
  try {
    const { monthId, categoryId, itemId } = req.params;
    
    const deleted = await monthDataService.deleteItem(monthId, categoryId, itemId);
    if (!deleted) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/month-data/:monthId/categories/:categoryId/items', async (req, res) => {
  try {
    const { monthId, categoryId } = req.params;
    const { name, amount, icon, subcategoriaId } = req.body;

    if (amount !== undefined && (typeof amount !== 'number' || amount < 0)) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const item = await monthDataService.createItem(monthId, categoryId, {
      name,
      amount,
      icon,
      subcategoriaId
    });
    if (!item) {
      return res.status(404).json({ error: 'Month or category not found' });
    }
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/subcategories', async (req, res) => {
  try {
    const subcategories = await monthDataService.getAllSubcategories();
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/subcategories/category/:categoriaPadreId', async (req, res) => {
  try {
    const subcategories = await monthDataService.getSubcategoriesByCategory(req.params.categoriaPadreId);
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/subcategories/:id', async (req, res) => {
  try {
    const subcategory = await monthDataService.getSubcategoryById(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    res.json(subcategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/subcategories', async (req, res) => {
  try {
    const { id, name, icon, categoriaPadreId } = req.body;
    
    if (!id || !name || !categoriaPadreId) {
      return res.status(400).json({ error: 'id, name, and categoriaPadreId are required' });
    }

    const subcategory = await monthDataService.createSubcategory({
      id,
      name,
      icon: icon || 'Circle',
      categoriaPadreId
    });
    res.status(201).json(subcategory);
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/subcategories/:id', async (req, res) => {
  try {
    const { name, icon, categoriaPadreId } = req.body;
    const subcategory = await monthDataService.updateSubcategory(req.params.id, {
      name,
      icon,
      categoriaPadreId
    });
    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    res.json(subcategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/subcategories/:id', async (req, res) => {
  try {
    const deleted = await monthDataService.deleteSubcategory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    res.json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
