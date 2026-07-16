import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Mail, Lock, User, Target, ArrowRight } from "lucide-react";

interface AuthPageProps {
  onLoginSuccess: (user: any) => void;
}

export function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleTestAccount = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
    setIsRegister(false);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    const body = isRegister ? { email, password, name } : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
      }

      if (isRegister) {
        setSuccess("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
        setIsRegister(false);
        setPassword("");
      } else {
        setSuccess("Đăng nhập thành công!");
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        onLoginSuccess(data.user);
        
        // Redirect logic based on role
        setTimeout(() => {
          if (data.user.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/account");
          }
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || "Kết nối đến server thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ background: "#0F172A",  }}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Header logo */}
        <div className="text-center">
          <div 
            className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-4 animate-bounce"
            style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)" }}
          >
            <Target className="w-6 h-6" style={{ color: "#0F172A" }} />
          </div>
          <h2 className="font-display text-4xl font-semibold tracking-tight" style={{ color: "#F8FAFC" }}>
            {isRegister ? "Tạo tài khoản mới" : "Chào mừng trở lại"}
          </h2>
          <p className="mt-2 text-sm" style={{ color: "#94A3B8" }}>
            {isRegister ? "Đăng ký thành viên Billiard Pro Shop" : "Đăng nhập để tiếp tục trải nghiệm"}
          </p>
        </div>

        {/* Main Card container */}
        <div 
          className="rounded-2xl border p-8 shadow-2xl transition-all duration-300"
          style={{ 
            background: "#1E293B", 
            borderColor: "rgba(212,175,55,0.15)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)"
          }}
        >
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm font-medium border text-red-400 bg-red-950/20 border-red-500/30">
              ⚠ {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg text-sm font-medium border text-green-400 bg-green-950/20 border-green-500/30">
              ✓ {success}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                  Họ và Tên
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748B" }} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập họ tên đầy đủ..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:border-yellow-500 bg-slate-900 border-slate-700 text-slate-100"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                Địa chỉ Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748B" }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:border-yellow-500 bg-slate-900 border-slate-700 text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748B" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition-all focus:border-yellow-500 bg-slate-900 border-slate-700 text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 mt-4 hover:shadow-xl disabled:opacity-50"
              style={{ 
                background: "linear-gradient(135deg, #D4AF37, #A88920)", 
                color: "#0F172A",
                boxShadow: "0 10px 20px rgba(212,175,55,0.15)"
              }}
            >
              {loading ? "Vui lòng chờ..." : isRegister ? "Đăng ký thành viên" : "Đăng nhập hệ thống"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle login/register mode */}
          <div className="mt-6 text-center text-sm border-t pt-4" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
            <span style={{ color: "#94A3B8" }}>
              {isRegister ? "Đã có tài khoản bida?" : "Chưa có tài khoản bida?"}
            </span>{" "}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
                setSuccess("");
              }}
              className="font-bold hover:underline transition-colors"
              style={{ color: "#D4AF37" }}
            >
              {isRegister ? "Đăng nhập ngay" : "Đăng ký thành viên"}
            </button>
          </div>
        </div>

        {/* Demo Accounts Panel */}
        <div 
          className="rounded-2xl border p-5 space-y-3 shadow-lg"
          style={{ 
            background: "rgba(30, 41, 59, 0.4)", 
            borderColor: "rgba(212,175,55,0.1)",
          }}
        >
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "#D4AF37" }}>
            🔑 Tài khoản thử nghiệm (Bấm để chọn nhanh)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Customer account */}
            <button
              onClick={() => handleTestAccount("customer@email.com", "customer123")}
              className="text-left p-3 rounded-xl border transition-all hover:bg-slate-800/40 text-xs text-slate-300"
              style={{ borderColor: "rgba(212,175,55,0.08)", background: "#182232" }}
            >
              <div className="font-bold" style={{ color: "#22C55E" }}>Mẫu Khách Hàng (Customer)</div>
              <div className="mt-1 font-mono">Email: customer@email.com</div>
              <div className="font-mono">Pass: customer123</div>
            </button>

            {/* Admin account */}
            <button
              onClick={() => handleTestAccount("admin@email.com", "admin123")}
              className="text-left p-3 rounded-xl border transition-all hover:bg-slate-800/40 text-xs text-slate-300"
              style={{ borderColor: "rgba(212,175,55,0.08)", background: "#182232" }}
            >
              <div className="font-bold" style={{ color: "#D4AF37" }}>Mẫu Quản Trị (Admin)</div>
              <div className="mt-1 font-mono">Email: admin@email.com</div>
              <div className="font-mono">Pass: admin123</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
