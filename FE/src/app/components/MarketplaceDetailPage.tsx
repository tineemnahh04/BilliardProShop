import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router";
import { 
  Star, MapPin, Phone, MessageSquare, Tag, ShieldCheck, 
  ArrowLeft, CheckCircle2, XCircle, DollarSign, Clock, RefreshCw, Send, ThumbsUp, Sparkles, AlertCircle, Trash2
} from "lucide-react";

interface MarketplaceDetailPageProps {
  currentUser: any;
}

export function MarketplaceDetailPage({ currentUser }: MarketplaceDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gallery main image
  const [selectedImage, setSelectedImage] = useState<string>("");

  // Action Modals State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerNote, setOfferNote] = useState("");

  const [showTradeModal, setShowTradeModal] = useState(false);
  const [offeredCue, setOfferedCue] = useState("");
  const [tradeCashOffset, setTradeCashOffset] = useState("");
  const [tradeNote, setTradeNote] = useState("");

  const [showBidModal, setShowBidModal] = useState(false);
  const [bidAmount, setBidAmount] = useState("");

  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chats, setChats] = useState<Array<{ id: string; senderId: string; senderName: string; senderRole: string; text: string; createdAt: string }>>([]);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Counter offer state for Seller
  const [counteringOfferId, setCounteringOfferId] = useState<string | null>(null);
  const [counterAmountInput, setCounterAmountInput] = useState("");

  const fetchItemDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/marketplace/${id}`);
      if (!response.ok) throw new Error("Không tìm thấy bài đăng mua bán.");
      const data = await response.json();
      setItem(data);
      if (data.chats) setChats(data.chats);
      if (data.images && data.images.length > 0) {
        setSelectedImage(data.images[0]);
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  const fetchChats = async () => {
    try {
      const response = await fetch(`/api/marketplace/${id}/chat`);
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchItemDetail();
  }, [id]);

  useEffect(() => {
    if (searchParams.get("action") === "offer") {
      setShowOfferModal(true);
    }
  }, [searchParams]);

  // Submit Make Offer
  const handleMakeOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerAmount || Number(offerAmount) <= 0) return;

    try {
      const response = await fetch(`/api/marketplace/${id}/offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: currentUser?.name || "Khách Mua Bida",
          buyerPhone: currentUser?.phone || "0912345678",
          offerAmount: Number(offerAmount),
          note: offerNote
        })
      });

      if (!response.ok) throw new Error("Lỗi khi gửi Make Offer.");
      alert("🎉 Đã gửi Make Offer thành công cho người bán!");
      setShowOfferModal(false);
      fetchItemDetail();
    } catch (err: any) {
      alert(err.message || "Lỗi gửi lời trả giá.");
    }
  };

  // Submit Trade Proposal
  const handleProposeTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offeredCue.trim()) return;

    try {
      const response = await fetch(`/api/marketplace/${id}/trade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: currentUser?.name || "Khách Mua Bida",
          offeredCue,
          cashOffset: Number(tradeCashOffset) || 0,
          note: tradeNote
        })
      });

      if (!response.ok) throw new Error("Lỗi khi gửi đề xuất đổi cơ.");
      alert("🤝 Đã gửi đề xuất trao đổi cơ thành công!");
      setShowTradeModal(false);
      fetchItemDetail();
    } catch (err: any) {
      alert(err.message || "Lỗi gửi đề xuất đổi cơ.");
    }
  };

  // Submit Place Bid
  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidAmount) return;

    try {
      const response = await fetch(`/api/marketplace/${id}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bidderName: currentUser?.name || "Cơ thủ Đấu giá",
          amount: Number(bidAmount)
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Lỗi đặt giá đấu giá.");
      }

      alert("⚡ Đã đặt giá thành công!");
      setShowBidModal(false);
      fetchItemDetail();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Seller Respond Offer
  const handleRespondOffer = async (offerId: string, action: "accept" | "reject" | "counter") => {
    try {
      const response = await fetch(`/api/marketplace/${id}/offer/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          counterAmount: action === "counter" ? Number(counterAmountInput) : 0
        })
      });

      if (!response.ok) throw new Error("Lỗi khi phản hồi trả giá.");
      alert("Đã cập nhật phản hồi offer thành công!");
      setCounteringOfferId(null);
      fetchItemDetail();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Send Chat message
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const currentUserId = currentUser?.userId || currentUser?.id || "user_guest";
    const currentName = currentUser?.name || "Khách Hàng";
    const isSeller = item?.seller?.userId === currentUserId || currentUser?.role === "seller";

    try {
      const response = await fetch(`/api/marketplace/${id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentUserId,
          senderName: currentName,
          senderRole: isSeller ? "seller" : "buyer",
          text: chatMessage.trim()
        })
      });

      if (!response.ok) throw new Error("Không thể gửi tin nhắn.");

      const data = await response.json();
      setChats(data.chats);
      setChatMessage("");
    } catch (err: any) {
      alert(err.message || "Lỗi kết nối khi chat.");
    }
  };

  // Recall Chat message
  const handleRecallChat = async (msgId: string) => {
    try {
      const response = await fetch(`/api/marketplace/${id}/chat/${msgId}/recall`, {
        method: "PATCH"
      });
      if (!response.ok) throw new Error("Không thể thu hồi tin nhắn.");
      const data = await response.json();
      setChats(data.chats);
    } catch (err: any) {
      alert(err.message || "Lỗi khi thu hồi tin nhắn.");
    }
  };

  // Clear all Chat history (Start clean session)
  const handleClearChat = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sạch toàn bộ lịch sử chat để bắt đầu đoạn chat mới không?")) return;
    try {
      const response = await fetch(`/api/marketplace/${id}/chat`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Không thể xóa lịch sử chat.");
      setChats([]);
    } catch (err: any) {
      alert(err.message || "Lỗi khi xóa lịch sử chat.");
    }
  };

  // Submit Rating & Review
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/marketplace/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raterRole: "buyer",
          raterName: currentUser?.name || "Người Mua",
          rating: reviewRating,
          comment: reviewComment
        })
      });

      if (!response.ok) throw new Error("Lỗi khi gửi đánh giá.");
      alert("⭐ Cảm ơn bạn đã gửi đánh giá uy tín cho Seller!");
      setShowReviewModal(false);
      fetchItemDetail();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatPriceVND = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-400 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Đang tải thông tin Marketplace...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen py-20 px-4 text-center max-w-lg mx-auto space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Không tìm thấy sản phẩm Marketplace</h2>
        <p className="text-xs text-slate-400">{error || "Bài đăng có thể đã bị xóa hoặc hết hạn."}</p>
        <Link to="/marketplace" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white text-xs font-semibold rounded-xl">
          <ArrowLeft className="w-4 h-4" /> Quay lại Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Back button navigation */}
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-yellow-400 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
            <img src={selectedImage || item.images[0]} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 bg-yellow-400 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              {item.listingType === 'auction' ? '⚡ Đấu Giá' : item.listingType === 'trade' ? '🔄 Trao Đổi' : '🛒 Đang Bán'}
            </div>
          </div>

          {/* Thumbnails */}
          {item.images && item.images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {item.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border transition-all shrink-0 cursor-pointer ${
                    selectedImage === img ? "border-yellow-400 ring-2 ring-yellow-400/30" : "border-slate-800 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Listing Details & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-yellow-400 font-bold mb-1">
              <Star className="w-4 h-4 fill-yellow-400" />
              <span>Tình trạng: {item.condition?.label || "Like New"} ({item.condition?.stars || 5}★)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{item.title}</h1>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-3xl font-black text-yellow-400">{formatPriceVND(item.price)}</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {item.location}
              </span>
            </div>
          </div>

          {/* Seller Card */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center font-bold text-yellow-400 text-lg">
                {item.seller?.name ? item.seller.name[0] : "S"}
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{item.seller?.name || "Người Bán"}</h4>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>★ {item.seller?.rating || 5.0} / 5.0 ({item.seller?.totalReviews || 1} đánh giá)</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              + Đánh giá Seller
            </button>
          </div>

          {/* Description */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mô tả từ người bán</h4>
            <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{item.description}</p>
          </div>

          {/* Auction status box if applicable */}
          {item.listingType === 'auction' && item.auctionDetails && (
            <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Đang diễn ra đấu giá</span>
                <span>{item.auctionDetails.bidsCount || 0} lượt đặt giá</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Giá cao nhất hiện tại:</span>
                <span className="text-xl font-extrabold text-purple-300">
                  {formatPriceVND(item.auctionDetails.currentBid || item.price)}
                </span>
              </div>
            </div>
          )}

          {/* Trade status box if applicable */}
          {item.listingType === 'trade' && item.tradeDetails && (
            <div className="p-4 bg-blue-950/40 border border-blue-500/30 rounded-2xl space-y-2 text-xs">
              <div className="font-bold text-blue-300 uppercase">Thông tin trao đổi (Trade)</div>
              <p className="text-slate-300">Muốn đổi lấy: <strong>{item.tradeDetails.targetCue}</strong></p>
              <p className="text-slate-300">Bù thêm: <strong>{formatPriceVND(item.tradeDetails.cashOffset)}</strong></p>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="space-y-3 pt-2">
            {item.listingType === 'sale' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-extrabold text-sm hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-2"
                >
                  <Tag className="w-4 h-4" /> Trả Giá / Thương Lượng
                </button>
                <button
                  onClick={() => setShowChatModal(true)}
                  className="py-3.5 px-4 rounded-xl border border-slate-700 bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-yellow-400" /> Chat Trực Tiếp
                </button>
              </div>
            )}

            {item.listingType === 'trade' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowTradeModal(true)}
                  className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-extrabold text-sm hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Đề Xuất Trao Đổi Cơ
                </button>
                <button
                  onClick={() => setShowChatModal(true)}
                  className="py-3.5 px-4 rounded-xl border border-slate-700 bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-blue-400" /> Chat Thương Lượng
                </button>
              </div>
            )}

            {item.listingType === 'auction' && (
              <button
                onClick={() => setShowBidModal(true)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 text-white font-extrabold text-sm hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Đặt Giá Đấu Giá
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Offers & Proposals History / Seller Dashboard */}
      <div className="mt-12 pt-8 border-t border-slate-800 space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Tag className="w-5 h-5 text-yellow-400" /> Danh sách đề nghị Trả giá & Đổi cơ ({item.offers?.length || 0})
        </h3>

        {item.offers && item.offers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {item.offers.map((off: any) => (
              <div key={off.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{off.buyerName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    off.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' :
                    off.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    off.status === 'countered' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-slate-800 text-yellow-400'
                  }`}>
                    {off.status}
                  </span>
                </div>
                <div className="text-lg font-black text-yellow-400">
                  Trả giá: {formatPriceVND(off.offerAmount)}
                </div>
                {off.note && <p className="text-xs text-slate-400 italic">"{off.note}"</p>}

                {/* Seller Controls */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  {off.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleRespondOffer(off.id, 'accept')}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors"
                      >
                        ✔ Accept
                      </button>
                      <button
                        onClick={() => handleRespondOffer(off.id, 'reject')}
                        className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors"
                      >
                        ✖ Reject
                      </button>
                      <button
                        onClick={() => {
                          setCounteringOfferId(off.id);
                          setCounterAmountInput(String(off.offerAmount));
                        }}
                        className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition-colors"
                      >
                        💬 Giá Khác
                      </button>
                    </>
                  )}

                  {counteringOfferId === off.id && (
                    <div className="w-full space-y-2 pt-2">
                      <input
                        type="number"
                        placeholder="Mức giá đề xuất lại (VNĐ)"
                        value={counterAmountInput}
                        onChange={(e) => setCounterAmountInput(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 text-white text-xs rounded-lg"
                      />
                      <button
                        onClick={() => handleRespondOffer(off.id, 'counter')}
                        className="w-full py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg"
                      >
                        Gửi Đề Xuất Phản Hồi
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">Chưa có lượt trả giá nào cho bài đăng này.</p>
        )}
      </div>

      {/* MAKE OFFER MODAL */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-yellow-500/30 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-yellow-400" /> Trả Giá / Thương Lượng Giá
            </h3>
            <p className="text-xs text-slate-400">Giá niêm yết: <strong className="text-yellow-400">{formatPriceVND(item.price)}</strong></p>
            <form onSubmit={handleMakeOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mức giá bạn muốn trả (VNĐ)</label>
                <input
                  type="number"
                  placeholder="7000000"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-yellow-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Ghi chú gửi người bán</label>
                <textarea
                  rows={2}
                  placeholder="Bớt 500k mình lấy trong ngày nhé!"
                  value={offerNote}
                  onChange={(e) => setOfferNote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-yellow-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-yellow-400 text-slate-950 font-bold text-xs hover:bg-yellow-300"
                >
                  Gửi Mức Giá Trả
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROPOSE TRADE MODAL */}
      {showTradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-blue-500/30 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-400" /> Đề Xuất Trao Đổi Cơ Bida
            </h3>
            <form onSubmit={handleProposeTrade} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Cây cơ bạn có để trao đổi</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Predator Aspire 1-1 ngọn One"
                  value={offeredCue}
                  onChange={(e) => setOfferedCue(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-blue-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Số tiền bạn muốn bù thêm (VNĐ)</label>
                <input
                  type="number"
                  placeholder="500000"
                  value={tradeCashOffset}
                  onChange={(e) => setTradeCashOffset(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Ghi chú chi tiết</label>
                <textarea
                  rows={2}
                  placeholder="Cơ mới 95% ngọn bạt thấp..."
                  value={tradeNote}
                  onChange={(e) => setTradeNote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-blue-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTradeModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500"
                >
                  Gửi Đề Xuất Đổi Cơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PLACE BID MODAL */}
      {showBidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" /> Place Bid (Đặt Giá Đấu Giá)
            </h3>
            <p className="text-xs text-slate-400">
              Giá hiện tại: <strong className="text-purple-300">{formatPriceVND(item.auctionDetails?.currentBid || item.price)}</strong>
            </p>
            <form onSubmit={handlePlaceBid} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mức giá bạn muốn đặt (VNĐ)</label>
                <input
                  type="number"
                  placeholder={String((item.auctionDetails?.currentBid || item.price) + 200000)}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-purple-400"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBidModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500"
                >
                  ⚡ Đặt Giá Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHAT MODAL */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col h-[520px] shadow-2xl">
            {/* Chat Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center justify-center font-bold text-xs border border-yellow-500/30">
                  {item.seller?.name ? item.seller.name[0] : "S"}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    {item.seller?.name}
                    <span className="text-[10px] bg-slate-800 text-yellow-400 px-2 py-0.5 rounded font-mono">Seller</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium">
                    👤 Bạn đang chat dưới tên: <strong className="text-white">{currentUser?.name || "Khách Hàng"}</strong>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {chats.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearChat}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                    title="Xóa toàn bộ lịch sử chat để bắt đầu đoạn chat mới"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Làm mới Chat</span>
                  </button>
                )}
                <button onClick={() => setShowChatModal(false)} className="text-slate-400 hover:text-white cursor-pointer p-1">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/50">
              {chats.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  Chưa có tin nhắn nào. Đặt câu hỏi cho người bán để bắt đầu hội thoại!
                </div>
              ) : (
                chats.map((msg: any, i: number) => {
                  const isMe = msg.senderId === (currentUser?.userId || currentUser?.id || "user_guest") || msg.senderName === currentUser?.name;
                  return (
                    <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <span className="text-[10px] text-slate-400 mb-1 px-1">
                        {msg.senderName} ({msg.senderRole === "seller" ? "Người Bán" : "Người Mua"})
                      </span>
                      <div className={`relative group max-w-[80%] p-3 rounded-2xl text-xs shadow-md ${
                        msg.isRecalled
                          ? "bg-slate-800/60 text-slate-400 italic border border-slate-800"
                          : isMe 
                          ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-semibold rounded-tr-none" 
                          : "bg-slate-800 text-white border border-slate-700 rounded-tl-none"
                      }`}>
                        {msg.text}
                        <div className="flex items-center justify-between gap-3 text-[9px] opacity-70 mt-1 font-mono">
                          {isMe && !msg.isRecalled && (
                            <button
                              type="button"
                              onClick={() => handleRecallChat(msg.id)}
                              className="text-red-950 font-bold hover:underline cursor-pointer opacity-80 hover:opacity-100"
                            >
                              Thu hồi
                            </button>
                          )}
                          <span className="ml-auto">
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : "Vừa xong"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Nhập tin nhắn (Gửi & đổi tài khoản để phản hồi)..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 text-white text-xs rounded-xl outline-none focus:border-yellow-400"
              />
              <button type="submit" className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl font-bold text-xs cursor-pointer">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Đánh Giá Seller
            </h3>
            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Đánh giá mức độ hài lòng</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewRating(s)}
                      className="p-1"
                    >
                      <Star className={`w-7 h-7 ${s <= reviewRating ? "text-yellow-400 fill-yellow-400" : "text-slate-700"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nhận xét chi tiết</label>
                <textarea
                  rows={3}
                  placeholder="Người bán thân thiện, giao dịch nhanh chóng..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-yellow-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-yellow-400 text-slate-950 font-bold text-xs"
                >
                  Gửi Đánh Giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
