import { readDB, writeDB } from './dbHelper.js';

export const UserModel = {
  getAll: () => {
    const db = readDB();
    return db.users || [];
  },

  findByEmail: (email) => {
    const users = UserModel.getAll();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  create: (userData) => {
    const db = readDB();
    if (!db.users) db.users = [];
    
    const nextId = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id: nextId,
      email: userData.email,
      password: userData.password,
      name: userData.name || userData.email.split('@')[0],
      role: userData.role || 'customer'
    };

    db.users.push(newUser);
    
    // Đồng bộ sang danh sách khách hàng nếu vai trò là customer
    if (newUser.role === 'customer') {
      if (!db.customers) db.customers = [];
      const exists = db.customers.some(c => c.email.toLowerCase() === newUser.email.toLowerCase());
      if (!exists) {
        db.customers.push({
          name: newUser.name,
          email: newUser.email,
          orders: 0,
          spent: 0,
          status: "Đang hoạt động",
          joined: `Tháng ${new Date().getMonth() + 1}, ${new Date().getFullYear()}`
        });
      }
    }

    writeDB(db);
    return newUser;
  }
};
