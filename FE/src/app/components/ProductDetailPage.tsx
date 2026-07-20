import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { Star, ShoppingCart, Heart, Shield, Truck, RotateCcw, ChevronLeft, ChevronRight, Minus, Plus, Check, Zap } from "lucide-react";
import type { CartItem } from "../App";

const categoryNames: Record<string, string> = {
  "pool-cues": "Cơ bida lỗ",
  "carom-cues": "Cơ bida phăng",
  "break-jump": "Cơ phá & nhảy",
  "cue-cases": "Bao đựng cơ",
  "chalks": "Lơ bida",
  "gloves": "Găng tay bida",
  "accessories": "Phụ kiện"
};

interface ProductDetailPageProps {
  addToCart: (item: CartItem) => void;
  wishlist: number[];
  toggleWishlist: (id: number) => void;
}

export function ProductDetailPage({ addToCart, wishlist, toggleWishlist }: ProductDetailPageProps) {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState("");
  const [selectedShaft, setSelectedShaft] = useState("");
  const [selectedTip, setSelectedTip] = useState("");
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    // Fetch product details
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Sản phẩm không tồn tại");
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setActiveImage(0);
        setSelectedWeight(data.weights?.[0] || "");
        setSelectedShaft(data.shafts?.[0] || "");
        setSelectedTip(data.tipSizes?.[0] || "");
        setQty(1);
        setLoading(false);
        
        // Fetch related products in the same category
        fetch(`/api/products?category=${data.category}`)
          .then(res => res.json())
          .then(relatedData => {
            const list = relatedData.products || relatedData;
            const filtered = list
              .filter((p: any) => p.id !== data.id)
              .slice(0, 4);
            setRelatedProducts(filtered);
          });
      })
      .catch(err => {
        console.error("Lỗi khi tải chi tiết sản phẩm:", err);
        setLoading(false);
      });
  }, [id]);

  const isWished = product ? wishlist.includes(product.id) : false;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.images[0] || product.image,
      quantity: qty,
      variant: [selectedWeight, selectedShaft, selectedTip].filter(Boolean).join(" / "),
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  if (loading) {
    return (
      <div style={{ background: "#0F172A", minHeight: "100vh" }} className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-yellow-500 border-slate-700 animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ background: "#0F172A", minHeight: "100vh" }} className="flex flex-col items-center justify-center py-32 text-center">
        <div className="text-4xl mb-4">🎱</div>
        <h2 className="text-xl font-bold text-slate-200 mb-2">Không tìm thấy sản phẩm</h2>
        <p className="text-slate-400 text-sm mb-6">Sản phẩm có thể đã bị xóa hoặc đường dẫn không chính xác.</p>
        <Link to="/products" className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}>
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: "#0F172A", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-6 py-4">
        <div className="flex items-center gap-2 text-xs" style={{ color: "#64748B" }}>
          <Link to="/" className="hover:text-yellow-400 transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-yellow-400 transition-colors">Sản phẩm</Link>
          <span>/</span>
          <Link to={`/products?cat=${product.category}`} className="hover:text-yellow-400 transition-colors">
            {categoryNames[product.category] || product.category}
          </Link>
          <span>/</span>
          <span style={{ color: "#94A3B8" }}>{product.name}</span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div>
            <div
              className="relative rounded-3xl overflow-hidden mb-4"
              style={{ background: "#1E293B", border: "1px solid rgba(212,175,55,0.15)" }}
            >
              <div style={{ paddingTop: "100%" }} className="relative">
                <img
                  src={product.images?.[activeImage] || product.image}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 60%, rgba(15,23,42,0.3))" }} />
              </div>
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((activeImage - 1 + product.images.length) % product.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border"
                    style={{ background: "rgba(15,23,42,0.8)", borderColor: "rgba(212,175,55,0.3)", color: "#F8FAFC" }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImage((activeImage + 1) % product.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border"
                    style={{ background: "rgba(15,23,42,0.8)", borderColor: "rgba(212,175,55,0.3)", color: "#F8FAFC" }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-3">
              {product.images?.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className="rounded-xl overflow-hidden border-2 transition-all"
                  style={{
                    borderColor: i === activeImage ? "#D4AF37" : "transparent",
                    width: "80px", height: "80px",
                    opacity: i === activeImage ? 1 : 0.6,
                  }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: "rgba(212,175,55,0.15)", color: "#D4AF37" }}>
                {product.brand}
              </span>
              {product.badge && (
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "#D4AF37", color: "#0F172A" }}>
                  {product.badge}
                </span>
              )}
              <span className="text-xs px-3 py-1 rounded-full ml-auto" style={{ background: product.inStock ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: product.inStock ? "#22C55E" : "#EF4444" }}>
                {product.inStock ? "● Còn hàng" : "● Hết hàng"}
              </span>
            </div>

            <h1 className="text-3xl font-bold mb-3" style={{ color: "#F8FAFC" }}>
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-current" style={{ color: s <= Math.floor(product.rating) ? "#D4AF37" : "#334155" }} />
                ))}
              </div>
              <span className="text-sm font-semibold" style={{ color: "#D4AF37" }}>{product.rating}</span>
              <span className="text-sm" style={{ color: "#94A3B8" }}>({product.reviews} đánh giá)</span>
              <span className="text-xs ml-auto" style={{ color: "#64748B" }}>SKU: {product.sku}</span>
            </div>

            <div className="flex items-end gap-3 mb-6 pb-6 border-b" style={{ borderColor: "rgba(212,175,55,0.15)" }}>
              <span className="text-4xl font-semibold font-display" style={{ color: "#D4AF37" }}>
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <div>
                  <span className="text-lg line-through" style={{ color: "#64748B" }}>${product.originalPrice.toFixed(2)}</span>
                  <span className="ml-2 text-sm font-bold" style={{ color: "#22C55E" }}>
                    Tiết kiệm ${(product.originalPrice - product.price).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Variants - Weight */}
            {product.weights && product.weights.length > 0 && (
              <div className="mb-5">
                <div className="text-sm font-semibold mb-3" style={{ color: "#F8FAFC" }}>
                  Trọng lượng: <span style={{ color: "#D4AF37" }}>{selectedWeight}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.weights.map((w: string) => (
                    <button
                      key={w}
                      onClick={() => setSelectedWeight(w)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                      style={{
                        background: selectedWeight === w ? "rgba(212,175,55,0.2)" : "#1E293B",
                        borderColor: selectedWeight === w ? "#D4AF37" : "rgba(212,175,55,0.2)",
                        color: selectedWeight === w ? "#D4AF37" : "#94A3B8",
                      }}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Variants - Shaft */}
            {product.shafts && product.shafts.length > 0 && (
              <div className="mb-5">
                <div className="text-sm font-semibold mb-3" style={{ color: "#F8FAFC" }}>
                  Loại ngọn: <span style={{ color: "#D4AF37" }}>{selectedShaft}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.shafts.map((s: string) => (
                    <button
                      key={s}
                      onClick={() => setSelectedShaft(s)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                      style={{
                        background: selectedShaft === s ? "rgba(212,175,55,0.2)" : "#1E293B",
                        borderColor: selectedShaft === s ? "#D4AF37" : "rgba(212,175,55,0.2)",
                        color: selectedShaft === s ? "#D4AF37" : "#94A3B8",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Variants - Tip Size */}
            {product.tipSizes && product.tipSizes.length > 0 && (
              <div className="mb-6">
                <div className="text-sm font-semibold mb-3" style={{ color: "#F8FAFC" }}>
                  Đầu cơ: <span style={{ color: "#D4AF37" }}>{selectedTip}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.tipSizes.map((t: string) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTip(t)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                      style={{
                        background: selectedTip === t ? "rgba(212,175,55,0.2)" : "#1E293B",
                        borderColor: selectedTip === t ? "#D4AF37" : "rgba(212,175,55,0.2)",
                        color: selectedTip === t ? "#D4AF37" : "#94A3B8",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + CTA */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center rounded-xl border overflow-hidden" style={{ borderColor: "rgba(212,175,55,0.2)" }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-white/5" style={{ color: "#F8FAFC" }}>
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-semibold" style={{ color: "#F8FAFC" }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-white/5" style={{ color: "#F8FAFC" }}>
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: addedToCart ? "linear-gradient(135deg, #22C55E, #16A34A)" : "linear-gradient(135deg, #D4AF37, #A88920)", color: addedToCart ? "#fff" : "#0F172A" }}
              >
                {addedToCart ? <><Check className="w-4 h-4" /> Đã thêm!</> : <><ShoppingCart className="w-4 h-4" /> Thêm vào giỏ</>}
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className="w-11 h-11 rounded-xl flex items-center justify-center border transition-all hover:border-yellow-400/50"
                style={{
                  background: isWished ? "rgba(212,175,55,0.15)" : "#1E293B",
                  borderColor: isWished ? "#D4AF37" : "rgba(212,175,55,0.2)",
                  color: isWished ? "#D4AF37" : "#94A3B8",
                }}
              >
                <Heart className="w-5 h-5" fill={isWished ? "currentColor" : "none"} />
              </button>
            </div>

            <Link
              to="/checkout"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm border transition-all hover:bg-emerald-400/10 mb-6"
              style={{ borderColor: "#22C55E", color: "#22C55E" }}
              onClick={() => addToCart({ id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.images?.[0] || product.image, quantity: qty, variant: [selectedWeight, selectedShaft].filter(Boolean).join(" / ") })}
            >
              <Zap className="w-4 h-4" /> Mua ngay — Thanh toán siêu tốc
            </Link>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, text: "Freeship đơn từ $150" },
                { icon: Shield, text: "Bảo đảm chính hãng 100%" },
                { icon: RotateCcw, text: "Đổi trả trong 30 ngày" },
              ].map((b) => (
                <div key={b.text} className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl" style={{ background: "#1E293B" }}>
                  <b.icon className="w-4 h-4" style={{ color: "#D4AF37" }} />
                  <span className="text-xs" style={{ color: "#94A3B8" }}>{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex border-b" style={{ borderColor: "rgba(212,175,55,0.15)" }}>
            {[
              { id: "description", label: "Mô tả" },
              { id: "specs", label: "Thông số kỹ thuật" },
              { id: "reviews", label: `Đánh giá (${product.reviewsList?.length || 0})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="px-6 py-3 text-sm font-semibold transition-all border-b-2 -mb-px"
                style={{
                  borderColor: activeTab === tab.id ? "#D4AF37" : "transparent",
                  color: activeTab === tab.id ? "#D4AF37" : "#94A3B8",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "description" && (
          <div className="rounded-2xl border p-6 mb-12" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.15)" }}>
            <p className="text-sm leading-relaxed" style={{ color: "#CBD5E1" }}>{product.description}</p>
          </div>
        )}

        {activeTab === "specs" && (
          <div className="rounded-2xl border overflow-hidden mb-12" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.15)" }}>
            {product.specs?.map((spec: { label: string; value: string }, i: number) => (
              <div
                key={spec.label}
                className="flex items-center justify-between px-6 py-4 border-b last:border-b-0"
                style={{ borderColor: "rgba(212,175,55,0.1)", background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}
              >
                <span className="text-sm font-medium" style={{ color: "#94A3B8" }}>{spec.label}</span>
                <span className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>{spec.value}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="mb-12 space-y-4">
            {(!product.reviewsList || product.reviewsList.length === 0) ? (
              <div className="text-center py-10 text-slate-400 text-sm">Chưa có đánh giá nào cho sản phẩm này.</div>
            ) : (
              product.reviewsList.map((r: any, i: number) => (
                <div key={i} className="rounded-2xl border p-6" style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.15)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}>
                        {r.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>{r.name}</div>
                        <div className="text-xs" style={{ color: "#64748B" }}>{r.date}</div>
                      </div>
                      {r.verified && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}>Đã mua hàng</span>}
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3.5 h-3.5 fill-current" style={{ color: s <= r.rating ? "#D4AF37" : "#334155" }} />)}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#CBD5E1" }}>{r.text}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: "#F8FAFC" }}>Sản Phẩm Tương Tự</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {relatedProducts.map((r) => (
                <Link
                  key={r.id}
                  to={`/products/${r.id}`}
                  className="rounded-2xl border overflow-hidden transition-all hover:-translate-y-1 hover:border-yellow-400/20"
                  style={{ background: "#1E293B", borderColor: "rgba(212,175,55,0.15)" }}
                >
                  <img src={r.image} alt={r.name} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <div className="text-xs font-bold uppercase mb-1" style={{ color: "#D4AF37" }}>{r.brand}</div>
                    <div className="text-sm font-semibold mb-2 line-clamp-2" style={{ color: "#F8FAFC" }}>{r.name}</div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold" style={{ color: "#D4AF37" }}>${r.price.toFixed(2)}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3 h-3 fill-current" style={{ color: s <= Math.floor(r.rating) ? "#D4AF37" : "#334155" }} />)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
