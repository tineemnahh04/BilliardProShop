import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Search, ShoppingCart, Heart, User, Menu, X, ChevronDown,
  Target, Zap, Package, BookOpen, Circle, Hand, Sparkles, Tag
} from "lucide-react";

const CATEGORIES = [
  { label: "Cơ bida lỗ", icon: Target, href: "/products?cat=pool-cues" },
  { label: "Cơ bida phăng", icon: Target, href: "/products?cat=carom-cues" },
  { label: "Cơ phá & nhảy", icon: Zap, href: "/products?cat=break-jump" },
  { label: "Bao đựng cơ", icon: Package, href: "/products?cat=cue-cases" },
  { label: "Lơ bida", icon: BookOpen, href: "/products?cat=chalks" },
  { label: "Găng tay bida", icon: Hand, href: "/products?cat=gloves" },
  { label: "Phụ kiện", icon: Circle, href: "/products?cat=accessories" },
];

const BRANDS = ["Predator", "Fury", "Cuetec", "JFlowers", "Kamui", "Mit Cues"];

import { AccountSwitcher } from "./AccountSwitcher";

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  currentUser: any;
  onLogout: () => void;
  onSwitchAccount?: (user: any) => void;
}

export function Navbar({ cartCount, wishlistCount, currentUser, onLogout, onSwitchAccount }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const catMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!catOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (catMenuRef.current && !catMenuRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [catOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b transition-colors duration-500 hover:border-yellow-500/40 shadow-lg"
      style={{
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(20px)",
        borderColor: "rgba(212, 175, 55, 0.2)",
      }}
    >
      {/* Top announcement bar */}
      <div
        className="text-center py-2 text-xs font-medium tracking-wider"
        style={{ background: "linear-gradient(90deg, #D4AF37, #A88920, #D4AF37)", color: "#0F172A" }}
      >
        MIỄN PHÍ VẬN CHUYỂN CHO ĐƠN HÀNG TRÊN $150 · SỬ DỤNG MÃ <span className="font-bold">PROSHOT</span> ĐỂ GIẢM 10% CHO ĐƠN HÀNG ĐẦU TIÊN
      </div>

      {/* Main nav */}
      <div className="max-w-[1440px] mx-auto px-6 flex items-center gap-6 h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group py-1">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]"
            style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)" }}
          >
            <Target className="w-5 h-5 transition-transform duration-300 group-hover:rotate-45" style={{ color: "#0F172A" }} />
          </div>
          <div>
            <div className="text-sm font-bold tracking-[0.14em] font-display transition-colors duration-300 group-hover:text-yellow-300" style={{ color: "#D4AF37", lineHeight: 1 }}>
              BILLIARD
            </div>
            <div className="text-[10px] tracking-[0.28em] uppercase font-medium transition-colors duration-300 group-hover:text-slate-200" style={{ color: "#94A3B8", lineHeight: 1.2 }}>
              PRO SHOP
            </div>
          </div>
        </Link>

        {/* Categories dropdown */}
        <div
          ref={catMenuRef}
          className="relative hidden lg:block"
          onMouseEnter={() => setCatOpen(true)}
          onMouseLeave={() => setCatOpen(false)}
        >
          <button
            type="button"
            onClick={() => setCatOpen((open) => !open)}
            className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-xl transition-all duration-300 hover:bg-yellow-400/10 hover:text-yellow-300 hover:shadow-[0_0_12px_rgba(212,175,55,0.15)] group"
            style={{ color: "#F8FAFC" }}
            aria-expanded={catOpen}
          >
            <span>Danh mục</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${catOpen ? "rotate-180 text-yellow-400" : "group-hover:translate-y-0.5"}`} />
          </button>
          {catOpen && (
            <div className="absolute top-full left-0 pt-1 w-56 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div
                className="rounded-xl border p-2 shadow-2xl backdrop-blur-xl"
                style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.25)" }}
              >
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.label}
                    to={cat.href}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 hover:text-yellow-300 hover:bg-yellow-400/10 hover:translate-x-1 group"
                    style={{ color: "#CBD5E1" }}
                    onClick={() => setCatOpen(false)}
                  >
                    <cat.icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" style={{ color: "#D4AF37" }} />
                    <span className="font-medium">{cat.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Brands & Links */}
        <Link 
          to="/products?brand=all" 
          className="hidden lg:block text-sm font-medium px-3 py-2 rounded-xl transition-all duration-300 hover:text-yellow-300 hover:bg-yellow-400/10" 
          style={{ color: "#CBD5E1" }}
        >
          Thương hiệu
        </Link>
        <Link 
          to="/products?sale=true" 
          className="hidden lg:flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-all duration-300 hover:text-emerald-300 hover:bg-emerald-500/10 hover:shadow-[0_0_12px_rgba(34,197,94,0.2)]" 
          style={{ color: "#22C55E" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Khuyến mãi
        </Link>
        <Link 
          to="/marketplace" 
          className="hidden lg:flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl transition-all duration-300 hover:text-yellow-300 hover:bg-yellow-400/10 hover:-translate-y-0.5 group" 
          style={{ color: "#F8FAFC" }}
        >
          <Tag className="w-4 h-4 text-yellow-400 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
          <span>Chợ Bida</span>
        </Link>
        <Link 
          to="/ai-cue-finder" 
          className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm hover:scale-105 hover:shadow-[0_0_18px_rgba(212,175,55,0.4)] hover:border-yellow-400 active:scale-95 group"
          style={{ 
            background: "linear-gradient(135deg, rgba(212,175,55,0.25), rgba(168,137,32,0.15))", 
            border: "1px solid rgba(212,175,55,0.5)",
            color: "#FACC15" 
          }}
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse transition-transform duration-300 group-hover:rotate-12" />
          <span>Tìm Cơ AI</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:flex group">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 group-hover:text-yellow-400 group-focus-within:text-yellow-400" style={{ color: "#94A3B8" }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm cơ, thương hiệu, phụ kiện..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border outline-none transition-all duration-300 hover:border-yellow-500/40 hover:bg-slate-800/80 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 focus:bg-slate-900"
              style={{
                background: "#1E293B",
                borderColor: "rgba(212,175,55,0.2)",
                color: "#F8FAFC",
              }}
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto lg:ml-0">
          <Link
            to="/wishlist"
            className="relative p-2.5 rounded-xl transition-all duration-300 hover:bg-yellow-400/10 hover:text-yellow-300 hover:scale-110 hover:shadow-[0_0_12px_rgba(212,175,55,0.25)] group"
            style={{ color: "#CBD5E1" }}
            title="Wishlist"
          >
            <Heart className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:text-red-400" />
            {wishlistCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold transition-transform duration-300 group-hover:scale-125 shadow-md"
                style={{ background: "#D4AF37", color: "#0F172A" }}
              >
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className="relative p-2.5 rounded-xl transition-all duration-300 hover:bg-yellow-400/10 hover:text-yellow-300 hover:scale-110 hover:shadow-[0_0_12px_rgba(212,175,55,0.25)] group"
            style={{ color: "#CBD5E1" }}
            title="Cart"
          >
            <ShoppingCart className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            {cartCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold transition-transform duration-300 group-hover:scale-125 shadow-md"
                style={{ background: "#D4AF37", color: "#0F172A" }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* Unified User Account Menu with Test Switcher */}
          {currentUser ? (
            <AccountSwitcher
              currentUser={currentUser}
              onSwitchAccount={onSwitchAccount}
              onLogout={onLogout}
            />
          ) : (
            <Link
              to="/login"
              className="px-3.5 py-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-400 hover:text-slate-950 transition-all duration-300 flex items-center gap-1.5 text-xs font-semibold text-yellow-400 shadow-sm cursor-pointer"
              title="Đăng nhập"
            >
              <User className="w-4 h-4" />
              <span>Đăng nhập</span>
            </Link>
          )}
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 rounded-lg ml-1"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ color: "#F8FAFC" }}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t px-6 py-4 space-y-3" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.2)" }}>
          <form onSubmit={handleSearch} className="flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94A3B8" }} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border outline-none"
                style={{ background: "#0F172A", borderColor: "rgba(212,175,55,0.2)", color: "#F8FAFC" }}
              />
            </div>
          </form>
          <Link
            to="/marketplace"
            className="flex items-center gap-3 text-sm py-2 font-bold"
            style={{ color: "#F8FAFC" }}
            onClick={() => setMenuOpen(false)}
          >
            <Tag className="w-4 h-4 text-yellow-400" />
            Chợ Bida Trao Đổi
          </Link>
          <Link
            to="/ai-cue-finder"
            className="flex items-center gap-3 text-sm py-2 font-bold"
            style={{ color: "#FACC15" }}
            onClick={() => setMenuOpen(false)}
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Tư Vấn Chọn Cơ AI
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              to={cat.href}
              className="flex items-center gap-3 text-sm py-2"
              style={{ color: "#CBD5E1" }}
              onClick={() => setMenuOpen(false)}
            >
              <cat.icon className="w-4 h-4" style={{ color: "#D4AF37" }} />
              {cat.label}
            </Link>
          ))}
          {currentUser?.role === "admin" && (
            <Link to="/admin" className="block text-sm py-2" style={{ color: "#D4AF37" }} onClick={() => setMenuOpen(false)}>
              Bảng Quản Trị
            </Link>
          )}

          {currentUser ? (
            <button
              onClick={() => {
                onLogout();
                setMenuOpen(false);
              }}
              className="w-full text-left text-sm py-2 text-red-400 font-semibold cursor-pointer"
            >
              Đăng xuất ({currentUser.name})
            </button>
          ) : (
            <Link to="/login" className="block text-sm py-2 font-semibold" style={{ color: "#D4AF37" }} onClick={() => setMenuOpen(false)}>
              Đăng nhập / Đăng ký
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
