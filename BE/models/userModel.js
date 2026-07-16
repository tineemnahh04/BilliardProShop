import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  joined: { type: String, default: () => `Tháng ${new Date().getMonth() + 1}, ${new Date().getFullYear()}` },
  spent: { type: Number, default: 0 },
  orders: { type: Number, default: 0 },
  status: { type: String, enum: ['Đang hoạt động', 'Đang khóa'], default: 'Đang hoạt động' },
  wishlist: [{ type: Number }], // danh sách ID sản phẩm yêu thích
  avatar: { type: String, default: '' },
  address: { type: String, default: '' },
  phone: { type: String, default: '' }
}, {
  timestamps: true
});

// Băm mật khẩu trước khi lưu
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Phương thức so sánh mật khẩu
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', UserSchema);
