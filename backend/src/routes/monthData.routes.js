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

module.exports = router;