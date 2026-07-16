import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discount: { type: Number, required: true }, // giá trị giảm (ví dụ 10 cho 10%, hoặc 15 cho $15)
  type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  minSpend: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  expiryDate: { type: Date, default: null }
}, {
  timestamps: true
});

export const Coupon = mongoose.model('Coupon', CouponSchema);
