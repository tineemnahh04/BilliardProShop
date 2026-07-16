import { Category } from '../models/categoryModel.js';

export const categoryController = {
  // Lấy toàn bộ danh mục sản phẩm
  getAll: async (req, res) => {
    try {
      const categories = await Category.find({}).sort({ code: 1 });
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách danh mục', error: error.message });
    }
  }
};
