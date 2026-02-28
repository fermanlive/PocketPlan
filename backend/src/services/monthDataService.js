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

  async getAll()                                          { return activeService.getAll(); },
  async getById(id)                                       { return activeService.getById(id); },
  async getByYearMonth(year, month)                       { return activeService.getByYearMonth(year, month); },
  async getByYear(year)                                   { return activeService.getByYear(year); },
  async getCategoriesByMonth(id)                          { return activeService.getCategoriesByMonth(id); },
  async getCategoryById(monthId, categoryId)              { return activeService.getCategoryById(monthId, categoryId); },
  async getExpensesByMonth(monthId)                       { return activeService.getExpensesByMonth(monthId); },
  async getWeeklyBudgetsByMonth(id)                       { return activeService.getWeeklyBudgetsByMonth(id); },
  async getSavingsByMonth(id)                             { return activeService.getSavingsByMonth(id); },
  async getAllSubcategories()                              { return activeService.getAllSubcategories(); },
  async getSubcategoriesByCategory(categoriaPadreId)      { return activeService.getSubcategoriesByCategory(categoriaPadreId); },
  async getSubcategoryById(id)                            { return activeService.getSubcategoryById(id); },
  async createSubcategory(subcategory)                    { return activeService.createSubcategory(subcategory); },
  async updateSubcategory(id, updates)                    { return activeService.updateSubcategory(id, updates); },
  async deleteSubcategory(id)                             { return activeService.deleteSubcategory(id); },
  async createCategory(monthId, data)                     { return activeService.createCategory(monthId, data); },
  async updateCategory(monthId, categoryId, data)         { return activeService.updateCategory(monthId, categoryId, data); },
  async deleteCategory(monthId, categoryId)               { return activeService.deleteCategory(monthId, categoryId); },
  async updateItem(monthId, categoryId, itemId, updates)  { return activeService.updateItem(monthId, categoryId, itemId, updates); },
  async deleteItem(monthId, categoryId, itemId)           { return activeService.deleteItem(monthId, categoryId, itemId); },
  async createItem(monthId, categoryId, item)             { return activeService.createItem(monthId, categoryId, item); },
  async createSaving(monthId, saving)                     { return activeService.createSaving(monthId, saving); },
  async updateSaving(monthId, savingId, updates)          { return activeService.updateSaving(monthId, savingId, updates); },
  async deleteSaving(monthId, savingId)                   { return activeService.deleteSaving(monthId, savingId); },
  async createMonth(year, month, salary)                  { return activeService.createMonth(year, month, salary); },
  async deleteMonth(id)                                   { return activeService.deleteMonth(id); },
};

module.exports = monthDataService;
