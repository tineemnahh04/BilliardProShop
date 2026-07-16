import { ProductModel } from '../models/productModel.js';

export const productController = {
  getAll: (req, res) => {
    try {
      const products = ProductModel.getAll();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm', error: error.message });
    }
  },

  getById: (req, res) => {
    try {
      const product = ProductModel.getById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy thông tin sản phẩm', error: error.message });
    }
  },

  create: (req, res) => {
    try {
      if (!req.body.name || !req.body.price) {
        return res.status(400).json({ message: 'Tên sản phẩm và giá tiền là bắt buộc' });
      }
      const newProduct = ProductModel.create(req.body);
      res.status(201).json(newProduct);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tạo sản phẩm mới', error: error.message });
    }
  },

  update: (req, res) => {
    try {
      const updatedProduct = ProductModel.update(req.params.id, req.body);
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });
      }
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm', error: error.message });
    }
  },

  delete: (req, res) => {
    try {
      const success = ProductModel.delete(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' });
      }
      res.json({ message: 'Đã xóa sản phẩm thành công' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', error: error.message });
    }
  }
};
