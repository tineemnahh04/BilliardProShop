import mongoose from 'mongoose';

const SpecSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const ReviewItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  date: { type: String, default: () => new Date().toLocaleDateString('vi-VN') },
  text: { type: String, required: true },
  verified: { type: Boolean, default: true }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, default: null },
  rating: { type: Number, default: 5.0 },
  reviews: { type: Number, default: 0 },
  badge: { type: String, default: '' },
  image: { type: String, required: true },
  images: [{ type: String }],
  inStock: { type: Boolean, default: true },
  stock: { type: Number, default: 10 },
  sku: { type: String, unique: true },
  description: { type: String, default: 'Mô tả đang được cập nhật.' },
  weights: [{ type: String }],
  shafts: [{ type: String }],
  tipSizes: [{ type: String }],
  specs: [SpecSchema],
  reviewsList: [ReviewItemSchema]
}, {
  timestamps: true
});

export const Product = mongoose.model('Product', ProductSchema);
