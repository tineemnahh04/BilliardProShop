import { readDB, writeDB } from './dbHelper.js';

export const CustomerModel = {
  getAll: () => {
    const db = readDB();
    return db.customers || [];
  },

  create: (customerData) => {
    const db = readDB();
    const customers = db.customers || [];
    
    // Check if customer already exists by name
    const exists = customers.find(c => c.name.toLowerCase() === customerData.name.toLowerCase());
    if (exists) return exists;

    const newCustomer = {
      name: customerData.name,
      email: customerData.email || '',
      orders: parseInt(customerData.orders) || 0,
      spent: parseFloat(customerData.spent) || 0.0,
      status: customerData.status || 'Đang hoạt động',
      joined: customerData.joined || `Tháng ${new Date().getMonth() + 1}, ${new Date().getFullYear()}`
    };

    customers.push(newCustomer);
    db.customers = customers;
    writeDB(db);
    return newCustomer;
  }
};
