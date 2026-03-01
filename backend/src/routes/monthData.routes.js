const express = require('express');
const router = express.Router();
const monthDataService = require('../services/monthDataService');

router.get('/month-data', async (req, res) => {
  try {
    const data = await monthDataService.getAll(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/month-data', async (req, res) => {
  try {
    const { year, month, salary } = req.body;

    if (!year || typeof year !== 'number') {
      return res.status(400).json({ error: 'year is required and must be a number' });
    }
    if (!month || typeof month !== 'number' || month < 1 || month > 12) {
      return res.status(400).json({ error: 'month is required and must be between 1 and 12' });
    }
    if (!salary || typeof salary !== 'number' || salary < 0) {
      return res.status(400).json({ error: 'salary is required and must be a non-negative number' });
    }

    const newMonth = await monthDataService.createMonth(year, month, salary, req.user.id);
    res.status(201).json(newMonth);
  } catch (error) {
    if (error.message && error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/month-data/:id', async (req, res) => {
  try {
    const deleted = await monthDataService.deleteMonth(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Month not found' });
    }
    res.json({ message: 'Month deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/month-data/:id', async (req, res) => {
  try {
    const data = await monthDataService.getById(req.params.id, req.user.id);
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
    const data = await monthDataService.getByYear(parseInt(req.params.year), req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/month-data/year/:year/month/:month', async (req, res) => {
  try {
    const data = await monthDataService.getByYearMonth(
      parseInt(req.params.year),
      parseInt(req.params.month),
      req.user.id
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
    const categories = await monthDataService.getCategoriesByMonth(req.params.id, req.user.id);
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
      req.params.categoryId,
      req.user.id
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
    const expenses = await monthDataService.getExpensesByMonth(req.params.id, req.user.id);
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
    const budgets = await monthDataService.getWeeklyBudgetsByMonth(req.params.id, req.user.id);
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
    const savings = await monthDataService.getSavingsByMonth(req.params.id, req.user.id);
    if (!savings) {
      return res.status(404).json({ error: 'Month data not found' });
    }
    res.json(savings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/month-data/:monthId/savings', async (req, res) => {
  try {
    const { monthId } = req.params;
    const { name, amount, date } = req.body;

    if (!name) return res.status(400).json({ error: 'name is required' });
    if (amount === undefined || typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({ error: 'amount must be a non-negative number' });
    }

    const saving = await monthDataService.createSaving(monthId, { name, amount, date }, req.user.id);
    if (!saving) return res.status(404).json({ error: 'Month not found' });
    res.status(201).json(saving);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/month-data/:monthId/savings/:savingId', async (req, res) => {
  try {
    const { monthId, savingId } = req.params;
    const { name, amount, date } = req.body;

    if (amount !== undefined && (typeof amount !== 'number' || amount < 0)) {
      return res.status(400).json({ error: 'amount must be a non-negative number' });
    }

    const saving = await monthDataService.updateSaving(monthId, savingId, { name, amount, date }, req.user.id);
    if (!saving) return res.status(404).json({ error: 'Saving not found' });
    res.json(saving);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/month-data/:monthId/savings/:savingId', async (req, res) => {
  try {
    const { monthId, savingId } = req.params;
    const deleted = await monthDataService.deleteSaving(monthId, savingId, req.user.id);
    if (!deleted) return res.status(404).json({ error: 'Saving not found' });
    res.json({ message: 'Saving deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/month-data/:monthId/debts', async (req, res) => {
  try {
    const result = await monthDataService.createDebt(req.params.monthId, req.body, req.user.id);
    if (!result) return res.status(404).json({ error: 'Month not found' });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/month-data/:monthId/debts/:debtId', async (req, res) => {
  try {
    const result = await monthDataService.updateDebt(
      req.params.monthId, req.params.debtId, req.body, req.user.id
    );
    if (!result) return res.status(404).json({ error: 'Debt not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/month-data/:monthId/debts/:debtId', async (req, res) => {
  try {
    const ok = await monthDataService.deleteDebt(
      req.params.monthId, req.params.debtId, req.user.id
    );
    if (!ok) return res.status(404).json({ error: 'Debt not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/month-data/:monthId/categories', async (req, res) => {
  try {
    const { monthId } = req.params;
    const { name, percentage, color } = req.body;

    if (!name) return res.status(400).json({ error: 'name is required' });
    if (percentage === undefined || percentage < 0 || percentage > 100) {
      return res.status(400).json({ error: 'percentage must be between 0 and 100' });
    }

    const category = await monthDataService.createCategory(monthId, { name, percentage, color }, req.user.id);
    if (!category) return res.status(404).json({ error: 'Month not found' });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/month-data/:monthId/categories/:catId', async (req, res) => {
  try {
    const { monthId, catId } = req.params;
    const { name, percentage, color } = req.body;

    if (percentage !== undefined && (percentage < 0 || percentage > 100)) {
      return res.status(400).json({ error: 'percentage must be between 0 and 100' });
    }

    const category = await monthDataService.updateCategory(monthId, catId, { name, percentage, color }, req.user.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/month-data/:monthId/categories/:catId', async (req, res) => {
  try {
    const { monthId, catId } = req.params;
    const deleted = await monthDataService.deleteCategory(monthId, catId, req.user.id);
    if (!deleted) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/month-data/:monthId/categories/:categoryId/items/:itemId', async (req, res) => {
  try {
    const { monthId, categoryId, itemId } = req.params;
    const { name, amount, icon, periodic } = req.body;

    if (amount !== undefined && (typeof amount !== 'number' || amount < 0)) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (amount !== undefined) updates.amount = amount;
    if (icon !== undefined) updates.icon = icon;
    if (periodic !== undefined) updates.periodic = periodic;

    const item = await monthDataService.updateItem(monthId, categoryId, itemId, updates, req.user.id);
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

    const deleted = await monthDataService.deleteItem(monthId, categoryId, itemId, req.user.id);
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
    }, req.user.id);
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
