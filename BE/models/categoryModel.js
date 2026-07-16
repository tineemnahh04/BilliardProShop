import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String, default: '' }
}, {
  timestamps: true
});

export const Category = mongoose.model('Category', CategorySchema);
