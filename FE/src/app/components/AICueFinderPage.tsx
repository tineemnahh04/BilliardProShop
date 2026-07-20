import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { 
  Sparkles, Target, Zap, DollarSign, Ruler, Award, 
  CheckCircle2, RotateCcw, ShoppingCart, Eye, ChevronRight,
  ShieldCheck, Flame, Cpu, CircleDot
} from "lucide-react";
import { CartItem } from "../App";

interface AICueFinderPageProps {
  addToCart: (item: CartItem) => void;
  wishlist: number[];
  toggleWishlist: (id: number) => void;
}

interface AIResult {
  recommendedCue: any;
  matchPercentage: number;
  reasons: string[];
  runnerUps: any[];
  advisorSpecs: {
    recommendedWeight: string;
    recommendedTipSize: string;
    shaftType: string;
  };
}

export function AICueFinderPage({ addToCart }: AICueFinderPageProps) {
  const navigate = useNavigate();

  // Form states
  const [step, setStep] = useState<number>(1);
  const [height, setHeight] = useState<string>("160_175");
  const [strokePower, setStrokePower] = useState<string>("medium");
  const [skillLevel, setSkillLevel] = useState<string>("beginner");
  const [gameType, setGameType] = useState<string>("pool");
  const [maxBudget, setMaxBudget] = useState<number>(6000000);

  // Status states
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStepText, setLoadingStepText] = useState<string>("Khởi tạo AI Cue Finder...");
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartAnalysis = async () => {
    setLoading(true);
    setError(null);

    const steps = [
      "Đang phân tích lực đánh & chiều cao người dùng...",
      "Đang kết nối kho cơ bida BilliardProShop...",
      "Đang tính toán góc bạt & độ bám ngọn cơ...",
      "Hoàn tất mô hình tư vấn cá nhân hóa!"
    ];

    for (let i = 0; i < steps.length; i++) {
      setLoadingStepText(steps[i]);
      await new Promise((res) => setTimeout(res, 500));
    }

    try {
      const response = await fetch("/api/products/ai-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height,
          strokePower,
          skillLevel,
          gameType,
          maxBudget
        })
      });

      if (!response.ok) {
        throw new Error("Không thể lấy dữ liệu tư vấn từ AI Server.");
      }

      const data = await response.json();
      setResult(data);
      setStep(6); // Result step
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra trong quá trình AI phân tích.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setResult(null);
    setError(null);
  };

  const formatPriceVND = (usdPrice: number) => {
    const vnd = Math.round(usdPrice * 25000);
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(vnd);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Top Banner Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-semibold tracking-wider uppercase mb-3">
          <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
          Tính năng AI Tư Vấn Độc Quyền
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-display">
          AI Cue Finder <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-200">Personalized</span>
        </h1>
        <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Không còn mất thời gian đắn đo! AI sẽ phân tích chiều cao, lực tay, phong cách đánh và ngân sách để tư vấn cây cơ hoàn hảo dành riêng cho bạn.
        </p>
      </div>

      {/* Main Card Container */}
      <div className="bg-slate-900/90 border border-yellow-500/20 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Decorative ambient background glows */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Loading overlay view */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-yellow-500/20 border-t-yellow-400 animate-spin" />
              <Cpu className="w-10 h-10 text-yellow-400 absolute animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-wide">AI đang phân tích dữ liệu...</h3>
              <p className="text-sm text-yellow-400/90 font-mono font-medium animate-pulse">
                {loadingStepText}
              </p>
            </div>
          </div>
        )}

        {/* Wizard Form View (Steps 1 to 5) */}
        {!loading && step <= 5 && (
          <div>
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
              {[
                { s: 1, label: "Chiều cao" },
                { s: 2, label: "Lực đánh" },
                { s: 3, label: "Trình độ" },
                { s: 4, label: "Thể loại" },
                { s: 5, label: "Ngân sách" }
              ].map((item) => (
                <button
                  key={item.s}
                  onClick={() => setStep(item.s)}
                  className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    step === item.s 
                      ? "text-yellow-400 border-b-2 border-yellow-400 pb-1" 
                      : step > item.s 
                      ? "text-green-400" 
                      : "text-slate-500"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step === item.s 
                      ? "bg-yellow-400 text-slate-950" 
                      : step > item.s 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-slate-800 text-slate-400"
                  }`}>
                    {item.s}
                  </span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </div>

            {/* STEP 1: Height */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400">
                    <Ruler className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">1. Chiều cao của bạn là bao nhiêu?</h2>
                    <p className="text-xs text-slate-400">Chiều cao ảnh hưởng trực tiếp đến chiều dài cơ & điểm cân bằng trọng lượng.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {[
                    { id: "under_160", title: "Dưới 160 cm", sub: "Khuyên dùng cơ 18.5 - 19oz, điểm cân bằng vừa phải" },
                    { id: "160_175", title: "160 cm - 175 cm", sub: "Khuyên dùng cơ chuẩn 19 - 19.5oz tiêu chuẩn" },
                    { id: "above_175", title: "Trên 175 cm", sub: "Khuyên dùng cơ 19.5 - 20oz, cán dài thoải mái" }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setHeight(opt.id)}
                      className={`p-5 rounded-xl border text-left transition-all cursor-pointer ${
                        height === opt.id
                          ? "border-yellow-400 bg-yellow-500/10 shadow-lg shadow-yellow-500/5 ring-1 ring-yellow-400"
                          : "border-slate-800 bg-slate-800/40 hover:border-slate-700 hover:bg-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-base">{opt.title}</span>
                        {height === opt.id && <CheckCircle2 className="w-5 h-5 text-yellow-400" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{opt.sub}</p>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-bold text-sm hover:brightness-110 transition-all cursor-pointer"
                  >
                    Tiếp theo <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Stroke Power */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">2. Lực đánh & Tốc độ ra cơ của bạn?</h2>
                    <p className="text-xs text-slate-400">Lực đánh quyết định độ nảy ngọn cơ & độ cứng tẩy phù hợp.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {[
                    { id: "light", title: "Lực Nhẹ", sub: "Thích điều bi mềm mại, kiểm soát góc tinh tế" },
                    { id: "medium", title: "Lực Vừa", sub: "Lực đánh trung bình, cân bằng giữa lực & xoáy" },
                    { id: "strong", title: "Lực Mạnh", sub: "Đánh áp phê sâu, cú đánh uy lực và dứt khoát" },
                    { id: "break", title: "Chuyên Phá bóng", sub: "Cần cây cơ ngọn cứng cáp tối đa trợ lực" }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setStrokePower(opt.id)}
                      className={`p-5 rounded-xl border text-left transition-all cursor-pointer ${
                        strokePower === opt.id
                          ? "border-yellow-400 bg-yellow-500/10 shadow-lg shadow-yellow-500/5 ring-1 ring-yellow-400"
                          : "border-slate-800 bg-slate-800/40 hover:border-slate-700 hover:bg-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-base">{opt.title}</span>
                        {strokePower === opt.id && <CheckCircle2 className="w-5 h-5 text-yellow-400" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{opt.sub}</p>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 font-medium text-sm hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-bold text-sm hover:brightness-110 transition-all cursor-pointer"
                  >
                    Tiếp theo <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Skill Level */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">3. Trình độ chơi bida của bạn?</h2>
                    <p className="text-xs text-slate-400">Giúp AI lựa chọn độ bạt ngọn cơ (low deflection) phù hợp nhất.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {[
                    { id: "beginner", title: "Mới chơi (Beginner)", sub: "Cần cơ trợ lực tốt, ngọn bạt thấp dễ bắt nhịp" },
                    { id: "intermediate", title: "Trung bình (Intermediate)", sub: "Đã quen ngắm góc, cần điều bi chính xác hơn" },
                    { id: "advanced", title: "Khá / Chuyên nghiệp", sub: "Cơ ngọn Carbon bạt cực thấp, phản hồi chuẩn xác" }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSkillLevel(opt.id)}
                      className={`p-5 rounded-xl border text-left transition-all cursor-pointer ${
                        skillLevel === opt.id
                          ? "border-yellow-400 bg-yellow-500/10 shadow-lg shadow-yellow-500/5 ring-1 ring-yellow-400"
                          : "border-slate-800 bg-slate-800/40 hover:border-slate-700 hover:bg-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-base">{opt.title}</span>
                        {skillLevel === opt.id && <CheckCircle2 className="w-5 h-5 text-yellow-400" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{opt.sub}</p>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 font-medium text-sm hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-bold text-sm hover:brightness-110 transition-all cursor-pointer"
                  >
                    Tiếp theo <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Game Type */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">4. Thể loại bida bạn hay chơi nhất?</h2>
                    <p className="text-xs text-slate-400">Mỗi thể loại bida đòi hỏi thiết kế ren, đầu cơ & ngọn khác biệt.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {[
                    { id: "pool", title: "🎱 Bida lỗ (Pool)", sub: "Cơ Pool tiêu chuẩn ngọn 11.8mm - 13mm" },
                    { id: "carom", title: "⚪ Bida phăng (Carom / 3C)", sub: "Cơ phăng nặng ngọn 11.5mm - 12mm gỗ/carbon" },
                    { id: "snooker", title: "🔴 Snooker", sub: "Cơ đầu nhỏ 9mm - 10mm ren gỗ truyền thống" },
                    { id: "break_jump", title: "⚡ Cơ Phá & Nhảy", sub: "Cơ lực phá cực mạnh & ngọn nhảy bốc bi" }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setGameType(opt.id)}
                      className={`p-5 rounded-xl border text-left transition-all cursor-pointer ${
                        gameType === opt.id
                          ? "border-yellow-400 bg-yellow-500/10 shadow-lg shadow-yellow-500/5 ring-1 ring-yellow-400"
                          : "border-slate-800 bg-slate-800/40 hover:border-slate-700 hover:bg-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-base">{opt.title}</span>
                        {gameType === opt.id && <CheckCircle2 className="w-5 h-5 text-yellow-400" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{opt.sub}</p>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 font-medium text-sm hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={() => setStep(5)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-bold text-sm hover:brightness-110 transition-all cursor-pointer"
                  >
                    Tiếp theo <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Budget */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">5. Ngân sách dự kiến của bạn?</h2>
                    <p className="text-xs text-slate-400">AI sẽ ưu tiên các dòng cơ tối ưu nhất trong tầm giá bạn chọn.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {[
                    { val: 3000000, label: "Dưới 3 triệu" },
                    { val: 6000000, label: "Dưới 6 triệu" },
                    { val: 12000000, label: "Dưới 12 triệu" },
                    { val: 25000000, label: "Trên 15 triệu" }
                  ].map((b) => (
                    <button
                      key={b.val}
                      type="button"
                      onClick={() => setMaxBudget(b.val)}
                      className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                        maxBudget === b.val
                          ? "border-yellow-400 bg-yellow-500/10 ring-1 ring-yellow-400 text-yellow-400 font-bold"
                          : "border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>

                {/* Slider input */}
                <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Hoặc tùy chỉnh ngân sách:</span>
                    <span className="text-yellow-400 font-bold text-sm">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(maxBudget)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1500000"
                    max="30000000"
                    step="500000"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="w-full accent-yellow-400 bg-slate-700 h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep(4)}
                    className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 font-medium text-sm hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleStartAnalysis}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-slate-950 font-extrabold text-sm shadow-xl shadow-yellow-500/20 hover:brightness-110 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-5 h-5" /> AI Phân Tích & Gợi Ý Cơ
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ERROR DISPLAY */}
        {error && (
          <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-center space-y-4">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700"
            >
              Thử lại từ đầu
            </button>
          </div>
        )}

        {/* RESULT VIEW (STEP 6) */}
        {!loading && result && (
          <div className="space-y-8 animate-fadeIn">
            {/* AI Recommendation Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs text-yellow-400 font-mono font-semibold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" /> AI Tư Vấn Cá Nhân Hóa
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  🎱 Cơ Bida Đề Xuất Phù Hợp Nhất
                </h2>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-2">
                <Flame className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 font-bold text-sm">
                  {result.matchPercentage}% Phù hợp nhất
                </span>
              </div>
            </div>

            {/* Featured Product Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-950/60 p-6 rounded-2xl border border-yellow-500/30">
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative group overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-2">
                  <img
                    src={result.recommendedCue.image}
                    alt={result.recommendedCue.name}
                    className="w-full max-w-[280px] h-auto object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-yellow-400 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {result.recommendedCue.brand}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white hover:text-yellow-400 transition-colors">
                    {result.recommendedCue.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-4">
                    <span className="text-2xl font-extrabold text-yellow-400">
                      {formatPriceVND(result.recommendedCue.price)}
                    </span>
                    <span className="text-xs text-slate-400">
                      (${result.recommendedCue.price})
                    </span>
                  </div>
                </div>

                {/* EXACT REQUIRED REASON BOX */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <CircleDot className="w-4 h-4 text-yellow-400" /> Lý do lựa chọn:
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300 font-medium">
                    {result.reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-emerald-400">
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Additional Spec Recommendations */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Trọng lượng</span>
                    <span className="text-xs font-bold text-white mt-0.5 block">{result.advisorSpecs.recommendedWeight}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Đầu tẩy</span>
                    <span className="text-xs font-bold text-white mt-0.5 block">{result.advisorSpecs.recommendedTipSize}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Loại ngọn</span>
                    <span className="text-xs font-bold text-white mt-0.5 block truncate">{result.advisorSpecs.shaftType}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => addToCart({
                      id: result.recommendedCue.id,
                      name: result.recommendedCue.name,
                      brand: result.recommendedCue.brand,
                      price: result.recommendedCue.price,
                      image: result.recommendedCue.image,
                      quantity: 1
                    })}
                    className="flex-1 min-w-[160px] flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-bold text-sm hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-yellow-500/10"
                  >
                    <ShoppingCart className="w-4 h-4" /> Thêm Vào Giỏ hàng
                  </button>

                  <Link
                    to={`/products/${result.recommendedCue.id}`}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-all"
                  >
                    <Eye className="w-4 h-4" /> Xem Chi Tiết
                  </Link>

                  <button
                    onClick={handleReset}
                    className="p-3 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                    title="Tư vấn lại"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Runner Ups */}
            {result.runnerUps && result.runnerUps.length > 0 && (
              <div className="pt-6 space-y-4">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Các lựa chọn phù hợp tiếp theo (Runner-ups)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.runnerUps.map((cue) => (
                    <div
                      key={cue.id}
                      className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center justify-between gap-4 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <img src={cue.image} alt={cue.name} className="w-14 h-14 object-cover rounded-lg bg-slate-900" />
                        <div>
                          <h5 className="text-sm font-bold text-white line-clamp-1">{cue.name}</h5>
                          <span className="text-xs text-yellow-400 font-semibold">{formatPriceVND(cue.price)}</span>
                        </div>
                      </div>
                      <Link
                        to={`/products/${cue.id}`}
                        className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 shrink-0"
                      >
                        Xem
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
