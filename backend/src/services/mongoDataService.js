const path = require('path');
const fs = require('fs');
const MonthData = require('../models/MonthData');
const Subcategory = require('../models/Subcategory');

// ─── Seed helpers ──────────────────────────────────────────────────────────────

async function seedIfEmpty() {
  const monthCount = await MonthData.countDocuments();
  if (monthCount === 0) {
    const mockDataPath = path.join(__dirname, '../../data/mock.json');
    try {
      const raw = fs.readFileSync(mockDataPath, 'utf8');
      const months = JSON.parse(raw);
      const arr = Array.isArray(months) ? months : [months];
      await MonthData.insertMany(arr, { ordered: false });
      console.log(`[Seed] Inserted ${arr.length} months from mock.json`);
    } catch (err) {
      console.warn('[Seed] Could not seed months:', err.message);
    }
  }

  const subCount = await Subcategory.countDocuments();
  if (subCount === 0) {
    const subPath = path.join(__dirname, '../../data/subcategories.json');
    try {
      const raw = fs.readFileSync(subPath, 'utf8');
      const { subcategories } = JSON.parse(raw);
      if (Array.isArray(subcategories) && subcategories.length > 0) {
        await Subcategory.insertMany(subcategories, { ordered: false });
        console.log(`[Seed] Inserted ${subcategories.length} subcategories`);
      }
    } catch (err) {
      console.warn('[Seed] Could not seed subcategories:', err.message);
    }
  }
}

// ─── Month CRUD ────────────────────────────────────────────────────────────────

async function getAll(userId) {
  return MonthData.find({ userId: userId || null }).lean();
}

async function getById(id, userId) {
  return MonthData.findOne({ id, userId: userId || null }).lean();
}

async function getByYear(year, userId) {
  return MonthData.find({ year, userId: userId || null }).lean();
}

async function getByYearMonth(year, month, userId) {
  return MonthData.findOne({ year, month, userId: userId || null }).lean();
}

async function getCategoriesByMonth(id, userId) {
  const doc = await getById(id, userId);
  return doc ? doc.categories : null;
}

async function getCategoryById(monthId, categoryId, userId) {
  const doc = await getById(monthId, userId);
  if (!doc) return null;
  return doc.categories.find(c => c.id === categoryId) || null;
}

async function getExpensesByMonth(monthId, userId) {
  const doc = await getById(monthId, userId);
  if (!doc) return null;
  const expenses = [];
  doc.categories.forEach(category => {
    (category.items || []).forEach(item => {
      expenses.push({
        ...item,
        categoryId: category.id,
        categoryName: category.name,
        categoryColor: category.color,
      });
    });
  });
  return expenses;
}

async function getWeeklyBudgetsByMonth(id, userId) {
  const doc = await getById(id, userId);
  return doc ? doc.weeklyBudgets : null;
}

async function getSavingsByMonth(id, userId) {
  const doc = await getById(id, userId);
  return doc ? doc.savings : null;
}

// ─── Category CRUD ─────────────────────────────────────────────────────────────

async function createCategory(monthId, { name, percentage, color }, userId) {
  const filter = { id: monthId, userId: userId || null };
  const doc = await MonthData.findOne(filter).lean();
  if (!doc) return null;

  const newCategory = {
    id: `cat-${Date.now()}`,
    name,
    percentage,
    budget: Math.round((doc.salary * percentage) / 100),
    color: color || 'chart-1',
    items: [],
  };

  const updated = await MonthData.findOneAndUpdate(
    filter,
    { $push: { categories: newCategory } },
    { new: true }
  ).lean();

  return updated.categories.find(c => c.id === newCategory.id) || null;
}

async function updateCategory(monthId, categoryId, { name, percentage, color }, userId) {
  const filter = { id: monthId, userId: userId || null };
  const doc = await MonthData.findOne(filter).lean();
  if (!doc) return null;

  const category = doc.categories.find(c => c.id === categoryId);
  if (!category) return null;

  const setFields = {};
  if (name !== undefined) setFields['categories.$[cat].name'] = name;
  if (color !== undefined) setFields['categories.$[cat].color'] = color;
  if (percentage !== undefined) {
    setFields['categories.$[cat].percentage'] = percentage;
    setFields['categories.$[cat].budget'] = Math.round((doc.salary * percentage) / 100);
  }

  const updated = await MonthData.findOneAndUpdate(
    filter,
    { $set: setFields },
    { arrayFilters: [{ 'cat.id': categoryId }], new: true }
  ).lean();

  return updated.categories.find(c => c.id === categoryId) || null;
}

async function deleteCategory(monthId, categoryId, userId) {
  const updated = await MonthData.findOneAndUpdate(
    { id: monthId, userId: userId || null },
    { $pull: { categories: { id: categoryId } } },
    { new: true }
  ).lean();
  return !!updated;
}

// ─── Item CRUD ─────────────────────────────────────────────────────────────────

async function createItem(monthId, categoryId, item, userId) {
  if (item.amount !== undefined) {
    if (typeof item.amount !== 'number' || item.amount < 0) {
      throw new Error('Amount must be a positive number');
    }
  }

  const newItem = {
    id: `${categoryId}-${Date.now()}`,
    name: item.name || 'Nuevo gasto',
    amount: item.amount || 0,
    icon: item.icon || 'Circle',
    periodic: item.periodic || false,
    subcategoriaId: item.subcategoriaId || null,
  };

  const updated = await MonthData.findOneAndUpdate(
    { id: monthId, userId: userId || null, 'categories.id': categoryId },
    { $push: { 'categories.$.items': newItem } },
    { new: true }
  ).lean();

  if (!updated) return null;
  const cat = updated.categories.find(c => c.id === categoryId);
  return cat ? cat.items.find(i => i.id === newItem.id) || null : null;
}

async function updateItem(monthId, categoryId, itemId, updates, userId) {
  if (updates.amount !== undefined) {
    if (typeof updates.amount !== 'number' || updates.amount < 0) {
      throw new Error('Amount must be a positive number');
    }
  }

  const setFields = {};
  for (const [key, val] of Object.entries(updates)) {
    setFields[`categories.$[cat].items.$[item].${key}`] = val;
  }

  const updated = await MonthData.findOneAndUpdate(
    { id: monthId, userId: userId || null },
    { $set: setFields },
    {
      arrayFilters: [{ 'cat.id': categoryId }, { 'item.id': itemId }],
      new: true,
    }
  ).lean();

  if (!updated) return null;
  const cat = updated.categories.find(c => c.id === categoryId);
  return cat ? cat.items.find(i => i.id === itemId) || null : null;
}

async function deleteItem(monthId, categoryId, itemId, userId) {
  const updated = await MonthData.findOneAndUpdate(
    { id: monthId, userId: userId || null },
    { $pull: { 'categories.$[cat].items': { id: itemId } } },
    { arrayFilters: [{ 'cat.id': categoryId }] }
  ).lean();
  return !!updated;
}

// ─── Savings CRUD ──────────────────────────────────────────────────────────────

async function createSaving(monthId, saving, userId) {
  const newSaving = {
    id: `saving-${Date.now()}`,
    name: saving.name || 'Ahorro',
    amount: saving.amount || 0,
    date: saving.date || new Date().toISOString().split('T')[0],
  };

  const updated = await MonthData.findOneAndUpdate(
    { id: monthId, userId: userId || null },
    { $push: { savings: newSaving } },
    { new: true }
  ).lean();

  if (!updated) return null;
  return updated.savings.find(s => s.id === newSaving.id) || null;
}

async function updateSaving(monthId, savingId, updates, userId) {
  const setFields = {};
  for (const [key, val] of Object.entries(updates)) {
    setFields[`savings.$[s].${key}`] = val;
  }

  const updated = await MonthData.findOneAndUpdate(
    { id: monthId, userId: userId || null },
    { $set: setFields },
    { arrayFilters: [{ 's.id': savingId }], new: true }
  ).lean();

  if (!updated) return null;
  return updated.savings.find(s => s.id === savingId) || null;
}

async function deleteSaving(monthId, savingId, userId) {
  const updated = await MonthData.findOneAndUpdate(
    { id: monthId, userId: userId || null },
    { $pull: { savings: { id: savingId } } }
  ).lean();
  return !!updated;
}

// ─── Debt CRUD ─────────────────────────────────────────────────────────────────

async function createDebt(monthId, debt, userId) {
  const newDebt = {
    id: `debt-${Date.now()}`,
    name: debt.name || 'Deuda',
    principal: debt.principal || 0,
    monthlyPayment: debt.monthlyPayment || 0,
    installments: debt.installments || 1,
    interestRate: debt.interestRate || 0,
    startDate: debt.startDate || new Date().toISOString().split('T')[0],
    timeline: debt.timeline || 'mediano',
  };
  const updated = await MonthData.findOneAndUpdate(
    { id: monthId, userId: userId || null },
    { $push: { debts: newDebt } },
    { new: true }
  ).lean();
  if (!updated) return null;
  return updated.debts.find(d => d.id === newDebt.id) || null;
}

async function updateDebt(monthId, debtId, updates, userId) {
  const setFields = {};
  for (const [key, val] of Object.entries(updates)) {
    setFields[`debts.$[d].${key}`] = val;
  }
  const updated = await MonthData.findOneAndUpdate(
    { id: monthId, userId: userId || null },
    { $set: setFields },
    { arrayFilters: [{ 'd.id': debtId }], new: true }
  ).lean();
  if (!updated) return null;
  return updated.debts.find(d => d.id === debtId) || null;
}

async function deleteDebt(monthId, debtId, userId) {
  const updated = await MonthData.findOneAndUpdate(
    { id: monthId, userId: userId || null },
    { $pull: { debts: { id: debtId } } }
  ).lean();
  return !!updated;
}

// ─── Month lifecycle ───────────────────────────────────────────────────────────

async function createMonth(year, month, salary, userId) {
  const monthId = `${year}-${String(month).padStart(2, '0')}`;

  const exists = await MonthData.findOne({ id: monthId, userId: userId || null }).lean();
  if (exists) throw new Error(`Month ${monthId} already exists`);

  const p = (pct) => Math.round((salary * pct) / 100);
  const defaultCategories = [
    { id: 'vivienda', name: 'Vivienda', percentage: 25, budget: p(25), color: 'chart-1', items: [] },
    { id: 'gastos-personales', name: 'Gastos Personales', percentage: 30, budget: p(30), color: 'chart-2', items: [] },
    { id: 'ahorros-inv', name: 'Ahorros e Inversiones', percentage: 30, budget: p(30), color: 'chart-3', items: [] },
    { id: 'diversion', name: 'Diversión', percentage: 10, budget: p(10), color: 'chart-4', items: [] },
    { id: 'imprevistos', name: 'Imprevistos', percentage: 5, budget: p(5), color: 'chart-5', items: [] },
  ];

  // Find most recent month before the new one and copy periodic items
  const newMonthNum = year * 100 + month;
  const prevMonth = await MonthData.findOne({
    userId: userId || null,
    $expr: { $lt: [{ $add: [{ $multiply: ['$year', 100] }, '$month'] }, newMonthNum] },
  })
    .sort({ year: -1, month: -1 })
    .lean();

  if (prevMonth) {
    prevMonth.categories.forEach(prevCat => {
      const periodicItems = (prevCat.items || []).filter(item => item.periodic === true);
      if (periodicItems.length > 0) {
        const newCat = defaultCategories.find(c => c.id === prevCat.id);
        if (newCat) {
          periodicItems.forEach(item => {
            newCat.items.push({
              id: `${prevCat.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              name: item.name,
              amount: item.amount,
              icon: item.icon,
              periodic: true,
              ...(item.subcategoriaId ? { subcategoriaId: item.subcategoriaId } : {}),
            });
          });
        }
      }
    });
  }

  const newMonth = new MonthData({
    id: monthId,
    year,
    month,
    salary,
    userId: userId || null,
    weeklyBudgets: [
      { label: 'Semana 1', amount: 150000 },
      { label: 'Semana 2', amount: 150000 },
    ],
    savings: [],
    categories: defaultCategories,
  });

  await newMonth.save();
  return newMonth.toObject();
}

async function deleteMonth(id, userId) {
  const result = await MonthData.deleteOne({ id, userId: userId || null });
  return result.deletedCount > 0;
}

// ─── Subcategories ─────────────────────────────────────────────────────────────

async function getAllSubcategories() {
  return Subcategory.find().lean();
}

async function getSubcategoriesByCategory(categoriaPadreId) {
  return Subcategory.find({ categoriaPadreId }).lean();
}

async function getSubcategoryById(id) {
  return Subcategory.findOne({ id }).lean();
}

async function createSubcategory(sub) {
  const exists = await Subcategory.findOne({ id: sub.id }).lean();
  if (exists) throw new Error('Subcategory already exists');
  const doc = new Subcategory(sub);
  await doc.save();
  return doc.toObject();
}

async function updateSubcategory(id, updates) {
  return Subcategory.findOneAndUpdate({ id }, updates, { new: true }).lean();
}

async function deleteSubcategory(id) {
  const result = await Subcategory.deleteOne({ id });
  return result.deletedCount > 0;
}

// ─── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  seedIfEmpty,
  getAll,
  getById,
  getByYear,
  getByYearMonth,
  getCategoriesByMonth,
  getCategoryById,
  getExpensesByMonth,
  getWeeklyBudgetsByMonth,
  getSavingsByMonth,
  createCategory,
  updateCategory,
  deleteCategory,
  createItem,
  updateItem,
  deleteItem,
  createSaving,
  updateSaving,
  deleteSaving,
  createDebt,
  updateDebt,
  deleteDebt,
  createMonth,
  deleteMonth,
  getAllSubcategories,
  getSubcategoriesByCategory,
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
};
