import { readDB, writeDB } from './dbHelper.js';

export const OrderModel = {
  getAll: () => {
    const db = readDB();
    return db.orders || [];
  },

  getByCustomerName: (customerName) => {
    const db = readDB();
    const orders = db.orders || [];
    return orders.filter(o => o.customerName.toLowerCase() === customerName.toLowerCase());
  },

  getByCustomerEmail: (customerEmail) => {
    const db = readDB();
    const orders = db.orders || [];
    return orders.filter(o => o.customerEmail && o.customerEmail.toLowerCase() === customerEmail.toLowerCase());
  },

  create: (orderData) => {
    const db = readDB();
    const orders = db.orders || [];
    
    // Generate order ID BPS-2026-XXXXX
    const randomId = Math.floor(10000 + Math.random() * 90000);
    const orderId = `BPS-2026-${randomId}`;

    // Get current date formatted like DD/MM/YYYY
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    // Calculate dynamic pricing
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discount = orderData.couponApplied === 'PROSHOT' ? subtotal * 0.1 : 0;
    const shipping = subtotal >= 150 ? 0 : 12.99;
    const total = subtotal - discount + shipping;

    const newOrder = {
      id: orderId,
      customerName: orderData.customerName || 'Khách vãng lai',
      customerEmail: orderData.customerEmail || '',
      phone: orderData.phone || '',
      address: orderData.address || '',
      date: formattedDate,
      status: 'Đang xử lý',
      items: orderData.items || [],
      subtotal: parseFloat(subtotal.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      payment: orderData.payment || 'COD'
    };

    orders.push(newOrder);
    db.orders = orders;

    // Optional: Update customer orders count and spent amount
    const customers = db.customers || [];
    const customerIndex = customers.findIndex(c => c.name.toLowerCase() === newOrder.customerName.toLowerCase());
    if (customerIndex !== -1) {
      customers[customerIndex].orders += 1;
      customers[customerIndex].spent += Math.round(newOrder.total);
    } else {
      // Create new customer if not exists
      customers.push({
        name: newOrder.customerName,
        email: newOrder.customerEmail,
        orders: 1,
        spent: Math.round(newOrder.total),
        status: 'Đang hoạt động',
        joined: `Tháng ${month}, ${year}`
      });
    }
    db.customers = customers;

    writeDB(db);
    return newOrder;
  },

  updateStatus: (id, status) => {
    const db = readDB();
    const orders = db.orders || [];
    const index = orders.findIndex(o => o.id === id);

    if (index === -1) return null;

    orders[index].status = status;
    db.orders = orders;
    writeDB(db);
    return orders[index];
  }
};
