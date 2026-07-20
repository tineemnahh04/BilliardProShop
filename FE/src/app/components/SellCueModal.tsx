import { useState } from "react";
import { X, Upload, Plus, Trash2, Tag, DollarSign, MapPin, Phone, Star, Sparkles, AlertCircle } from "lucide-react";

interface SellCueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: any;
}

export function SellCueModal({ isOpen, onClose, onSuccess, currentUser }: SellCueModalProps) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [conditionStars, setConditionStars] = useState(5);
  const [conditionLabel, setConditionLabel] = useState("Like New (99%)");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Hồ Chí Minh");
  const [phone, setPhone] = useState(currentUser?.phone || "0908123456");
  const [sellerName, setSellerName] = useState(currentUser?.name || "Cơ thủ bida");
  const [listingType, setListingType] = useState<"sale" | "auction" | "trade">("sale");

  // Additional options
  const [targetCue, setTargetCue] = useState("");
  const [cashOffset, setCashOffset] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [auctionDays, setAuctionDays] = useState(3);

  // Images state (up to 5)
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1599685315659-bc876da49fe5?w=600&h=600&fit=crop"
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    if (images.length >= 5) {
      alert("Tối đa 5 hình ảnh cho mỗi bài đăng!");
      return;
    }
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    if (images.length <= 1) {
      alert("Cần ít nhất 1 hình ảnh mô tả!");
      return;
    }
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || !location.trim() || !phone.trim()) {
      setError("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          price: Number(price),
          conditionStars,
          conditionLabel,
          description,
          location,
          phone,
          sellerName,
          listingType,
          images,
          targetCue,
          cashOffset: cashOffset ? Number(cashOffset) : 0,
          startingBid: startingBid ? Number(startingBid) : Number(price),
          auctionDays
        })
      });

      if (!response.ok) {
        throw new Error("Lỗi khi tạo bài đăng mua bán.");
      }

      alert("🎉 Đăng tin bán cơ lên Marketplace thành công!");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-yellow-500/30 rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl relative">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Sell Your Cue</h3>
              <p className="text-xs text-slate-400">Đăng bài bán hoặc trao đổi cơ bida lên Marketplace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Tên cây cơ <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Mezz EC9-W1 ngọn WX700"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-yellow-400"
              required
            />
          </div>

          {/* 2. Listing Type Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Hình thức giao dịch
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: "sale", label: "Bán Thường (Sale)" },
                { type: "auction", label: "Đấu Giá (Auction)" },
                { type: "trade", label: "Trao Đổi (Trade)" }
              ].map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setListingType(t.type as any)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    listingType === t.type
                      ? "border-yellow-400 bg-yellow-500/10 text-yellow-400"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Images (Up to 5) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Hình ảnh thực tế (Tối đa 5 ảnh) <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative group aspect-square rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
                  <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Xóa ảnh"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            {images.length < 5 && (
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Dán đường dẫn ảnh (URL image)..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-yellow-400"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-yellow-400 font-bold text-xs hover:bg-slate-700 transition-colors"
                >
                  + Thêm Ảnh
                </button>
              </div>
            )}
          </div>

          {/* 4. Price & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Giá mong muốn (VNĐ) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                placeholder="7500000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-yellow-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Tình trạng
              </label>
              <select
                value={conditionStars}
                onChange={(e) => {
                  const s = Number(e.target.value);
                  setConditionStars(s);
                  if (s === 5) setConditionLabel("Như Mới (99%)");
                  else if (s === 4) setConditionLabel("Tốt (90%)");
                  else setConditionLabel("Trung Bình (80%)");
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-yellow-400"
              >
                <option value={5}>★★★★★ Như Mới (99%)</option>
                <option value={4}>★★★★☆ Tốt (90%)</option>
                <option value={3}>★★★☆☆ Trung Bình (80%)</option>
              </select>
            </div>
          </div>

          {/* Auction extra options */}
          {listingType === "auction" && (
            <div className="p-4 bg-slate-950/60 border border-yellow-500/20 rounded-xl space-y-4">
              <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Tùy chọn Đấu giá (Auction)</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Giá khởi điểm (VNĐ)</label>
                  <input
                    type="number"
                    placeholder={price || "4500000"}
                    value={startingBid}
                    onChange={(e) => setStartingBid(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 text-white text-xs rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Thời gian đấu giá</label>
                  <select
                    value={auctionDays}
                    onChange={(e) => setAuctionDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 text-white text-xs rounded-lg"
                  >
                    <option value={1}>1 Ngày</option>
                    <option value={3}>3 Ngày</option>
                    <option value={5}>5 Ngày</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Trade extra options */}
          {listingType === "trade" && (
            <div className="p-4 bg-slate-950/60 border border-yellow-500/20 rounded-xl space-y-4">
              <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Tùy chọn Trao đổi (Trade)</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Dòng cơ muốn đổi lấy</label>
                  <input
                    type="text"
                    placeholder="Predator Aspire hoặc tương đương"
                    value={targetCue}
                    onChange={(e) => setTargetCue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 text-white text-xs rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Số tiền muốn bù thêm (+/- VNĐ)</label>
                  <input
                    type="number"
                    placeholder="500000"
                    value={cashOffset}
                    onChange={(e) => setCashOffset(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 text-white text-xs rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Mô tả chi tiết
            </label>
            <textarea
              rows={3}
              placeholder="Used 6 months, no scratches, original tip..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-yellow-400"
            />
          </div>

          {/* 6. Location & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Khu vực / Tỉnh thành <span className="text-red-400">*</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-yellow-400"
              >
                <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Bình Dương">Bình Dương</option>
                <option value="Cần Thơ">Cần Thơ</option>
                <option value="Hải Phòng">Hải Phòng</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Số điện thoại liên hệ <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="0908123456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-yellow-400"
                required
              />
            </div>
          </div>

          {/* Footer Submit Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-yellow-500/10"
            >
              {submitting ? "Đang xử lý..." : "🚀 Đăng Bán Cơ Ngay"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
