const mockDataService = require('./mockDataService');

class MonthDataService {
  async getAll() {
    return mockDataService.getAll();
  }

  async getById(id) {
    return mockDataService.getById(id);
  }

  async getByYearMonth(year, month) {
    return mockDataService.getByYearMonth(year, month);
  }

  async getByYear(year) {
    return mockDataService.getByYear(year);
  }

  async getCategoriesByMonth(id) {
    return mockDataService.getCategoriesByMonth(id);
  }

  async getCategoryById(monthId, categoryId) {
    return mockDataService.getCategoryById(monthId, categoryId);
  }

  async getExpensesByMonth(monthId) {
    return mockDataService.getExpensesByMonth(monthId);
  }

  async getWeeklyBudgetsByMonth(id) {
    return mockDataService.getWeeklyBudgetsByMonth(id);
  }

  async getSavingsByMonth(id) {
    return mockDataService.getSavingsByMonth(id);
  }

  async getAllSubcategories() {
    return mockDataService.getAllSubcategories();
  }

  async getSubcategoriesByCategory(categoriaPadreId) {
    return mockDataService.getSubcategoriesByCategory(categoriaPadreId);
  }

  async getSubcategoryById(id) {
    return mockDataService.getSubcategoryById(id);
  }

  async createSubcategory(subcategory) {
    return mockDataService.createSubcategory(subcategory);
  }

  async updateSubcategory(id, updates) {
    return mockDataService.updateSubcategory(id, updates);
  }

  async deleteSubcategory(id) {
    return mockDataService.deleteSubcategory(id);
  }

  async updateItem(monthId, categoryId, itemId, updates) {
    return mockDataService.updateItem(monthId, categoryId, itemId, updates);
  }

  async deleteItem(monthId, categoryId, itemId) {
    return mockDataService.deleteItem(monthId, categoryId, itemId);
  }

  async createItem(monthId, categoryId, item) {
    return mockDataService.createItem(monthId, categoryId, item);
  }
}

module.exports = new MonthDataService();
