import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import { User } from '../models/userModel.js';
import { Product } from '../models/productModel.js';
import { Order } from '../models/orderModel.js';
import { Category } from '../models/categoryModel.js';
import { Coupon } from '../models/couponModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbPath = path.resolve(__dirname, '../database.json');

const defaultCategories = [
  { code: 'pool-cues', name: 'Cơ bida lỗ', image: 'https://images.unsplash.com/photo-1599685315659-bc876da49fe5?w=500&h=500&fit=crop' },
  { code: 'carom-cues', name: 'Cơ bida phăng', image: 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?w=500&h=500&fit=crop' },
  { code: 'break-jump', name: 'Cơ phá & nhảy', image: 'https://images.unsplash.com/photo-1575553939928-d03b21323afe?w=500&h=500&fit=crop' },
  { code: 'cue-cases', name: 'Bao đựng cơ', image: 'https://images.unsplash.com/photo-1544281153-6603be88b354?w=500&h=500&fit=crop' },
  { code: 'chalks', name: 'Lơ bida', image: 'https://images.unsplash.com/photo-1609141973641-60a67bf2a64c?w=500&h=500&fit=crop' },
  { code: 'gloves', name: 'Găng tay bida', image: 'https://images.unsplash.com/photo-1628784230353-5bee16e2f005?w=500&h=500&fit=crop' },
  { code: 'accessories', name: 'Phụ kiện', image: 'https://images.unsplash.com/photo-1611005831777-a89cfa67b458?w=500&h=500&fit=crop' }
];

const defaultCoupons = [
  { code: 'PROSHOT', discount: 10, type: 'percentage', minSpend: 100, isActive: true },
  { code: 'FREESHIP', discount: 15, type: 'fixed', minSpend: 150, isActive: true },
  { code: 'WELCOME5', discount: 5, type: 'fixed', minSpend: 0, isActive: true }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/billiard_pro_shop';
    console.log(`Đang kết nối MongoDB tại: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB đã kết nối thành công!');

    // Đọc dữ liệu từ file database.json
    console.log(`Đọc file CSDL từ ${dbPath}...`);
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // 1. Xóa các collection cũ
    console.log('Đang dọn dẹp các collection cũ...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Category.deleteMany({});
    await Coupon.deleteMany({});

    // 2. Seed Users (Băm mật khẩu)
    console.log('Đang import Users...');
    const usersToInsert = [];
    for (const u of dbData.users || []) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(u.password, salt);
      
      // Đồng bộ thông tin khách hàng từ customers (nếu có)
      const customerData = (dbData.customers || []).find(c => c.email.toLowerCase() === u.email.toLowerCase());
      
      usersToInsert.push({
        id: u.id,
        email: u.email,
        password: hashedPassword,
        name: u.name,
        role: u.role,
        joined: customerData ? customerData.joined : undefined,
        spent: customerData ? customerData.spent : 0,
        orders: customerData ? customerData.orders : 0,
        status: customerData ? customerData.status : 'Đang hoạt động',
        wishlist: u.role === 'customer' ? [2, 5] : [],
        avatar: u.role === 'admin' 
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' 
          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        address: u.role === 'customer' ? '12 Đường Ba Tháng Hai, Quận 10, TP. Hồ Chí Minh' : '',
        phone: u.role === 'customer' ? '+84 912 345 678' : ''
      });
    }
    await User.insertMany(usersToInsert);
    console.log(`Đã import thành công ${usersToInsert.length} users.`);

    // 3. Seed Products
    console.log('Đang import Products...');
    const productsToInsert = (dbData.products || []).map(p => {
      // Đảm bảo kiểu dữ liệu chuẩn xác
      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: parseFloat(p.price),
        originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
        rating: parseFloat(p.rating) || 5.0,
        reviews: parseInt(p.reviews) || 0,
        badge: p.badge || '',
        image: p.image,
        images: p.images || [p.image],
        inStock: p.inStock !== undefined ? p.inStock : true,
        stock: parseInt(p.stock) || 10,
        sku: p.sku || `BPS-${p.id}-${Date.now().toString().slice(-4)}`,
        description: p.description,
        weights: p.weights || [],
        shafts: p.shafts || [],
        tipSizes: p.tipSizes || [],
        specs: p.specs || [],
        reviewsList: p.reviewsList || []
      };
    });
    await Product.insertMany(productsToInsert);
    console.log(`Đã import thành công ${productsToInsert.length} products.`);

    // 4. Seed Orders
    console.log('Đang import Orders...');
    const ordersToInsert = (dbData.orders || []).map(o => {
      // Tìm ID người dùng tương ứng dựa vào email
      const user = usersToInsert.find(u => u.email.toLowerCase() === o.customerEmail.toLowerCase());
      return {
        id: o.id,
        userId: user ? user.id : null,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        phone: o.phone || '+84 912 345 678',
        address: o.address,
        date: o.date,
        status: o.status,
        items: (o.items || []).map(item => ({
          id: item.id,
          name: item.name,
          brand: item.brand,
          qty: parseInt(item.qty),
          price: parseFloat(item.price),
          variant: item.variant || null
        })),
        subtotal: parseFloat(o.subtotal),
        shipping: parseFloat(o.shipping),
        discount: parseFloat(o.discount) || 0,
        total: parseFloat(o.total),
        payment: o.payment || 'COD'
      };
    });
    await Order.insertMany(ordersToInsert);
    console.log(`Đã import thành công ${ordersToInsert.length} orders.`);

    // 5. Seed Categories
    console.log('Đang import Categories...');
    await Category.insertMany(defaultCategories);
    console.log(`Đã import thành công ${defaultCategories.length} categories.`);

    // 6. Seed Coupons
    console.log('Đang import Coupons...');
    await Coupon.insertMany(defaultCoupons);
    console.log(`Đã import thành công ${defaultCoupons.length} coupons.`);

    console.log('[OK] Hạt giống dữ liệu (Seed Data) đã hoàn tất thành công!');
    await mongoose.disconnect();
    console.log('Đã đóng kết nối MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error(`[ERROR] Có lỗi xảy ra trong quá trình seed dữ liệu:`, error);
    process.exit(1);
  }
};

seedDB();
