import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  ArrowRight, Star, Shield, Truck, RotateCcw, Award,
  ChevronLeft, ChevronRight, Quote, Target, Zap, Package, BookOpen, Hand, Circle, Sparkles, Gift, Flame, Trophy
} from "lucide-react";
import type { CartItem } from "../App";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1575553939928-d03b21323afe?w=1440&h=700&fit=crop",
  "https://images.unsplash.com/photo-1544281153-6603be88b354?w=1440&h=700&fit=crop",
  "https://images.unsplash.com/photo-1599685315659-bc876da49fe5?w=1440&h=700&fit=crop",
];

const CATEGORIES = [
  { label: "Cơ bida lỗ", icon: Target, key: "pool-cues", href: "/products?cat=pool-cues", color: "#D4AF37" },
  { label: "Cơ bida phăng", icon: Target, key: "carom-cues", href: "/products?cat=carom-cues", color: "#22C55E" },
  { label: "Cơ phá & nhảy", icon: Zap, key: "break-jump", href: "/products?cat=break-jump", color: "#3B82F6" },
  { label: "Bao đựng cơ", icon: Package, key: "cue-cases", href: "/products?cat=cue-cases", color: "#F59E0B" },
  { label: "Lơ bida", icon: BookOpen, key: "chalks", href: "/products?cat=chalks", color: "#EC4899" },
  { label: "Găng tay bida", icon: Hand, key: "gloves", href: "/products?cat=gloves", color: "#8B5CF6" },
];

const BRANDS = [
  { name: "Predator", tagline: "Thương hiệu ngọn cơ số 1 thế giới", color: "#D4AF37" },
  { name: "Fury", tagline: "Hiệu suất nhà vô địch", color: "#22C55E" },
  { name: "Cuetec", tagline: "Đổi mới trong từng đường cơ", color: "#3B82F6" },
  { name: "JFlowers", tagline: "Tuyệt tác thủ công mỹ nghệ", color: "#F59E0B" },
  { name: "Kamui", tagline: "Độ chính xác và tiêu chuẩn Nhật Bản", color: "#EC4899" },
  { name: "Mit Cues", tagline: "Dòng cơ tùy chỉnh đẳng cấp", color: "#8B5CF6" },
];

const TESTIMONIALS = [
  {
    name: "Marcus Chen", role: "Cơ thủ chuyên nghiệp, Vô địch thế giới 9 bi",
    text: "Billiard Pro Shop là nơi duy nhất tôi tin tưởng để mua sắm thiết bị thi đấu. Sự lựa chọn các dòng Predator của họ là vô đối và dịch vụ chăm sóc khách hàng đạt đẳng cấp thế giới.",
    rating: 5, avatar: "MC",
  },
  {
    name: "Nguyễn Hoàng Lan", role: "Giám đốc Hiệp hội APA Việt Nam",
    text: "Chúng tôi trang bị phụ kiện bida cho toàn bộ giải đấu thông qua Billiard Pro Shop. Giá cả cực kỳ hợp lý, mặt hàng phong phú và giao hàng luôn siêu tốc.",
    rating: 5, avatar: "HL",
  },
  {
    name: "Trần Minh Tiến", role: "Huấn luyện viên Billiards & Youtuber",
    text: "Tôi đã giới thiệu Billiard Pro Shop cho hàng ngàn học viên của mình. Bạn hoàn toàn có thể yên tâm — đây là shop bida uy tín và chất lượng tốt nhất trên thị trường.",
    rating: 5, avatar: "MT",
  },
];

const FEATURES = [
  { icon: Truck, title: "Giao Hàng Miễn Phí", desc: "Freeship toàn quốc cho các đơn hàng trị giá từ $150" },
  { icon: Shield, title: "Sản Phẩm Chính Hãng", desc: "Cam kết 100% hàng nhập khẩu chính ngạch, uy tín" },
  { icon: RotateCcw, title: "Đổi Trả Dễ Dàng", desc: "Chính sách đổi trả miễn phí, linh hoạt trong vòng 30 ngày" },
  { icon: Award, title: "Tư Vấn Cơ Thủ", desc: "Nhận lời khuyên từ các cơ thủ bida chuyên nghiệp" },
];

const BADGE_COLORS: Record<string, string> = {
  "Bán chạy": "#D4AF37",
  "Mới về": "#22C55E",
  "Khuyến mãi": "#EF4444",
  "Cao cấp": "#8B5CF6",
  "Đánh giá cao": "#3B82F6",
};

interface HomePageProps {
  addToCart: (item: CartItem) => void;
  wishlist: number[];
  toggleWishlist: (id: number) => void;
}

function ProductCard({
  product, addToCart, wishlist, toggleWishlist
}: {
  product: any;
  addToCart: (item: CartItem) => void;
  wishlist: number[];
  toggleWishlist: (id: number) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isWished = wishlist.includes(product.id);

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all duration-300 cursor-pointer group"
      style={{
        background: "#1E293B",
        borderColor: hovered ? "rgba(212,175,55,0.4)" : "rgba(212,175,55,0.1)",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 20px 60px rgba(212,175,55,0.15)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden" style={{ paddingTop: "75%" }}>
        <Link to={`/products/${product.id}`} className="absolute inset-0 block">
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,23,42,0.6) 0%, transparent 50%)" }} />
        </Link>

        {product.badge && (
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ background: BADGE_COLORS[product.badge] || "#D4AF37", color: "#0F172A" }}
          >
            {product.badge}
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleWishlist(product.id); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10"
          style={{
            background: isWished ? "#D4AF37" : "rgba(15,23,42,0.7)",
            color: isWished ? "#0F172A" : "#F8FAFC",
          }}
        >
          ♥
        </button>

        {!product.inStock && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(239,68,68,0.9)", color: "#fff" }}>
            Hết hàng
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#D4AF37" }}>
          {product.brand}
        </div>
        <Link to={`/products/${product.id}`} className="block text-sm font-semibold mb-2 hover:text-yellow-400 transition-colors line-clamp-2" style={{ color: "#F8FAFC" }}>
          {product.name}
        </Link>

        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-3.5 h-3.5 fill-current" style={{ color: s <= Math.floor(product.rating) ? "#D4AF37" : "#334155" }} />
            ))}
          </div>
          <span className="text-xs" style={{ color: "#94A3B8" }}>({product.reviews})</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold" style={{ color: "#D4AF37" }}>${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-xs line-through ml-2" style={{ color: "#64748B" }}>${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (product.inStock) {
                addToCart({ id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.image, quantity: 1 });
              }
            }}
            disabled={!product.inStock}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] active:scale-95 disabled:opacity-40 disabled:pointer-events-none disabled:transform-none"
            style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}
          >
            Thêm giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border p-4 space-y-4 animate-pulse" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.1)" }}>
      <div className="w-full rounded-xl" style={{ paddingTop: "75%", background: "#0F172A" }} />
      <div className="h-4 rounded" style={{ background: "#0F172A", width: "40%" }} />
      <div className="h-5 rounded" style={{ background: "#0F172A", width: "80%" }} />
      <div className="h-4 rounded" style={{ background: "#0F172A", width: "20%" }} />
      <div className="flex justify-between items-center">
        <div className="h-6 rounded" style={{ background: "#0F172A", width: "30%" }} />
        <div className="h-8 rounded-lg" style={{ background: "#0F172A", width: "35%" }} />
      </div>
    </div>
  );
}

export function HomePage({ addToCart, wishlist, toggleWishlist }: HomePageProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroSlide, setHeroSlide] = useState(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi tải sản phẩm:', err);
        setLoading(false);
      });
  }, []);

  // Filter products for sections
  const bestSellers = products.filter(p => p.badge === "Bán chạy" || p.rating >= 4.8).slice(0, 4);
  const newArrivals = products.filter(p => p.badge === "Mới về" || p.id % 2 === 0).slice(0, 4);

  return (
    <div style={{ background: "#0F172A" }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ height: "680px" }}>
        <img
          src={HERO_IMAGES[heroSlide]}
          alt="Billiards cao cấp"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(110deg, rgba(15,23,42,0.95) 40%, rgba(15,23,42,0.5) 70%, rgba(15,23,42,0.2) 100%)" }}
        />

        {/* Decorative gold accent */}
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: "linear-gradient(to bottom, transparent, #D4AF37, transparent)" }} />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 h-full flex flex-col justify-center">
          <div className="max-w-xl">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider mb-6 border"
              style={{ background: "rgba(212,175,55,0.1)", borderColor: "rgba(212,175,55,0.3)", color: "#D4AF37" }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#D4AF37" }} />
              THIẾT BỊ BILLIARDS NHẬP KHẨU CAO CẤP
            </div>

            <h1
              className="font-display text-[3.25rem] md:text-6xl lg:text-[4.75rem] mb-5 font-semibold leading-[1.05]"
              style={{ color: "#F8FAFC" }}
            >
              Nâng Tầm Cú{" "}
              <span className="italic font-medium" style={{ color: "#D4AF37" }}>Đánh</span>
            </h1>
            <p className="text-lg mb-8 leading-relaxed max-w-lg font-light" style={{ color: "#CBD5E1" }}>
              Mua sắm cơ bida lỗ, cơ libre, phụ kiện cao cấp nhất từ Predator, Fury, Cuetec, Kamui... Lựa chọn tin cậy của các nhà vô địch bida chuyên nghiệp.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/ai-cue-finder"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:brightness-110 shadow-lg shadow-yellow-500/20"
                style={{ background: "linear-gradient(135deg, #FACC15, #D4AF37)", color: "#0F172A" }}
              >
                <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" /> Tìm Cơ Bida AI
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm border transition-all hover:bg-white/5"
                style={{ borderColor: "rgba(248,250,252,0.3)", color: "#F8FAFC" }}
              >
                Tất Cả Sản Phẩm <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex gap-8 mt-10">
              {[{ val: "10K+", label: "Khách hàng hài lòng" }, { val: "500+", label: "Sản phẩm chính hãng" }, { val: "15+", label: "Thương hiệu đối tác" }].map((s) => (
                <div key={s.label}>
                  <div className="font-display text-3xl font-semibold" style={{ color: "#D4AF37" }}>{s.val}</div>
                  <div className="text-xs" style={{ color: "#94A3B8" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slide controls */}
        <div className="absolute bottom-6 right-6 flex gap-2">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroSlide(i)}
              className="rounded-full transition-all"
              style={{
                width: i === heroSlide ? "24px" : "8px",
                height: "8px",
                background: i === heroSlide ? "#D4AF37" : "rgba(248,250,252,0.3)",
              }}
            />
          ))}
        </div>
        <button
          onClick={() => setHeroSlide((heroSlide - 1 + HERO_IMAGES.length) % HERO_IMAGES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:border-yellow-400/50"
          style={{ background: "rgba(15,23,42,0.6)", borderColor: "rgba(255,255,255,0.2)", color: "#F8FAFC" }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setHeroSlide((heroSlide + 1) % HERO_IMAGES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:border-yellow-400/50"
          style={{ background: "rgba(15,23,42,0.6)", borderColor: "rgba(255,255,255,0.2)", color: "#F8FAFC" }}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </section>

      {/* Trust Features */}
      <section style={{ background: "#1E293B", borderTop: "1px solid rgba(212,175,55,0.15)", borderBottom: "1px solid rgba(212,175,55,0.15)" }}>
        <div className="max-w-[1440px] mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(212,175,55,0.1)" }}>
                <f.icon className="w-5 h-5" style={{ color: "#D4AF37" }} />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>{f.title}</div>
                <div className="text-xs leading-tight" style={{ color: "#94A3B8" }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Cue Finder Promo Banner */}
      <section className="max-w-[1440px] mx-auto px-6 pt-12">
        <div 
          className="rounded-3xl p-8 md:p-12 relative overflow-hidden border flex flex-col md:flex-row items-center justify-between gap-8"
          style={{
            background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
            borderColor: "rgba(212,175,55,0.3)",
            boxShadow: "0 25px 50px -12px rgba(212, 175, 55, 0.1)"
          }}
        >
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none" />
          <div className="space-y-4 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-yellow-400" /> Trợ Lý AI Cá Nhân Hóa
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight font-display">
              Chưa biết chọn cây cơ nào phù hợp nhất?
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Trải nghiệm ngay <strong className="text-yellow-400">Công Cụ Tìm Cơ AI</strong> — Nhập chiều cao, lực đánh, trình độ và ngân sách để nhận tư vấn cây cơ 🎱 hoàn hảo được tối ưu hóa riêng cho bạn trong 30 giây!
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/ai-cue-finder"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm transition-all hover:brightness-110 shadow-lg shadow-yellow-500/20"
                style={{ background: "linear-gradient(135deg, #FACC15, #D4AF37)", color: "#0F172A" }}
              >
                <Sparkles className="w-4 h-4 text-slate-950" /> Tìm Cơ Bida AI Ngay
              </Link>
              <span className="text-xs text-slate-400">✔ Miễn phí 100% · ✔ Tư vấn chính xác dựa trên thông số</span>
            </div>
          </div>

          <div className="relative z-10 shrink-0 w-full md:w-auto flex justify-center">
            <div className="p-6 rounded-2xl border border-yellow-500/20 bg-slate-900/80 backdrop-blur-md max-w-xs space-y-3 shadow-2xl">
              <div className="text-xs text-yellow-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Gợi ý mẫu
              </div>
              <div className="text-sm font-extrabold text-white">Mezz EC9 / Predator 314</div>
              <ul className="text-xs space-y-1.5 text-slate-300">
                <li className="text-emerald-400 font-medium">✔ Phù hợp trình độ & lực đánh</li>
                <li className="text-emerald-400 font-medium">✔ Cân bằng trọng lượng chuẩn theo chiều cao</li>
                <li className="text-emerald-400 font-medium">✔ Chuẩn ngân sách lựa chọn</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 🎁 ULTRA-PROMINENT BLIND BOX SECTION ($500 -> 10% $1,000 DROP) */}
      <section className="max-w-[1440px] mx-auto px-6 pt-12">
        <div 
          className="rounded-3xl p-8 md:p-12 relative overflow-hidden border-2 border-yellow-500/60 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-[0_0_50px_rgba(212,175,55,0.25)]"
          style={{
            background: "radial-gradient(circle at 80% 20%, rgba(212,175,55,0.15) 0%, rgba(15,23,42,0.95) 70%)",
          }}
        >
          {/* Ambient Lighting & Particles */}
          <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none" />
          <div className="absolute top-4 right-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-widest animate-pulse shadow-lg">
            🔥 SỰ KIỆN NỔ HŨ HOT NHẤT 2026
          </div>

          <div className="space-y-5 max-w-2xl relative z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 text-xs font-extrabold uppercase tracking-wider">
              <Flame className="w-4 h-4 animate-bounce text-yellow-400" /> TÍNH NĂNG TÚI MÙ ĐỘC QUYỀN
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight font-display">
              Mở Túi Mù Bida <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500">$500</span> — Cơ Hội Trúng Gậy <span className="text-yellow-400 underline decoration-yellow-400/50 underline-offset-8">$1,000</span>
            </h2>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed font-light">
              Mỗi lượt mở Túi Mù <strong className="text-yellow-400">$500 (12.500.000đ)</strong> chắc chắn nhận ngay 1 Cây Cơ Cao Cấp Chính Hãng (trị giá $500 - $650). 
              Đặc biệt <strong className="text-amber-300 font-bold">CƠ HỘI NỔ HŨ 10%</strong> nhận Siêu Phẩm Cây Cơ Predator/Mezz Dragon Edition trị giá <strong className="text-yellow-400 font-extrabold">$1,000 (25.000.000đ)</strong>!
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link
                to="/blind-box"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-base transition-all duration-300 hover:brightness-110 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                style={{ background: "linear-gradient(135deg, #FACC15, #D4AF37)", color: "#0F172A" }}
              >
                <Gift className="w-6 h-6 text-slate-950 animate-bounce" /> 🎁 Mua & Mở Túi Mù Ngay ($500)
              </Link>
              
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Minh bạch 100% tỷ lệ quay thưởng · Nhận hàng tức thì</span>
              </div>
            </div>
          </div>

          {/* 3D Animated Box Card Showcase */}
          <div className="relative z-10 shrink-0 cursor-pointer" onClick={() => window.location.href = '/blind-box'}>
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition duration-500 animate-pulse" />
              
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-slate-900 border-2 border-yellow-400/80 p-6 flex flex-col items-center justify-center text-center shadow-2xl transition-all duration-300 group-hover:scale-105">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/40 mb-3 animate-bounce">
                  <Gift className="w-14 h-14 text-slate-950" />
                </div>
                
                <span className="text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 mb-1">
                  10% NỔ HŨ $1,000
                </span>
                <div className="text-lg font-bold text-white">Túi Mù Bida Hoàng Gia</div>
                <div className="text-2xl font-black text-yellow-400 font-mono">$500.00</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-[1440px] mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#D4AF37" }}>Duyệt Theo Danh Mục</div>
            <h2 className="text-3xl font-semibold" style={{ color: "#F8FAFC" }}>
              Tìm Thiết Bị Phù Hợp Lối Chơi
            </h2>
          </div>
          <Link to="/products" className="hidden md:flex items-center gap-1.5 text-sm font-medium hover:gap-2.5 transition-all" style={{ color: "#D4AF37" }}>
            Tất cả sản phẩm <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              to={cat.href}
              className="group relative rounded-2xl border p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "#1E293B",
                borderColor: "rgba(212,175,55,0.15)",
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                style={{ background: `${cat.color}15` }}
              >
                <cat.icon className="w-7 h-7" style={{ color: cat.color }} />
              </div>
              <div className="text-sm font-semibold mb-1" style={{ color: "#F8FAFC" }}>{cat.label}</div>
              <div className="text-xs" style={{ color: "#94A3B8" }}>
                {products.filter((p) => p.category === cat.key).length} sản phẩm
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-20" style={{ background: "rgba(30,41,59,0.5)" }}>
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#D4AF37" }}>Sản phẩm nổi tiếng</div>
              <h2 className="text-3xl font-semibold" style={{ color: "#F8FAFC" }}>
                Sản Phẩm Bán Chạy nhất
              </h2>
            </div>
            <Link to="/products" className="hidden md:flex items-center gap-1.5 text-sm font-medium hover:gap-2.5 transition-all" style={{ color: "#D4AF37" }}>
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [1, 2, 3, 4].map(idx => <SkeletonCard key={idx} />)
            ) : bestSellers.length === 0 ? (
              <div className="col-span-4 text-center text-sm text-slate-400 py-10">Đang cập nhật sản phẩm bán chạy...</div>
            ) : (
              bestSellers.map((p) => (
                <ProductCard key={p.id} product={p} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="max-w-[1440px] mx-auto px-6 py-10">
        <div
          className="rounded-3xl overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)", border: "1px solid rgba(212,175,55,0.2)" }}
        >
          <div className="absolute inset-0 opacity-20">
            <img
              src="https://images.unsplash.com/photo-1545062080-a71640ea75a1?w=1440&h=400&fit=crop"
              alt="Bàn bida"
              className="w-full h-full object-cover"
            />
          </div>
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, rgba(15,23,42,1) 30%, rgba(15,23,42,0.5) 100%)" }}
          />
          <div className="relative p-12 md:p-16">
            <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#22C55E" }}>Khuyến Mãi Có Hạn</div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-3" style={{ color: "#F8FAFC" }}>
              Giảm Giá Tới <span style={{ color: "#D4AF37" }}>30%</span> Cho Cơ Predator
            </h2>
            <p className="text-sm mb-8 max-w-lg" style={{ color: "#94A3B8" }}>
              Cơ hội sở hữu ngọn cơ sợi carbon công nghệ Revo huyền thoại với giá ưu đãi cực lớn. Đừng bỏ lỡ — số lượng trong kho có hạn.
            </p>
            <Link
              to="/products?brand=predator&sale=true"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}
            >
              Mua ngay đợt ưu đãi Predator <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-[1440px] mx-auto px-6 py-10 pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#22C55E" }}>Sản phẩm mới nhập</div>
            <h2 className="text-3xl font-semibold" style={{ color: "#F8FAFC" }}>
              Sản Phẩm Mới Về
            </h2>
          </div>
          <Link to="/products?sort=new" className="hidden md:flex items-center gap-1.5 text-sm font-medium hover:gap-2.5 transition-all" style={{ color: "#D4AF37" }}>
            Xem sản phẩm mới <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            [1, 2, 3, 4].map(idx => <SkeletonCard key={idx} />)
          ) : newArrivals.length === 0 ? (
            <div className="col-span-4 text-center text-sm text-slate-400 py-10">Đang cập nhật sản phẩm mới về...</div>
          ) : (
            newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />
            ))
          )}
        </div>
      </section>

      {/* Brands */}
      <section className="py-20" style={{ background: "#1E293B", borderTop: "1px solid rgba(212,175,55,0.1)", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#D4AF37" }}>Đơn vị đồng hành</div>
            <h2 className="text-3xl font-semibold" style={{ color: "#F8FAFC" }}>
              Thương Hiệu Đối Tác Cao Cấp
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {BRANDS.map((brand) => (
              <Link
                key={brand.name}
                to={`/products?brand=${brand.name.toLowerCase()}`}
                className="group rounded-2xl border p-6 text-center transition-all hover:-translate-y-1 hover:border-yellow-400/30"
                style={{ background: "#0F172A", borderColor: "rgba(212,175,55,0.1)" }}
              >
                <div className="text-lg font-semibold mb-1 transition-colors group-hover:text-yellow-400" style={{ color: "#F8FAFC" }}>
                  {brand.name}
                </div>
                <div className="text-xs" style={{ color: "#94A3B8" }}>{brand.tagline}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-[1440px] mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#D4AF37" }}>Cơ thủ đánh giá</div>
              <h2 className="text-3xl font-semibold" style={{ color: "#F8FAFC" }}>
            Khách Hàng Nói Gì Về Chúng Tôi
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 border"
              style={{
                background: "#1E293B",
                borderColor: "rgba(212,175,55,0.15)",
              }}
            >
              <Quote className="w-8 h-8 mb-4" style={{ color: "#D4AF37", opacity: 0.5 }} />
              <p className="text-sm leading-relaxed mb-6" style={{ color: "#CBD5E1" }}>"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>{t.name}</div>
                  <div className="text-xs" style={{ color: "#94A3B8" }}>{t.role}</div>
                </div>
                <div className="ml-auto flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-current" style={{ color: "#D4AF37" }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Quick Action Widget for Blind Box */}
      <div className="fixed bottom-6 right-6 z-50 animate-bounce">
        <Link
          to="/blind-box"
          className="flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(212,175,55,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-yellow-300"
        >
          <Gift className="w-5 h-5 text-slate-950" />
          <span>🎁 Mở Túi Mù $500 (Nổ Hũ $1,000)</span>
        </Link>
      </div>
    </div>
  );
}
