const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '../../data/mock.json');
const subcategoriesPath = path.join(__dirname, '../../data/subcategories.json');

class MockDataService {
  constructor() {
    this.data = null;
    this.subcategories = null;
    this.loadData();
    this.loadSubcategories();
  }

  loadData() {
    try {
      const fileContent = fs.readFileSync(mockDataPath, 'utf8');
      this.data = JSON.parse(fileContent);
    } catch (error) {
      console.error('Error loading mock data:', error.message);
      this.data = null;
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
      fs.writeFileSync(mockDataPath, JSON.stringify(this.data, null, 2), 'utf8');
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
    return this.data ? [this.data] : [];
  }

  getById(id) {
    return this.data && this.data.id === id ? this.data : null;
  }

  getByYear(year) {
    return this.data && this.data.year === year ? [this.data] : [];
  }

  getByYearMonth(year, month) {
    return this.data && this.data.year === year && this.data.month === month ? this.data : null;
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
}

module.exports = new MockDataService();
