import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ScrollToTop } from "./components/ScrollToTop";
import { HomePage } from "./components/HomePage";
import { ProductListingPage } from "./components/ProductListingPage";
import { ProductDetailPage } from "./components/ProductDetailPage";
import { CartPage } from "./components/CartPage";
import { CheckoutPage } from "./components/CheckoutPage";
import { AccountPage } from "./components/AccountPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { AuthPage } from "./components/AuthPage";
import { AICueFinderPage } from "./components/AICueFinderPage";
import { MarketplacePage } from "./components/MarketplacePage";
import { MarketplaceDetailPage } from "./components/MarketplaceDetailPage";

export type CartItem = {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
};

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Predator 2SE 4-Point Pool Cue",
      brand: "Predator",
      price: 349.99,
      image: "https://images.unsplash.com/photo-1599685315659-bc876da49fe5?w=300&h=300&fit=crop",
      quantity: 1,
      variant: "19oz / Z-3 Shaft",
    },
  ]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // Sync wishlist when user logs in or out
  useEffect(() => {
    if (currentUser && currentUser.wishlist) {
      setWishlist(currentUser.wishlist);
    } else {
      setWishlist([]);
    }
  }, [currentUser]);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) {
      setCartItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setCartItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i));
    }
  };

  const removeFromCart = (id: number) => setCartItems((prev) => prev.filter((i) => i.id !== id));

  const toggleWishlist = (id: number) => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để sử dụng tính năng yêu thích!");
      return;
    }
    fetch('/api/auth/wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify({ productId: id })
    })
      .then(res => {
        if (!res.ok) throw new Error("Lỗi cập nhật wishlist");
        return res.json();
      })
      .then(data => {
        if (data.wishlist) {
          setWishlist(data.wishlist);
          const updatedUser = { ...currentUser, wishlist: data.wishlist };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
        }
      })
      .catch(err => {
        console.error("Lỗi cập nhật wishlist:", err);
      });
  };

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setCurrentUser(null);
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen" style={{ background: "#0F172A", color: "#F8FAFC" }}>
        <Routes>
          <Route 
            path="/admin/*" 
            element={
              currentUser?.role === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route
            path="*"
            element={
              <>
                <Navbar 
                  cartCount={cartCount} 
                  wishlistCount={wishlist.length} 
                  currentUser={currentUser} 
                  onLogout={handleLogout} 
                  onSwitchAccount={handleLoginSuccess}
                />
                <Routes>
                  <Route path="/" element={<HomePage addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
                  <Route path="/products" element={<ProductListingPage addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
                  <Route path="/products/:id" element={<ProductDetailPage addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
                  <Route path="/ai-cue-finder" element={<AICueFinderPage addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
                  <Route path="/marketplace" element={<MarketplacePage currentUser={currentUser} />} />
                  <Route path="/marketplace/:id" element={<MarketplaceDetailPage currentUser={currentUser} />} />
                  <Route path="/cart" element={<CartPage cartItems={cartItems} updateQty={updateQty} removeFromCart={removeFromCart} />} />
                  <Route path="/checkout" element={<CheckoutPage cartItems={cartItems} clearCart={() => setCartItems([])} currentUser={currentUser} />} />
                  <Route path="/account" element={currentUser ? <AccountPage wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} currentUser={currentUser} /> : <Navigate to="/login" replace />} />
                  <Route path="/login" element={<AuthPage onLoginSuccess={handleLoginSuccess} />} />
                  <Route path="/wishlist" element={<Navigate to="/account?tab=wishlist" replace />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <Footer />
              </>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
