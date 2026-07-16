import { Order } from '../models/orderModel.js';
import { Product } from '../models/productModel.js';
import { User } from '../models/userModel.js';

export const orderController = {
  // Lấy danh sách đơn hàng (hỗ trợ tìm kiếm, phân quyền)
  getAll: async (req, res) => {
    try {
      const { customerEmail, customerName, q } = req.query;
      const filter = {};

      // Phân quyền: Khách hàng chỉ xem được đơn hàng của chính họ
      if (req.user.role !== 'admin') {
        filter.$or = [
          { userId: req.user.id },
          { customerEmail: req.user.email.toLowerCase() }
        ];
      } else {
        // Admin: Tìm kiếm hoặc lọc nâng cao
        if (q) {
          filter.$or = [
            { id: { $regex: q, $options: 'i' } },
            { customerName: { $regex: q, $options: 'i' } },
            { customerEmail: { $regex: q, $options: 'i' } },
            { phone: { $regex: q, $options: 'i' } }
          ];
        } else if (customerEmail) {
          filter.customerEmail = { $regex: `^${customerEmail}$`, $options: 'i' };
        } else if (customerName) {
          filter.customerName = { $regex: customerName, $options: 'i' };
        }
      }

      const orders = await Order.find(filter).sort({ createdAt: -1 });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn hàng', error: error.message });
    }
  },

  // Tạo đơn hàng mới (trừ tồn kho & cộng chi tiêu khách hàng)
  create: async (req, res) => {
    try {
      const { items, customerName, customerEmail, phone, address, payment, couponApplied } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Giỏ hàng không được để trống' });
      }

      // 1. Tạo Order ID ngẫu nhiên: BPS-2026-XXXXX
      const randomId = Math.floor(10000 + Math.random() * 90000);
      const orderId = `BPS-2026-${randomId}`;

      // 2. Tính toán tiền đơn hàng và kiểm tra/trừ kho sản phẩm
      let subtotal = 0;
      const validatedItems = [];

      for (const item of items) {
        const product = await Product.findOne({ id: item.id });
        if (!product) {
          return res.status(404).json({ message: `Sản phẩm ${item.name} không tồn tại` });
        }

        if (product.stock < item.qty) {
          return res.status(400).json({ 
            message: `Sản phẩm ${product.name} chỉ còn ${product.stock} sản phẩm trong kho` 
          });
        }

        // Trừ tồn kho sản phẩm bằng updateOne/save
        product.stock = Math.max(0, product.stock - item.qty);
        product.inStock = product.stock > 0;
        await product.save();

        subtotal += product.price * item.qty;
        validatedItems.push({
          id: product.id,
          name: product.name,
          brand: product.brand,
          qty: item.qty,
          price: product.price,
          variant: item.variant || null
        });
      }

      // Tính giảm giá & vận chuyển
      let discount = 0;
      if (couponApplied === 'PROSHOT') {
        discount = subtotal * 0.1;
      } else if (couponApplied === 'FREESHIP') {
        discount = 15;
      } else if (couponApplied === 'WELCOME5') {
        discount = 5;
      }
      
      const shipping = subtotal >= 150 ? 0 : 12.99;
      const total = Math.max(0, subtotal - discount + shipping);

      // Lấy ngày hiện tại định dạng DD/MM/YYYY
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;

      // 3. Tạo đơn hàng mới
      const newOrder = await Order.create({
        id: orderId,
        userId: req.user ? req.user.id : null,
        customerName: customerName || (req.user ? req.user.name : 'Khách vãng lai'),
        customerEmail: customerEmail || (req.user ? req.user.email : ''),
        phone: phone || (req.user ? req.user.phone : ''),
        address: address || (req.user ? req.user.address : ''),
        date: formattedDate,
        status: 'Đang xử lý',
        items: validatedItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        payment: payment || 'COD'
      });

      // 4. Cộng đơn hàng & chi tiêu cho user (nếu có tài khoản)
      if (req.user) {
        await User.updateOne(
          { id: req.user.id },
          { 
            $inc: { orders: 1, spent: Math.round(total) } 
          }
        );
      }

      res.status(201).json(newOrder);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tạo đơn hàng mới', error: error.message });
    }
  },

  // Cập nhật trạng thái đơn hàng (Đang xử lý -> Đang giao -> Đã giao -> Đã hủy)
  updateStatus: async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: 'Trạng thái là bắt buộc' });
      }

      const order = await Order.findOne({ id: req.params.id });
      if (!order) {
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
      }

      const oldStatus = order.status;
      order.status = status;
      await order.save();

      // Nếu đơn hàng bị hủy, hoàn trả lại tồn kho sản phẩm
      if (status === 'Đã hủy' && oldStatus !== 'Đã hủy') {
        for (const item of order.items) {
          await Product.updateOne(
            { id: item.id },
            { 
              $inc: { stock: item.qty },
              $set: { inStock: true }
            }
          );
        }

        // Hoàn trả số lượng đơn và chi tiêu của user
        if (order.userId) {
          await User.updateOne(
            { id: order.userId },
            { 
              $inc: { orders: -1, spent: -Math.round(order.total) } 
            }
          );
        }
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái đơn hàng', error: error.message });
    }
  }
};
