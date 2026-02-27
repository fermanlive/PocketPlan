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
}

module.exports = new MonthDataService();
