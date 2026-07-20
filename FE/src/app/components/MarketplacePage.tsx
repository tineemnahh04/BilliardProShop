import { useState, useEffect } from "react";
import { Link } from "react-router";
import { 
  Search, Plus, MapPin, Star, Tag, Sparkles, Filter, 
  Flame, RefreshCw, MessageSquare, ShieldCheck, DollarSign, ArrowUpDown
} from "lucide-react";
import { SellCueModal } from "./SellCueModal";

interface MarketplacePageProps {
  currentUser: any;
}

export function MarketplacePage({ currentUser }: MarketplacePageProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [selectedListingType, setSelectedListingType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Sell Modal State
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  const fetchMarketplaceItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (selectedLocation !== "all") params.append("location", selectedLocation);
      if (selectedCondition !== "all") params.append("condition", selectedCondition);
      if (selectedListingType !== "all") params.append("listingType", selectedListingType);
      if (sortBy) params.append("sort", sortBy);

      const response = await fetch(`/api/marketplace?${params.toString()}`);
      if (!response.ok) throw new Error("Không thể tải danh sách Marketplace.");

      const data = await response.json();
      setItems(data);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceItems();
  }, [selectedLocation, selectedCondition, selectedListingType, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMarketplaceItems();
  };

  const formatPriceVND = (price: number) => {
    if (price >= 1000000) {
      return (price / 1000000).toFixed(1).replace(".0", "") + "M VNĐ";
    }
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl p-8 sm:p-12 mb-10 overflow-hidden border border-yellow-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 shadow-2xl">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-bold uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5" /> Chợ Mua Bán Bida Cũ & Mới
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
              Chợ <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-200">Cơ Bida</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base">
              Chợ trao đổi & mua bán cơ bida lướt hàng đầu Việt Nam. Nơi cơ thủ thỏa sức <strong className="text-white">bán lại cơ, mua cơ cũ, trả giá, đấu giá 3 ngày & trao đổi cơ bù tiền</strong>.
            </p>
          </div>

          <button
            onClick={() => setIsSellModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-slate-950 font-extrabold text-sm shadow-xl shadow-yellow-500/20 hover:brightness-110 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-5 h-5" /> + Đăng Bán Cơ Bida
          </button>
        </div>
      </div>

      {/* Search & Filters Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 mb-8 backdrop-blur-xl space-y-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên cây cơ (Mezz EC9, Predator, Cuetec...), địa điểm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm outline-none focus:border-yellow-400"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-yellow-400 font-bold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Địa điểm</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-yellow-400"
            >
              <option value="all">Tất cả địa điểm</option>
              <option value="Hồ Chí Minh">Hồ Chí Minh</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
              <option value="Bình Dương">Bình Dương</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tình trạng</label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-yellow-400"
            >
              <option value="all">Tất cả độ mới</option>
              <option value="like_new">★★★★★ Như Mới (99%)</option>
              <option value="good">★★★★☆ Tốt (90%)</option>
              <option value="fair">★★★☆☆ Trung Bình (80%)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Loại bài đăng</label>
            <select
              value={selectedListingType}
              onChange={(e) => setSelectedListingType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-yellow-400"
            >
              <option value="all">Tất cả loại bài</option>
              <option value="sale">Bán trực tiếp</option>
              <option value="auction">Đấu giá đếm ngược</option>
              <option value="trade">Trao đổi cơ</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sắp xếp</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-yellow-400"
            >
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
              <option value="rating">Người bán uy tín nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Listings Grid */}
      {loading && (
        <div className="py-20 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-400 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Đang tải bài đăng Chợ Bida Trao Đổi...</p>
        </div>
      )}

      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-center space-y-3">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={fetchMarketplaceItems}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700"
          >
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="py-20 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
          <Tag className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Chưa có bài đăng mua bán nào</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Hãy là người đầu tiên đăng cây cơ của bạn lên Chợ Bida Trao Đổi!</p>
          <button
            onClick={() => setIsSellModalOpen(true)}
            className="px-5 py-2.5 bg-yellow-400 text-slate-950 font-bold text-xs rounded-xl hover:bg-yellow-300 transition-colors"
          >
            + Đăng Bán Cơ Ngay
          </button>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-yellow-500/40 transition-all duration-300 flex flex-col group shadow-lg"
            >
              {/* Card Image */}
              <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                <img
                  src={item.images && item.images[0] ? item.images[0] : "https://images.unsplash.com/photo-1599685315659-bc876da49fe5?w=600&h=600&fit=crop"}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                    item.listingType === 'auction' 
                      ? "bg-purple-600 text-white" 
                      : item.listingType === 'trade' 
                      ? "bg-blue-600 text-white" 
                      : "bg-emerald-600 text-white"
                  }`}>
                    {item.listingType === 'auction' ? '⚡ Đấu giá' : item.listingType === 'trade' ? '🔄 Trao đổi' : '🛒 Đang Bán'}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md text-yellow-400 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-800">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" />
                  <span>{item.condition?.label || "Như Mới"}</span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-white text-base line-clamp-1 group-hover:text-yellow-400 transition-colors">
                    {item.title}
                  </h3>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-xl font-extrabold text-yellow-400">
                      {formatPriceVND(item.price)}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.location}</span>
                    </div>
                  </div>
                </div>

                {/* Seller snippet */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-yellow-400">
                      {item.seller?.name ? item.seller.name[0] : "U"}
                    </div>
                    <span className="truncate max-w-[100px] text-slate-300 font-medium">{item.seller?.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>★ {item.seller?.rating || 5.0}</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to={`/marketplace/${item.id}`}
                    className="flex items-center justify-center px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
                  >
                    Xem Chi Tiết
                  </Link>
                  <Link
                    to={`/marketplace/${item.id}?action=offer`}
                    className="flex items-center justify-center px-3 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-extrabold text-xs hover:brightness-110 transition-all cursor-pointer"
                  >
                    Trả Giá
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Sell Your Cue */}
      <SellCueModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        onSuccess={fetchMarketplaceItems}
        currentUser={currentUser}
      />
    </div>
  );
}
