const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '../../data/mock.json');

class MockDataService {
  constructor() {
    this.data = null;
    this.loadData();
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
}

module.exports = new MockDataService();
