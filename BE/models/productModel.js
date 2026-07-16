import { readDB, writeDB } from './dbHelper.js';

export const ProductModel = {
  getAll: () => {
    const db = readDB();
    return db.products || [];
  },

  getById: (id) => {
    const db = readDB();
    return (db.products || []).find(p => p.id === parseInt(id));
  },

  create: (productData) => {
    const db = readDB();
    const products = db.products || [];
    
    // Generate new unique ID
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    
    // Default values for detailed specs if not provided
    const newProduct = {
      id: newId,
      name: productData.name || '',
      brand: productData.brand || '',
      category: productData.category || '',
      price: parseFloat(productData.price) || 0.0,
      originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : null,
      rating: parseFloat(productData.rating) || 5.0,
      reviews: parseInt(productData.reviews) || 0,
      badge: productData.badge || null,
      image: productData.image || 'https://images.unsplash.com/photo-1545062080-a71640ea75a1?w=300&h=300&fit=crop',
      images: productData.images || [productData.image],
      inStock: productData.inStock !== undefined ? productData.inStock : true,
      stock: parseInt(productData.stock) || 10,
      sku: productData.sku || `BPS-${newId}-${Date.now().toString().slice(-4)}`,
      description: productData.description || 'Mô tả đang được cập nhật.',
      weights: productData.weights || ["19oz"],
      shafts: productData.shafts || ["Tiêu chuẩn"],
      tipSizes: productData.tipSizes || ["13mm"],
      specs: productData.specs || [
        { "label": "Chất liệu", "value": "Gỗ phong sấy cao cấp" },
        { "label": "Chiều dài", "value": "58 inches" }
      ],
      reviewsList: productData.reviewsList || []
    };

    products.push(newProduct);
    db.products = products;
    writeDB(db);
    return newProduct;
  },

  update: (id, updatedFields) => {
    const db = readDB();
    const products = db.products || [];
    const index = products.findIndex(p => p.id === parseInt(id));
    
    if (index === -1) return null;

    // Preserve specs if not overwritten or format appropriately
    const updatedProduct = {
      ...products[index],
      ...updatedFields,
      // Ensure numerical conversion
      price: updatedFields.price !== undefined ? parseFloat(updatedFields.price) : products[index].price,
      originalPrice: updatedFields.originalPrice !== undefined ? (updatedFields.originalPrice ? parseFloat(updatedFields.originalPrice) : null) : products[index].originalPrice,
      stock: updatedFields.stock !== undefined ? parseInt(updatedFields.stock) : products[index].stock,
      inStock: updatedFields.stock !== undefined ? parseInt(updatedFields.stock) > 0 : (updatedFields.inStock !== undefined ? updatedFields.inStock : products[index].inStock)
    };

    products[index] = updatedProduct;
    db.products = products;
    writeDB(db);
    return updatedProduct;
  },

  delete: (id) => {
    const db = readDB();
    const products = db.products || [];
    const index = products.findIndex(p => p.id === parseInt(id));
    
    if (index === -1) return false;

    products.splice(index, 1);
    db.products = products;
    writeDB(db);
    return true;
  }
};
