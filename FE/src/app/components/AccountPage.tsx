import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import {
  User, Package, MapPin, Heart, Settings, LogOut, Star, ChevronRight,
  Check, Clock, Truck, AlertCircle, Edit2, Plus
} from "lucide-react";
import type { CartItem } from "../App";

const TABS = [
  { id: "profile", label: "Hồ sơ cá nhân", icon: User },
  { id: "orders", label: "Đơn hàng của tôi", icon: Package },
  { id: "addresses", label: "Địa chỉ nhận hàng", icon: MapPin },
  { id: "wishlist", label: "Sản phẩm yêu thích", icon: Heart },
  { id: "settings", label: "Thiết lập tài khoản", icon: Settings },
];

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any }> = {
  "Đang xử lý": { color: "#F59E0B", bg: "rgba(245,158,11,0.15)", icon: Clock },
  "Đang giao hàng": { color: "#3B82F6", bg: "rgba(59,130,246,0.15)", icon: Truck },
  "Đã giao hàng": { color: "#22C55E", bg: "rgba(34,197,94,0.15)", icon: Check },
  "Đã hủy": { color: "#EF4444", bg: "rgba(239,68,68,0.15)", icon: AlertCircle },
};

const ORDER_TIMELINE = [
  { label: "Đã đặt hàng", done: true },
  { label: "Đã thanh toán", done: true },
  { label: "Đang xử lý", done: false, active: true },
  { label: "Đang giao", done: false },
  { label: "Đã nhận", done: false },
];

interface AccountPageProps {
  wishlist: number[];
  toggleWishlist: (id: number) => void;
  addToCart: (item: CartItem) => void;
  currentUser: any;
}

export function AccountPage({ wishlist, toggleWishlist, addToCart, currentUser }: AccountPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    // Keep tab in sync with query parameter if it changes
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!currentUser) return;

    // Load customer orders for logged-in user dynamically using email
    fetch(`/api/orders?customerEmail=${encodeURIComponent(currentUser.email)}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoadingOrders(false);
      })
      .catch(err => {
        console.error("Lỗi tải đơn hàng:", err);
        setLoadingOrders(false);
      });

    // Load all products to show detailed wishlist
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
      })
      .catch(err => console.error("Lỗi tải sản phẩm:", err));
  }, [currentUser]);

  // Filter actual products matching user's wishlist IDs
  const wishlistItems = products.filter(p => wishlist.includes(p.id));

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  return (
    <div style={{ background: "#0F172A", minHeight: "100vh" }}>
      <div className="py-8 px-6 border-b" style={{ background: "linear-gradient(to bottom, #1E293B, #0F172A)", borderColor: "rgba(212,175,55,0.15)" }}>
        <div className="max-w-[1440px] mx-auto flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold uppercase" style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}>
            {currentUser?.name ? currentUser.name[0] : "U"}
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#F8FAFC" }}>{currentUser?.name}</h1>
            <p className="text-sm" style={{ color: "#94A3B8" }}>{currentUser?.email} · Thành viên từ {currentUser?.joined || "2026"}</p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)" }}>
            <Star className="w-4 h-4 fill-current" style={{ color: "#D4AF37" }} />
            <span className="text-sm font-semibold" style={{ color: "#D4AF37" }}>
              {currentUser?.role === "admin" ? "Thành viên Quản trị" : "Thành viên Vàng (Gold)"}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-56 shrink-0">
          <nav className="space-y-1 md:sticky md:top-24">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all"
                style={{
                  background: activeTab === tab.id ? "rgba(212,175,55,0.15)" : "transparent",
                  color: activeTab === tab.id ? "#D4AF37" : "#94A3B8",
                }}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
            <button 
              onClick={() => {
                localStorage.removeItem("user");
                window.location.href = "/";
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left mt-4 transition-all hover:bg-red-500/10 cursor-pointer" 
              style={{ color: "#EF4444" }}
            >
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="rounded-2xl border p-6" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.15)" }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold" style={{ color: "#F8FAFC" }}>Thông tin cá nhân</h2>
                  <button className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "#D4AF37" }}>
                    <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { label: "Tên", value: currentUser?.name ? currentUser.name.split(" ").pop() : "Hàng" },
                    { label: "Họ", value: currentUser?.name ? currentUser.name.split(" ").slice(0, -1).join(" ") : "Khách" },
                    { label: "Email", value: currentUser?.email || "" },
                    { label: "Điện thoại", value: "+84 912 345 678" },
                    { label: "Ngày sinh", value: "15 tháng 3, 1990" },
                    { label: "Giới tính", value: "Nam" },
                  ].map((f) => (
                    <div key={f.label}>
                      <div className="text-xs font-medium mb-1" style={{ color: "#64748B" }}>{f.label}</div>
                      <div className="text-sm font-medium" style={{ color: "#F8FAFC" }}>{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Đơn đã mua", value: orders.length.toString() },
                  { label: "Tổng chi tiêu", value: `$${orders.reduce((sum, o) => sum + (o.status !== "Đã hủy" ? o.total : 0), 0).toLocaleString()}` },
                  { label: "Mẫu cơ yêu thích", value: wishlist.length.toString() },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border p-5 text-center" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.15)" }}>
                    <div className="text-2xl font-bold mb-1" style={{ color: "#D4AF37" }}>{s.value}</div>
                    <div className="text-xs" style={{ color: "#94A3B8" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold" style={{ color: "#F8FAFC" }}>Lịch sử đặt hàng</h2>
              
              {loadingOrders ? (
                <div className="text-center py-10 text-sm text-slate-400">Đang tải lịch sử đơn hàng...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 border rounded-2xl" style={{ borderColor: "rgba(212,175,55,0.1)", background: "#1E293B" }}>
                  <Package className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                  <p className="text-slate-400 text-sm mb-4">Bạn chưa thực hiện đơn hàng nào.</p>
                  <Link to="/products" className="px-5 py-2 rounded-xl text-xs font-semibold" style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}>
                    Mua sắm ngay
                  </Link>
                </div>
              ) : (
                orders.map((order) => {
                  const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG["Đang xử lý"];
                  const isExpanded = expandedOrder === order.id;
                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border overflow-hidden transition-all"
                      style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.15)" }}
                    >
                      <div
                        className="p-5 cursor-pointer flex items-center justify-between gap-4"
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="text-sm font-bold mb-1" style={{ color: "#D4AF37" }}>#{order.id}</div>
                            <div className="text-xs" style={{ color: "#64748B" }}>{order.date}</div>
                          </div>
                          <div>
                            <div className="text-xs mb-1" style={{ color: "#94A3B8" }}>{order.items?.length || 0} sản phẩm</div>
                            <div className="text-sm font-bold" style={{ color: "#F8FAFC" }}>${order.total.toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ background: statusConf.bg, color: statusConf.color }}
                          >
                            <statusConf.icon className="w-3 h-3" />
                            {order.status}
                          </span>
                          <ChevronRight className="w-4 h-4 transition-transform" style={{ color: "#64748B", transform: isExpanded ? "rotate(90deg)" : "none" }} />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t px-5 py-4" style={{ borderColor: "rgba(212,175,55,0.1)", background: "#0F172A" }}>
                          <div className="space-y-3 mb-5">
                            {order.items?.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span style={{ color: "#CBD5E1" }}>×{item.qty} {item.name}</span>
                                <span style={{ color: "#D4AF37" }}>${(item.price * item.qty).toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between text-xs pt-2 border-t" style={{ borderColor: "rgba(212,175,55,0.1)", color: "#64748B" }}>
                              <span>Thanh toán: {order.payment}</span>
                              <span className="font-bold" style={{ color: "#F8FAFC" }}>Tổng tiền: ${order.total.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Order Timeline */}
                          {order.status === "Đang xử lý" && (
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#94A3B8" }}>Tiến trình đơn hàng</div>
                              <div className="flex items-center gap-0 overflow-x-auto pb-2">
                                {ORDER_TIMELINE.map((t, i) => (
                                  <div key={i} className="flex items-center shrink-0">
                                    <div className="flex flex-col items-center">
                                      <div
                                        className="w-6 h-6 rounded-full flex items-center justify-center"
                                        style={{
                                          background: t.done ? "#22C55E" : t.active ? "linear-gradient(135deg, #D4AF37, #A88920)" : "#334155",
                                        }}
                                      >
                                        {t.done ? <Check className="w-3 h-3 text-white" /> : t.active ? <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> : <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#64748B" }} />}
                                      </div>
                                      <div className="text-xs mt-1 text-center w-16" style={{ color: t.done ? "#22C55E" : t.active ? "#D4AF37" : "#64748B" }}>{t.label}</div>
                                    </div>
                                    {i < ORDER_TIMELINE.length - 1 && (
                                      <div className="w-8 h-px mb-6 mx-0.5" style={{ background: t.done ? "#22C55E" : "#334155" }} />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === "addresses" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold" style={{ color: "#F8FAFC" }}>Địa chỉ giao hàng đã lưu</h2>
                <button className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl" style={{ background: "rgba(212,175,55,0.15)", color: "#D4AF37" }}>
                  <Plus className="w-4 h-4" /> Thêm địa chỉ mới
                </button>
              </div>
              {[
                { label: "Nhà riêng", address: "12 Đường Ba Tháng Hai, Quận 10", city: "TP. Hồ Chí Minh, 700000", country: "Việt Nam", default: true },
                { label: "Văn phòng", address: "500 E Fremont Street #200", city: "Las Vegas, NV 89101", country: "United States", default: false },
              ].map((addr, i) => (
                <div key={i} className="rounded-2xl border p-5 flex items-start justify-between" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.15)" }}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(212,175,55,0.1)" }}>
                      <MapPin className="w-5 h-5" style={{ color: "#D4AF37" }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>{addr.label}</span>
                        {addr.default && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}>Mặc định</span>}
                      </div>
                      <div className="text-sm" style={{ color: "#94A3B8" }}>{addr.address}</div>
                      <div className="text-sm" style={{ color: "#94A3B8" }}>{addr.city}</div>
                      <div className="text-sm" style={{ color: "#94A3B8" }}>{addr.country}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-white/5" style={{ borderColor: "rgba(212,175,55,0.2)", color: "#94A3B8" }}>Sửa</button>
                    {!addr.default && <button className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-red-500/10" style={{ borderColor: "rgba(239,68,68,0.2)", color: "#EF4444" }}>Xóa</button>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === "wishlist" && (
            <div>
              <h2 className="text-lg font-semibold mb-4" style={{ color: "#F8FAFC" }}>Sản phẩm yêu thích của tôi</h2>
              {wishlistItems.length === 0 ? (
                <div className="text-center py-16 border rounded-2xl" style={{ borderColor: "rgba(212,175,55,0.1)", background: "#1E293B" }}>
                  <Heart className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                  <p className="text-slate-400 text-sm mb-4">Danh sách yêu thích trống.</p>
                  <Link to="/products" className="px-5 py-2 rounded-xl text-xs font-semibold" style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}>
                    Khám phá cơ bida
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="rounded-2xl border overflow-hidden" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.15)" }}>
                      <div className="relative" style={{ paddingTop: "70%" }}>
                        <Link to={`/products/${item.id}`} className="absolute inset-0 block">
                          <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                        </Link>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(item.id); }}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-slate-900/80 text-yellow-500 hover:text-slate-200 transition-all z-10"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="p-4">
                        <div className="text-xs font-bold uppercase mb-1" style={{ color: "#D4AF37" }}>{item.brand}</div>
                        <Link to={`/products/${item.id}`} className="text-sm font-semibold mb-2 block hover:text-yellow-400 transition-colors line-clamp-2" style={{ color: "#F8FAFC" }}>{item.name}</Link>
                        <div className="flex items-center gap-1.5 mb-3">
                          <div className="flex">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3 h-3 fill-current" style={{ color: s <= Math.floor(item.rating) ? "#D4AF37" : "#334155" }} />)}</div>
                          <span className="text-xs" style={{ color: "#94A3B8" }}>{item.rating}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold" style={{ color: "#D4AF37" }}>${item.price.toFixed(2)}</span>
                          <button 
                            onClick={() => item.inStock && addToCart({ id: item.id, name: item.name, brand: item.brand, price: item.price, image: item.image, quantity: 1 })}
                            disabled={!item.inStock}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40" 
                            style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}
                          >
                            {item.inStock ? "Thêm giỏ hàng" : "Hết hàng"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold" style={{ color: "#F8FAFC" }}>Cài đặt tài khoản</h2>
              <div className="rounded-2xl border p-6" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.15)" }}>
                <h3 className="text-sm font-semibold mb-5" style={{ color: "#F8FAFC" }}>Đổi mật khẩu</h3>
                <div className="space-y-4">
                  {["Mật khẩu hiện tại", "Mật khẩu mới", "Xác nhận mật khẩu mới"].map((label) => (
                    <div key={label}>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>{label}</label>
                      <input type="password" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none" style={{ background: "#0F172A", borderColor: "rgba(212,175,55,0.2)", color: "#F8FAFC" }} />
                    </div>
                  ))}
                  <button className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}>
                    Cập nhật mật khẩu
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border p-6" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.15)" }}>
                <h3 className="text-sm font-semibold mb-5" style={{ color: "#F8FAFC" }}>Thông báo</h3>
                <div className="space-y-4">
                  {[
                    { label: "Cập nhật đơn hàng", desc: "Gửi email cho tôi khi trạng thái đơn hàng thay đổi" },
                    { label: "Khuyến mãi & Tin tức", desc: "Nhận thông báo ưu đãi và giảm giá độc quyền" },
                    { label: "Hàng mới về", desc: "Nhận tin tức sớm nhất khi có thiết bị bida mới" },
                  ].map((n) => (
                    <label key={n.label} className="flex items-center justify-between cursor-pointer">
                      <div>
                        <div className="text-sm font-medium" style={{ color: "#F8FAFC" }}>{n.label}</div>
                        <div className="text-xs" style={{ color: "#94A3B8" }}>{n.desc}</div>
                      </div>
                      <input type="checkbox" defaultChecked style={{ accentColor: "#D4AF37" }} className="w-4 h-4" />
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border p-6" style={{ background: "rgba(239,68,68,0.05)", borderColor: "rgba(239,68,68,0.2)" }}>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "#EF4444" }}>Khu vực bảo mật</h3>
                <p className="text-xs mb-4" style={{ color: "#94A3B8" }}>Xóa vĩnh viễn tài khoản của bạn và toàn bộ dữ liệu đơn hàng.</p>
                <button className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all hover:bg-red-500/10" style={{ borderColor: "rgba(239,68,68,0.5)", color: "#EF4444" }}>
                  Xóa tài khoản
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
