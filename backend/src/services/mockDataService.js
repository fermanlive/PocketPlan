const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '../../data/mock.json');
const subcategoriesPath = path.join(__dirname, '../../data/subcategories.json');
const userSavingsPath = path.join(__dirname, '../../data/user-savings.json');
const userDebtsPath = path.join(__dirname, '../../data/user-debts.json');
const userExtraFundsPath = path.join(__dirname, '../../data/user-extra-funds.json');

class MockDataService {
  constructor() {
    this.months = [];
    this.subcategories = null;
    this.userSavings = [];
    this.userDebts = [];
    this.userExtraFunds = [];
    this.loadData();
    this.loadSubcategories();
    this.loadUserData();
  }

  loadData() {
    try {
      const fileContent = fs.readFileSync(mockDataPath, 'utf8');
      const parsed = JSON.parse(fileContent);
      this.months = Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      console.error('Error loading mock data:', error.message);
      this.months = [];
    }
  }

  loadSubcategories() {
    try {
      const fileContent = fs.readFileSync(subcategoriesPath, 'utf8');
      this.subcategories = JSON.parse(fileContent).subcategories;
    } catch (error) {
      console.error('Error loading subcategories:', error.message);
      this.subcategories = [];
    }
  }

  saveData() {
    try {
      fs.writeFileSync(mockDataPath, JSON.stringify(this.months, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving mock data:', error.message);
      throw error;
    }
  }

  saveSubcategories() {
    try {
      fs.writeFileSync(subcategoriesPath, JSON.stringify({ subcategories: this.subcategories }, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving subcategories:', error.message);
      throw error;
    }
  }

  loadUserData() {
    try {
      this.userSavings = JSON.parse(fs.readFileSync(userSavingsPath, 'utf8'));
    } catch { this.userSavings = []; }
    try {
      this.userDebts = JSON.parse(fs.readFileSync(userDebtsPath, 'utf8'));
    } catch { this.userDebts = []; }
    try {
      this.userExtraFunds = JSON.parse(fs.readFileSync(userExtraFundsPath, 'utf8'));
    } catch { this.userExtraFunds = []; }
  }

  saveUserSavings() {
    fs.writeFileSync(userSavingsPath, JSON.stringify(this.userSavings, null, 2), 'utf8');
  }

  saveUserDebts() {
    fs.writeFileSync(userDebtsPath, JSON.stringify(this.userDebts, null, 2), 'utf8');
  }

  saveUserExtraFunds() {
    fs.writeFileSync(userExtraFundsPath, JSON.stringify(this.userExtraFunds, null, 2), 'utf8');
  }

  // User-level Savings
  getUserSavings() { return this.userSavings; }

  createUserSaving(saving) {
    const newSaving = {
      id: `saving-${Date.now()}`,
      name: saving.name || 'Ahorro',
      amount: saving.amount || 0,
      date: saving.date || new Date().toISOString().split('T')[0],
    };
    this.userSavings.push(newSaving);
    this.saveUserSavings();
    return newSaving;
  }

  updateUserSaving(savingId, updates) {
    const idx = this.userSavings.findIndex(s => s.id === savingId);
    if (idx === -1) return null;
    this.userSavings[idx] = { ...this.userSavings[idx], ...updates };
    this.saveUserSavings();
    return this.userSavings[idx];
  }

  deleteUserSaving(savingId) {
    const idx = this.userSavings.findIndex(s => s.id === savingId);
    if (idx === -1) return false;
    this.userSavings.splice(idx, 1);
    this.saveUserSavings();
    return true;
  }

  // User-level Debts
  getUserDebts() { return this.userDebts; }

  createUserDebt(debt) {
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
    this.userDebts.push(newDebt);
    this.saveUserDebts();
    return newDebt;
  }

  updateUserDebt(debtId, updates) {
    const idx = this.userDebts.findIndex(d => d.id === debtId);
    if (idx === -1) return null;
    this.userDebts[idx] = { ...this.userDebts[idx], ...updates };
    this.saveUserDebts();
    return this.userDebts[idx];
  }

  deleteUserDebt(debtId) {
    const idx = this.userDebts.findIndex(d => d.id === debtId);
    if (idx === -1) return false;
    this.userDebts.splice(idx, 1);
    this.saveUserDebts();
    return true;
  }

  // User-level ExtraFunds
  getUserExtraFunds() { return this.userExtraFunds; }

  createUserExtraFund(fund) {
    const newFund = {
      id: `fund-${Date.now()}`,
      name: fund.name || 'Ingreso Extra',
      totalAmount: fund.totalAmount || 0,
      source: fund.source || 'otro',
      date: fund.date || new Date().toISOString().split('T')[0],
      items: [],
    };
    this.userExtraFunds.push(newFund);
    this.saveUserExtraFunds();
    return newFund;
  }

  updateUserExtraFund(fundId, updates) {
    const idx = this.userExtraFunds.findIndex(f => f.id === fundId);
    if (idx === -1) return null;
    this.userExtraFunds[idx] = { ...this.userExtraFunds[idx], ...updates };
    this.saveUserExtraFunds();
    return this.userExtraFunds[idx];
  }

  deleteUserExtraFund(fundId) {
    const idx = this.userExtraFunds.findIndex(f => f.id === fundId);
    if (idx === -1) return false;
    this.userExtraFunds.splice(idx, 1);
    this.saveUserExtraFunds();
    return true;
  }

  createUserExtraFundItem(fundId, item) {
    const fund = this.userExtraFunds.find(f => f.id === fundId);
    if (!fund) return null;
    if (!fund.items) fund.items = [];
    const newItem = {
      id: `fund-item-${Date.now()}`,
      name: item.name || 'Asignación',
      amount: item.amount || 0,
      icon: item.icon || null,
      note: item.note || null,
      subitems: [],
    };
    fund.items.push(newItem);
    this.saveUserExtraFunds();
    return newItem;
  }

  updateUserExtraFundItem(fundId, itemId, updates) {
    const fund = this.userExtraFunds.find(f => f.id === fundId);
    if (!fund) return null;
    const idx = (fund.items || []).findIndex(i => i.id === itemId);
    if (idx === -1) return null;
    fund.items[idx] = { ...fund.items[idx], ...updates };
    this.saveUserExtraFunds();
    return fund.items[idx];
  }

  deleteUserExtraFundItem(fundId, itemId) {
    const fund = this.userExtraFunds.find(f => f.id === fundId);
    if (!fund) return false;
    const idx = (fund.items || []).findIndex(i => i.id === itemId);
    if (idx === -1) return false;
    fund.items.splice(idx, 1);
    this.saveUserExtraFunds();
    return true;
  }

  getAll() {
    return this.months;
  }

  getById(id) {
    return this.months.find(m => m.id === id) || null;
  }

  getByYear(year) {
    return this.months.filter(m => m.year === year);
  }

  getByYearMonth(year, month) {
    return this.months.find(m => m.year === year && m.month === month) || null;
  }

  getCategoriesByMonth(id) {
    const monthData = this.getById(id);
    return monthData ? monthData.categories : null;
  }

  getCategoryById(monthId, categoryId) {
    const monthData = this.getById(monthId);
    if (!monthData) return null;
    return monthData.categories.find(c => c.id === categoryId);
  }

  getExpensesByMonth(monthId) {
    const monthData = this.getById(monthId);
    if (!monthData) return null;

    const expenses = [];
    monthData.categories.forEach(category => {
      category.items.forEach(item => {
        expenses.push({
          ...item,
          categoryId: category.id,
          categoryName: category.name,
          categoryColor: category.color
        });
      });
    });
    return expenses;
  }

  getWeeklyBudgetsByMonth(id) {
    const monthData = this.getById(id);
    return monthData ? monthData.weeklyBudgets : null;
  }

  getSavingsByMonth(id) {
    const monthData = this.getById(id);
    return monthData ? monthData.savings : null;
  }

  getAllSubcategories() {
    return this.subcategories || [];
  }

  getSubcategoriesByCategory(categoriaPadreId) {
    return this.subcategories
      ? this.subcategories.filter(s => s.categoriaPadreId === categoriaPadreId)
      : [];
  }

  getSubcategoryById(id) {
    return this.subcategories
      ? this.subcategories.find(s => s.id === id)
      : null;
  }

  createSubcategory(subcategory) {
    if (!this.subcategories) this.subcategories = [];

    const exists = this.subcategories.find(s => s.id === subcategory.id);
    if (exists) {
      throw new Error('Subcategory already exists');
    }

    this.subcategories.push(subcategory);
    this.saveSubcategories();
    return subcategory;
  }

  updateSubcategory(id, updates) {
    const index = this.subcategories.findIndex(s => s.id === id);
    if (index === -1) return null;

    this.subcategories[index] = { ...this.subcategories[index], ...updates };
    this.saveSubcategories();
    return this.subcategories[index];
  }

  deleteSubcategory(id) {
    const index = this.subcategories.findIndex(s => s.id === id);
    if (index === -1) return false;

    this.subcategories.splice(index, 1);
    this.saveSubcategories();
    return true;
  }

  updateItem(monthId, categoryId, itemId, updates) {
    const monthData = this.getById(monthId);
    if (!monthData) return null;

    const category = monthData.categories.find(c => c.id === categoryId);
    if (!category) return null;

    const itemIndex = category.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return null;

    if (updates.amount !== undefined) {
      if (typeof updates.amount !== 'number' || updates.amount < 0) {
        throw new Error('Amount must be a positive number');
      }
    }

    category.items[itemIndex] = { ...category.items[itemIndex], ...updates };
    this.saveData();
    return category.items[itemIndex];
  }

  deleteItem(monthId, categoryId, itemId) {
    const monthData = this.getById(monthId);
    if (!monthData) return false;

    const category = monthData.categories.find(c => c.id === categoryId);
    if (!category) return false;

    const itemIndex = category.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return false;

    category.items.splice(itemIndex, 1);
    this.saveData();
    return true;
  }

  createCategory(monthId, { name, percentage, color }) {
    const monthData = this.getById(monthId);
    if (!monthData) return null;

    const newCategory = {
      id: `cat-${Date.now()}`,
      name,
      percentage,
      budget: Math.round((monthData.salary * percentage) / 100),
      color: color || 'chart-1',
      items: [],
    };

    monthData.categories.push(newCategory);
    this.saveData();
    return newCategory;
  }

  updateCategory(monthId, categoryId, { name, percentage, color }) {
    const monthData = this.getById(monthId);
    if (!monthData) return null;

    const index = monthData.categories.findIndex(c => c.id === categoryId);
    if (index === -1) return null;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (color !== undefined) updates.color = color;
    if (percentage !== undefined) {
      updates.percentage = percentage;
      updates.budget = Math.round((monthData.salary * percentage) / 100);
    }

    monthData.categories[index] = { ...monthData.categories[index], ...updates };
    this.saveData();
    return monthData.categories[index];
  }

  deleteCategory(monthId, categoryId) {
    const monthData = this.getById(monthId);
    if (!monthData) return false;

    const index = monthData.categories.findIndex(c => c.id === categoryId);
    if (index === -1) return false;

    monthData.categories.splice(index, 1);
    this.saveData();
    return true;
  }

  createSaving(monthId, saving) {
    const monthData = this.getById(monthId);
    if (!monthData) return null;

    if (!Array.isArray(monthData.savings)) monthData.savings = [];

    const newSaving = {
      id: `saving-${Date.now()}`,
      name: saving.name || 'Ahorro',
      amount: saving.amount || 0,
      date: saving.date || new Date().toISOString().split('T')[0],
    };

    monthData.savings.push(newSaving);
    this.saveData();
    return newSaving;
  }

  updateSaving(monthId, savingId, updates) {
    const monthData = this.getById(monthId);
    if (!monthData) return null;

    const index = monthData.savings.findIndex(s => s.id === savingId);
    if (index === -1) return null;

    monthData.savings[index] = { ...monthData.savings[index], ...updates };
    this.saveData();
    return monthData.savings[index];
  }

  deleteSaving(monthId, savingId) {
    const monthData = this.getById(monthId);
    if (!monthData) return false;

    const index = monthData.savings.findIndex(s => s.id === savingId);
    if (index === -1) return false;

    monthData.savings.splice(index, 1);
    this.saveData();
    return true;
  }

  createDebt(monthId, debt, userId) {
    const monthData = this.getById(monthId);
    if (!monthData) return null;
    if (!monthData.debts) monthData.debts = [];
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
    monthData.debts.push(newDebt);
    this.saveData();
    return newDebt;
  }

  updateDebt(monthId, debtId, updates, userId) {
    const monthData = this.getById(monthId);
    if (!monthData) return null;
    const idx = (monthData.debts || []).findIndex(d => d.id === debtId);
    if (idx === -1) return null;
    monthData.debts[idx] = { ...monthData.debts[idx], ...updates };
    this.saveData();
    return monthData.debts[idx];
  }

  deleteDebt(monthId, debtId, userId) {
    const monthData = this.getById(monthId);
    if (!monthData) return false;
    const idx = (monthData.debts || []).findIndex(d => d.id === debtId);
    if (idx === -1) return false;
    monthData.debts.splice(idx, 1);
    this.saveData();
    return true;
  }

  createExtraFund(monthId, fund, userId) {
    const monthData = this.getById(monthId);
    if (!monthData) return null;
    if (!monthData.extraFunds) monthData.extraFunds = [];
    const newFund = {
      id: `fund-${Date.now()}`,
      name: fund.name || 'Ingreso Extra',
      totalAmount: fund.totalAmount || 0,
      source: fund.source || 'otro',
      date: fund.date || new Date().toISOString().split('T')[0],
      items: [],
    };
    monthData.extraFunds.push(newFund);
    this.saveData();
    return newFund;
  }

  updateExtraFund(monthId, fundId, updates, userId) {
    const monthData = this.getById(monthId);
    if (!monthData) return null;
    const idx = (monthData.extraFunds || []).findIndex(f => f.id === fundId);
    if (idx === -1) return null;
    monthData.extraFunds[idx] = { ...monthData.extraFunds[idx], ...updates };
    this.saveData();
    return monthData.extraFunds[idx];
  }

  deleteExtraFund(monthId, fundId, userId) {
    const monthData = this.getById(monthId);
    if (!monthData) return false;
    const idx = (monthData.extraFunds || []).findIndex(f => f.id === fundId);
    if (idx === -1) return false;
    monthData.extraFunds.splice(idx, 1);
    this.saveData();
    return true;
  }

  createExtraFundItem(monthId, fundId, item, userId) {
    const monthData = this.getById(monthId);
    if (!monthData) return null;
    const fund = (monthData.extraFunds || []).find(f => f.id === fundId);
    if (!fund) return null;
    if (!fund.items) fund.items = [];
    const newItem = {
      id: `fund-item-${Date.now()}`,
      name: item.name || 'Asignación',
      amount: item.amount || 0,
      icon: item.icon || null,
      note: item.note || null,
      subitems: [],
    };
    fund.items.push(newItem);
    this.saveData();
    return newItem;
  }

  updateExtraFundItem(monthId, fundId, itemId, updates, userId) {
    const monthData = this.getById(monthId);
    if (!monthData) return null;
    const fund = (monthData.extraFunds || []).find(f => f.id === fundId);
    if (!fund) return null;
    const idx = (fund.items || []).findIndex(i => i.id === itemId);
    if (idx === -1) return null;
    fund.items[idx] = { ...fund.items[idx], ...updates };
    this.saveData();
    return fund.items[idx];
  }

  deleteExtraFundItem(monthId, fundId, itemId, userId) {
    const monthData = this.getById(monthId);
    if (!monthData) return false;
    const fund = (monthData.extraFunds || []).find(f => f.id === fundId);
    if (!fund) return false;
    const idx = (fund.items || []).findIndex(i => i.id === itemId);
    if (idx === -1) return false;
    fund.items.splice(idx, 1);
    this.saveData();
    return true;
  }

  createItem(monthId, categoryId, item) {
    const monthData = this.getById(monthId);
    if (!monthData) return null;

    const category = monthData.categories.find(c => c.id === categoryId);
    if (!category) return null;

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
      subcategoriaId: item.subcategoriaId || null
    };

    category.items.push(newItem);
    this.saveData();
    return newItem;
  }

  updateSalary(monthId, salary, userId) {
    const monthData = this.getById(monthId);
    if (!monthData) return null;

    monthData.salary = salary;
    monthData.categories.forEach(cat => {
      cat.budget = Math.round((salary * cat.percentage) / 100);
    });
    this.saveData();
    return monthData;
  }

  createExtraIncome(monthId, income, userId) {
    const monthData = this.getById(monthId);
    if (!monthData) return null;

    if (!Array.isArray(monthData.extraIncomes)) monthData.extraIncomes = [];

    const newIncome = {
      id: `income-${Date.now()}`,
      name: income.name || 'Ingreso',
      amount: income.amount || 0,
      date: income.date || new Date().toISOString().split('T')[0],
    };

    monthData.extraIncomes.push(newIncome);
    this.saveData();
    return newIncome;
  }

  updateExtraIncome(monthId, incomeId, updates, userId) {
    const monthData = this.getById(monthId);
    if (!monthData) return null;

    const idx = (monthData.extraIncomes ?? []).findIndex(e => e.id === incomeId);
    if (idx === -1) return null;

    monthData.extraIncomes[idx] = { ...monthData.extraIncomes[idx], ...updates };
    this.saveData();
    return monthData.extraIncomes[idx];
  }

  deleteExtraIncome(monthId, incomeId, userId) {
    const monthData = this.getById(monthId);
    if (!monthData) return false;

    const idx = (monthData.extraIncomes ?? []).findIndex(e => e.id === incomeId);
    if (idx === -1) return false;

    monthData.extraIncomes.splice(idx, 1);
    this.saveData();
    return true;
  }

  createSubItem(monthId, categoryId, itemId, subitem, userId) {
    const monthData = this.getById(monthId);
    if (!monthData) return null;

    const category = monthData.categories.find(c => c.id === categoryId);
    if (!category) return null;

    const item = category.items.find(i => i.id === itemId);
    if (!item) return null;

    if (!Array.isArray(item.subitems)) item.subitems = [];

    const newSub = {
      id: `sub-${Date.now()}`,
      name: subitem.name || 'Sub-item',
      amount: subitem.amount || 0,
      note: subitem.note || null,
    };

    item.subitems.push(newSub);
    item.amount = item.subitems.reduce((s, sub) => s + sub.amount, 0);
    this.saveData();
    return newSub;
  }

  updateSubItem(monthId, categoryId, itemId, subitemId, updates, userId) {
    const monthData = this.getById(monthId);
    if (!monthData) return null;

    const category = monthData.categories.find(c => c.id === categoryId);
    if (!category) return null;

    const item = category.items.find(i => i.id === itemId);
    if (!item) return null;

    const idx = (item.subitems ?? []).findIndex(s => s.id === subitemId);
    if (idx === -1) return null;

    item.subitems[idx] = { ...item.subitems[idx], ...updates };
    item.amount = item.subitems.reduce((s, sub) => s + sub.amount, 0);
    this.saveData();
    return item.subitems[idx];
  }

  deleteSubItem(monthId, categoryId, itemId, subitemId, userId) {
    const monthData = this.getById(monthId);
    if (!monthData) return false;

    const category = monthData.categories.find(c => c.id === categoryId);
    if (!category) return false;

    const item = category.items.find(i => i.id === itemId);
    if (!item) return false;

    const idx = (item.subitems ?? []).findIndex(s => s.id === subitemId);
    if (idx === -1) return false;

    item.subitems.splice(idx, 1);
    if (item.subitems.length > 0) {
      item.amount = item.subitems.reduce((s, sub) => s + sub.amount, 0);
    }
    this.saveData();
    return true;
  }

  createMonth(year, month, salary) {
    const monthId = `${year}-${String(month).padStart(2, '0')}`;

    if (this.months.some(m => m.id === monthId)) {
      throw new Error(`Month ${monthId} already exists`);
    }

    const p = (pct) => Math.round((salary * pct) / 100);
    const defaultCategories = [
      { id: 'vivienda', name: 'Vivienda', percentage: 25, budget: p(25), color: 'chart-1', items: [] },
      { id: 'gastos-personales', name: 'Gastos Personales', percentage: 30, budget: p(30), color: 'chart-2', items: [] },
      { id: 'ahorros-inv', name: 'Ahorros e Inversiones', percentage: 30, budget: p(30), color: 'chart-3', items: [] },
      { id: 'diversion', name: 'Diversión', percentage: 10, budget: p(10), color: 'chart-4', items: [] },
      { id: 'imprevistos', name: 'Imprevistos', percentage: 5, budget: p(5), color: 'chart-5', items: [] },
    ];

    // Find most recent month before the new one
    const newMonthNum = year * 100 + month;
    const prevMonth = this.months
      .filter(m => m.year * 100 + m.month < newMonthNum)
      .sort((a, b) => (b.year * 100 + b.month) - (a.year * 100 + a.month))[0];

    // Copy periodic items from previous month into matching categories
    if (prevMonth) {
      prevMonth.categories.forEach(prevCat => {
        const periodicItems = prevCat.items.filter(item => item.periodic === true);
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

    const newMonth = {
      id: monthId,
      year,
      month,
      salary,
      weeklyBudgets: [
        { label: 'Semana 1', amount: 150000 },
        { label: 'Semana 2', amount: 150000 },
      ],
      savings: [],
      categories: defaultCategories,
    };

    this.months.push(newMonth);
    this.saveData();
    return newMonth;
  }

  deleteMonth(id) {
    const index = this.months.findIndex(m => m.id === id);
    if (index === -1) return false;

    this.months.splice(index, 1);
    this.saveData();
    return true;
  }
}

module.exports = new MockDataService();
