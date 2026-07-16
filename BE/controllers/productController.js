import mongoose from 'mongoose';
import { Product } from '../models/productModel.js';

export const productController = {
  // Lấy toàn bộ sản phẩm (hỗ trợ search, filter, sort, pagination)
  getAll: async (req, res) => {
    try {
      const { q, category, brand, minPrice, maxPrice, rating, inStockOnly, sort, page, limit } = req.query;
      
      const filter = {};
      
      // 1. Tìm kiếm theo tên hoặc thương hiệu
      if (q) {
        filter.$or = [
          { name: { $regex: q, $options: 'i' } },
          { brand: { $regex: q, $options: 'i' } }
        ];
      }
      
      // 2. Lọc theo danh mục
      if (category) {
        filter.category = category;
      }
      
      // 3. Lọc theo thương hiệu
      if (brand && brand !== 'all') {
        // Tách nhiều thương hiệu nếu gửi lên dưới dạng mảng hoặc chuỗi cách nhau bằng dấu phẩy
        const brandList = brand.split(',');
        filter.brand = { $in: brandList.map(b => new RegExp(`^${b.trim()}$`, 'i')) };
      }
      
      // 4. Lọc theo khoảng giá
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
      }
      
      // 5. Lọc theo đánh giá tối thiểu
      if (rating) {
        filter.rating = { $gte: parseFloat(rating) };
      }
      
      // 6. Lọc hàng còn tồn kho
      if (inStockOnly === 'true' || inStockOnly === true) {
        filter.inStock = true;
        filter.stock = { $gt: 0 };
      }

      // 7. Sắp xếp
      let sortQuery = {};
      if (sort === 'price-asc') {
        sortQuery.price = 1;
      } else if (sort === 'price-desc') {
        sortQuery.price = -1;
      } else if (sort === 'rating') {
        sortQuery.rating = -1;
      } else if (sort === 'new') {
        sortQuery.createdAt = -1;
      } else {
        sortQuery.id = 1; // Sắp xếp mặc định theo ID tăng dần
      }

      // 8. Phân trang hoặc trả toàn bộ danh sách (để tương thích FE cũ)
      if (page) {
        const currentPage = parseInt(page) || 1;
        const limitPerPage = parseInt(limit) || 9;
        const skip = (currentPage - 1) * limitPerPage;
        
        const products = await Product.find(filter)
          .sort(sortQuery)
          .skip(skip)
          .limit(limitPerPage);
          
        const total = await Product.countDocuments(filter);
        
        res.json({
          products,
          total,
          pages: Math.ceil(total / limitPerPage),
          currentPage
        });
      } else {
        const products = await Product.find(filter).sort(sortQuery);
        res.json(products);
      }
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm', error: error.message });
    }
  },

  // Chi tiết sản phẩm
  getById: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      let product;
      
      if (!isNaN(id)) {
        product = await Product.findOne({ id });
      } else if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        product = await Product.findById(req.params.id);
      }

      if (!product) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy thông tin sản phẩm', error: error.message });
    }
  },

  // Tạo sản phẩm mới
  create: async (req, res) => {
    try {
      if (!req.body.name || !req.body.price) {
        return res.status(400).json({ message: 'Tên sản phẩm và giá tiền là bắt buộc' });
      }

      const lastProd = await Product.findOne().sort({ id: -1 });
      const nextId = lastProd ? lastProd.id + 1 : 1;

      // Sinh mã SKU mặc định nếu thiếu
      const sku = req.body.sku || `BPS-${nextId}-${Date.now().toString().slice(-4)}`;

      const newProduct = new Product({
        id: nextId,
        sku,
        ...req.body,
        price: parseFloat(req.body.price),
        originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : null,
        stock: parseInt(req.body.stock) || 10,
        inStock: (parseInt(req.body.stock) || 10) > 0
      });

      await newProduct.save();
      res.status(201).json(newProduct);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tạo sản phẩm mới', error: error.message });
    }
  },

  // Cập nhật sản phẩm
  update: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
      }

      const updateData = { ...req.body };
      if (updateData.price !== undefined) updateData.price = parseFloat(updateData.price);
      if (updateData.originalPrice !== undefined) {
        updateData.originalPrice = updateData.originalPrice ? parseFloat(updateData.originalPrice) : null;
      }
      if (updateData.stock !== undefined) {
        updateData.stock = parseInt(updateData.stock);
        updateData.inStock = updateData.stock > 0;
      }

      const updatedProduct = await Product.findOneAndUpdate(
        { id },
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });
      }
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm', error: error.message });
    }
  },

  // Xóa sản phẩm
  delete: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
      }

      const deleted = await Product.findOneAndDelete({ id });
      if (!deleted) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' });
      }
      res.json({ message: 'Đã xóa sản phẩm thành công' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', error: error.message });
    }
  },

  // Cập nhật tồn kho nhanh (updateOne)
  updateStock: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const stock = parseInt(req.body.stock);

      if (isNaN(id) || isNaN(stock) || stock < 0) {
        return res.status(400).json({ message: 'ID sản phẩm hoặc số lượng tồn kho không hợp lệ' });
      }

      const result = await Product.updateOne(
        { id },
        { 
          $set: { 
            stock, 
            inStock: stock > 0 
          } 
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });
      }

      const updatedProduct = await Product.findOne({ id });
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật tồn kho nhanh', error: error.message });
    }
  }
};
