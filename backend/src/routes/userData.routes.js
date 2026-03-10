const express = require('express');
const router = express.Router();
const monthDataService = require('../services/monthDataService');

// ─── Savings ────────────────────────────────────────────────────────────────────

router.get('/savings', async (req, res) => {
  try {
    const data = await monthDataService.getUserSavings(req.user.id);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/savings', async (req, res) => {
  try {
    const { name, amount, date } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    if (amount === undefined || typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({ error: 'amount must be a non-negative number' });
    }
    const result = await monthDataService.createUserSaving({ name, amount, date }, req.user.id);
    res.status(201).json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/savings/:id', async (req, res) => {
  try {
    const { name, amount, date } = req.body;
    if (amount !== undefined && (typeof amount !== 'number' || amount < 0)) {
      return res.status(400).json({ error: 'amount must be a non-negative number' });
    }
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (amount !== undefined) updates.amount = amount;
    if (date !== undefined) updates.date = date;
    const result = await monthDataService.updateUserSaving(req.params.id, updates, req.user.id);
    if (!result) return res.status(404).json({ error: 'Saving not found' });
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/savings/:id', async (req, res) => {
  try {
    const ok = await monthDataService.deleteUserSaving(req.params.id, req.user.id);
    if (!ok) return res.status(404).json({ error: 'Saving not found' });
    res.status(204).end();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Debts ──────────────────────────────────────────────────────────────────────

router.get('/debts', async (req, res) => {
  try {
    const data = await monthDataService.getUserDebts(req.user.id);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/debts', async (req, res) => {
  try {
    const result = await monthDataService.createUserDebt(req.body, req.user.id);
    res.status(201).json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/debts/:id', async (req, res) => {
  try {
    const result = await monthDataService.updateUserDebt(req.params.id, req.body, req.user.id);
    if (!result) return res.status(404).json({ error: 'Debt not found' });
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/debts/:id', async (req, res) => {
  try {
    const ok = await monthDataService.deleteUserDebt(req.params.id, req.user.id);
    if (!ok) return res.status(404).json({ error: 'Debt not found' });
    res.status(204).end();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Extra Funds ─────────────────────────────────────────────────────────────────

router.get('/extra-funds', async (req, res) => {
  try {
    const data = await monthDataService.getUserExtraFunds(req.user.id);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/extra-funds', async (req, res) => {
  try {
    const result = await monthDataService.createUserExtraFund(req.body, req.user.id);
    res.status(201).json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/extra-funds/:fundId', async (req, res) => {
  try {
    const result = await monthDataService.updateUserExtraFund(req.params.fundId, req.body, req.user.id);
    if (!result) return res.status(404).json({ error: 'Fund not found' });
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/extra-funds/:fundId', async (req, res) => {
  try {
    const ok = await monthDataService.deleteUserExtraFund(req.params.fundId, req.user.id);
    if (!ok) return res.status(404).json({ error: 'Fund not found' });
    res.status(204).end();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/extra-funds/:fundId/items', async (req, res) => {
  try {
    const result = await monthDataService.createUserExtraFundItem(req.params.fundId, req.body, req.user.id);
    if (!result) return res.status(404).json({ error: 'Fund not found' });
    res.status(201).json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/extra-funds/:fundId/items/:itemId', async (req, res) => {
  try {
    const result = await monthDataService.updateUserExtraFundItem(
      req.params.fundId, req.params.itemId, req.body, req.user.id
    );
    if (!result) return res.status(404).json({ error: 'Item not found' });
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/extra-funds/:fundId/items/:itemId', async (req, res) => {
  try {
    const ok = await monthDataService.deleteUserExtraFundItem(
      req.params.fundId, req.params.itemId, req.user.id
    );
    if (!ok) return res.status(404).json({ error: 'Item not found' });
    res.status(204).end();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
