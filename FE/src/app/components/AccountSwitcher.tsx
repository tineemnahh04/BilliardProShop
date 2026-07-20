import { useState } from "react";
import { UserCheck, ChevronDown, User, Shield, Tag } from "lucide-react";

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
  onSwitchAccount: (user: any) => void;
}

export function AccountSwitcher({ currentUser, onSwitchAccount }: AccountSwitcherProps) {
  const [open, setOpen] = useState(false);

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
    onSwitchAccount(newUser);
    setOpen(false);
  };

  const activeAcc = PRESET_ACCOUNTS.find(a => a.userId === currentUser?.userId || a.email === currentUser?.email) || PRESET_ACCOUNTS[2];

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-yellow-500/30 bg-slate-900 text-xs font-semibold text-slate-200 hover:border-yellow-400 transition-all cursor-pointer"
        title="Bấm để chuyển đổi vai trò Người bán / Người mua / Bidder"
      >
        <div className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold text-[10px]">
          {activeAcc.name[0]}
        </div>
        <span className="max-w-[110px] truncate font-bold text-yellow-400">{activeAcc.name}</span>
        <span className="text-[10px] text-slate-400 hidden sm:inline">({activeAcc.tag.split(' ')[0]})</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-yellow-500/30 p-2 shadow-2xl z-50 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-extrabold text-yellow-400 uppercase tracking-wider flex items-center gap-1 border-b border-slate-800">
            <UserCheck className="w-3.5 h-3.5" /> Chuyển đổi vai trò người dùng (Test 2 chiều)
          </div>
          {PRESET_ACCOUNTS.map((acc) => (
            <button
              key={acc.userId}
              onClick={() => handleSelect(acc)}
              className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition-colors text-xs cursor-pointer ${
                activeAcc.userId === acc.userId
                  ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-bold"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0 text-yellow-400">
                {acc.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold truncate text-white">{acc.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{acc.tag}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
