const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '../../data/mock.json');
const subcategoriesPath = path.join(__dirname, '../../data/subcategories.json');

class MockDataService {
  constructor() {
    this.months = [];
    this.subcategories = null;
    this.loadData();
    this.loadSubcategories();
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
