import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/billiard_pro_shop');
    console.log(`[OK] MongoDB đã kết nối thành công: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[ERROR] Lỗi kết nối MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
