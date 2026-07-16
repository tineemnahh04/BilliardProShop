import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', userRoutes);

// Base route for sanity check
app.get('/', (req, res) => {
  res.send('Billiard Pro Shop API is running...');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống từ phía server' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[OK] Backend Express server đang chạy trên cổng ${PORT}`);
});
