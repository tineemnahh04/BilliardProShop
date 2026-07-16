import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, Filter, Star, ChevronDown, SlidersHorizontal, Grid3X3, List, X } from "lucide-react";
import type { CartItem } from "../App";

const BRANDS = ["Predator", "Fury", "Cuetec", "JFlowers", "Kamui", "Mit Cues"];

const BADGE_COLORS: Record<string, string> = {
  "Bán chạy": "#D4AF37",
  "Mới về": "#22C55E",
  "Khuyến mãi": "#EF4444",
  "Cao cấp": "#8B5CF6",
  "Đánh giá cao": "#3B82F6",
};

const catDisplayNames: Record<string, string> = {
  "pool-cues": "Cơ bida lỗ",
  "carom-cues": "Cơ bida phăng",
  "break-jump": "Cơ phá & nhảy",
  "cue-cases": "Bao đựng cơ",
  "chalks": "Lơ bida",
  "gloves": "Găng tay bida",
  "accessories": "Phụ kiện"
};

interface ProductListingPageProps {
  addToCart: (item: CartItem) => void;
  wishlist: number[];
  toggleWishlist: (id: number) => void;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border p-4 space-y-4 animate-pulse" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.1)" }}>
      <div className="w-full rounded-xl" style={{ paddingTop: "70%", background: "#0F172A" }} />
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

export function ProductListingPage({ addToCart, wishlist, toggleWishlist }: ProductListingPageProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  
  const [filters, setFilters] = useState({
    brands: [] as string[],
    categories: [] as string[],
    minPrice: 0,
    maxPrice: 600,
    rating: 0,
    inStockOnly: false,
  });
  
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const q = searchParams.get("q") || "";
  const catParam = searchParams.get("cat") || "";
  const brandParam = searchParams.get("brand") || "";

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Reset page to 1 when filters or search keyword changes
  useEffect(() => {
    setPage(1);
  }, [q, catParam, brandParam, filters.brands, filters.minPrice, filters.maxPrice, filters.rating, filters.inStockOnly, sortBy]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    
    if (q) params.set("q", q);
    if (catParam) params.set("category", catParam);
    
    if (brandParam && brandParam !== "all") {
      params.set("brand", brandParam);
    } else if (filters.brands.length > 0) {
      params.set("brand", filters.brands.join(","));
    }
    
    if (filters.minPrice > 0) params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice < 600) params.set("maxPrice", filters.maxPrice.toString());
    if (filters.rating > 0) params.set("rating", filters.rating.toString());
    if (filters.inStockOnly) params.set("inStockOnly", "true");
    if (sortBy) params.set("sort", sortBy);
    
    params.set("page", page.toString());
    params.set("limit", "9");

    fetch(`/api/products?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.products) {
          setProducts(data.products);
          setTotalPages(data.pages || 1);
          setTotalProducts(data.total || 0);
        } else {
          // Fallback if API returned plain array
          setProducts(data);
          setTotalPages(1);
          setTotalProducts(data.length);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi tải sản phẩm:', err);
        setLoading(false);
      });
  }, [q, catParam, brandParam, filters, sortBy, page]);

  const filtered = products;

  const toggleBrand = (brand: string) => {
    setFilters((f) => ({
      ...f, brands: f.brands.includes(brand) ? f.brands.filter((b) => b !== brand) : [...f.brands, brand],
    }));
  };

  return (
    <div style={{ background: "#0F172A", minHeight: "100vh" }}>
      {/* Page header */}
      <div
        className="py-10 px-6 border-b"
        style={{ background: "linear-gradient(to bottom, #1E293B, #0F172A)", borderColor: "rgba(212,175,55,0.15)" }}
      >
        <div className="max-w-[1440px] mx-auto">
          <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#D4AF37" }}>
            {catParam ? (catDisplayNames[catParam] || catParam) : "Tất cả sản phẩm"}
          </div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: "#F8FAFC" }}>
            {q ? `Tìm kiếm: "${q}"` : catParam ? (catDisplayNames[catParam] || catParam) : "Cửa Hàng Thiết Bị Bida"}
          </h1>
          <p className="text-sm" style={{ color: "#94A3B8" }}>{loading ? 'Đang tìm kiếm...' : `Tìm thấy ${filtered.length} sản phẩm`}</p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Brands */}
              <div className="rounded-2xl border p-5" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.15)" }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: "#F8FAFC" }}>Thương hiệu</h3>
                <div className="space-y-2.5">
                  {BRANDS.map((brand) => (
                    <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: "#D4AF37" }}
                      />
                      <span className="text-sm transition-colors group-hover:text-yellow-400" style={{ color: "#CBD5E1" }}>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="rounded-2xl border p-5" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.15)" }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: "#F8FAFC" }}>Khoảng giá (USD)</h3>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters((f) => ({ ...f, minPrice: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg text-xs border outline-none"
                    style={{ background: "#0F172A", borderColor: "rgba(212,175,55,0.2)", color: "#F8FAFC" }}
                    placeholder="Min"
                  />
                  <span style={{ color: "#94A3B8" }}>–</span>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg text-xs border outline-none"
                    style={{ background: "#0F172A", borderColor: "rgba(212,175,55,0.2)", color: "#F8FAFC" }}
                    placeholder="Max"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="600"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))}
                  className="w-full"
                  style={{ accentColor: "#D4AF37" }}
                />
                <div className="flex justify-between text-xs mt-1" style={{ color: "#94A3B8" }}>
                  <span>$0</span><span>$600+</span>
                </div>
              </div>

              {/* Rating */}
              <div className="rounded-2xl border p-5" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.15)" }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: "#F8FAFC" }}>Đánh giá tối thiểu</h3>
                <div className="space-y-2">
                  {[4.5, 4.0, 3.5, 0].map((r) => (
                    <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.rating === r}
                        onChange={() => setFilters((f) => ({ ...f, rating: r }))}
                        style={{ accentColor: "#D4AF37" }}
                      />
                      <div className="flex items-center gap-1">
                        {r > 0 ? (
                          <>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="w-3 h-3 fill-current" style={{ color: s <= r ? "#D4AF37" : "#334155" }} />
                            ))}
                            <span className="text-xs ml-1" style={{ color: "#94A3B8" }}>{r}+ Sao</span>
                          </>
                        ) : (
                          <span className="text-xs" style={{ color: "#94A3B8" }}>Tất cả đánh giá</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* In Stock */}
              <div className="rounded-2xl border p-5" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.15)" }}>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStockOnly}
                    onChange={(e) => setFilters((f) => ({ ...f, inStockOnly: e.target.checked }))}
                    style={{ accentColor: "#D4AF37" }}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium" style={{ color: "#F8FAFC" }}>Chỉ sản phẩm còn hàng</span>
                </label>
              </div>

              {/* Clear */}
              <button
                onClick={() => setFilters({ brands: [], categories: [], minPrice: 0, maxPrice: 600, rating: 0, inStockOnly: false })}
                className="w-full py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-white/5"
                style={{ borderColor: "rgba(212,175,55,0.3)", color: "#D4AF37" }}
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          </aside>
        )}

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-all hover:border-yellow-400/40"
              style={{ borderColor: "rgba(212,175,55,0.2)", color: "#CBD5E1" }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {sidebarOpen ? "Ẩn" : "Hiện"} bộ lọc
            </button>

            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className="p-2 rounded-lg transition-colors"
                  style={{ background: viewMode === "grid" ? "rgba(212,175,55,0.15)" : "transparent", color: viewMode === "grid" ? "#D4AF37" : "#94A3B8" }}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className="p-2 rounded-lg transition-colors"
                  style={{ background: viewMode === "list" ? "rgba(212,175,55,0.15)" : "transparent", color: viewMode === "list" ? "#D4AF37" : "#94A3B8" }}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-xl text-sm border outline-none"
                style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.2)", color: "#F8FAFC" }}
              >
                <option value="featured">Nổi bật</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
                <option value="rating">Đánh giá cao nhất</option>
                <option value="new">Mới nhất</option>
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {(filters.brands.length > 0 || filters.inStockOnly || filters.rating > 0) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.brands.map((b) => (
                <span key={b} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(212,175,55,0.15)", color: "#D4AF37" }}>
                  {b} <button onClick={() => toggleBrand(b)}><X className="w-3 h-3" /></button>
                </span>
              ))}
              {filters.inStockOnly && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}>
                  Còn hàng <button onClick={() => setFilters((f) => ({ ...f, inStockOnly: false }))}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Product grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(idx => <SkeletonCard key={idx} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">🎱</div>
              <div className="text-lg font-semibold mb-2" style={{ color: "#F8FAFC" }}>Không tìm thấy sản phẩm</div>
              <div className="text-sm" style={{ color: "#94A3B8" }}>Hãy thử điều chỉnh bộ lọc của bạn</div>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-4"}>
              {filtered.map((p) => (
                viewMode === "grid" ? (
                  <div
                    key={p.id}
                    className="rounded-2xl border overflow-hidden transition-all duration-300 group"
                    style={{
                      background: "#1E293B",
                      borderColor: hoveredId === p.id ? "rgba(212,175,55,0.4)" : "rgba(212,175,55,0.1)",
                      transform: hoveredId === p.id ? "translateY(-4px)" : "none",
                      boxShadow: hoveredId === p.id ? "0 20px 60px rgba(212,175,55,0.12)" : "none",
                    }}
                    onMouseEnter={() => setHoveredId(p.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="relative overflow-hidden" style={{ paddingTop: "70%" }}>
                      <Link to={`/products/${p.id}`} className="absolute inset-0 block">
                        <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,23,42,0.5), transparent 50%)" }} />
                      </Link>
                      {p.badge && (
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: BADGE_COLORS[p.badge] || "#D4AF37", color: "#0F172A" }}>
                          {p.badge}
                        </div>
                      )}
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(p.id); }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10"
                        style={{ background: wishlist.includes(p.id) ? "#D4AF37" : "rgba(15,23,42,0.7)", color: wishlist.includes(p.id) ? "#0F172A" : "#F8FAFC" }}
                      >♥</button>
                    </div>
                    <div className="p-4">
                      <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#D4AF37" }}>{p.brand}</div>
                      <Link to={`/products/${p.id}`} className="block text-sm font-semibold mb-2 hover:text-yellow-400 transition-colors line-clamp-2" style={{ color: "#F8FAFC" }}>{p.name}</Link>
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3.5 h-3.5 fill-current" style={{ color: s <= Math.floor(p.rating) ? "#D4AF37" : "#334155" }} />)}
                        </div>
                        <span className="text-xs" style={{ color: "#94A3B8" }}>({p.reviews})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold" style={{ color: "#D4AF37" }}>${p.price.toFixed(2)}</span>
                          {p.originalPrice && <span className="text-xs line-through ml-2" style={{ color: "#64748B" }}>${p.originalPrice.toFixed(2)}</span>}
                        </div>
                        <button
                          onClick={() => p.inStock && addToCart({ id: p.id, name: p.name, brand: p.brand, price: p.price, image: p.image, quantity: 1 })}
                          disabled={!p.inStock}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-40"
                          style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}
                        >
                          {p.inStock ? "Thêm giỏ hàng" : "Hết hàng"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={p.id} className="rounded-2xl border p-4 flex gap-5 transition-all hover:border-yellow-400/20" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.15)" }}>
                    <Link to={`/products/${p.id}`} className="shrink-0">
                      <img src={p.image} alt={p.name} className="w-28 h-28 rounded-xl object-cover" />
                    </Link>
                    <div className="flex-1">
                      <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#D4AF37" }}>{p.brand}</div>
                      <Link to={`/products/${p.id}`} className="text-base font-semibold hover:text-yellow-400 transition-colors" style={{ color: "#F8FAFC" }}>{p.name}</Link>
                      <div className="flex items-center gap-1.5 mt-1 mb-2">
                        <div className="flex">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3.5 h-3.5 fill-current" style={{ color: s <= Math.floor(p.rating) ? "#D4AF37" : "#334155" }} />)}</div>
                        <span className="text-xs" style={{ color: "#94A3B8" }}>({p.reviews})</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold" style={{ color: "#D4AF37" }}>${p.price.toFixed(2)}</span>
                        {p.originalPrice && <span className="text-sm line-through" style={{ color: "#64748B" }}>${p.originalPrice.toFixed(2)}</span>}
                        {p.badge && <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: BADGE_COLORS[p.badge] || "#D4AF37", color: "#0F172A" }}>{p.badge}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => p.inStock && addToCart({ id: p.id, name: p.name, brand: p.brand, price: p.price, image: p.image, quantity: 1 })}
                      disabled={!p.inStock}
                      className="self-center px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 shrink-0"
                      style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}
                    >
                      {p.inStock ? "Thêm giỏ hàng" : "Hết hàng"}
                    </button>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-9 h-9 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: p === page ? "linear-gradient(135deg, #D4AF37, #A88920)" : "#1E293B",
                    color: p === page ? "#0F172A" : "#94A3B8",
                    border: p === page ? "none" : "1px solid rgba(212,175,55,0.15)",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
