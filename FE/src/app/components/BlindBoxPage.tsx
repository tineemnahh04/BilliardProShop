import { useState, useEffect } from "react";
import { Link } from "react-router";
import { 
  Gift, 
  Sparkles, 
  Trophy, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  ShoppingCart, 
  RotateCcw, 
  Flame, 
  CreditCard, 
  QrCode, 
  ShieldCheck, 
  HelpCircle,
  Star,
  ChevronRight,
  Truck,
  Package,
  MapPin,
  Phone,
  User,
  X,
  Briefcase
} from "lucide-react";

interface BlindBoxPageProps {
  addToCart: (item: any) => void;
  currentUser?: any;
}

// Jackpot Cues ($1,000 value - 10% Chance)
const JACKPOT_ITEMS = [
  {
    id: "blind_jackpot_1",
    name: "Predator Dragon Limited Edition 2026 Pro",
    brand: "Predator",
    price: 1000,
    originalValue: 1200,
    image: "https://images.unsplash.com/photo-1599685315659-bc876da49fe5?w=600&h=600&fit=crop",
    rarity: "SUPER RARE (10% DROP)",
    tier: "jackpot",
    description: "Cơ bida siêu phẩm giới hạn sản xuất 50 cây trên toàn cầu. Khảm rồng vàng 24K đỉnh cao thi đấu chuyên nghiệp."
  },
  {
    id: "blind_jackpot_2",
    name: "Mezz Exceed Gold Wave Custom Limited",
    brand: "Mezz",
    price: 1000,
    originalValue: 1150,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&h=600&fit=crop",
    rarity: "SUPER RARE (10% DROP)",
    tier: "jackpot",
    description: "Tuyệt tác ngọn carbon công nghệ Wavy Joint thế hệ mới. Đem lại độ chuẩn xác tuyệt đối trong từng cú chạm bóng."
  }
];

// Standard High-Tier Cues ($450 - $650 value - 90% Chance)
const STANDARD_ITEMS = [
  {
    id: "blind_std_1",
    name: "Fury Professional Carom Cue C-08 Gold Edition",
    brand: "Fury",
    price: 550,
    originalValue: 650,
    image: "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=600&h=600&fit=crop",
    rarity: "HIGH TIER",
    tier: "standard",
    description: "Dòng cơ Libre & Carom cao cấp truyền lực vượt trội, cẩn xà cừ tinh tế."
  },
  {
    id: "blind_std_2",
    name: "Cuetec Carbon Synergy Shaft Pool Cue",
    brand: "Cuetec",
    price: 600,
    originalValue: 680,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&h=600&fit=crop",
    rarity: "HIGH TIER",
    tier: "standard",
    description: "Ngọn Carbon Synergy giảm bạt bóng tối đa, cán bọc da bò dập nổi sang trọng."
  },
  {
    id: "blind_std_3",
    name: "JFlowers Carbon Energy Custom Cue",
    brand: "JFlowers",
    price: 520,
    originalValue: 600,
    image: "https://images.unsplash.com/photo-1599685315659-bc876da49fe5?w=600&h=600&fit=crop",
    rarity: "HIGH TIER",
    tier: "standard",
    description: "Thiết kế họa tiết hoa văn phong cách Hoàng Gia, tích hợp đầu tẩy Kamui Black."
  },
  {
    id: "blind_std_4",
    name: "Pechauer Special Edition Pool Cue",
    brand: "Pechauer",
    price: 490,
    originalValue: 580,
    image: "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=600&h=600&fit=crop",
    rarity: "HIGH TIER",
    tier: "standard",
    description: "Gỗ Phong Canada tuyển chọn phơi sấy 5 năm, điểm cân bằng vàng phản hồi chuẩn xác."
  }
];

export function BlindBoxPage({ addToCart, currentUser }: BlindBoxPageProps) {
  const [gameState, setGameState] = useState<"idle" | "paying" | "unboxing" | "revealed">("idle");
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "banking" | "card">("momo");
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [wonItem, setWonItem] = useState<any>(null);
  const [isJackpot, setIsJackpot] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [history, setHistory] = useState<any[]>([]);
  
  // Direct Home Delivery Claim Modal
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [claimStatus, setClaimStatus] = useState<string | null>(null);
  const [shippingForm, setShippingForm] = useState({
    name: currentUser?.name || "Marcus Chen",
    phone: currentUser?.phone || "+84 912 345 678",
    address: "123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh",
    note: "Giao hàng bọc chống xóc bảo vệ ngọn cơ"
  });

  // Format currency
  const formatVND = (usd: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(usd * 25000);
  };

  // Start payment process
  const handleOpenPayment = () => {
    setGameState("paying");
  };

  // Confirm payment and trigger 3D unboxing animation
  const handleConfirmPayment = () => {
    setIsProcessingPay(true);
    setTimeout(() => {
      setIsProcessingPay(false);
      // Start unboxing countdown animation
      setGameState("unboxing");
      setCountdown(3);
    }, 1200);
  };

  // Unboxing countdown & RNG calculation
  useEffect(() => {
    let timer: any;
    if (gameState === "unboxing") {
      if (countdown > 1) {
        timer = setTimeout(() => {
          setCountdown((prev) => prev - 1);
        }, 1000);
      } else {
        timer = setTimeout(() => {
          // 10% Chance for Jackpot $1,000 item
          const rng = Math.random();
          const hitJackpot = rng < 0.10; // 10% probability
          setIsJackpot(hitJackpot);

          let prize: any;
          if (hitJackpot) {
            prize = JACKPOT_ITEMS[Math.floor(Math.random() * JACKPOT_ITEMS.length)];
          } else {
            prize = STANDARD_ITEMS[Math.floor(Math.random() * STANDARD_ITEMS.length)];
          }

          setWonItem(prize);
          setHistory((prev) => [{ item: prize, isJackpot: hitJackpot, time: new Date().toLocaleTimeString("vi-VN") }, ...prev]);
          setGameState("revealed");
          setClaimStatus(null);
        }, 1000);
      }
    }
    return () => clearTimeout(timer);
  }, [gameState, countdown]);

  // Method 1: Direct Add to cart ($0 cost since user paid $500 for Blind Box)
  const handleAddToCart = () => {
    if (wonItem) {
      const pmLabel = paymentMethod === "momo" 
        ? "Ví điện tử MoMo" 
        : paymentMethod === "banking" 
        ? "Chuyển khoản Ngân hàng" 
        : "Thẻ ATM / Visa";

      localStorage.setItem("blindBoxPaymentMethod", paymentMethod);
      localStorage.setItem("blindBoxPaymentLabel", pmLabel);

      addToCart({
        id: wonItem.id,
        name: `🎁 [Phần Thưởng Túi Mù] ${wonItem.name}`,
        brand: wonItem.brand,
        price: 0, // $0 since already paid $500 for Blind Box
        image: wonItem.image,
        quantity: 1,
        variant: `Đã thanh toán $500 qua ${pmLabel}`
      });
      setClaimStatus("cart");
    }
  };

  // Method 2: Submit Direct Home Delivery Form ($0 Order)
  const handleConfirmShipping = (e: React.FormEvent) => {
    e.preventDefault();
    setShowShippingModal(false);
    setClaimStatus("shipping");
  };

  const handlePlayAgain = () => {
    setWonItem(null);
    setIsJackpot(false);
    setGameState("idle");
    setClaimStatus(null);
    setShowShippingModal(false);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 text-xs font-bold tracking-wider uppercase mb-3 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
          <Flame className="w-4 h-4 text-yellow-400 animate-bounce" />
          SỰ KIỆN ĐẶC BIỆT 2026 · TÚI MÙ HOÀNG GIA
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-display">
          Mở Túi Mù Bida <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500">$500</span>
        </h1>

        <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-light leading-relaxed">
          Chỉ với <strong className="text-yellow-400 font-bold">$500 (12.500.000đ)</strong>, bạn chắc chắn sở hữu 1 cây cơ cao cấp chính hãng. 
          Đặc biệt cơ hội <strong className="text-amber-300 font-bold">NỔ HŨ 10%</strong> trúng Siêu Phẩm Cây Cơ Trị Giá <strong className="text-yellow-400 font-extrabold">$1,000 (25.000.000đ)</strong>!
        </p>
      </div>

      {/* Main Interactive Stage */}
      <div className="bg-slate-900/90 border-2 border-yellow-500/30 rounded-3xl p-6 sm:p-10 shadow-[0_0_50px_rgba(212,175,55,0.15)] backdrop-blur-xl relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* ── STATE 1: IDLE / SHOWCASE ── */}
        {gameState === "idle" && (
          <div className="flex flex-col items-center text-center space-y-8 relative z-10 py-6">
            {/* Animated 3D Mystery Box Display */}
            <div className="relative group cursor-pointer" onClick={handleOpenPayment}>
              {/* Outer Golden Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 rounded-3xl blur-2xl opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse" />
              
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-yellow-400/60 p-6 flex flex-col items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-1">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30 mb-4 transform group-hover:rotate-6 transition-transform">
                  <Gift className="w-14 h-14 sm:w-16 sm:h-16 text-slate-950 animate-pulse" />
                </div>
                
                <div className="space-y-1 text-center">
                  <span className="px-3 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-xs font-bold uppercase tracking-widest">
                    MYSTERY CUE BOX
                  </span>
                  <h3 className="text-xl font-bold text-white">Túi Mù Bida Cao Cấp</h3>
                  <div className="text-2xl font-extrabold text-yellow-400 font-mono">$500.00</div>
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="space-y-3 max-w-md w-full">
              <button
                onClick={handleOpenPayment}
                className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 text-slate-950 font-extrabold text-lg sm:text-xl shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:brightness-110 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-3"
              >
                <Sparkles className="w-6 h-6 text-slate-950 animate-spin" /> Mua & Mở Túi Mù ($500)
              </button>
              <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Cam kết 100% nhận cơ chính hãng trị giá từ $500 - $1,000!
              </p>
            </div>

            {/* Prize Pool Transparency Showcase */}
            <div className="w-full pt-8 border-t border-slate-800/80">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6 flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" /> Danh Mục Phần Thưởng Trong Túi Mù
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {/* 10% Jackpot Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-slate-900 border-2 border-yellow-500/40 relative overflow-hidden group">
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-extrabold text-[10px] tracking-wider uppercase animate-pulse shadow-md">
                    👑 NỔ HŨ 10% ($1,000)
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <img src={JACKPOT_ITEMS[0].image} alt="Jackpot Cue" className="w-20 h-20 rounded-xl object-cover border border-yellow-500/30 group-hover:scale-105 transition-transform" />
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="text-xs font-bold text-yellow-400">GIẢI ĐẶC BIỆT (TỈ LỆ 10%)</div>
                      <h4 className="text-sm font-bold text-white truncate">{JACKPOT_ITEMS[0].name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-yellow-400 font-mono">$1,000.00</span>
                        <span className="text-xs text-slate-500 line-through font-mono">$1,200.00</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 90% High Tier Card */}
                <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 relative overflow-hidden group">
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-700 text-slate-300 font-bold text-[10px] tracking-wider uppercase">
                    💎 GIẢI CAO CẤP 90% ($500 - $650)
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <img src={STANDARD_ITEMS[0].image} alt="Standard Cue" className="w-20 h-20 rounded-xl object-cover border border-slate-700 group-hover:scale-105 transition-transform" />
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-400">GÂY BIDA CAO CẤP HÃNG FURY/CUETEC</div>
                      <h4 className="text-sm font-bold text-white truncate">{STANDARD_ITEMS[0].name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-emerald-400 font-mono">$550.00 - $650.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STATE 2: PAYMENT MODAL ── */}
        {gameState === "paying" && (
          <div className="max-w-lg mx-auto py-4 space-y-6 relative z-10">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold uppercase">
                BƯỚC 1 / 2: THANH TOÁN $500
              </span>
              <h2 className="text-2xl font-bold text-white">Xác Nhận Mua Túi Mù Bida</h2>
              <p className="text-xs text-slate-400">Chọn phương thức thanh toán $500 để kích hoạt lượt mở quà tức thì</p>
            </div>

            {/* Price Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-yellow-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">1x Túi Mù Bida Hoàng Gia</div>
                  <div className="text-xs text-yellow-400">Cơ hội trúng Cây Cơ $1,000 (Tỉ lệ 10%)</div>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-lg font-bold text-yellow-400">$500.00</div>
                <div className="text-[10px] text-slate-400">{formatVND(500)}</div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Phương thức thanh toán
              </label>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "momo", label: "Ví MoMo QR", icon: QrCode },
                  { id: "banking", label: "Chuyển Khoản", icon: Zap },
                  { id: "card", label: "Thẻ ATM/Visa", icon: CreditCard }
                ].map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === pm.id
                        ? "bg-yellow-500/10 border-yellow-400 text-yellow-400 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                        : "bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <pm.icon className="w-5 h-5" />
                    <span className="text-xs font-semibold">{pm.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setGameState("idle")}
                className="px-5 py-3 rounded-xl border border-slate-700 text-slate-300 font-semibold text-sm hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Hủy
              </button>

              <button
                onClick={handleConfirmPayment}
                disabled={isProcessingPay}
                className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-extrabold text-base hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessingPay ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Đang xác nhận thanh toán $500...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" /> Xác Nhận Thanh Toán $500 & Mở Hộp
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STATE 3: SPECTACULAR 3D UNBOXING ANIMATION ── */}
        {gameState === "unboxing" && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-8 relative z-10">
            {/* Spinning & Pulsing Ray Atmosphere */}
            <div className="relative flex items-center justify-center">
              {/* Spinning Light Beams */}
              <div className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-r from-yellow-400/30 via-amber-500/20 to-yellow-300/30 blur-2xl animate-spin" />
              
              {/* Violent Shaking Mystery Box */}
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-gradient-to-b from-yellow-400 via-amber-500 to-yellow-600 p-6 flex flex-col items-center justify-center shadow-[0_0_60px_rgba(250,204,21,0.8)] border-4 border-white animate-bounce">
                <Gift className="w-24 h-24 text-slate-950 animate-pulse" />
                <div className="absolute -top-3 px-3 py-1 rounded-full bg-slate-950 border border-yellow-400 text-yellow-400 text-[10px] font-black tracking-widest uppercase">
                  UNBOXING...
                </div>
              </div>
            </div>

            {/* Suspense Countdown Feedback */}
            <div className="space-y-3">
              <div className="text-5xl font-black text-yellow-400 font-mono tracking-widest animate-ping">
                {countdown}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                ⚡ Đang Khai Mở Túi Mù Bida...
              </h2>

              <p className="text-sm text-yellow-400 font-mono font-medium animate-pulse max-w-md mx-auto">
                {countdown === 3 && "🔮 Đang khởi tạo ma trận phần thưởng ngẫu nhiên..."}
                {countdown === 2 && "✨ Đang quét tỉ lệ NỔ HŨ 10% Cây Cơ $1,000..."}
                {countdown === 1 && "⚡ Hộp quà đang phát nổ hào quang giải thưởng!"}
              </p>
            </div>
          </div>
        )}

        {/* ── STATE 4: REVEAL RESULT & DIRECT CLAIM ── */}
        {gameState === "revealed" && wonItem && (
          <div className="space-y-8 relative z-10 py-4 animate-fade-in">
            {/* Banner Winner Header */}
            {isJackpot ? (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 text-slate-950 text-center space-y-1 shadow-[0_0_30px_rgba(212,175,55,0.6)] animate-pulse">
                <div className="inline-flex items-center gap-1.5 font-black text-xs uppercase tracking-widest bg-slate-950 text-yellow-400 px-3 py-1 rounded-full">
                  <Trophy className="w-4 h-4 text-yellow-400" /> SIÊU PHẨM NỔ HŨ JACKPOT 10%!
                </div>
                <h2 className="text-2xl sm:text-3xl font-black">
                  🎉 CHÚC MỪNG! BẠN ĐÃ TRÚNG CÂY CƠ THÁNH GIÓNG TRỊ GIÁ $1,000!
                </h2>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-yellow-500/30 text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-widest text-emerald-400">
                  <CheckCircle className="w-4 h-4" /> MỞ TÚI MÙ THÀNH CÔNG
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  ✨ CHÚC MỪNG! BẠN ĐÃ MỞ ĐƯỢC CÂY CƠ CAO CẤP!
                </h2>
              </div>
            )}

            {/* Revealed Item Card */}
            <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-800/60 border-2 border-yellow-500/40 flex flex-col md:flex-row items-center gap-6 shadow-2xl relative overflow-hidden">
              <img 
                src={wonItem.image} 
                alt={wonItem.name} 
                className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl object-cover border-2 border-yellow-400/50 shadow-xl" 
              />

              <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-yellow-400/20 text-yellow-400 border border-yellow-400/30">
                  {wonItem.rarity}
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {wonItem.name}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  {wonItem.description}
                </p>

                <div className="flex items-center justify-center md:justify-start gap-3 pt-1">
                  <div className="text-2xl font-extrabold text-yellow-400 font-mono">
                    ${wonItem.price}.00
                  </div>
                  <div className="text-sm text-slate-500 line-through font-mono">
                    ${wonItem.originalValue}.00
                  </div>
                </div>
              </div>
            </div>

            {/* 🎁 CLAIM STATUS NOTIFICATION BADGES */}
            {claimStatus === "shipping" && (
              <div className="max-w-lg mx-auto p-5 rounded-2xl border text-center animate-fade-in shadow-xl bg-emerald-500/10 border-emerald-500/40 text-emerald-400 space-y-2">
                <div className="font-extrabold flex items-center justify-center gap-2 text-base">
                  <Truck className="w-6 h-6 text-emerald-400 animate-bounce" /> ĐÃ TẠO ĐƠN GIAO HÀNG TẬN NHÀ THÀNH CÔNG!
                </div>
                <p className="text-xs text-slate-300">
                  Mã vận đơn: <strong className="text-yellow-400 font-mono">#PRO-SHIP-9982</strong>. Cây cơ <strong className="text-white">{wonItem.name}</strong> đang được đóng gói và giao đến tận nơi cho bạn!
                </p>
              </div>
            )}

            {claimStatus === "cart" && (
              <div className="max-w-lg mx-auto p-6 rounded-2xl border text-center animate-fade-in shadow-xl bg-yellow-500/10 border-yellow-500/40 text-yellow-400 space-y-3">
                <div className="font-extrabold flex items-center justify-center gap-2 text-base">
                  <ShoppingCart className="w-6 h-6 text-yellow-400 animate-bounce" /> ĐÃ THÊM PHẦN THƯỞNG VÀO GIỎ HÀNG ($0đ)!
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cây cơ đã được thêm vào giỏ hàng chung của bạn với giá <strong className="text-emerald-400">$0.00</strong> và <strong className="text-yellow-400">Freeship 100%</strong>.
                </p>
                <div className="pt-2 flex items-center justify-center">
                  <Link
                    to="/cart"
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 text-slate-950 font-black text-sm shadow-lg shadow-yellow-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4 text-slate-950" /> 🚀 Xem Giỏ Hàng Ngay →
                  </Link>
                </div>
              </div>
            )}

            {/* 🎁 REVEALED PRIMARY ACTIONS */}
            <div className="max-w-lg mx-auto space-y-4 pt-2">
              {!claimStatus && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Action 1: Direct 1-Click Home Delivery (Separate from cart) */}
                  <button
                    onClick={() => setShowShippingModal(true)}
                    className="py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Truck className="w-5 h-5 text-slate-950" /> 🚀 Giao Tận Nhà Ngay ($0đ)
                  </button>

                  {/* Action 2: Add to general cart */}
                  <button
                    onClick={handleAddToCart}
                    className="py-4 px-6 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-yellow-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingCart className="w-5 h-5 text-slate-950" /> Thêm Vào Giỏ Hàng ($0đ)
                  </button>
                </div>
              )}

              {/* Play Again Button */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={handlePlayAgain}
                  className="py-3 px-6 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white font-bold text-xs hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-yellow-400" /> Mở Tiếp Túi Mù Khác ($500)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🚚 DIRECT HOME DELIVERY FORM MODAL (Dedicated for won item - Separate from cart) */}
      {showShippingModal && wonItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border-2 border-yellow-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowShippingModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400/20 border border-emerald-400/40 mx-auto flex items-center justify-center">
                <Truck className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Giao Phần Thưởng Tận Nhà ($0đ)</h3>
              <p className="text-xs text-slate-400">
                Nhập địa chỉ giao hàng riêng cho cây cơ: <strong className="text-yellow-400">{wonItem.name}</strong>
              </p>
            </div>

            <form onSubmit={handleConfirmShipping} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-yellow-400" /> Họ & Tên người nhận
                </label>
                <input
                  type="text"
                  required
                  value={shippingForm.name}
                  onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-yellow-400" /> Số điện thoại liên hệ
                </label>
                <input
                  type="text"
                  required
                  value={shippingForm.phone}
                  onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-yellow-400" /> Địa chỉ giao hàng tận nhà
                </label>
                <textarea
                  required
                  rows={2}
                  value={shippingForm.address}
                  onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm outline-none focus:border-yellow-400"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowShippingModal(false)}
                  className="px-5 py-3 rounded-xl border border-slate-700 text-slate-300 font-semibold text-sm hover:bg-slate-800 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-extrabold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                >
                  Xác Nhận Đặt Đơn Giao $0đ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Log */}
      {history.length > 0 && (
        <div className="mt-10 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-yellow-400" /> Lịch Sử Lượt Mở Túi Mù Gần Đây
          </h3>

          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 text-xs">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${h.isJackpot ? "bg-yellow-400 text-slate-950" : "bg-slate-700 text-slate-300"}`}>
                    {h.isJackpot ? "👑 NỔ HŨ $1,000" : "💎 CAO CẤP"}
                  </span>
                  <span className="font-semibold text-white">{h.item.name}</span>
                </div>
                <div className="text-slate-400 font-mono">{h.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
