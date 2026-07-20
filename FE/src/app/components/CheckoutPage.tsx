import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronRight, Shield, Check, CreditCard, Smartphone, Package, MapPin, User, Mail, Phone, Tag } from "lucide-react";
import type { CartItem } from "../App";

const STEPS = ["Thông tin nhận hàng", "Thanh toán", "Xác nhận đơn hàng", "Hoàn tất"];

interface CheckoutPageProps {
  cartItems: CartItem[];
  clearCart: () => void;
  currentUser: any;
}

export function CheckoutPage({ cartItems, clearCart, currentUser }: CheckoutPageProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => {
    const names = currentUser?.name ? currentUser.name.split(" ") : ["Khách", "Hàng"];
    const firstName = names[names.length - 1] || "Hàng";
    const lastName = names.slice(0, names.length - 1).join(" ") || "Khách";
    return {
      firstName: firstName,
      lastName: lastName,
      email: currentUser?.email || "",
      phone: currentUser?.phone || "+84 912 345 678",
      address: currentUser?.address || "12 Đường Ba Tháng Hai",
      city: "TP. Hồ Chí Minh",
      state: "Quận 10",
      zip: "700000",
      country: "Việt Nam"
    };
  });
  
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState("percentage");
  const [couponError, setCouponError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = discountType === "percentage" ? subtotal * (discountValue / 100) : discountValue;
  const shipping = subtotal >= 150 ? 0 : 12.99;
  const total = subtotal - discount + shipping;

  const updateForm = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const applyCoupon = () => {
    setCouponError("");
    fetch('/api/coupons/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("token") || ""}`
      },
      body: JSON.stringify({ code: couponCode, subtotal })
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

  const handlePlaceOrder = () => {
    setLoading(true);
    const orderData = {
      customerName: `${form.firstName} ${form.lastName}`.trim(),
      customerEmail: form.email,
      phone: form.phone,
      address: `${form.address}, ${form.city}, ${form.state} ${form.zip}, ${form.country}`,
      payment: paymentMethod === 'vnpay' ? 'VNPAY' : paymentMethod === 'momo' ? 'MoMo' : 'COD',
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        qty: item.quantity,
        price: item.price,
        variant: item.variant || null
      })),
      couponApplied: appliedCoupon || null
    };

    fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("token") || ""}`
      },
      body: JSON.stringify(orderData)
    })
      .then(res => {
        if (!res.ok) throw new Error("Không thể đặt hàng");
        return res.json();
      })
      .then(data => {
        setCreatedOrder(data);
        setCompleted(true);
        setStep(3);
        clearCart();
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi đặt hàng:", err);
        alert("Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại.");
        setLoading(false);
      });
  };

  if (completed && createdOrder) {
    return (
      <div style={{ background: "#0F172A", minHeight: "100vh" }} className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
        >
          <Check className="w-10 h-10" style={{ color: "#fff" }} />
        </div>
        <h1 className="text-3xl font-bold mb-3" style={{ color: "#F8FAFC" }}>Đặt Hàng Thành Công!</h1>
        <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>Cảm ơn bạn đã mua sắm tại cửa hàng, {form.firstName}!</p>
        <p className="text-sm mb-1" style={{ color: "#94A3B8" }}>
          Đơn hàng <span style={{ color: "#D4AF37" }}>#{createdOrder.id}</span> đã được ghi nhận.
        </p>
        <p className="text-sm mb-8" style={{ color: "#94A3B8" }}>Thư xác nhận chi tiết đơn hàng đã được gửi tới {form.email}.</p>

        <div className="w-full max-w-md rounded-2xl border p-6 mb-8 text-left" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.2)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "#F8FAFC" }}>Dòng thời gian đơn hàng</h3>
          {[
            { label: "Đã đặt hàng thành công", date: createdOrder.date, status: "done" },
            { label: "Xác nhận thanh toán", date: createdOrder.date, status: "done" },
            { label: "Đang chuẩn bị hàng", date: "Dự kiến trong hôm nay", status: "active" },
            { label: "Đang giao hàng", date: "Dự kiến sau 2-3 ngày", status: "pending" },
            { label: "Giao hàng thành công", date: "Dự kiến sau 4-5 ngày", status: "pending" },
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  background: t.status === "done" ? "linear-gradient(135deg, #22C55E, #16A34A)" : t.status === "active" ? "linear-gradient(135deg, #D4AF37, #A88920)" : "#334155",
                }}
              >
                {t.status === "done" && <Check className="w-3.5 h-3.5 text-white" />}
                {t.status === "active" && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                {t.status === "pending" && <div className="w-2 h-2 rounded-full" style={{ background: "#64748B" }} />}
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: t.status === "pending" ? "#94A3B8" : "#F8FAFC" }}>{t.label}</div>
                <div className="text-xs" style={{ color: "#64748B" }}>{t.date}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <Link to="/account?tab=orders" className="px-6 py-3 rounded-xl text-sm font-semibold border transition-all hover:bg-white/5" style={{ borderColor: "rgba(212,175,55,0.3)", color: "#D4AF37" }}>
            Theo Dõi Đơn Hàng
          </Link>
          <Link to="/" className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}>
            Tiếp Tục Mua Sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0F172A", minHeight: "100vh" }}>
      <div className="py-8 px-6 border-b" style={{ background: "linear-gradient(to bottom, #1E293B, #0F172A)", borderColor: "rgba(212,175,55,0.15)" }}>
        <div className="max-w-[1440px] mx-auto">
          <h1 className="text-2xl font-bold mb-6" style={{ color: "#F8FAFC" }}>Thanh Toán</h1>
          {/* Stepper */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: i < step ? "#22C55E" : i === step ? "linear-gradient(135deg, #D4AF37, #A88920)" : "#334155",
                      color: i <= step ? "#0F172A" : "#64748B",
                    }}
                  >
                    {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className="text-sm font-medium hidden sm:block" style={{ color: i === step ? "#D4AF37" : i < step ? "#22C55E" : "#64748B" }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-8 sm:w-16 h-px mx-2" style={{ background: i < step ? "#22C55E" : "rgba(212,175,55,0.2)" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Area */}
        <div className="lg:col-span-2">
          {step === 0 && (
            <div className="rounded-2xl border p-6" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.15)" }}>
              <h2 className="text-lg font-semibold mb-6" style={{ color: "#F8FAFC" }}>
                Thông tin nhận hàng
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  { key: "lastName", label: "Họ", icon: User },
                  { key: "firstName", label: "Tên", icon: User },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>{label}</label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748B" }} />
                      <input
                        value={(form as any)[key]}
                        onChange={(e) => updateForm(key, e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:border-yellow-400/50"
                        style={{ background: "#0F172A", borderColor: "rgba(212,175,55,0.2)", color: "#F8FAFC" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {[
                  { key: "email", label: "Địa chỉ Email", icon: Mail },
                  { key: "phone", label: "Số điện thoại", icon: Phone },
                  { key: "address", label: "Số nhà, tên đường", icon: MapPin },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>{label}</label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748B" }} />
                      <input
                        value={(form as any)[key]}
                        onChange={(e) => updateForm(key, e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:border-yellow-400/50"
                        style={{ background: "#0F172A", borderColor: "rgba(212,175,55,0.2)", color: "#F8FAFC" }}
                      />
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { key: "city", label: "Thành phố / Tỉnh" },
                    { key: "state", label: "Quận / Huyện" },
                    { key: "zip", label: "Mã bưu chính" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>{label}</label>
                      <input
                        value={(form as any)[key]}
                        onChange={(e) => updateForm(key, e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                        style={{ background: "#0F172A", borderColor: "rgba(212,175,55,0.2)", color: "#F8FAFC" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setStep(1)}
                className="mt-6 w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}
              >
                Tiếp tục đến thanh toán <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="rounded-2xl border p-6" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.15)" }}>
              <h2 className="text-lg font-semibold mb-6" style={{ color: "#F8FAFC" }}>Phương thức thanh toán</h2>

              <div className="space-y-3 mb-6">
                {[
                  { id: "vnpay", label: "Cổng thanh toán VNPAY", desc: "Thanh toán bằng thẻ ATM, Visa, Mastercard hoặc QR code", icon: CreditCard, color: "#3B82F6" },
                  { id: "momo", label: "Ví điện tử MoMo", desc: "Thanh toán siêu tốc qua ứng dụng MoMo", icon: Smartphone, color: "#EC4899" },
                  { id: "cod", label: "Thanh toán khi giao hàng (COD)", desc: "Trả tiền mặt cho shipper khi nhận được hàng", icon: Package, color: "#22C55E" },
                ].map((method) => (
                  <label
                    key={method.id}
                    className="flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all"
                    style={{
                      background: paymentMethod === method.id ? "rgba(212,175,55,0.08)" : "#0F172A",
                      borderColor: paymentMethod === method.id ? "#D4AF37" : "rgba(212,175,55,0.15)",
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      style={{ accentColor: "#D4AF37" }}
                    />
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${method.color}20` }}>
                      <method.icon className="w-5 h-5" style={{ color: method.color }} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>{method.label}</div>
                      <div className="text-xs" style={{ color: "#94A3B8" }}>{method.desc}</div>
                    </div>
                    {paymentMethod === method.id && (
                      <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#22C55E" }}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </label>
                ))}
              </div>

              {paymentMethod === "vnpay" && (
                <div className="rounded-xl p-4 mb-6" style={{ background: "#0F172A", border: "1px solid rgba(59,130,246,0.3)" }}>
                  <div className="text-xs font-medium mb-3" style={{ color: "#94A3B8" }}>Thông tin thẻ quốc tế</div>
                  <div className="space-y-3">
                    <input placeholder="Số thẻ bida" className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.2)", color: "#F8FAFC" }} />
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="Tháng / Năm hết hạn (MM / YY)" className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.2)", color: "#F8FAFC" }} />
                      <input placeholder="Mã bảo mật CVV" className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.2)", color: "#F8FAFC" }} />
                    </div>
                    <input placeholder="Họ tên chủ thẻ viết không dấu" className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.2)", color: "#F8FAFC" }} />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="px-6 py-3 rounded-xl text-sm font-medium border transition-all hover:bg-white/5" style={{ borderColor: "rgba(212,175,55,0.2)", color: "#94A3B8" }}>
                  Quay lại
                </button>
                <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}>
                  Kiểm tra đơn hàng <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="rounded-2xl border p-6" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.15)" }}>
              <h2 className="text-lg font-semibold mb-6" style={{ color: "#F8FAFC" }}>Xác nhận lại đơn hàng</h2>

              <div className="rounded-xl p-4 mb-4" style={{ background: "#0F172A" }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#94A3B8" }}>Địa chỉ giao hàng</div>
                <div className="text-sm" style={{ color: "#F8FAFC" }}>{form.firstName} {form.lastName}</div>
                <div className="text-sm" style={{ color: "#94A3B8" }}>{form.address}, {form.city}, {form.state} {form.zip}</div>
                <div className="text-sm" style={{ color: "#94A3B8" }}>{form.email} · {form.phone}</div>
              </div>

              <div className="rounded-xl p-4 mb-6" style={{ background: "#0F172A" }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#94A3B8" }}>Phương thức thanh toán</div>
                <div className="text-sm" style={{ color: "#F8FAFC" }}>
                  {paymentMethod === "vnpay" ? "Thẻ tín dụng VNPAY" : paymentMethod === "momo" ? "Ví điện tử MoMo" : "Thanh toán tiền mặt khi nhận hàng (COD)"}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 text-sm line-clamp-1" style={{ color: "#F8FAFC" }}>{item.name}</div>
                    <div className="text-sm font-semibold" style={{ color: "#D4AF37" }}>×{item.quantity} ${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl text-sm font-medium border transition-all hover:bg-white/5" style={{ borderColor: "rgba(212,175,55,0.2)", color: "#94A3B8" }}>
                  Quay lại
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)", color: "#fff" }}
                >
                  <Shield className="w-4 h-4" /> {loading ? "Đang xử lý..." : `Đặt Hàng Ngay — $${total.toFixed(2)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <div className="rounded-2xl border p-5 sticky top-24" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.2)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "#F8FAFC" }}>Tóm tắt sản phẩm</h3>
            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold" style={{ background: "#D4AF37", color: "#0F172A" }}>{item.quantity}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: "#F8FAFC" }}>{item.name}</div>
                    {item.variant && <div className="text-xs" style={{ color: "#64748B" }}>{item.variant}</div>}
                  </div>
                  <span className="text-sm font-semibold shrink-0" style={{ color: "#D4AF37" }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Check coupon in checkout too */}
            <div className="flex gap-2 mb-4 pt-3 border-t" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
              <input
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
                placeholder="Mã giảm giá"
                className="w-full px-3 py-1.5 rounded-lg border text-xs outline-none"
                style={{ background: "#0F172A", borderColor: "rgba(212,175,55,0.2)", color: "#F8FAFC" }}
              />
              <button
                onClick={applyCoupon}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                style={{ borderColor: "#D4AF37", color: "#D4AF37" }}
              >
                Áp dụng
              </button>
            </div>
            {couponError && <p className="text-xs text-red-500 mb-3">⚠ {couponError}</p>}
            {appliedCoupon && (
              <p className="text-xs text-green-500 mb-3">
                ✓ Đã áp dụng mã giảm giá {appliedCoupon} (-{discountType === 'percentage' ? `${discountValue}%` : `$${discountValue}`})!
              </p>
            )}

            <div className="pt-4 border-t space-y-2" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#94A3B8" }}>Tạm tính</span>
                <span style={{ color: "#F8FAFC" }}>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-500">
                  <span>Giảm giá</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span style={{ color: "#94A3B8" }}>Vận chuyển</span>
                <span style={{ color: shipping === 0 ? "#22C55E" : "#F8FAFC" }}>{shipping === 0 ? "MIỄN PHÍ" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
                <span style={{ color: "#F8FAFC" }}>Tổng tiền thanh toán</span>
                <span style={{ color: "#D4AF37" }}>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
