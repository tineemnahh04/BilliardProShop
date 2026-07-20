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
      className="sticky top-0 z-50 border-b"
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
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)" }}
          >
            <Target className="w-5 h-5" style={{ color: "#0F172A" }} />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-[0.14em] font-display" style={{ color: "#D4AF37", lineHeight: 1 }}>
              BILLIARD
            </div>
            <div className="text-[10px] tracking-[0.28em] uppercase font-medium" style={{ color: "#94A3B8", lineHeight: 1.2 }}>
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
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: "#F8FAFC" }}
            aria-expanded={catOpen}
          >
            Danh mục <ChevronDown className={`w-4 h-4 transition-transform ${catOpen ? "rotate-180" : ""}`} />
          </button>
          {catOpen && (
            <div className="absolute top-full left-0 pt-1 w-56 z-50">
              <div
                className="rounded-xl border p-2 shadow-2xl"
                style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.2)" }}
              >
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.label}
                    to={cat.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:text-yellow-400 hover:bg-white/5"
                    style={{ color: "#CBD5E1" }}
                    onClick={() => setCatOpen(false)}
                  >
                    <cat.icon className="w-4 h-4" style={{ color: "#D4AF37" }} />
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Brands link */}
        <Link to="/products?brand=all" className="hidden lg:block text-sm font-medium transition-colors" style={{ color: "#CBD5E1" }}>
          Thương hiệu
        </Link>
        <Link to="/products?sale=true" className="hidden lg:block text-sm font-medium transition-colors" style={{ color: "#22C55E" }}>
          Khuyến mãi
        </Link>
        <Link 
          to="/marketplace" 
          className="hidden lg:flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-yellow-400" 
          style={{ color: "#F8FAFC" }}
        >
          <Tag className="w-4 h-4 text-yellow-400" />
          <span>Chợ Bida</span>
        </Link>
        <Link 
          to="/ai-cue-finder" 
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
          style={{ 
            background: "linear-gradient(135deg, rgba(212,175,55,0.2), rgba(168,137,32,0.1))", 
            border: "1px solid rgba(212,175,55,0.4)",
            color: "#FACC15" 
          }}
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Tìm Cơ AI</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94A3B8" }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm cơ, thương hiệu, phụ kiện..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border outline-none transition-all"
              style={{
                background: "#1E293B",
                borderColor: "rgba(212,175,55,0.2)",
                color: "#F8FAFC",
              }}
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1.5 ml-auto lg:ml-0">
          {onSwitchAccount && (
            <AccountSwitcher currentUser={currentUser} onSwitchAccount={onSwitchAccount} />
          )}

          {currentUser ? (
            <div className="flex items-center gap-2.5">
              <Link
                to="/account"
                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/5 transition-all"
                style={{ color: "#CBD5E1" }}
                title="Hồ sơ cá nhân"
              >
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0" 
                  style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}
                >
                  {currentUser.name ? currentUser.name[0].toUpperCase() : "U"}
                </div>
                <span className="text-xs font-medium max-w-[80px] truncate hidden sm:inline">{currentUser.name}</span>
              </Link>
              <button
                onClick={onLogout}
                className="text-xs px-2.5 py-1.5 rounded-lg border transition-all hover:bg-red-500/10 cursor-pointer"
                style={{ borderColor: "rgba(239,68,68,0.2)", color: "#EF4444" }}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="p-2 rounded-lg transition-colors hover:bg-white/5 flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: "#CBD5E1" }}
              title="Đăng nhập"
            >
              <User className="w-4 h-4" />
              <span>Đăng nhập</span>
            </Link>
          )}

          <Link
            to="/wishlist"
            className="relative p-2 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: "#CBD5E1" }}
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                style={{ background: "#D4AF37", color: "#0F172A" }}
              >
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className="relative p-2 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: "#CBD5E1" }}
            title="Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                style={{ background: "#D4AF37", color: "#0F172A" }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* Admin link */}
          {currentUser?.role === "admin" && (
            <Link
              to="/admin"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ml-2 transition-colors hover:bg-yellow-400/10"
              style={{ borderColor: "#D4AF37", color: "#D4AF37" }}
            >
              Quản trị
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
            Chợ Bida (Marketplace)
          </Link>
          <Link
            to="/ai-cue-finder"
            className="flex items-center gap-3 text-sm py-2 font-bold"
            style={{ color: "#FACC15" }}
            onClick={() => setMenuOpen(false)}
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Tìm Cơ AI (Cue Finder)
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
