const mockDataService = require('./mockDataService');

let activeService = mockDataService;

const monthDataService = {
  async init(mongoConnected) {
    if (mongoConnected) {
      const mongoDataService = require('./mongoDataService');
      await mongoDataService.seedIfEmpty();
      activeService = mongoDataService;
      console.log('[Service] Usando MongoDB');
    } else {
      console.log('[Service] Usando Mock (fallback)');
    }
  },

  async getAll(userId)                                          { return activeService.getAll(userId); },
  async getById(id, userId)                                     { return activeService.getById(id, userId); },
  async getByYearMonth(year, month, userId)                     { return activeService.getByYearMonth(year, month, userId); },
  async getByYear(year, userId)                                 { return activeService.getByYear(year, userId); },
  async getCategoriesByMonth(id, userId)                        { return activeService.getCategoriesByMonth(id, userId); },
  async getCategoryById(monthId, categoryId, userId)            { return activeService.getCategoryById(monthId, categoryId, userId); },
  async getExpensesByMonth(monthId, userId)                     { return activeService.getExpensesByMonth(monthId, userId); },
  async getWeeklyBudgetsByMonth(id, userId)                     { return activeService.getWeeklyBudgetsByMonth(id, userId); },
  async getSavingsByMonth(id, userId)                           { return activeService.getSavingsByMonth(id, userId); },
  async getAllSubcategories()                                    { return activeService.getAllSubcategories(); },
  async getSubcategoriesByCategory(categoriaPadreId)            { return activeService.getSubcategoriesByCategory(categoriaPadreId); },
  async getSubcategoryById(id)                                  { return activeService.getSubcategoryById(id); },
  async createSubcategory(subcategory)                          { return activeService.createSubcategory(subcategory); },
  async updateSubcategory(id, updates)                          { return activeService.updateSubcategory(id, updates); },
  async deleteSubcategory(id)                                   { return activeService.deleteSubcategory(id); },
  async createCategory(monthId, data, userId)                   { return activeService.createCategory(monthId, data, userId); },
  async updateCategory(monthId, categoryId, data, userId)       { return activeService.updateCategory(monthId, categoryId, data, userId); },
  async deleteCategory(monthId, categoryId, userId)             { return activeService.deleteCategory(monthId, categoryId, userId); },
  async updateItem(monthId, categoryId, itemId, updates, userId){ return activeService.updateItem(monthId, categoryId, itemId, updates, userId); },
  async deleteItem(monthId, categoryId, itemId, userId)         { return activeService.deleteItem(monthId, categoryId, itemId, userId); },
  async createItem(monthId, categoryId, item, userId)           { return activeService.createItem(monthId, categoryId, item, userId); },
  async createSaving(monthId, saving, userId)                   { return activeService.createSaving(monthId, saving, userId); },
  async updateSaving(monthId, savingId, updates, userId)        { return activeService.updateSaving(monthId, savingId, updates, userId); },
  async deleteSaving(monthId, savingId, userId)                 { return activeService.deleteSaving(monthId, savingId, userId); },
  async createDebt(monthId, debt, userId)                       { return activeService.createDebt(monthId, debt, userId); },
  async updateDebt(monthId, debtId, updates, userId)            { return activeService.updateDebt(monthId, debtId, updates, userId); },
  async deleteDebt(monthId, debtId, userId)                     { return activeService.deleteDebt(monthId, debtId, userId); },
  async createMonth(year, month, salary, userId)                { return activeService.createMonth(year, month, salary, userId); },
  async deleteMonth(id, userId)                                 { return activeService.deleteMonth(id, userId); },
};

module.exports = monthDataService;
