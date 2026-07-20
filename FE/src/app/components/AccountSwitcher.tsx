import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { UserCheck, ChevronDown, User, Shield, LogOut } from "lucide-react";

export const PRESET_ACCOUNTS = [
  {
    userId: "user_pro_1",
    name: "Nguyễn Văn Hùng",
    email: "hung.mezz@email.com",
    role: "customer",
    phone: "0908123456",
    tag: "Người Bán (Chủ cây cơ Mezz EC9)",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
  },
  {
    userId: "user_pro_2",
    name: "Trần Quốc Anh",
    email: "quocanh@email.com",
    role: "customer",
    phone: "0987654321",
    tag: "Người Bán (Chủ cơ Predator Aspire)",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop"
  },
  {
    userId: "buyer_marcus",
    name: "Marcus Chen",
    email: "customer@email.com",
    role: "customer",
    phone: "+84 912 345 678",
    tag: "Người Mua (Khách hàng chính)",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
  },
  {
    userId: "buyer_10",
    name: "Lê Minh Tuấn",
    email: "tuan.le@email.com",
    role: "customer",
    phone: "0912345678",
    tag: "Người Đặt Giá (Trả giá 7.0 triệu)",
    avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop"
  },
  {
    userId: "admin_pro",
    name: "Admin Pro",
    email: "admin@email.com",
    role: "admin",
    phone: "0900000000",
    tag: "Quản Trị Viên Hệ Thống",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
  }
];

interface AccountSwitcherProps {
  currentUser: any;
  onSwitchAccount?: (user: any) => void;
  onLogout?: () => void;
}

export function AccountSwitcher({ currentUser, onSwitchAccount, onLogout }: AccountSwitcherProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = (acc: typeof PRESET_ACCOUNTS[0]) => {
    const newUser = {
      id: acc.userId,
      userId: acc.userId,
      name: acc.name,
      email: acc.email,
      role: acc.role,
      phone: acc.phone,
      avatar: acc.avatar,
      wishlist: [2, 5]
    };

    localStorage.setItem("user", JSON.stringify(newUser));
    if (onSwitchAccount) onSwitchAccount(newUser);
    setOpen(false);
  };

  const displayName = currentUser?.name || "Khách hàng";
  const displayEmail = currentUser?.email || "Chưa đăng nhập";
  const isAdmin = currentUser?.role === "admin";

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-yellow-500/30 bg-slate-900/90 text-xs font-semibold text-slate-200 hover:border-yellow-400 hover:bg-slate-800 hover:shadow-[0_0_12px_rgba(212,175,55,0.2)] transition-all cursor-pointer group"
        title="Tài khoản & Chuyển đổi vai trò Test"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform shadow-md">
          {displayName[0]?.toUpperCase() || "U"}
        </div>
        <div className="flex flex-col text-left">
          <span className="max-w-[100px] truncate font-bold text-yellow-400 text-xs leading-tight group-hover:text-yellow-300">
            {displayName}
          </span>
          <span className="text-[10px] text-slate-400 leading-tight">
            {isAdmin ? "Quản trị" : "Thành viên"}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${open ? "rotate-180 text-yellow-400" : "group-hover:translate-y-0.5"}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900/95 border border-yellow-500/30 p-2.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
          {/* Account Profile Header */}
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 mb-2 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
              {displayName[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-white truncate">{displayName}</div>
              <div className="text-[11px] text-slate-400 truncate">{displayEmail}</div>
              <span className="inline-flex items-center gap-1 mt-1 text-[10px] px-2 py-0.5 rounded-md font-extrabold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                {isAdmin ? <Shield className="w-3 h-3 text-yellow-400" /> : <User className="w-3 h-3 text-yellow-400" />}
                {isAdmin ? "Quản trị viên Hệ thống" : "Khách hàng / Người bán"}
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-1 mb-2">
            <Link
              to="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-yellow-400/10 hover:text-yellow-300 transition-colors"
            >
              <User className="w-4 h-4 text-yellow-400" />
              <span>Hồ sơ cá nhân & Đơn hàng</span>
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-yellow-400 hover:bg-yellow-500/20 transition-colors"
              >
                <Shield className="w-4 h-4 text-yellow-400" />
                <span>Bảng Quản Trị (Admin)</span>
              </Link>
            )}
          </div>

          {/* Test Account Switcher Section */}
          {onSwitchAccount && (
            <div className="border-t border-slate-800/80 pt-2 mb-1.5">
              <div className="px-2.5 py-1 text-[10px] font-extrabold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-yellow-400" /> Chuyển tài khoản Test
              </div>
              <div className="space-y-1 mt-1 max-h-48 overflow-y-auto pr-1">
                {PRESET_ACCOUNTS.map((acc) => {
                  const isSelected = (acc.userId === currentUser?.userId || acc.email === currentUser?.email);
                  return (
                    <button
                      key={acc.userId}
                      onClick={() => handleSelect(acc)}
                      className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 transition-all text-xs cursor-pointer ${
                        isSelected
                          ? "bg-yellow-500/15 border border-yellow-500/40 text-yellow-300 font-bold"
                          : "hover:bg-slate-800/80 text-slate-300"
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 text-yellow-400">
                        {acc.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold truncate text-slate-200">{acc.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{acc.tag}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Logout button */}
          {onLogout && currentUser && (
            <div className="border-t border-slate-800/80 pt-1.5">
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

