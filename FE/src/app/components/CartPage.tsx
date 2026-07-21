import { useState } from "react";
import { Link } from "react-router";
import { Minus, Plus, Trash2, Tag, ShoppingBag, ArrowRight, Shield, Truck } from "lucide-react";
import type { CartItem } from "../App";

interface CartPageProps {
  cartItems: CartItem[];
  updateQty: (id: number, qty: number) => void;
  removeFromCart: (id: number) => void;
  addToCart: (item: CartItem) => void;
}

const SUGGESTED = [
  { id: 4, name: "Hộp Lơ Bida Cao Cấp Kamui Black", brand: "Kamui", price: 14.99, image: "https://images.unsplash.com/photo-1544281153-6603be88b354?w=200&h=200&fit=crop" },
  { id: 8, name: "Găng Tay Bida Cuetec Pro Glove", brand: "Cuetec", price: 24.99, image: "https://images.unsplash.com/photo-1544281153-6603be88b354?w=200&h=200&fit=crop" },
  { id: 11, name: "Đầu Tẩy Bida Kamui Clear Tip Soft", brand: "Kamui", price: 19.99, image: "https://images.unsplash.com/photo-1544281153-6603be88b354?w=200&h=200&fit=crop" },
];

export function CartPage({ cartItems, updateQty, removeFromCart, addToCart }: CartPageProps) {
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState("percentage");

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = discountType === "percentage" ? subtotal * (discountValue / 100) : discountValue;
  const hasBlindBoxReward = cartItems.some(i => i.price === 0 || (i.name && i.name.includes("Túi Mù")));
  const shipping = (subtotal >= 150 || hasBlindBoxReward) ? 0 : 12.99;
  const total = Math.max(0, subtotal - discount + shipping);

  const applyCoupon = () => {
    setCouponError("");
    fetch('/api/coupons/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("token") || ""}`
      },
      body: JSON.stringify({ code: coupon, subtotal })
    })
      .then(res => res.json())
      .then(data => {
        if (data.isValid) {
          setAppliedCoupon(data.code);
          setDiscountValue(data.discount);
          setDiscountType(data.type);
          setCouponError("");
        } else {
          setCouponError(data.message || "Mã giảm giá không hợp lệ");
          setAppliedCoupon("");
          setDiscountValue(0);
        }
      })
      .catch(err => {
        console.error("Lỗi áp dụng coupon:", err);
        setCouponError("Không thể kết nối đến server");
      });
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ background: "#0F172A", minHeight: "100vh" }} className="flex flex-col items-center justify-center py-32 px-6 text-center">
        <div className="text-6xl mb-6">🎱</div>
        <h2 className="text-2xl font-bold mb-3" style={{ color: "#F8FAFC" }}>Giỏ hàng của bạn đang trống</h2>
        <p className="text-sm mb-8" style={{ color: "#94A3B8" }}>Khám phá các thiết bị bida nhập khẩu chính hãng cao cấp nhất tại cửa hàng.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm"
          style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}
        >
          <ShoppingBag className="w-4 h-4" /> Mua Sắm Ngay
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: "#0F172A", minHeight: "100vh" }}>
      <div
        className="py-8 px-6 border-b"
        style={{ background: "linear-gradient(to bottom, #1E293B, #0F172A)", borderColor: "rgba(212,175,55,0.15)" }}
      >
        <div className="max-w-[1440px] mx-auto">
          <h1 className="text-3xl font-bold" style={{ color: "#F8FAFC" }}>
            Giỏ Hàng <span className="text-lg font-normal" style={{ color: "#94A3B8" }}>({cartItems.length} sản phẩm)</span>
          </h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border p-5 flex gap-5 transition-all hover:border-yellow-400/20"
              style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.15)" }}
            >
              <img src={item.image} alt={item.name} className="w-24 h-24 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#D4AF37" }}>{item.brand}</div>
                <div className="text-sm font-semibold mb-1 line-clamp-2" style={{ color: "#F8FAFC" }}>{item.name}</div>
                {item.variant && <div className="text-xs mb-3" style={{ color: "#94A3B8" }}>{item.variant}</div>}
                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-xl border overflow-hidden" style={{ borderColor: "rgba(212,175,55,0.2)" }}>
                    <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/5 transition-colors" style={{ color: "#F8FAFC" }}>
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold" style={{ color: "#F8FAFC" }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/5 transition-colors" style={{ color: "#F8FAFC" }}>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="flex items-center gap-1.5 text-xs transition-colors hover:text-red-400"
                    style={{ color: "#64748B" }}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Xóa
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-bold" style={{ color: "#D4AF37" }}>${(item.price * item.quantity).toFixed(2)}</div>
                {item.quantity > 1 && <div className="text-xs" style={{ color: "#94A3B8" }}>${item.price.toFixed(2)} / mỗi cái</div>}
              </div>
            </div>
          ))}

          {/* Suggested */}
          <div className="rounded-2xl border p-5" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.1)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "#F8FAFC" }}>Thường Được Mua Cùng Nhau</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {SUGGESTED.map((s) => (
                <div key={s.id} className="shrink-0 flex items-center gap-3 p-3 rounded-xl" style={{ background: "#0F172A", minWidth: "200px" }}>
                  <img src={s.image} alt={s.name} className="w-14 h-14 rounded-lg object-cover" />
                  <div>
                    <div className="text-xs font-bold" style={{ color: "#D4AF37" }}>{s.brand}</div>
                    <div className="text-xs font-medium mb-2 line-clamp-1" style={{ color: "#F8FAFC" }}>{s.name}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: "#D4AF37" }}>${s.price}</span>
                      <button 
                        onClick={() => addToCart({ id: s.id, name: s.name, brand: s.brand, price: s.price, image: s.image, quantity: 1 })}
                        className="text-xs px-2.5 py-1 rounded-lg font-bold transition-all duration-300 cursor-pointer hover:bg-yellow-400 hover:text-slate-950 hover:scale-105 hover:shadow-[0_0_10px_rgba(212,175,55,0.4)] active:scale-95" 
                        style={{ background: "rgba(212,175,55,0.15)", color: "#D4AF37" }}
                      >
                        + Thêm
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="rounded-2xl border p-6 sticky top-24" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.2)" }}>
            <h2 className="text-lg font-bold mb-6" style={{ color: "#F8FAFC" }}>Tóm tắt đơn hàng</h2>

            <div className="space-y-3 pb-4 mb-4 border-b" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#94A3B8" }}>Tạm tính ({cartItems.reduce((s, i) => s + i.quantity, 0)} sản phẩm)</span>
                <span style={{ color: "#F8FAFC" }}>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: "#22C55E" }}>
                    Mã giảm giá ({appliedCoupon || "MÃ GIẢM GIÁ"} -{discountType === "percentage" ? `${discountValue}%` : `$${discountValue}`})
                  </span>
                  <span style={{ color: "#22C55E" }}>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span style={{ color: "#94A3B8" }}>Phí vận chuyển</span>
                <span style={{ color: shipping === 0 ? "#22C55E" : "#F8FAFC" }}>
                  {shipping === 0 ? "MIỄN PHÍ" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <div className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(212,175,55,0.08)", color: "#94A3B8" }}>
                  Mua thêm ${(150 - subtotal).toFixed(2)} để được miễn phí vận chuyển
                </div>
              )}
            </div>

            <div className="flex justify-between mb-6">
              <span className="font-bold" style={{ color: "#F8FAFC" }}>Tổng cộng</span>
              <span className="text-xl font-bold" style={{ color: "#D4AF37" }}>${total.toFixed(2)}</span>
            </div>

            {/* Coupon */}
            <div className="mb-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94A3B8" }} />
                  <input
                    value={coupon}
                    onChange={(e) => { setCoupon(e.target.value); setCouponError(""); }}
                    placeholder="Nhập mã giảm giá"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ background: "#0F172A", borderColor: "rgba(212,175,55,0.2)", color: "#F8FAFC" }}
                  />
                </div>
                <button
                  onClick={applyCoupon}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-yellow-400/10"
                  style={{ borderColor: "#D4AF37", color: "#D4AF37" }}
                >
                  Áp dụng
                </button>
              </div>
              {couponError && <p className="text-xs mt-2" style={{ color: "#EF4444" }}>{couponError}</p>}
              {appliedCoupon && <p className="text-xs mt-2" style={{ color: "#22C55E" }}>✓ Áp dụng mã giảm giá thành công!</p>}
              <p className="text-xs mt-2" style={{ color: "#64748B" }}>Mã gợi ý: PROSHOT</p>
            </div>

            <Link
              to="/checkout"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 mb-4"
              style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}
            >
              Tiến Hành Thanh Toán <ArrowRight className="w-4 h-4" />
            </Link>

            <Link to="/products" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium text-sm border transition-all hover:bg-white/5" style={{ borderColor: "rgba(212,175,55,0.2)", color: "#94A3B8" }}>
              Tiếp Tục Mua Sắm
            </Link>

            <div className="flex items-center gap-2 mt-5 pt-5 border-t" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
              <Shield className="w-4 h-4 shrink-0" style={{ color: "#D4AF37" }} />
              <span className="text-xs" style={{ color: "#64748B" }}>Thanh toán an toàn. Thông tin của bạn được bảo vệ mã hóa SSL 256-bit.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
