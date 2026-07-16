import { Link } from "react-router";
import { Target, Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter } from "lucide-react";

const LINKS = {
  "Cửa hàng": [
    { label: "Cơ bida lỗ", href: "/products?cat=pool-cues" },
    { label: "Cơ bida phăng", href: "/products?cat=carom-cues" },
    { label: "Cơ phá & nhảy", href: "/products?cat=break-jump" },
    { label: "Bao đựng cơ", href: "/products?cat=cue-cases" },
    { label: "Lơ & Phụ kiện bida", href: "/products?cat=accessories" },
    { label: "Khuyến mãi", href: "/products?sale=true" },
  ],
  "Thương hiệu": [
    { label: "Predator", href: "/products?brand=predator" },
    { label: "Fury", href: "/products?brand=fury" },
    { label: "Cuetec", href: "/products?brand=cuetec" },
    { label: "JFlowers", href: "/products?brand=jflowers" },
    { label: "Kamui", href: "/products?brand=kamui" },
    { label: "Mit Cues", href: "/products?brand=mit-cues" },
  ],
  "Hỗ trợ khách hàng": [
    { label: "Tài khoản của tôi", href: "/account" },
    { label: "Theo dõi đơn hàng", href: "/account?tab=orders" },
    { label: "Chính sách đổi trả", href: "/account" },
    { label: "Chính sách vận chuyển", href: "/account" },
    { label: "Câu hỏi thường gặp", href: "/account" },
    { label: "Liên hệ", href: "/account" },
  ],
};

export function Footer() {
  return (
    <footer style={{ background: "#080E1A", borderTop: "1px solid rgba(212,175,55,0.15)" }}>
      {/* Newsletter */}
      <div
        className="py-12"
        style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(34,197,94,0.05) 100%)" }}
      >
        <div className="max-w-[1440px] mx-auto px-6 text-center">
          <h3
            className="font-display text-3xl mb-2 font-semibold"
            style={{ color: "#D4AF37" }}
          >
            Tham gia Cộng đồng Cơ thủ Chuyên nghiệp
          </h3>
          <p className="text-sm mb-6" style={{ color: "#94A3B8" }}>
            Nhận ưu đãi độc quyền, sản phẩm mới và mẹo từ chuyên gia gửi trực tiếp đến hộp thư của bạn.
          </p>
          <form
            className="flex gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94A3B8" }} />
              <input
                placeholder="Nhập địa chỉ email của bạn"
                className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none"
                style={{
                  background: "#1E293B",
                  borderColor: "rgba(212,175,55,0.2)",
                  color: "#F8FAFC",
                }}
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)", color: "#0F172A" }}
            >
              Đăng ký
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-[1440px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #D4AF37, #A88920)" }}
              >
                <Target className="w-5 h-5" style={{ color: "#0F172A" }} />
              </div>
              <div>
                <div className="font-display font-semibold tracking-wide text-lg" style={{ color: "#D4AF37" }}>
                  BILLIARD PRO SHOP
                </div>
                <div className="text-xs tracking-wider" style={{ color: "#94A3B8" }}>
                  THIẾT BỊ BILLIARDS NHẬP KHẨU CAO CẤP
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#94A3B8" }}>
              Điểm đến hàng đầu của bạn cho các thiết bị bida đẳng cấp thế giới. Chúng tôi cung cấp các loại cơ bida, phụ kiện và dụng cụ tốt nhất từ các thương hiệu hàng đầu được các cơ thủ chuyên nghiệp trên toàn thế giới tin dùng.
            </p>
            <div className="space-y-2 text-sm" style={{ color: "#94A3B8" }}>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" style={{ color: "#D4AF37" }} />
                <span>+84 1900 555 888</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" style={{ color: "#D4AF37" }} />
                <span>support@billiardproshop.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color: "#D4AF37" }} />
                <span>Quận 10, TP. Hồ Chí Minh, Việt Nam</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg flex items-center justify-center border transition-all hover:border-yellow-400/50 hover:bg-yellow-400/10"
                  style={{ borderColor: "rgba(212,175,55,0.2)", color: "#94A3B8" }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h4
                className="text-sm font-semibold mb-4 tracking-wider uppercase"
                style={{ color: "#D4AF37" }}
              >
                {section}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm transition-colors hover:text-yellow-400"
                      style={{ color: "#94A3B8" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div
        className="border-t py-6"
        style={{ borderColor: "rgba(212,175,55,0.1)" }}
      >
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs" style={{ color: "#64748B" }}>
          <span>© 2026 Billiard Pro Shop. Bảo lưu mọi quyền.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-yellow-400 transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Chính sách Cookie</a>
          </div>
          <div className="flex items-center gap-2">
            <span>Thanh toán:</span>
            {["VNPAY", "MoMo", "COD", "Visa", "Mastercard"].map((p) => (
              <span
                key={p}
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{ background: "#1E293B", color: "#94A3B8" }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
