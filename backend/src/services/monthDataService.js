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

  async createCategory(monthId, data) {
    return mockDataService.createCategory(monthId, data);
  }

  async updateCategory(monthId, categoryId, data) {
    return mockDataService.updateCategory(monthId, categoryId, data);
  }

  async deleteCategory(monthId, categoryId) {
    return mockDataService.deleteCategory(monthId, categoryId);
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

  async createSaving(monthId, saving) {
    return mockDataService.createSaving(monthId, saving);
  }

  async updateSaving(monthId, savingId, updates) {
    return mockDataService.updateSaving(monthId, savingId, updates);
  }

  async deleteSaving(monthId, savingId) {
    return mockDataService.deleteSaving(monthId, savingId);
  }

  async createMonth(year, month, salary) {
    return mockDataService.createMonth(year, month, salary);
  }

  async deleteMonth(id) {
    return mockDataService.deleteMonth(id);
  }
}

module.exports = new MonthDataService();
