import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart2, Archive,
  Tag, Settings, ChevronRight, Star, Search, Bell, LogOut, Target,
  Eye, Edit2, Trash2, Plus, Filter, Download, CheckCircle, Clock, Truck,
  XCircle, MoreVertical, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const NAV_ITEMS = [
  { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { id: "orders", label: "Đơn hàng", icon: ShoppingCart },
  { id: "products", label: "Sản phẩm", icon: Package },
  { id: "customers", label: "Khách hàng", icon: Users },
  { id: "analytics", label: "Phân tích doanh số", icon: BarChart2 },
  { id: "inventory", label: "Kho hàng", icon: Archive },
  { id: "promotions", label: "Khuyến mãi", icon: Tag },
  { id: "settings", label: "Thiết lập", icon: Settings },
];

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any }> = {
  "Đang xử lý": { color: "#F59E0B", bg: "rgba(245,158,11,0.15)", icon: Clock },
  "Đang giao hàng": { color: "#3B82F6", bg: "rgba(59,130,246,0.15)", icon: Truck },
  "Đã giao hàng": { color: "#22C55E", bg: "rgba(34,197,94,0.15)", icon: CheckCircle },
  "Đã hủy": { color: "#EF4444", bg: "rgba(239,68,68,0.15)", icon: XCircle },
  "Đang hoạt động": { color: "#22C55E", bg: "rgba(34,197,94,0.15)", icon: CheckCircle },
  "Đang khóa": { color: "#EF4444", bg: "rgba(239,68,68,0.15)", icon: XCircle },
  "Còn hàng": { color: "#22C55E", bg: "rgba(34,197,94,0.15)", icon: CheckCircle },
  "Sắp hết hàng": { color: "#F59E0B", bg: "rgba(245,158,11,0.15)", icon: Clock },
  "Hết hàng": { color: "#EF4444", bg: "rgba(239,68,68,0.15)", icon: XCircle },
};

type OrderSortField = "id" | "customerName" | "phone" | "total" | "payment" | "status" | "date";

const parseOrderDate = (dateStr: string) => {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return 0;
  const [day, month, year] = parts.map(Number);
  return new Date(year, month - 1, day).getTime();
};

const ORDER_STATUS_ORDER = ["Đang xử lý", "Đang giao hàng", "Đã giao hàng", "Đã hủy"];

const getOrderStatusRank = (status: string) => {
  const index = ORDER_STATUS_ORDER.indexOf(status);
  return index === -1 ? ORDER_STATUS_ORDER.length : index;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border p-3 shadow-xl" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.3)" }}>
        <p className="text-xs font-medium mb-2" style={{ color: "#94A3B8" }}>Tháng {label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name === "revenue" ? "Doanh thu" : "Đơn hàng"}: {p.name === "revenue" ? `$${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderSort, setOrderSort] = useState<{ field: OrderSortField; dir: "asc" | "desc" }>({
    field: "date",
    dir: "desc",
  });
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [chartPeriod, setChartPeriod] = useState("year");

  // Fetch States
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockQty, setStockQty] = useState("10");
  
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Coupon States
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [showEditCouponModal, setShowEditCouponModal] = useState(false);
  const [showDeleteCouponModal, setShowDeleteCouponModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [couponForm, setCouponForm] = useState({
    code: "",
    discount: "",
    type: "percentage",
    minSpend: "0",
    isActive: true,
    expiryDate: ""
  });

  // Form States
  const [productForm, setProductForm] = useState({
    name: "", brand: "", category: "", price: "", originalPrice: "",
    stock: "", badge: "", sku: "", image: "", description: ""
  });

  const loadData = () => {
    setLoading(true);
    const authHeaders = { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` };
    Promise.all([
      fetch('/api/products', { headers: authHeaders }).then(res => res.json()),
      fetch('/api/orders', { headers: authHeaders }).then(res => res.json()),
      fetch('/api/customers', { headers: authHeaders }).then(res => res.json()),
      fetch('/api/analytics', { headers: authHeaders }).then(res => res.json()),
      fetch('/api/coupons', { headers: authHeaders }).then(res => res.json())
    ])
      .then(([prods, ords, custs, analy, coups]) => {
        setProducts(prods);
        setOrders(ords);
        setCustomers(custs);
        setAnalytics(analy);
        setCoupons(Array.isArray(coups) ? coups : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi tải thông tin admin:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/products', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify(productForm)
    })
      .then(res => res.json())
      .then(() => {
        setShowAddModal(false);
        resetProductForm();
        loadData();
      })
      .catch(err => console.error(err));
  };

  const handleEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    fetch(`/api/products/${selectedProduct.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify(productForm)
    })
      .then(res => res.json())
      .then(() => {
        setShowEditModal(false);
        setSelectedProduct(null);
        resetProductForm();
        loadData();
      })
      .catch(err => console.error(err));
  };

  const handleDeleteProduct = () => {
    if (!selectedProduct) return;
    fetch(`/api/products/${selectedProduct.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
    })
      .then(() => {
        setShowDeleteModal(false);
        setSelectedProduct(null);
        loadData();
      })
      .catch(err => console.error(err));
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(() => {
        loadData();
      })
      .catch(err => console.error(err));
  };

  const resetProductForm = () => {
    setProductForm({
      name: "", brand: "", category: "", price: "", originalPrice: "",
      stock: "", badge: "", sku: "", image: "", description: ""
    });
  };

  const resetCouponForm = () => {
    setCouponForm({
      code: "",
      discount: "",
      type: "percentage",
      minSpend: "0",
      isActive: true,
      expiryDate: ""
    });
  };

  const openAddCouponModal = () => {
    resetCouponForm();
    setShowAddCouponModal(true);
  };

  const openEditCouponModal = (coupon: any) => {
    setSelectedCoupon(coupon);
    let formattedDate = "";
    if (coupon.expiryDate) {
      const date = new Date(coupon.expiryDate);
      if (!isNaN(date.getTime())) {
        formattedDate = date.toISOString().split('T')[0];
      }
    }
    setCouponForm({
      code: coupon.code,
      discount: coupon.discount.toString(),
      type: coupon.type,
      minSpend: coupon.minSpend ? coupon.minSpend.toString() : "0",
      isActive: coupon.isActive,
      expiryDate: formattedDate
    });
    setShowEditCouponModal(true);
  };

  const openDeleteCouponModal = (coupon: any) => {
    setSelectedCoupon(coupon);
    setShowDeleteCouponModal(true);
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify({
        ...couponForm,
        expiryDate: couponForm.expiryDate || null
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.message || 'Lỗi thêm mã giảm giá') });
        }
        return res.json();
      })
      .then(() => {
        setShowAddCouponModal(false);
        resetCouponForm();
        loadData();
      })
      .catch(err => {
        alert(err.message || "Lỗi khi thêm mã giảm giá");
        console.error(err);
      });
  };

  const handleEditCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoupon) return;
    fetch(`/api/coupons/${selectedCoupon._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify({
        ...couponForm,
        expiryDate: couponForm.expiryDate || null
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.message || 'Lỗi cập nhật mã giảm giá') });
        }
        return res.json();
      })
      .then(() => {
        setShowEditCouponModal(false);
        setSelectedCoupon(null);
        resetCouponForm();
        loadData();
      })
      .catch(err => {
        alert(err.message || "Lỗi khi cập nhật mã giảm giá");
        console.error(err);
      });
  };

  const handleDeleteCoupon = () => {
    if (!selectedCoupon) return;
    fetch(`/api/coupons/${selectedCoupon._id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.message || 'Lỗi xóa mã giảm giá') });
        }
        return res.json();
      })
      .then(() => {
        setShowDeleteCouponModal(false);
        setSelectedCoupon(null);
        loadData();
      })
      .catch(err => {
        alert(err.message || "Lỗi khi xóa mã giảm giá");
        console.error(err);
      });
  };

  const openEditModal = (prod: any) => {
    setSelectedProduct(prod);
    setProductForm({
      name: prod.name,
      brand: prod.brand,
      category: prod.category,
      price: prod.price.toString(),
      originalPrice: prod.originalPrice ? prod.originalPrice.toString() : "",
      stock: prod.stock.toString(),
      badge: prod.badge || "",
      sku: prod.sku,
      image: prod.image,
      description: prod.description || ""
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (prod: any) => {
    setSelectedProduct(prod);
    setShowDeleteModal(true);
  };

  const openStockModal = (prod: any) => {
    setSelectedProduct(prod);
    setStockQty("10");
    setShowStockModal(true);
  };

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const qty = Number(stockQty);
    if (!stockQty.trim() || isNaN(qty) || qty <= 0) return;

    fetch(`/api/products/${selectedProduct.id}/stock`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify({ stock: selectedProduct.stock + qty })
    })
      .then(() => {
        setShowStockModal(false);
        setSelectedProduct(null);
        setStockQty("10");
        loadData();
      })
      .catch(err => console.error(err));
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const sortedOrders = useMemo(() => {
    const list = [...filteredOrders];
    const { field, dir } = orderSort;
    const multiplier = dir === "asc" ? 1 : -1;

    list.sort((a, b) => {
      let comparison = 0;
      switch (field) {
        case "id":
          comparison = a.id.localeCompare(b.id);
          break;
        case "customerName":
          comparison = a.customerName.localeCompare(b.customerName, "vi");
          break;
        case "phone":
          comparison = a.phone.localeCompare(b.phone);
          break;
        case "total":
          comparison = a.total - b.total;
          break;
        case "payment":
          comparison = a.payment.localeCompare(b.payment);
          break;
        case "status":
          comparison = getOrderStatusRank(a.status) - getOrderStatusRank(b.status);
          break;
        case "date":
          comparison = parseOrderDate(a.date) - parseOrderDate(b.date);
          break;
      }
      return comparison * multiplier;
    });

    return list;
  }, [filteredOrders, orderSort]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const getProductStockStatus = (stock: number) => {
    if (stock === 0) return "Hết hàng";
    if (stock < 5) return "Sắp hết hàng";
    return "Còn hàng";
  };

  if (loading || !analytics) {
    return (
      <div style={{ background: "#0F172A", minHeight: "100vh" }} className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-yellow-500 border-slate-700 animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium">Đang tải bảng điều khiển quản trị...</p>
      </div>
    );
  }

  const chartData = chartPeriod === "year" ? analytics.revenueData : analytics.revenueData.slice(-6);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0F172A", color: "#F8FAFC",  }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col border-r transition-all duration-300"
        style={{
          width: sidebarCollapsed ? "64px" : "220px",
          background: "#080E1A",
          borderColor: "rgba(212,175,55,0.15)",
          minWidth: sidebarCollapsed ? "64px" : "220px",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 p-4 border-b" style={{ borderColor: "rgba(212,175,55,0.15)", height: "60px" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)" }}>
            <Target className="w-4 h-4" style={{ color: "#0F172A" }} />
          </div>
          {!sidebarCollapsed && (
            <div>
              <div className="text-xs font-bold" style={{ color: "#D4AF37" }}>BILLIARD PRO</div>
              <div className="text-xs" style={{ color: "#64748B" }}>Quản trị viên</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${sidebarCollapsed ? "justify-center" : ""}`}
              style={{
                background: activeSection === item.id ? "rgba(212,175,55,0.12)" : "transparent",
                color: activeSection === item.id ? "#D4AF37" : "#94A3B8",
                borderLeft: activeSection === item.id ? "2px solid #D4AF37" : "2px solid transparent",
              }}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t p-4" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
          <Link
            to="/"
            className={`flex items-center gap-3 text-sm transition-colors hover:text-yellow-400 ${sidebarCollapsed ? "justify-center" : ""}`}
            style={{ color: "#94A3B8" }}
            title="Quay lại cửa hàng"
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && "Quay lại Shop"}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header
          className="flex items-center gap-4 px-6 border-b shrink-0"
          style={{ height: "60px", background: "#080E1A", borderColor: "rgba(212,175,55,0.15)" }}
        >
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: "#94A3B8" }}
          >
            <LayoutDashboard className="w-4 h-4" />
          </button>
          <div className="text-sm font-semibold capitalize" style={{ color: "#F8FAFC" }}>{NAV_ITEMS.find(n => n.id === activeSection)?.label}</div>

          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-white/5" style={{ color: "#94A3B8" }}>
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: "#EF4444" }} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}>A</div>
              <span className="text-xs font-medium hidden md:block" style={{ color: "#F8FAFC" }}>Admin</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* ── DASHBOARD ─────────────────────────────────────── */}
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {analytics.kpiCards.map((kpi: any) => (
                  <div
                    key={kpi.label}
                    className="rounded-2xl border p-4"
                    style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.12)" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs" style={{ color: "#94A3B8" }}>{kpi.label}</div>
                      {kpi.trend === "up"
                        ? <ArrowUpRight className="w-3.5 h-3.5" style={{ color: "#22C55E" }} />
                        : <ArrowDownRight className="w-3.5 h-3.5" style={{ color: "#EF4444" }} />
                      }
                    </div>
                    <div className="text-xl font-bold mb-1" style={{ color: kpi.color }}>{kpi.value}</div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold" style={{ color: kpi.trend === "up" ? "#22C55E" : "#EF4444" }}>{kpi.change}</span>
                      <span className="text-xs" style={{ color: "#64748B" }}>{kpi.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Revenue Chart */}
              <div className="rounded-2xl border p-5" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.12)" }}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-semibold" style={{ color: "#F8FAFC" }}>Biểu đồ doanh thu</h3>
                  <div className="flex gap-2">
                    {["month", "year"].map((p) => (
                      <button
                        key={p}
                        onClick={() => setChartPeriod(p)}
                        className="px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all"
                        style={{
                          background: chartPeriod === p ? "rgba(212,175,55,0.2)" : "#0F172A",
                          color: chartPeriod === p ? "#D4AF37" : "#94A3B8",
                        }}
                      >
                        {p === "year" ? "Cả năm" : "6 Tháng"}
                      </button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.06)" />
                    <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748B" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="revenue" stroke="#D4AF37" strokeWidth={2} fill="url(#goldGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Category Pie */}
                <div className="rounded-2xl border p-5" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.12)" }}>
                  <h3 className="text-sm font-semibold mb-4" style={{ color: "#F8FAFC" }}>Tỷ lệ danh mục bán ra</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={analytics.categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                        {analytics.categoryData.map((entry: any, i: number) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props: any) => [`${value}% (${props.payload?.qty || 0} sản phẩm)`, "Tỷ lệ"]} contentStyle={{ background: "#1E293B", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "12px", color: "#F8FAFC" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2 max-h-[140px] overflow-y-auto">
                    {analytics.categoryData.map((c: any) => (
                      <div key={c.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                          <span style={{ color: "#94A3B8" }}>{c.name}</span>
                        </div>
                        <span className="font-semibold" style={{ color: "#F8FAFC" }}>{c.value}% ({c.qty || 0} SP)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Products */}
                <div className="lg:col-span-2 rounded-2xl border p-5" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.12)" }}>
                  <h3 className="text-sm font-semibold mb-4" style={{ color: "#F8FAFC" }}>Top sản phẩm bán chạy nhất</h3>
                  <div className="space-y-3">
                    {analytics.topProducts.map((p: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: i === 0 ? "rgba(212,175,55,0.2)" : "#0F172A", color: i === 0 ? "#D4AF37" : "#64748B" }}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate" style={{ color: "#F8FAFC" }}>{p.name}</div>
                          <div className="text-xs" style={{ color: "#64748B" }}>{p.brand} · {p.units} sản phẩm</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold" style={{ color: "#D4AF37" }}>${p.revenue.toLocaleString()}</div>
                          <div className="flex items-center gap-0.5 justify-end">
                            {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-2.5 h-2.5 fill-current" style={{ color: s <= Math.floor(p.rating) ? "#D4AF37" : "#334155" }} />)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ANALYTICS ─────────────────────────────────────── */}
          {activeSection === "analytics" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold" style={{ color: "#F8FAFC" }}>Phân tích doanh số theo thương hiệu</h3>
              {/* Brand Revenue Bar Chart */}
              <div className="rounded-2xl border p-5" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.12)" }}>
                <h3 className="text-sm font-semibold mb-5" style={{ color: "#F8FAFC" }}>Doanh thu theo thương hiệu</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={analytics.brandData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.06)" />
                    <XAxis dataKey="brand" stroke="#64748B" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748B" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "12px", color: "#F8FAFC" }} formatter={(v: any) => [`$${v.toLocaleString()}`, "Doanh thu"]} />
                    <Bar dataKey="revenue" fill="#D4AF37" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── ORDERS ─────────────────────────────────────── */}
          {activeSection === "orders" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748B" }} />
                  <input
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Tìm mã đơn, tên khách..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm outline-none"
                    style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.2)", color: "#F8FAFC" }}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: "#94A3B8" }}>
                  <Filter className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} />
                  <span>Sắp xếp:</span>
                  <select
                    value={`${orderSort.field}-${orderSort.dir}`}
                    onChange={(e) => {
                      const [field, dir] = e.target.value.split("-") as [OrderSortField, "asc" | "desc"];
                      setOrderSort({ field, dir });
                    }}
                    className="px-3 py-2 rounded-xl border text-xs outline-none bg-slate-800"
                    style={{ borderColor: "rgba(212,175,55,0.2)", color: "#F8FAFC" }}
                  >
                    <option value="date-desc">Ngày mới nhất</option>
                    <option value="date-asc">Ngày cũ nhất</option>
                    <option value="total-desc">Tổng tiền cao → thấp</option>
                    <option value="total-asc">Tổng tiền thấp → cao</option>
                    <option value="customerName-asc">Khách hàng A → Z</option>
                    <option value="customerName-desc">Khách hàng Z → A</option>
                    <option value="status-asc">Trạng thái: Đang xử lý → Đã hủy</option>
                    <option value="status-desc">Trạng thái: Đã hủy → Đang xử lý</option>
                    <option value="id-desc">Mã đơn mới nhất</option>
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border overflow-hidden" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.12)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: "#0F172A", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
                        {["Mã đơn", "Khách hàng", "Số điện thoại", "Tổng tiền", "Thanh toán", "Trạng thái", "Ngày tạo", "Cập nhật nhanh"].map((h) => (
                          <th key={h} className="text-left py-3 px-4 text-xs font-medium" style={{ color: "#64748B" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedOrders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-10 px-4 text-center text-sm" style={{ color: "#64748B" }}>
                            Không tìm thấy đơn hàng phù hợp.
                          </td>
                        </tr>
                      ) : sortedOrders.map((order) => {
                        const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG["Đang xử lý"];
                        return (
                          <tr key={order.id} className="border-b transition-colors hover:bg-white/2" style={{ borderColor: "rgba(212,175,55,0.05)" }}>
                            <td className="py-3 px-4 font-mono text-xs font-bold" style={{ color: "#D4AF37" }}>#{order.id}</td>
                            <td className="py-3 px-4 text-xs font-medium" style={{ color: "#F8FAFC" }}>{order.customerName}</td>
                            <td className="py-3 px-4 text-xs" style={{ color: "#94A3B8" }}>{order.phone}</td>
                            <td className="py-3 px-4 text-xs font-bold" style={{ color: "#D4AF37" }}>${order.total.toFixed(2)}</td>
                            <td className="py-3 px-4 text-xs" style={{ color: "#94A3B8" }}>{order.payment}</td>
                            <td className="py-3 px-4">
                              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-fit" style={{ background: sc?.bg, color: sc?.color }}>
                                <sc.icon className="w-3 h-3" />{order.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs" style={{ color: "#64748B" }}>{order.date}</td>
                            <td className="py-3 px-4">
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                className="px-2 py-1 rounded border text-xs outline-none bg-slate-800"
                                style={{ borderColor: "rgba(212,175,55,0.3)", color: "#F8FAFC" }}
                              >
                                <option value="Đang xử lý">Đang xử lý</option>
                                <option value="Đang giao hàng">Đang giao hàng</option>
                                <option value="Đã giao hàng">Đã giao hàng</option>
                                <option value="Đã hủy">Đã hủy</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── PRODUCTS ─────────────────────────────────────── */}
          {activeSection === "products" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748B" }} />
                  <input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Tìm tên sản phẩm, hãng..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm outline-none"
                    style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.2)", color: "#F8FAFC" }}
                  />
                </div>
                <button
                  onClick={() => { resetProductForm(); setShowAddModal(true); }}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}
                >
                  <Plus className="w-4 h-4" /> Thêm sản phẩm
                </button>
              </div>

              <div className="rounded-2xl border overflow-hidden" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.12)" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "#0F172A", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
                      {["#", "Sản phẩm", "Thương hiệu", "Danh mục", "Giá", "Tồn kho", "Trạng thái", "Hành động"].map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-medium" style={{ color: "#64748B" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => {
                      const stockStatus = getProductStockStatus(p.stock);
                      const sc = STATUS_CONFIG[stockStatus];
                      return (
                        <tr key={p.id} className="border-b hover:bg-white/2 transition-colors" style={{ borderColor: "rgba(212,175,55,0.05)" }}>
                          <td className="py-3 px-4 text-xs" style={{ color: "#64748B" }}>#{p.id}</td>
                          <td className="py-3 px-4 text-xs font-medium max-w-[200px] truncate" style={{ color: "#F8FAFC" }}>{p.name}</td>
                          <td className="py-3 px-4 text-xs" style={{ color: "#D4AF37" }}>{p.brand}</td>
                          <td className="py-3 px-4 text-xs" style={{ color: "#94A3B8" }}>{p.category}</td>
                          <td className="py-3 px-4 text-xs font-bold" style={{ color: "#F8FAFC" }}>${p.price.toFixed(2)}</td>
                          <td className="py-3 px-4 text-xs font-mono" style={{ color: p.stock === 0 ? "#EF4444" : p.stock < 5 ? "#F59E0B" : "#22C55E" }}>{p.stock}</td>
                          <td className="py-3 px-4">
                            {sc && (
                              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium w-fit" style={{ background: sc.bg, color: sc.color }}>
                                <sc.icon className="w-3 h-3" />{stockStatus}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Link to={`/products/${p.id}`} className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: "#94A3B8" }}><Eye className="w-3.5 h-3.5" /></Link>
                              <button onClick={() => openEditModal(p)} className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: "#94A3B8" }}><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => openDeleteModal(p)} className="p-1.5 rounded-lg hover:bg-red-500/10" style={{ color: "#EF4444" }}><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── CUSTOMERS ─────────────────────────────────────── */}
          {activeSection === "customers" && (
            <div className="space-y-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748B" }} />
                <input
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Tìm khách hàng..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm outline-none"
                  style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.2)", color: "#F8FAFC" }}
                />
              </div>

              <div className="rounded-2xl border overflow-hidden" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.12)" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "#0F172A", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
                      {["Khách hàng", "Email", "Số đơn đặt", "Tổng chi tiêu", "Trạng thái", "Tham gia"].map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-medium" style={{ color: "#64748B" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((c, i) => {
                      const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG["Đang hoạt động"];
                      return (
                        <tr key={i} className="border-b hover:bg-white/2 transition-colors" style={{ borderColor: "rgba(212,175,55,0.05)" }}>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}>
                                {c.name[0]}
                              </div>
                              <span className="text-xs font-medium" style={{ color: "#F8FAFC" }}>{c.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-xs" style={{ color: "#94A3B8" }}>{c.email}</td>
                          <td className="py-3 px-4 text-xs font-bold" style={{ color: "#F8FAFC" }}>{c.orders}</td>
                          <td className="py-3 px-4 text-xs font-bold" style={{ color: "#D4AF37" }}>${c.spent.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            {sc && (
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: sc.bg, color: sc.color }}>{c.status}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-xs" style={{ color: "#64748B" }}>{c.joined}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── INVENTORY ─────────────────────────────────────── */}
          {activeSection === "inventory" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Tổng sản phẩm", value: products.length.toString(), color: "#D4AF37" },
                  { label: "Đủ hàng", value: products.filter(p => p.stock >= 5).length.toString(), color: "#22C55E" },
                  { label: "Sắp hết hàng", value: products.filter(p => p.stock > 0 && p.stock < 5).length.toString(), color: "#F59E0B" },
                  { label: "Đã hết hàng", value: products.filter(p => p.stock === 0).length.toString(), color: "#EF4444" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border p-4" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.12)" }}>
                    <div className="text-xs mb-2" style={{ color: "#94A3B8" }}>{s.label}</div>
                    <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border p-5" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.12)" }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: "#F59E0B" }}>⚠ Cảnh báo tồn kho thấp</h3>
                <div className="space-y-3">
                  {products.filter((p) => p.stock < 5).map((p) => (
                    <div key={p.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: p.stock === 0 ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)" }}>
                      <div>
                        <div className="text-sm font-medium" style={{ color: "#F8FAFC" }}>{p.name}</div>
                        <div className="text-xs" style={{ color: "#94A3B8" }}>{p.brand} · SKU: {p.sku}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold mb-1" style={{ color: p.stock === 0 ? "#EF4444" : "#F59E0B" }}>{p.stock} sản phẩm</div>
                        <button
                          onClick={() => openStockModal(p)}
                          className="text-xs font-semibold hover:underline" 
                          style={{ color: "#D4AF37" }}
                        >
                          Nhập thêm hàng →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PROMOTIONS ─────────────────────────────────────── */}
          {activeSection === "promotions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold" style={{ color: "#F8FAFC" }}>Quản lý các mã giảm giá</h2>
                <button
                  onClick={openAddCouponModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
                  style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm mã giảm giá
                </button>
              </div>

              {coupons.length === 0 ? (
                <div className="text-center py-10 rounded-2xl border" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.15)" }}>
                  <Tag className="w-10 h-10 mx-auto mb-3" style={{ color: "#D4AF37" }} />
                  <p className="text-sm font-medium" style={{ color: "#94A3B8" }}>Chưa có mã giảm giá nào được tạo.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coupons.map((promo) => (
                    <div key={promo._id} className="rounded-2xl border p-5 relative group" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.15)" }}>
                      {/* Actions */}
                      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditCouponModal(promo)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Sửa mã"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteCouponModal(promo)}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                          title="Xóa mã"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mb-3 pr-14">
                        <span className="font-mono text-base font-bold" style={{ color: "#D4AF37" }}>{promo.code}</span>
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: promo.isActive ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: promo.isActive ? "#22C55E" : "#EF4444" }}>
                          {promo.isActive ? "Đang chạy" : "Tạm ngưng"}
                        </span>
                      </div>
                      
                      <div className="text-xl font-bold mb-1" style={{ color: "#F8FAFC" }}>
                        {promo.type === "percentage" ? `Giảm ${promo.discount}%` : `Giảm $${promo.discount}`}
                      </div>
                      <div className="text-xs mb-3" style={{ color: "#94A3B8" }}>
                        {promo.minSpend > 0 ? `Áp dụng đơn hàng từ $${promo.minSpend}` : "Không giới hạn chi tiêu tối thiểu"}
                      </div>
                      <div className="flex items-center justify-between text-xs" style={{ color: "#64748B" }}>
                        <span>Loại: {promo.type === "percentage" ? "Theo phần trăm" : "Cố định"}</span>
                        <span>Hạn dùng: {promo.expiryDate ? new Date(promo.expiryDate).toLocaleDateString("vi-VN") : "Không giới hạn"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SETTINGS ─────────────────────────────────────── */}
          {activeSection === "settings" && (
            <div className="space-y-5 max-w-2xl">
              <div className="rounded-2xl border p-6" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.15)" }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: "#F8FAFC" }}>Cấu hình chung cửa hàng</h3>
                <div className="space-y-4">
                  {[
                    { label: "Tên shop bida", value: "Billiard Pro Shop" },
                    { label: "Email hệ thống", value: "support@billiardproshop.com" },
                    { label: "Tiền tệ mặc định", value: "USD ($)" },
                    { label: "Múi giờ hoạt động", value: "Asia/Ho_Chi_Minh" },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>{f.label}</label>
                      <input
                        defaultValue={f.value}
                        className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                        style={{ background: "#0F172A", borderColor: "rgba(212,175,55,0.2)", color: "#F8FAFC" }}
                      />
                    </div>
                  ))}
                  <button className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}>
                    Lưu cấu hình
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── ADD PRODUCT MODAL ─────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-lg rounded-2xl border p-6 max-h-[90vh] overflow-y-auto" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.3)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-100">Thêm sản phẩm bida mới</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Tên sản phẩm *</label>
                <input required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Hãng (Brand) *</label>
                  <input required value={productForm.brand} onChange={e => setProductForm({...productForm, brand: e.target.value})} placeholder="VD: Predator, Fury..." className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Danh mục *</label>
                  <input required value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} placeholder="VD: Cơ bida lỗ, Phụ kiện..." className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Giá bán *</label>
                  <input required type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Giá gốc (nếu giảm giá)</label>
                  <input type="number" step="0.01" value={productForm.originalPrice} onChange={e => setProductForm({...productForm, originalPrice: e.target.value})} className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Số lượng tồn kho *</label>
                  <input required type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nhãn dán (Badge)</label>
                  <select value={productForm.badge} onChange={e => setProductForm({...productForm, badge: e.target.value})} className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100">
                    <option value="">Không có</option>
                    <option value="Bán chạy">Bán chạy</option>
                    <option value="Mới về">Mới về</option>
                    <option value="Khuyến mãi">Khuyến mãi</option>
                    <option value="Cao cấp">Cao cấp</option>
                    <option value="Đánh giá cao">Đánh giá cao</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">SKU</label>
                  <input placeholder="Tự sinh nếu để trống" value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Link hình ảnh sản phẩm</label>
                <input value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100" placeholder="https://images.unsplash.com/photo-..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Mô tả chi tiết</label>
                <textarea rows={3} value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-xl text-sm font-semibold border-slate-700 text-slate-400 hover:bg-slate-800">Hủy</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-sm font-semibold" style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}>Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT PRODUCT MODAL ─────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-lg rounded-2xl border p-6 max-h-[90vh] overflow-y-auto" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.3)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-100">Chỉnh sửa sản phẩm</h3>
              <button onClick={() => { setShowEditModal(false); setSelectedProduct(null); }} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleEditProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Tên sản phẩm *</label>
                <input required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Hãng (Brand) *</label>
                  <input required value={productForm.brand} onChange={e => setProductForm({...productForm, brand: e.target.value})} placeholder="VD: Predator, Fury..." className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Danh mục *</label>
                  <input required value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} placeholder="VD: Cơ bida lỗ, Phụ kiện..." className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Giá bán *</label>
                  <input required type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Giá gốc (nếu giảm giá)</label>
                  <input type="number" step="0.01" value={productForm.originalPrice} onChange={e => setProductForm({...productForm, originalPrice: e.target.value})} className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Số lượng tồn kho *</label>
                  <input required type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nhãn dán (Badge)</label>
                  <select value={productForm.badge} onChange={e => setProductForm({...productForm, badge: e.target.value})} className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100">
                    <option value="">Không có</option>
                    <option value="Bán chạy">Bán chạy</option>
                    <option value="Mới về">Mới về</option>
                    <option value="Khuyến mãi">Khuyến mãi</option>
                    <option value="Cao cấp">Cao cấp</option>
                    <option value="Đánh giá cao">Đánh giá cao</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">SKU</label>
                  <input required value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Link hình ảnh sản phẩm</label>
                <input value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Mô tả chi tiết</label>
                <textarea rows={3} value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => { setShowEditModal(false); setSelectedProduct(null); }} className="px-4 py-2 border rounded-xl text-sm font-semibold border-slate-700 text-slate-400 hover:bg-slate-800">Hủy</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-sm font-semibold" style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}>Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── RESTOCK MODAL ──────────────────────────────────────── */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-2xl border p-6" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.3)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-100">Nhập thêm hàng</h3>
              <button
                onClick={() => { setShowStockModal(false); setSelectedProduct(null); }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(245,158,11,0.08)" }}>
              <div className="text-sm font-medium text-slate-100 mb-1">{selectedProduct.name}</div>
              <div className="text-xs text-slate-400 mb-2">{selectedProduct.brand} · SKU: {selectedProduct.sku}</div>
              <div className="text-sm">
                <span className="text-slate-400">Tồn kho hiện tại: </span>
                <span className="font-bold" style={{ color: selectedProduct.stock === 0 ? "#EF4444" : "#F59E0B" }}>
                  {selectedProduct.stock} sản phẩm
                </span>
              </div>
            </div>

            <form onSubmit={handleRestock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Số lượng nhập thêm *</label>
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={stockQty}
                  onChange={e => setStockQty(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100"
                  placeholder="VD: 10"
                  autoFocus
                />
                <p className="text-xs mt-2 text-slate-500">
                  Số lượng này sẽ được cộng thêm vào tồn kho hiện có.
                  {stockQty && !isNaN(Number(stockQty)) && Number(stockQty) > 0 && (
                    <span className="block mt-1 text-slate-400">
                      Tồn kho sau nhập: <strong className="text-slate-200">{selectedProduct.stock + Number(stockQty)}</strong> sản phẩm
                    </span>
                  )}
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setShowStockModal(false); setSelectedProduct(null); }}
                  className="px-4 py-2 border rounded-xl text-sm font-semibold border-slate-700 text-slate-400 hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}
                >
                  Xác nhận nhập hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE PRODUCT CONFIRM MODAL ───────────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-2xl border p-6" style={{ background: "#1E293B", borderColor: "rgba(239,68,68,0.3)" }}>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Xác nhận xóa sản phẩm</h3>
            <p className="text-sm text-slate-400 mb-6">Bạn có chắc chắn muốn xóa sản phẩm <strong className="text-slate-200">"{selectedProduct?.name}"</strong> không? Hành động này sẽ cập nhật CSDL và không thể hoàn tác.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setShowDeleteModal(false); setSelectedProduct(null); }} className="px-4 py-2 border rounded-xl text-sm font-semibold border-slate-700 text-slate-400 hover:bg-slate-800">Quay lại</button>
              <button onClick={handleDeleteProduct} className="px-5 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white">Chấp nhận xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD COUPON MODAL ───────────────────────────────────── */}
      {showAddCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-lg rounded-2xl border p-6 max-h-[90vh] overflow-y-auto" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.3)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-100">Tạo mã giảm giá mới</h3>
              <button onClick={() => setShowAddCouponModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Mã giảm giá (Code) *</label>
                <input
                  required
                  placeholder="VD: PROSHOT, WELCOME10..."
                  value={couponForm.code}
                  onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Loại giảm giá *</label>
                  <select
                    value={couponForm.type}
                    onChange={e => setCouponForm({...couponForm, type: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Mức giảm giá *</label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="VD: 10, 15..."
                    value={couponForm.discount}
                    onChange={e => setCouponForm({...couponForm, discount: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Chi tiêu tối thiểu ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={couponForm.minSpend}
                    onChange={e => setCouponForm({...couponForm, minSpend: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Hạn sử dụng</label>
                  <input
                    type="date"
                    value={couponForm.expiryDate}
                    onChange={e => setCouponForm({...couponForm, expiryDate: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Trạng thái</label>
                <select
                  value={couponForm.isActive ? "true" : "false"}
                  onChange={e => setCouponForm({...couponForm, isActive: e.target.value === "true"})}
                  className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100"
                >
                  <option value="true">Đang hoạt động (Kích hoạt)</option>
                  <option value="false">Tạm ngưng</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCouponModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-semibold border-slate-700 text-slate-400 hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}
                >
                  Tạo mã
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT COUPON MODAL ──────────────────────────────────── */}
      {showEditCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-lg rounded-2xl border p-6 max-h-[90vh] overflow-y-auto" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.3)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-100">Chỉnh sửa mã giảm giá</h3>
              <button onClick={() => { setShowEditCouponModal(false); setSelectedCoupon(null); }} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleEditCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Mã giảm giá (Code) *</label>
                <input
                  required
                  placeholder="VD: PROSHOT, WELCOME10..."
                  value={couponForm.code}
                  onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Loại giảm giá *</label>
                  <select
                    value={couponForm.type}
                    onChange={e => setCouponForm({...couponForm, type: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Mức giảm giá *</label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="VD: 10, 15..."
                    value={couponForm.discount}
                    onChange={e => setCouponForm({...couponForm, discount: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Chi tiêu tối thiểu ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={couponForm.minSpend}
                    onChange={e => setCouponForm({...couponForm, minSpend: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Hạn sử dụng</label>
                  <input
                    type="date"
                    value={couponForm.expiryDate}
                    onChange={e => setCouponForm({...couponForm, expiryDate: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Trạng thái</label>
                <select
                  value={couponForm.isActive ? "true" : "false"}
                  onChange={e => setCouponForm({...couponForm, isActive: e.target.value === "true"})}
                  className="w-full px-3 py-2 rounded-lg border text-sm bg-slate-900 border-slate-700 text-slate-100"
                >
                  <option value="true">Đang hoạt động (Kích hoạt)</option>
                  <option value="false">Tạm ngưng</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setShowEditCouponModal(false); setSelectedCoupon(null); }}
                  className="px-4 py-2 border rounded-xl text-sm font-semibold border-slate-700 text-slate-400 hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}
                >
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE COUPON CONFIRM MODAL ────────────────────────── */}
      {showDeleteCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-2xl border p-6" style={{ background: "#1E293B", borderColor: "rgba(239,68,68,0.3)" }}>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Xác nhận xóa mã giảm giá</h3>
            <p className="text-sm text-slate-400 mb-6">Bạn có chắc chắn muốn xóa mã giảm giá <strong className="text-slate-200">"{selectedCoupon?.code}"</strong> không? Hành động này sẽ cập nhật CSDL và không thể hoàn tác.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setShowDeleteCouponModal(false); setSelectedCoupon(null); }} className="px-4 py-2 border rounded-xl text-sm font-semibold border-slate-700 text-slate-400 hover:bg-slate-800">Quay lại</button>
              <button onClick={handleDeleteCoupon} className="px-5 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white">Chấp nhận xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
