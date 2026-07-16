import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  variant: { type: String, default: null }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: Number, default: null }, // ID của người dùng đã đặt hàng
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  date: { type: String, required: true }, // định dạng DD/MM/YYYY
  status: { type: String, enum: ['Đang xử lý', 'Đang giao hàng', 'Đã giao', 'Đã giao hàng', 'Đã hủy'], default: 'Đang xử lý' },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  shipping: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  payment: { type: String, default: 'COD' }
}, {
  timestamps: true
});

export const Order = mongoose.model('Order', OrderSchema);
