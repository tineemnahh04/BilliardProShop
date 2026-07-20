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
  },

  // AI Cue Finder Recommendation Engine
  aiRecommend: async (req, res) => {
    try {
      const { height, strokePower, skillLevel, gameType, maxBudget } = req.body;

      const products = await Product.find({ inStock: true });
      if (!products || products.length === 0) {
        return res.status(404).json({ message: 'Hiện chưa có sản phẩm trong hệ thống' });
      }

      // Convert maxBudget to USD for comparison if passed in VND
      let budgetUsd = parseFloat(maxBudget) || 1000;
      if (budgetUsd > 10000) {
        budgetUsd = budgetUsd / 25000;
      }

      // Determine category preference
      let targetCategory = '';
      if (gameType === 'pool') targetCategory = 'pool-cues';
      else if (gameType === 'carom') targetCategory = 'carom-cues';
      else if (gameType === 'break_jump') targetCategory = 'break-jump';

      // Score each product
      const scoredProducts = products.map(p => {
        let score = 50;

        // Category match
        if (targetCategory && p.category === targetCategory) score += 30;
        else if (p.category.includes('cue') || p.category === 'pool-cues' || p.category === 'carom-cues') score += 15;

        // Budget match
        if (p.price <= budgetUsd) {
          score += 25;
          const ratio = p.price / budgetUsd;
          score += ratio * 10;
        } else {
          const diffRatio = (p.price - budgetUsd) / budgetUsd;
          score -= diffRatio * 30;
        }

        // Skill level preference
        if (skillLevel === 'beginner') {
          if (p.price <= 350) score += 15;
          if (p.brand === 'Fury' || p.brand === 'JFlowers' || p.brand === 'Cuetec') score += 10;
        } else if (skillLevel === 'advanced') {
          if (p.brand === 'Predator' || p.brand === 'Mezz' || p.brand === 'Kamui') score += 15;
          if (p.price > 250) score += 10;
        }

        // Rating bonus
        score += (p.rating || 4.5) * 2;

        return { product: p, score: Math.round(score) };
      });

      scoredProducts.sort((a, b) => b.score - a.score);

      const topItem = scoredProducts[0];
      const recommendedCue = topItem.product;
      const matchPercentage = Math.min(99, Math.max(85, topItem.score));

      const skillTextMap = {
        beginner: 'Phù hợp cho người mới bắt đầu tập chơi bida',
        intermediate: 'Phù hợp cho cơ thủ trung cấp nâng cao kỹ năng điều bi',
        advanced: 'Phù hợp cho cơ thủ khá giỏi & thi đấu chuyên nghiệp'
      };

      const strokeTextMap = {
        light: 'Cảm giác chạm bi mềm mại, tốc độ ra cơ êm ái',
        medium: 'Cảm giác đánh lực vừa & phân bổ trọng lượng cân bằng',
        strong: 'Ngọn cứng cáp cho cú phát lực mạnh & truyền lực tối đa',
        break: 'Lực phá bùng nổ chuyên dụng cho cú mở ván'
      };

      const heightTextMap = {
        under_160: 'Dễ dàng kiểm soát điều bi (Trọng lượng 18.5 - 19.0 oz)',
        '160_175': 'Dễ dàng kiểm soát điều bi (Trọng lượng 19.0 - 19.5 oz)',
        above_175: 'Tầm với thoải mái (Trọng lượng 19.5 - 20.0 oz)'
      };

      let budgetLabel = '';
      const numBudget = parseFloat(maxBudget) || 6000000;
      if (numBudget > 10000) {
        budgetLabel = `Hợp lý trong tầm ngân sách dưới ${(numBudget / 1000000).toFixed(0)} triệu VNĐ`;
      } else {
        budgetLabel = `Hợp lý trong tầm ngân sách dưới $${budgetUsd.toFixed(0)}`;
      }

      const reasons = [
        `✔ ${skillTextMap[skillLevel] || 'Phù hợp cho người mới bắt đầu'}`,
        `✔ ${strokeTextMap[strokePower] || 'Cảm giác đánh lực vừa'}`,
        `✔ ${heightTextMap[height] || 'Dễ kiểm soát cơ'}`,
        `✔ ${budgetLabel}`
      ];

      const runnerUps = scoredProducts.slice(1, 3).map(sp => sp.product);

      res.json({
        recommendedCue,
        matchPercentage,
        reasons,
        runnerUps,
        advisorSpecs: {
          recommendedWeight: height === 'under_160' ? '18.5 oz - 19 oz' : height === 'above_175' ? '19.5 oz - 20 oz' : '19 oz - 19.5 oz',
          recommendedTipSize: skillLevel === 'beginner' ? '12.5mm - 13.0mm' : '11.8mm - 12.5mm',
          shaftType: strokePower === 'strong' || skillLevel === 'advanced' ? 'Ngọn Sợi Carbon' : 'Ngọn Gỗ Công Nghệ Trợ Lực'
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tư vấn gợi ý sản phẩm', error: error.message });
    }
  }
};
