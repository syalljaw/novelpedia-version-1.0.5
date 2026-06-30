'use client';

import React, { useState, useEffect } from "react";
import { Settings, ShieldAlert } from "lucide-react";

// ==========================================
// PATHS FOR PREMIUM MODERN SVG ICONS
// ==========================================
const ICON_PATHS: Record<string, string> = {
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  card: "M1 7.6h22M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  wallet: "M20 12V8H6a2 2 0 0 1-2-2 2 2 0 0 1 2-2h14v2 M4 6v12a2 2 0 0 0 2 2h14v-4",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 19.5A2.5 2.5 0 0 0 6.5 22H20 M4 19.5V5A2.5 2.5 0 0 1 6.5 2.5H20 M20 2V22",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  palette: "M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 14.7 3.1 17.2 4.8 19H12V22Z",
  handshake: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M16 3.1a4 4 0 0 1 0 7.7 M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  help: "M12 22C17.5 22 22 17.5 22 12S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3 M12 17h.01",
  trash: "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M10 11v6 M14 11v6",
  camera: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  at: "M4 12a8 8 0 0 1 16 0V15a2.5 2.5 0 0 1-5 0v-3a3 3 0 1 0-3 3c1.5 0 3-1 3-1",
  alignLeft: "M17 12H3 M21 6H3 M21 18H3",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.2.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.5 2.8.7a2 2 0 0 1 1.7 1.7z",
  calendar: "M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  save: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8",
  lock: "M17 11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2 M2 11h20 M7 11V7a5 5 0 0 1 10 0v4",
  key: "M21 2l-2 2 M12 12a5.5 5.5 0 1 1-7.8 7.8 5.5 5.5 0 0 1 7.8-7.8z M12 12l3.5-3.5 M15.5 8.5l3 3",
  checkCircle: "M22 11.1V12a10 10 0 1 1-5.9-9.1 M22 4L12 14l-3-3",
  shieldCheck: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 11l2 2 4-4",
  qrCode: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z M6 7H4V4h2z",
  desktop: "M22 12H2 M2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-7A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.8 1z",
  smartphone: "M5 2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M12 18h.01",
  power: "M18.4 6.6a9 9 0 1 1-12.7 0 M12 2v10",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  eyeOff: "M17.9 17.9A10.1 10.1 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.1-5.9 M9.9 4.2A9.1 9.1 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  plusCircle: "M12 22C17.5 22 22 17.5 22 12S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z M12 8v8 M8 12h8",
  moreVertical: "M12 12h.01 M12 5h.01 M12 19h.01",
  star: "M12 2l3.1 6.3L22 9.3l-5 4.9 1.2 6.9-6.2-3.3-6.2 3.3L7 14.1l-5-4.9 6.9-1L12 2z",
  chevronDown: "M6 9l6 6 6-6",
  chevronRight: "M9 18l6-6-6-6",
  chevronLeft: "M15 18l-6-6 6-6",
  plus: "M12 5v14 M5 12h14",
  arrowUpRight: "M7 17L17 7 M7 7h10v10",
  arrowUp: "M12 19V5 M5 12l7-7 7 7",
  arrowDown: "M12 5v14 M19 12l-7 7-7-7",
  tag: "M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z M7 7h.01",
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
  sparkles: "M12 3v1 M12 20v1 M21 12h-1 M4 12H3 M18.4 5.6l-.7.7 M6.3 17.7l-.7.7 M5.6 5.6l.7.7 M17.7 17.7l.7.7",
  layers: "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
  messageCircle: "M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z",
  heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z",
  userPlus: "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M19 8v6 M16 11h6",
  megaphone: "M12 12H3 M13 5h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3 M17 5l-4 4 M17 15l-4-4",
  shieldAlert: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M12 8v4 M12 16h.01",
  send: "M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z",
  moon: "M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z",
  sun: "M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0 M12 1v2 M12 21v2 M4.2 4.2l1.4 1.4 M18.4 18.4l1.4 1.4 M1 12h2 M21 12h2",
  wind: "M9.6 4.6A2 2 0 1 1 11 8H2 M12.6 19.4A2 2 0 1 0 14 16H2 M15.7 7.7A2.5 2.5 0 1 1 19.5 12H2",
  refreshCcw: "M1 4v6h6 M23 20v-6h-6 M20.5 9a9 9 0 0 0-14.9-3.4L1 10m22 4l-4.6 4.4a9 9 0 0 1-14.9-3.4",
  gift: "M20 12v10H4V12 M2 7h20v5H2z M12 22V7 M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z",
  copy: "M9 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v5 M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2z",
  coin: "M12 22C17.5 22 22 17.5 22 12S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z M12 6v12 M15 9H10.5a1.5 1.5 0 1 0 0 3h3a1.5 1.5 0 1 1 0 3H9",
  headset: "M21 10V8a9 9 0 0 0-18 0v2 M21 14h-3 M3 14H6 M20.4 14a2 2 0 1 1-3.4 1.4 M3.6 14a2 2 0 1 0 3.4 1.4",
  alertTriangle: "M10.3 3.9l-8.5 14.1a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z M12 9v4 M12 17h.01",
  edit3: "M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
  uploadCloud: "M16 16l-4-4-4 4 M12 12v9 M20.4 18.4A5 5 0 0 0 18 9h-1.3A8 8 0 1 0 3 16.3",
  info: "M12 22C17.5 22 22 17.5 22 12S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z M12 16v-4 M12 8h.01",
  check: "M20 6L9 17l-5-5",
  diamond: "M2.7 10.3l7 7c.4.4 1 .4 1.4 0l7-7c.4-.4.4-1 0-1.4l-7-7c-.4-.4-1-.4-1.4 0l-7 7c-.4.4-.4 1 0 1.4z"
};

interface SvgIconProps {
  type: string;
  color?: string;
  size?: number;
  className?: string;
}

export function SvgIcon({ type, color = "currentColor", size = 20, className = "" }: SvgIconProps) {
  const path = ICON_PATHS[type] || "";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 transition-colors duration-250 ${className}`}
    >
      {path ? <path d={path} /> : null}
      {type === "moreVertical" && (
        <>
          <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}

// ==========================================
// PROPS INTERFACE Definition
// ==========================================
interface Wallet {
  email: string;
  coins: number;
  revenueExp: number;
  isAdmin: boolean;
  username?: string;
  bio?: string;
  password?: string;
  isPremium?: boolean;
}

interface AccountSettingsProps {
  user: { email: string; username: string };
  wallet: Wallet | null;
  onRefreshWallet: () => void;
  onLogout: () => void;
  onLogin?: (email: string, username: string) => void;
  embedded?: boolean;
}

// 10 Navigation Menus setup
const SIDEBAR_MENUS = [
  { id: "profil", label: "Profil & Akun", icon: "user", color: "#64748B" },
  { id: "keamanan", label: "Keamanan & Privasi", icon: "shield", color: "#64748B" },
  { id: "pembayaran", label: "Metode Pembayaran", icon: "card", color: "#64748B" },
  { id: "penarikan", label: "Penarikan Saldo", icon: "wallet", color: "#64748B" },
  { id: "karya", label: "Manajemen Karya", icon: "book", color: "#64748B" },
  { id: "notifikasi", label: "Notifikasi", icon: "bell", color: "#64748B", badge: true },
  { id: "tampilan", label: "Tema & Tampilan", icon: "palette", color: "#64748B" },
  { id: "kemitraan", label: "Kemitraan & Afiliasi", icon: "handshake", color: "#64748B" },
  { id: "bantuan", label: "Bantuan & Dukungan", icon: "help", color: "#64748B" },
  { id: "hapus", label: "Hapus Akun", icon: "trash", color: "#EF4444", danger: true }
];

export default function AccountSettings({
  user,
  wallet,
  onRefreshWallet,
  onLogout,
  onLogin,
  embedded = false
}: AccountSettingsProps) {
  const [activeMenu, setActiveMenu] = useState<string>("profil");
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Trigger simulated local state toasts
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Render core wrapper layout
  return (
    <div className={`flex flex-col md:flex-row relative rounded-3xl overflow-hidden ${embedded ? "bg-white/30 backdrop-blur-md border border-white/60 p-1 md:p-2" : "min-h-screen bg-[#F8FAFC]"}`}>
      
      {/* Toast Alert Banner */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-fade-in bg-slate-900 text-white text-xs px-5 py-3.5 rounded-xl shadow-2xl border border-slate-800 flex items-center gap-2.5 max-w-sm">
          <SvgIcon type={toast.type === "success" ? "checkCircle" : "alertTriangle"} color={toast.type === "success" ? "#10B981" : "#EF4444"} size={16} />
          <span className="font-medium tracking-tight">{toast.message}</span>
        </div>
      )}

      {/* MOBILE LIST VIEW */}
      <div className={`md:hidden flex-1 select-text w-full ${mobileView === "list" ? "block" : "hidden"} ${embedded ? "p-4" : "p-5"} pb-24`}>
        <div className="mb-6 text-left">
          <h1 className="text-xl font-black text-[#0F172A] tracking-tight leading-tight uppercase flex items-center gap-2">
            <Settings size={20} className="text-slate-700" />
            <span>Pengaturan Akun</span>
          </h1>
          <p className="text-xs text-[#475569] font-light mt-1">
            Kelola profil, keamanan, dan fitur lainnya.
          </p>
        </div>
        
        <div className="flex flex-col gap-2">
          {SIDEBAR_MENUS.map((menu) => (
            <button
              key={menu.id}
              onClick={() => {
                setActiveMenu(menu.id);
                setMobileView("detail");
              }}
              className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between hover:border-indigo-300 transition-colors cursor-pointer shadow-sm text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${menu.danger ? "bg-red-50 text-red-500" : "bg-indigo-50 text-indigo-500"}`}>
                  <SvgIcon type={menu.icon} color={menu.danger ? "#EF4444" : "#4F46E5"} size={16} />
                </div>
                <div>
                  <h3 className={`text-xs font-bold uppercase tracking-wide ${menu.danger ? "text-red-600" : "text-slate-800"}`}>{menu.label}</h3>
                  {menu.badge && <span className="text-[9px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded-sm inline-block mt-0.5">PERLU PERHATIAN</span>}
                </div>
              </div>
              <SvgIcon type="chevronRight" size={16} color="#CBD5E1" />
            </button>
          ))}
          
          <button
            onClick={() => {
              if (confirm("Anda yakin ingin keluar dari akun Novelpedia?")) {
                onLogout();
              }
            }}
            className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer shadow-sm text-left mt-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-red-500 border border-red-100">
                <SvgIcon type="power" size={14} color="#EF4444" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Keluar Akun</h3>
              </div>
            </div>
            <SvgIcon type="chevronRight" size={16} color="#CBD5E1" />
          </button>
        </div>
      </div>

      {/* PERSISTENT SIDEBAR - Left side on desktop/sticky */}
      <aside className={`hidden md:flex bg-white border-r border-[#E2E8F0] flex-col shrink-0 overflow-y-auto p-5 text-left select-none rounded-l-3xl ${embedded ? "w-[240px] h-auto min-h-[550px]" : "w-[290px] sticky top-16 h-[calc(100vh-64px)]"}`}>
        <div className="mb-6">
          <div className="text-[10px] uppercase font-black tracking-widest text-[#94A3B8] mb-1">Menu Navigasi</div>
          <h2 className="text-sm font-black text-slate-900 uppercase">Pengaturan</h2>
          <p className="text-[10px] text-slate-400 font-light">Kelola semua opsi di bawah</p>
        </div>

        <nav className="flex-1 flex flex-col gap-1.5">
          {SIDEBAR_MENUS.map((menu) => {
            const isActive = activeMenu === menu.id;
            return (
              <button
                key={menu.id}
                onClick={() => setActiveMenu(menu.id)}
                className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  isActive
                    ? "bg-[#4F46E5] text-white shadow-lg shadow-indigo-600/25 translate-x-1"
                    : "text-slate-600 hover:bg-[#F1F5F9] hover:translate-x-1 hover:text-[#4F46E5]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <SvgIcon
                    type={menu.icon}
                    color={isActive ? "#FFFFFF" : menu.danger ? "#EF4444" : "#64748B"}
                    size={16}
                  />
                  <span className={menu.danger ? "text-red-500 font-bold " + (isActive ? "text-white" : "") : ""}>{menu.label}</span>
                </div>
                {menu.badge && (
                  <span className={`h-2 w-2 rounded-full ${isActive ? "bg-white" : "bg-red-500"} animate-pulse shrink-0`} />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-8 border-t border-slate-100 pt-4 flex flex-col gap-2">
          <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-100 flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
              {user.username.substring(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[10px] font-black text-slate-900 truncate">@{user.username}</p>
              <p className="text-[9px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (confirm("Anda yakin ingin keluar dari akun Novelpedia?")) {
                onLogout();
              }
            }}
            className="w-full py-2 bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-650 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <SvgIcon type="power" size={11} className="text-red-500" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* CONTINUOUS CONTENT BODY AREA - Right Side */}
      <main className={`flex-1 select-text w-full ${mobileView === "list" ? "hidden md:block" : "block"} ${embedded ? "p-4 md:p-6" : "p-6 md:p-10 max-w-5xl mx-auto"}`}>
        
        {/* Mobile Back Button */}
        <div className="md:hidden mb-4">
          <button 
            onClick={() => setMobileView("list")}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <SvgIcon type="chevronLeft" size={14} />
            <span>Kembali ke Daftar Pengaturan</span>
          </button>
        </div>

        {/* Breadcrumbs and Section header */}
        {!embedded && (
          <div className="mb-8 text-left">
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2 select-none">
              <span>Dashboard</span>
              <SvgIcon type="chevronRight" size={10} color="#94A3B8" />
              <span className="text-[#4F46E5] font-black">Pengaturan</span>
            </div>
            
            <h1 className="text-2xl md:text-3.5xl font-black text-[#0F172A] tracking-tight leading-tight uppercase flex items-center gap-3">
              <Settings size={28} className="text-slate-800" />
              <span>Pengaturan Akun</span>
            </h1>
            <p className="text-xs md:text-sm text-[#475569] font-light mt-1">
              Kelola preferensi akun, sirkulasi royalti otomatis, proteksi naskah AI, dan identitas sastra Novelpedia Anda.
            </p>
          </div>
        )}

        {/* CONTAINER Card Slot with active tab selectors */}
        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm hover:shadow-md transition-shadow p-6 md:p-8 text-left">
          {/* Default Content Fallback Shell */}
          {activeMenu === "profil" && <TabProfile user={user} wallet={wallet} onRefreshWallet={onRefreshWallet} showToast={showToast} onLogin={onLogin} />}
          {activeMenu === "keamanan" && <TabKeamanan showToast={showToast} />}
          {activeMenu === "pembayaran" && <TabPembayaran user={user} showToast={showToast} />}
          {activeMenu === "penarikan" && <TabPenarikan showToast={showToast} />}
          {activeMenu === "karya" && <TabKarya showToast={showToast} />}
          {activeMenu === "notifikasi" && <TabNotifikasi showToast={showToast} />}
          {activeMenu === "tampilan" && <TabTampilan showToast={showToast} />}
          {activeMenu === "kemitraan" && <TabKemitraan showToast={showToast} />}
          {activeMenu === "bantuan" && <TabBantuan showToast={showToast} />}
          {activeMenu === "hapus" && <TabHapus onLogout={onLogout} showToast={showToast} />}
        </div>

      </main>

    </div>
  );
}

// =======================================================
// MODULE COMPONENTS FOR ALL 10 PRESET SETTINGS TABS
// =======================================================

// 1. Tab Profil
function TabProfile({ user, wallet, onRefreshWallet, showToast, onLogin }: { user: any; wallet: any; onRefreshWallet: () => void; showToast: any; onLogin?: any }) {
  const [fullName, setFullName] = useState("Irsyal Faiz");
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(wallet?.bio || "Penulis fiksi orisinal beraliran fantasi petualangan retro di Novelpedia.");
  const [phone, setPhone] = useState("081234567890");
  const [dob, setDob] = useState("1997-06-15");
  const [gender, setGender] = useState("pria");
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black text-slate-900 uppercase">1. Profil & Informasi Sastrawan</h3>
        <p className="text-xs text-slate-500 font-light mt-0.5">Sesuaikan tampilan publik Anda pada halaman sirkulasi karya.</p>
      </div>

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          setSaving(true);
          setTimeout(() => {
            setSaving(false);
            showToast("Perubahan profil berhasil disimpan ke awan.");
          }, 1000);
        }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Kolom Kiri */}
        <div className="space-y-5">
          {/* Avatar Area */}
          <div>
            <label className="block text-[10.5px] font-black uppercase text-slate-450 tracking-wider mb-2">Foto Profil</label>
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-350">
                <span className="text-2xl font-black text-slate-700">{username.substring(0,2).toUpperCase()}</span>
                <label 
                  className="absolute bottom-0 right-0 p-1.5 bg-[#4F46E5] hover:bg-indigo-600 text-white rounded-full shadow-md cursor-pointer border border-white"
                >
                  <SvgIcon type="camera" size={12} />
                  <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      showToast(`Gambar ${e.target.files[0].name} berhasil dipilih.`);
                    }
                  }} />
                </label>
              </div>
              <div className="text-left text-xs">
                <p className="font-bold text-slate-700">Dimensi Rekomendasi</p>
                <p className="text-slate-400 font-light mt-0.5">Kecepatan optimal 1:1 maksimal 2MB.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10.5px] font-black uppercase text-slate-450 tracking-wider mb-2">Nama Lengkap</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <SvgIcon type="user" size={16} />
              </span>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10.5px] font-black uppercase text-slate-450 tracking-wider mb-2">Username Sastra</label>
            <div className="relative animate-in fade-in duration-300">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <SvgIcon type="at" size={16} />
              </span>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500" 
              />
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-500">
                <SvgIcon type="checkCircle" size={16} />
              </span>
            </div>

            {/* QUICK PRESET ACCOUNT SWITCHER */}
            <div className="mt-3.5 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 shadow-xs">
              <div className="flex items-center gap-1.5 mb-2 col-span-2">
                <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">
                  Ganti Akun Admin
                </span>
              </div>
              <p className="text-[10px] text-slate-600 font-light mb-3 leading-normal">
                Beralih akun instan untuk melakukan pengelolaan platform:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onLogin) {
                      onLogin("irsyalfaiz97@gmail.com", "IrsyalFaiz");
                      showToast("Berhasil login sebagai: Admin 1 (Irsyal Faiz)");
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-[11px] font-bold text-left transition-all cursor-pointer ${
                    user.email === "irsyalfaiz97@gmail.com"
                      ? "bg-indigo-600 border-indigo-700 text-white shadow-md shadow-indigo-600/10 scale-[1.02]"
                      : "bg-white/90 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-300 hover:scale-[1.01]"
                  }`}
                >
                  <div className="font-bold flex items-center gap-1">
                    <span>Admin 1</span>
                  </div>
                  <div className={`text-[10px] font-normal truncate mt-0.5 ${user.email === "irsyalfaiz97@gmail.com" ? "text-indigo-100" : "text-slate-450"}`}>
                    Irsyal Faiz
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onLogin) {
                      onLogin("yareyyaa0529@gmail.com", "Reyya");
                      showToast("Berhasil login sebagai: Admin 2 (Reyya)");
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-[11px] font-bold text-left transition-all cursor-pointer ${
                    user.email === "yareyyaa0529@gmail.com"
                      ? "bg-indigo-600 border-indigo-700 text-white shadow-md shadow-indigo-600/10 scale-[1.02]"
                      : "bg-white/90 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-300 hover:scale-[1.01]"
                  }`}
                >
                  <div className="font-bold flex items-center gap-1">
                    <span>Admin 2</span>
                  </div>
                  <div className={`text-[10px] font-normal truncate mt-0.5 ${user.email === "yareyyaa0529@gmail.com" ? "text-indigo-100" : "text-slate-450"}`}>
                    Reyya
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10.5px] font-black uppercase text-slate-450 tracking-wider">Biografi Penulis</label>
              <span className="text-[10px] font-mono text-slate-400 font-medium">{bio.length}/160</span>
            </div>
            <div className="relative">
              <span className="absolute top-3 left-3.5 text-slate-400">
                <SvgIcon type="alignLeft" size={16} />
              </span>
              <textarea 
                maxLength={160}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 h-24 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 resize-none" 
              />
            </div>
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="space-y-5">
          <div>
            <label className="block text-[10.5px] font-black uppercase text-slate-450 tracking-wider mb-2">Surel Elektronik (Email)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <SvgIcon type="mail" size={16} />
              </span>
              <input 
                type="email" 
                disabled 
                value={user.email} 
                className="w-full bg-slate-100/70 border border-slate-200 text-slate-400 rounded-xl pl-10 pr-4 py-2.5 text-xs cursor-not-allowed outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10.5px] font-black uppercase text-slate-450 tracking-wider mb-2">Nomor Telepon Handphone</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <SvgIcon type="phone" size={16} />
              </span>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10.5px] font-black uppercase text-slate-450 tracking-wider mb-2">Tanggal Lahir</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <SvgIcon type="calendar" size={16} />
              </span>
              <input 
                type="date" 
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10.5px] font-black uppercase text-slate-450 tracking-wider mb-2">Jenis Kelamin</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <SvgIcon type="users" size={16} />
              </span>
              <select 
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-850 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none"
              >
                <option value="pria">Pria (Laki-laki)</option>
                <option value="wanita">Wanita (Perempuan)</option>
                <option value="rahasiakan">Rahasiakan (Privat)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-full shadow-lg shadow-indigo-600/20 active:translate-y-px cursor-pointer flex items-center gap-2"
          >
            {saving ? <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span> : <SvgIcon type="save" size={14} />}
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </div>
  );
}

// Dummy structures for later enrichment to keep this commit within tokens limits.
// 2. Tab Keamanan & Privasi
function TabKeamanan({ showToast }: { showToast: any }) {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confPass, setConfPass] = useState("");
  const [is2Fa, setIs2Fa] = useState(false);
  
  // Privacy status choices
  const [showEmailPub, setShowEmailPub] = useState("tidak");
  const [showOnlineStatus, setShowOnlineStatus] = useState("ya");
  const [isIndexed, setIsIndexed] = useState(true);

  // Active devices state simulation
  const [sessions, setSessions] = useState([
    { id: "s_1", device: "desktop", name: "Chrome on macOS Catalina", location: "Jakarta, Indonesia", time: "Aktif Sekarang" },
    { id: "s_2", device: "mobile", name: "Safari on iPhone 15 Pro", location: "Bandung, Indonesia", time: "2 jam yang lalu" },
    { id: "s_3", device: "laptop", name: "Firefox on Windows JRPG Engine", location: "Surabaya, Indonesia", time: "3 hari yang lalu" }
  ]);

  // Determine password strength
  const getStrength = () => {
    if (!newPass) return { label: "Kosong", color: "w-0", textBg: "bg-slate-100", textColor: "text-slate-400" };
    if (newPass.length < 5) return { label: "Lemah (Merah)", color: "w-1/3 bg-red-500", textBg: "bg-red-50 text-red-700", textColor: "text-red-500" };
    if (newPass.length < 9) return { label: "Sedang (Kuning)", color: "w-2/3 bg-amber-500", textBg: "bg-amber-50 text-amber-700", textColor: "text-amber-500" };
    return { label: "Sangat Kuat (Hijau)", color: "w-full bg-emerald-500", textBg: "bg-emerald-50 text-emerald-700", textColor: "text-emerald-500" };
  };

  const strength = getStrength();

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPass || !newPass || !confPass) {
      showToast("Tolong lengkapi semua isian sandi terlebih dahulu.", "error");
      return;
    }
    if (newPass !== confPass) {
      showToast("Konfirmasi sandi baru tidak cocok.", "error");
      return;
    }
    showToast("Kata sandi akun Anda berhasil diperbarui!");
    setOldPass("");
    setNewPass("");
    setConfPass("");
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h3 className="text-lg font-black text-slate-900 uppercase">2. Keamanan & Konfigurasi Privasi</h3>
        <p className="text-xs text-slate-500 font-light mt-0.5">Atur integritas sandi masuk, sesi aktif, serta saringan peranti perayap web.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kiri - Form Sandi & 2FA */}
        <div className="space-y-6">
          <form onSubmit={handleSavePassword} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1.5 mb-1">
              <SvgIcon type="lock" size={14} /> Ubah Kata Sandi Akun
            </h4>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Kata Sandi Lama</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <SvgIcon type="lock" size={14} />
                </span>
                <input 
                  type="password" 
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  placeholder="Sandi lama saat ini..." 
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Kata Sandi Baru</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <SvgIcon type="key" size={14} />
                </span>
                <input 
                  type="password" 
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Isi sandi baru tangguh..." 
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Password strength progress bar */}
              <div className="mt-2.5">
                <div className="flex justify-between items-center mb-1 text-[10px]">
                  <span className="text-slate-400">Kekuatan Sandi:</span>
                  <span className="font-bold text-slate-600 font-mono">{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${strength.color}`} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Konfirmasi Sandi Baru</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <SvgIcon type="checkCircle" size={14} />
                </span>
                <input 
                  type="password" 
                  value={confPass}
                  onChange={(e) => setConfPass(e.target.value)}
                  placeholder="Ulangi isian sandi baru..." 
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer select-none"
            >
              <SvgIcon type="shield" size={14} color="#FFF" />
              <span>Simpan Sandi Baru</span>
            </button>
          </form>

          {/* 2FA Section */}
          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-3.5">
            <div className="flex items-start justify-between gap-4">
              <div className="text-left">
                <span className="text-[10px] bg-indigo-550/10 text-indigo-700 font-black px-2 py-0.5 rounded uppercase flex items-center gap-1 w-max">
                  <SvgIcon type="shieldCheck" size={11} color="#4F46E5" /> VERIFIKASI DUA LANGKAH (2FA)
                </span>
                <h4 className="text-xs font-bold text-slate-800 uppercase mt-2">Amankan akun dengan verifikasi tambahan</h4>
                <p className="text-[11px] text-slate-500 font-light mt-0.5">Sistem akan meminta kode OTP sekunder saat masukan login baru.</p>
              </div>

              {/* Custom Switch Toggle */}
              <button 
                onClick={() => {
                  const newVal = !is2Fa;
                  setIs2Fa(newVal);
                  showToast(newVal ? "Verifikasi OTP 2FA Sistem diaktifkan." : "2FA dinonaktifkan.");
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-305 outline-none cursor-pointer flex items-center ${
                  is2Fa ? "bg-indigo-600 justify-end" : "bg-slate-300 justify-start"
                }`}
              >
                <span className="bg-white h-5 w-5 rounded-full shadow-md transition-all block" />
              </button>
            </div>

            <button 
              onClick={() => showToast("Memindai Kode QR... Sinkronisasi 2FA sukses!", "success")}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <SvgIcon type="qrCode" size={14} color="#64748B" />
              <span>Atur Authenticator 2FA</span>
            </button>
          </div>
        </div>

        {/* Kanan - Sessions & Privacy choices */}
        <div className="space-y-6">
          
          {/* Active Sessions List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <SvgIcon type="desktop" size={15} color="#4F46E5" /> Daftar Perangkat Aktif
            </h4>
            
            <div className="divide-y divide-slate-100">
              {sessions.map((ses) => (
                <div key={ses.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                      <SvgIcon type={ses.device} size={18} color="#64748B" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-850 truncate">{ses.name}</p>
                      <p className="text-[10px] text-slate-500 font-light truncate">{ses.location} • <span className="font-mono text-[9px] text-slate-400">{ses.time}</span></p>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setSessions(sessions.filter(s => s.id !== ses.id));
                      showToast(`Sesi perangkat ${ses.device} berhasil dihentikan.`);
                    }}
                    className="p-1 px-2.5 text-[10px] font-bold text-red-600 hover:bg-red-50 rounded-lg border border-red-150 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <SvgIcon type="power" size={11} color="#EF4444" />
                    <span>Keluar</span>
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={() => {
                setSessions(sessions.slice(0, 1)); // keep Jakarta macOS one
                showToast("Semua sesi perangkat lain sukses dinonaktifkan.");
              }}
              className="w-full py-2.5 border border-red-200 hover:bg-red-50 text-red-650 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              <SvgIcon type="trash" size={14} color="#EF4444" />
              <span>Keluarkan dari Semua Perangkat Lain</span>
            </button>
          </div>

          {/* Privacy preferences info */}
          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-850">Preferensi Keterlihatan Publik</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Tampilkan Email ke Publik?</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <SvgIcon type="eye" size={14} />
                  </span>
                  <select 
                    value={showEmailPub}
                    onChange={(e) => {
                      setShowEmailPub(e.target.value);
                      showToast("Sirkulasi keterlihatan surel publik diperbarui.");
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 outline-none cursor-pointer appearance-none"
                  >
                    <option value="tidak">Sembunyikan Surel dari Pembaca (Privat)</option>
                    <option value="ya">Tampilkan pada Menu Penulis (Publik)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Tampilkan Status Online Anda?</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <SvgIcon type="eyeOff" size={14} />
                  </span>
                  <select 
                    value={showOnlineStatus}
                    onChange={(e) => {
                      setShowOnlineStatus(e.target.value);
                      showToast("Preferensi status kehadiran bergeser.");
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 outline-none cursor-pointer appearance-none"
                  >
                    <option value="ya">Tampilkan Status Aktif Online (Aktif)</option>
                    <option value="tidak">Sembunyikan Status Kehadiran (Senyap)</option>
                  </select>
                </div>
              </div>

              {/* Checkbox custom */}
              <label className="flex items-center gap-3 cursor-pointer py-1.5 select-none text-left">
                <input 
                  type="checkbox"
                  checked={isIndexed}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsIndexed(checked);
                    showToast(checked ? "Perayap Google Search diizinkan." : "Pencarian Google dibatalkan.");
                  }}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 shrink-0" 
                />
                <div className="text-left font-light text-slate-650 text-xs leading-normal">
                  Izinkan mesin pencari (Google, Bing) mengindeks profil sastrawan Novelpedia Anda.
                </div>
              </label>
            </div>
          </div>

          {/* Backup data & Activity */}
          <div className="bg-emerald-50/20 p-5 rounded-2xl border border-emerald-100 flex flex-wrap gap-4 items-center justify-between">
            <div className="text-left max-w-xs">
              <h5 className="text-xs font-bold text-slate-800">Berkas Cadangan (Sip)</h5>
              <p className="text-[10px] text-slate-500 font-light mt-0.5">Dapatkan naskah mentah, draf, dan riwayat royalty.</p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  showToast("Naskah & Royalti ZIP berhasil diunduh.");
                }}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1"
              >
                <SvgIcon type="download" size={12} color="#FFF" />
                <span>Unduh Data</span>
              </button>
              <button 
                onClick={() => {
                  if (confirm("Hapus total riwayat aktivitas baca?")) {
                    showToast("Log riwayat bersih.");
                  }
                }}
                className="px-3 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-650 rounded-xl text-xs font-bold transition-colors"
              >
                Bersihkan Log
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
// 3. Tab Metode Pembayaran
function TabPembayaran({ user, showToast }: { user: any; showToast: any }) {
  const [activeSubTab, setActiveSubTab] = useState<"bank" | "ewallet" | "spay">("bank");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Modal State Form
  const [newCat, setNewCat] = useState<"bank" | "ewallet" | "spay">("bank");
  const [provider, setProvider] = useState("");
  const [accNum, setAccNum] = useState("");
  const [accOwner, setAccOwner] = useState("");
  const [makeMain, setMakeMain] = useState(true);

  // Active payment accounts
  const [methods, setMethods] = useState([
    { id: "m_1", type: "bank", provider: "Bank Central Asia (BCA)", number: "8012-3342-9901", owner: "Irsyal Faiz", isMain: true, status: "Verified" },
    { id: "m_2", type: "bank", provider: "Bank Mandiri Sastra", number: "135-00-12883-221", owner: "Irsyal Faiz", isMain: false, status: "Verified" },
    { id: "m_3", type: "ewallet", provider: "GoPay Premium", number: "0812-3456-7890", owner: "Irsyal Faiz", isMain: true, status: "Verified" },
    { id: "m_4", type: "ewallet", provider: "Dana Sastra", number: "0812-3456-7890", owner: "Irsyal Faiz", isMain: false, status: "Pending" }
  ]);

  // Transaction Ledger (Spay)
  const [transactions, setTransactions] = useState([
    { id: "t_1", type: "in", title: "Klaim Tiket Baca Bab 45", amount: "Rp 150.000", date: "23 Juni 2026" },
    { id: "t_2", type: "out", title: "Pembelian Cover Eksklusif", amount: "Rp 350.000", date: "21 Juni 2026" },
    { id: "t_3", type: "in", title: "Bagi Hasil Royalti Bulanan", amount: "Rp 1.450.000", date: "15 Juni 2026" }
  ]);

  // Searchable 25 Banks Mock List
  const BANK_LIST = [
    "Bank Central Asia (BCA)", "Bank Mandiri", "Bank Rakyat Indonesia (BRI)", 
    "Bank Negara Indonesia (BNI)", "Bank Syariah Indonesia (BSI)", "Bank Danamon", 
    "Bank CIMB Niaga", "Permata Bank", "Bank BTN", "Bank Jago", "Allo Bank", 
    "Jenius (BTPN)", "OCBC NISP", "Panin Bank", "Bank Bukopin", "Maybank Indonesia", 
    "Bank Mega", "Bank Jawa Barat (BJB)", "Bank DKI", "Bank Jatim", "Bank Jateng", 
    "Bank Sulselbar", "Bank Papua", "Bank Kaltimtara", "Muamalat Indonesia"
  ];

  // Ewallets list
  const EWALLET_LIST = ["GoPay", "OVO", "DANA", "LinkAja", "ShopeePay"];

  const handleCreateMethod = () => {
    if (!provider || !accNum || !accOwner) {
      showToast("Tolong lengkapi semua isian.", "error");
      return;
    }

    const newMethod = {
      id: "m_" + Date.now(),
      type: newCat,
      provider,
      number: accNum,
      owner: accOwner,
      isMain: makeMain,
      status: "Verified"
    };

    // If main, make others not main
    let updated = [...methods];
    if (makeMain) {
      updated = updated.map(m => m.type === newCat ? { ...m, isMain: false } : m);
    }
    setMethods([...updated, newMethod]);
    showToast(`Metode ${provider} berhasil ditambahkan.`);
    
    // Reset Form
    setIsAddModalOpen(false);
    setStep(1);
    setProvider("");
    setAccNum("");
    setAccOwner("");
    setMakeMain(true);
  };

  return (
    <div className="space-y-6 text-left relative">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 uppercase">3. Metode Pembayaran & Saldo Spay</h3>
          <p className="text-xs text-slate-500 font-light mt-0.5">Kelola rekening bank komersial dan dompet digital pendukung royalti.</p>
        </div>

        <button
          onClick={() => {
            setStep(1);
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2 bg-[#4F46E5] hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <SvgIcon type="plusCircle" size={14} color="#FFF" />
          <span>Tambah Rekening Baru</span>
        </button>
      </div>

      {/* Categories Horizontal Pills Grid */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab("bank")}
          className={`px-5 py-3.5 text-xs font-black uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer duration-150 ${
            activeSubTab === "bank" ? "border-indigo-600 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-650"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
          <span>Rekening Bank</span>
        </button>

        <button
          onClick={() => setActiveSubTab("ewallet")}
          className={`px-5 py-3.5 text-xs font-black uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer duration-150 ${
            activeSubTab === "ewallet" ? "border-[#10B981] text-slate-900" : "border-transparent text-slate-400 hover:text-slate-650"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          <span>Dompet Digital (E-Wallet)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("spay")}
          className={`px-5 py-3.5 text-xs font-black uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer duration-150 ${
            activeSubTab === "spay" ? "border-[#7C3AED] text-slate-900" : "border-transparent text-slate-400 hover:text-slate-650"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
          <span>Saku Spay Sastra</span>
        </button>
      </div>

      {/* Subtab Contents */}
      {activeSubTab !== "spay" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {methods
            .filter((m) => m.type === activeSubTab)
            .map((item) => (
              <div key={item.id} className="p-5 bg-white border border-slate-200 rounded-2xl flex items-start justify-between gap-4 hover:shadow-sm duration-200 group text-left">
                <div className="flex items-start gap-3.5">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-sm ${
                    item.type === "bank" ? "bg-blue-600" : "bg-emerald-500"
                  }`}>
                    {item.provider.substring(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black text-slate-900">{item.provider}</p>
                      {item.isMain && (
                        <span className="bg-amber-50 border border-amber-200 text-amber-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5">
                          <SvgIcon type="star" size={8} color="#D97706" /> UTAMA
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-mono mt-1">{item.number}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-light">Pemilik: {item.owner}</p>

                    <div className="mt-3 flex items-center gap-1.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                        item.status === "Verified" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-600"
                      }`}>
                        {item.status === "Verified" ? "✓ Terverifikasi" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3-Dot Dropdown Controls */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      const opt = confirm(`Pilih aksi untuk ${item.provider}: (OK: Hapus, Cancel: Jadikan Utama)`);
                      if (opt) {
                        setMethods(methods.filter(m => m.id !== item.id));
                        showToast(`Metode berhasil dibuang.`);
                      } else {
                        setMethods(methods.map(m => m.type === item.type ? { ...m, isMain: m.id === item.id } : m));
                        showToast("Metode utama berhasil dirubah.");
                      }
                    }}
                    className="p-1 px-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
                  >
                    <SvgIcon type="moreVertical" size={12} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      ) : (
        // SPAY SASRA LAYOUT SECTION WITH BALANCE CARD & HISTORIES
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-2xl text-white flex flex-wrap items-center justify-between gap-6 shadow-md">
            <div className="space-y-2 text-left">
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-bold px-2 py-1 rounded-md uppercase tracking-wider">SALDO SPAY SASTRA</span>
              <h4 className="text-2.5xl font-black tracking-tight font-mono">Rp 1.250.000</h4>
              <p className="text-[10px] text-indigo-200/70">Terintegrasi otomatis dengan dompet digital untuk kecepatan tarik tunai.</p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => {
                  showToast("Layanan Topup Koin Saku berhasil diantarkan.");
                }}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <SvgIcon type="plus" size={13} color="#000" />
                <span>Top Up</span>
              </button>
              <button 
                onClick={() => {
                  showToast("Pengalihan penarikan ke halaman ekosistem.");
                }}
                className="px-4 py-2 bg-transparent border border-white/30 hover:bg-white/10 text-white text-xs font-black uppercase rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <SvgIcon type="arrowUpRight" size={13} color="#FFF" />
                <span>Tarik Dana</span>
              </button>
            </div>
          </div>

          {/* Ledger History List */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <div className="p-4 bg-slate-50/50 border-b border-slate-200 font-black text-xs text-slate-900 tracking-wider">
              RIWAYAT TRANSAKSI SPAY SASTRA (BULAN INI)
            </div>
            
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 select-none">
                <tr>
                  <th className="px-5 py-3">Kategori</th>
                  <th className="px-5 py-3">Nama Deskripsi</th>
                  <th className="px-5 py-3 text-right">Jumlah Saldo</th>
                  <th className="px-5 py-3 text-right">Tanggal Selesai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tr) => (
                  <tr key={tr.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        tr.type === "in" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                      }`}>
                        <SvgIcon type={tr.type === "in" ? "arrowDown" : "arrowUp"} size={10} color={tr.type === "in" ? "#10B981" : "#EF4444"} />
                        {tr.type === "in" ? "Masuk" : "Keluar"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-850 font-bold">{tr.title}</td>
                    <td className={`px-5 py-3.5 text-right font-bold ${tr.type === "in" ? "text-emerald-600" : "text-red-500"}`}>
                      {tr.type === "in" ? "+" : "-"} {tr.amount}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-500 font-light font-mono text-[10px]">{tr.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3-STEP INTEGRATION MODAL OVERLAY */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-200 overflow-hidden relative">
            
            {/* Modal Closer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 select-none">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-[#4F46E5]">Rekening Baru</h4>
                <p className="text-[10px] text-slate-400 font-light">Langkah {step} dari 3</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 hover:bg-slate-50 p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <SvgIcon type="trash" size={14} color="#94A3B8" />
              </button>
            </div>

            {/* Step 1: Category Picker */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">Pilih jenis metode sirkulasi dana royalti sastrawan Anda:</p>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => { setNewCat("bank"); setStep(2); }}
                    className="p-4 border border-slate-250 hover:border-indigo-600 hover:bg-indigo-50/20 rounded-2xl flex items-center gap-3 w-full text-left cursor-pointer duration-150"
                  >
                    <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-medium">B</div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">Rekening Perbankan Lokal</h5>
                      <p className="text-[10px] text-slate-500 font-light">Mendukung 25 bank komersial real-time.</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setNewCat("ewallet"); setStep(2); }}
                    className="p-4 border border-slate-250 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-2xl flex items-center gap-3 w-full text-left cursor-pointer duration-150"
                  >
                    <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-medium">EW</div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">Dompet Digital (E-Wallet)</h5>
                      <p className="text-[10px] text-slate-500 font-light">Penarikan cepat DANA, OVO, GoPay, LinkAja.</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setNewCat("spay"); setStep(2); setProvider("Saku Spay Sastra"); }}
                    className="p-4 border border-slate-250 hover:border-purple-600 hover:bg-purple-50/20 rounded-2xl flex items-center gap-3 w-full text-left cursor-pointer duration-150"
                  >
                    <div className="h-9 w-9 rounded-xl bg-purple-600 flex items-center justify-center text-white font-medium">SP</div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">Saku Spay Sastra Novelpedia</h5>
                      <p className="text-[10px] text-slate-500 font-light">Tarik instan komisi royalti langsung dari dasbor.</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Select Provider */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">Pilih penyedia layanan pembayaran royalti Anda:</p>
                
                {newCat === "bank" ? (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Pilih Bank</label>
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="w-full rounded-xl border border-slate-205 p-2.5 text-xs bg-slate-50"
                    >
                      <option value="">-- Ketuk Untuk Memilih Bank Anda --</option>
                      {BANK_LIST.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                ) : newCat === "ewallet" ? (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Platform E-Wallet</label>
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="w-full rounded-xl border border-slate-205 p-2.5 text-xs bg-slate-50"
                    >
                      <option value="">-- Pilih Brand Dompet Digital --</option>
                      {EWALLET_LIST.map((ew) => (
                        <option key={ew} value={ew}>{ew}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="p-4 bg-purple-50 border border-purple-150 rounded-xl text-purple-700 text-xs">
                    Sistem akan menyinkronisasi dengan akun Saku Spay Sastra utama Anda secara otomatis pada Langkah 3.
                  </div>
                )}

                <div className="flex gap-2.5 pt-2 font-black text-xs">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-center cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button 
                    onClick={() => {
                      if (!provider) { showToast("Pilih penyedia terlebih dahulu.", "error"); return; }
                      setStep(3);
                    }}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-center cursor-pointer"
                  >
                    Lanjut
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Account Number / Credentials */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-650">Isi detail akun sirkulasi atau perbankan Anda:</p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Penyedia Terpilih</label>
                    <input type="text" disabled value={provider} className="w-full rounded-xl border border-slate-200 p-2 text-xs bg-slate-100/75 cursor-not-allowed text-slate-500 font-bold" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                      {newCat === "bank" ? "Nomor Rekening Bank" : "Nomor Handphone Terdaftar"}
                    </label>
                    <input 
                      type="text" 
                      placeholder={newCat === "bank" ? "Contoh: 121-00-112..." : "Contoh: 0812..."} 
                      value={accNum}
                      onChange={(e) => setAccNum(e.target.value)}
                      className="w-full rounded-xl border border-slate-205 p-2.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Nama Pemilik Akun / Rekening</label>
                    <input 
                      type="text" 
                      placeholder="Nama asli sesuai identitas..." 
                      value={accOwner}
                      onChange={(e) => setAccOwner(e.target.value)}
                      className="w-full rounded-xl border border-slate-205 p-2.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <label className="flex items-center gap-3.5 py-1.5 cursor-pointer text-left">
                    <input 
                      type="checkbox" 
                      checked={makeMain} 
                      onChange={(e) => setMakeMain(e.target.checked)}
                      className="rounded text-[#4F46E5] h-4 w-4" 
                    />
                    <span className="text-xs font-light text-slate-600">Jadikan metode pembayaran utama (sumber royalti utama).</span>
                  </label>
                </div>

                <div className="flex gap-2.5 pt-2 text-xs font-black">
                  <button 
                    onClick={() => setStep(2)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-center cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button 
                    onClick={handleCreateMethod}
                    className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-center cursor-pointer"
                  >
                    Simpan & Selesai
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
// 4. Tab Penarikan Saldo
function TabPenarikan({ showToast }: { showToast: any }) {
  const [defaultMethod, setDefaultMethod] = useState("bca");
  const [minLimit, setMinLimit] = useState("50000");
  const [autoWithdraw, setAutoWithdraw] = useState(false);
  const [selectedDay, setSelectedDay] = useState("25");
  const [page, setPage] = useState(1);

  // withdrawal log
  const [withdrawals, setWithdrawals] = useState([
    { id: "w_1", date: "25 Mei 2026", method: "BCA (8012-***)", amount: "Rp 5.250.000", status: "Berhasil" },
    { id: "w_2", date: "25 April 2026", method: "GoPay (0812-***)", amount: "Rp 1.450.000", status: "Berhasil" },
    { id: "w_3", date: "25 Maret 2026", method: "Mandiri (135-***)", amount: "Rp 950.000", status: "Gagal" },
    { id: "w_4", date: "12 Maret 2026", method: "Dana (0812-***)", amount: "Rp 250.000", status: "Diproses" }
  ]);

  return (
    <div className="space-y-6 text-left">
      <div>
        <h3 className="text-lg font-black text-slate-900 uppercase">4. Sirkulasi Penarikan Saldo (Payout)</h3>
        <p className="text-xs text-slate-500 font-light mt-0.5">Konfigurasi batas minimum transfer otomatis serta status pengiriman royalti berkala.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Preference Card Column 1 */}
        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-3">
          <label className="block text-[10px] font-black uppercase text-[#4F46E5] tracking-wider">Metode Default</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <SvgIcon type="card" size={14} />
            </span>
            <select
              value={defaultMethod}
              onChange={(e) => {
                setDefaultMethod(e.target.value);
                showToast("Metode pengiriman utama disetel.");
              }}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 outline-none cursor-pointer"
            >
              <option value="bca">BCA (8012-***)</option>
              <option value="mandiri">Mandiri (135-***)</option>
              <option value="gopay">GoPay (0812-***)</option>
            </select>
          </div>
          <p className="text-[10px] text-slate-400">Semua royalti langsung akan dialirkan ke sini.</p>
        </div>

        {/* Preference Card Column 2 */}
        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-3">
          <label className="block text-[10px] font-black uppercase text-[#4F46E5] tracking-wider">Batas Minimum Transfer</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-black text-[11px] font-mono select-none">
              Rp
            </span>
            <input 
              type="number"
              value={minLimit}
              onChange={(e) => {
                setMinLimit(e.target.value);
              }}
              onBlur={() => showToast(`Minimum pengiriman diatur ke Rp ${Number(minLimit).toLocaleString()}`)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <p className="text-[10px] text-slate-400">Mengurangi beban biaya kliring (biaya bank).</p>
        </div>

        {/* Preference Card Column 3 */}
        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-[10px] font-black uppercase text-[#4F46E5] tracking-wider">Penarikan Otomatis</label>
            <button 
              onClick={() => {
                const updated = !autoWithdraw;
                setAutoWithdraw(updated);
                showToast(updated ? "Auto Payout diaktifkan bulanan." : "Auto Payout dimatikan.");
              }}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-150 cursor-pointer flex items-center ${
                autoWithdraw ? "bg-indigo-600 justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <span className="bg-white h-4 w-4 rounded-full shadow-md block" />
            </button>
          </div>

          {autoWithdraw ? (
            <div className="relative animate-fade-in">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <SvgIcon type="calendar" size={13} />
              </span>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 cursor-pointer outline-none"
              >
                <option value="1">Setiap tanggal 1</option>
                <option value="10">Setiap tanggal 10</option>
                <option value="25">Setiap tanggal 25</option>
              </select>
            </div>
          ) : (
            <p className="text-[10.5px] text-slate-400 font-light pt-1 leading-normal">Aktifkan untuk mengirim otomatis pada siklus kalender bulanan.</p>
          )}
        </div>
      </div>

      {/* Withdrawal Logs Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white mt-4">
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 font-black text-xs text-slate-900 tracking-wider">
          DAFTAR RIWAYAT PENGIRIMAN DANA KARYA (PAYOUT HISTORY)
        </div>
        
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Tanggal Pengajuan</th>
              <th className="px-5 py-3">Metode Tujuan</th>
              <th className="px-5 py-3 text-right">Volume Dana</th>
              <th className="px-5 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {withdrawals.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 flex items-center gap-2">
                  <SvgIcon type="calendar" size={13} color="#64748B" />
                  <span className="font-medium text-slate-800">{item.date}</span>
                </td>
                <td className="px-5 py-3.5 font-mono text-[11px] text-slate-700">{item.method}</td>
                <td className="px-5 py-3.5 text-right font-bold text-slate-900">{item.amount}</td>
                <td className="px-5 py-3.5 text-center">
                  <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                    item.status === "Berhasil" ? "bg-emerald-50 text-emerald-700" :
                    item.status === "Diproses" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                  }`}>
                    <SvgIcon 
                      type={item.status === "Berhasil" ? "checkCircle" : item.status === "Diproses" ? "calendar" : "alertTriangle"} 
                      size={10} 
                      color={item.status === "Berhasil" ? "#10B981" : item.status === "Diproses" ? "#D97706" : "#EF4444"} 
                    />
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Dynamic Pagination Footer */}
        <div className="flex items-center justify-between p-4 bg-slate-50/50 border-t border-slate-100 text-[10.5px] font-bold text-slate-550 select-none">
          <span>Menampilkan 4 dari 15 Transaksi</span>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => { if (page > 1) { setPage(page-1); showToast("Memuat halaman sebelumnya..."); } }}
              className="p-1 px-2.5 border border-slate-200 bg-white hover:bg-slate-100 rounded-md cursor-pointer flex items-center gap-1"
            >
              <SvgIcon type="chevronLeft" size={10} />
              <span>Kembali</span>
            </button>
            <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-mono">{page}</span>
            <button 
              onClick={() => { setPage(page+1); showToast("Memuat log transaksi lama..."); }}
              className="p-1 px-2.5 border border-slate-200 bg-white hover:bg-slate-100 rounded-md cursor-pointer flex items-center gap-1"
            >
              <span>Lanjut</span>
              <SvgIcon type="chevronRight" size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. Tab Kesenian / Manajemen Karya
function TabKarya({ showToast }: { showToast: any }) {
  const [pubStatus, setPubStatus] = useState("publik");
  const [category, setCategory] = useState("fiksi");
  const [proofread, setProofread] = useState(true);
  const [antiPlagiat, setAntiPlagiat] = useState(true);
  const [wordsPerPage, setWordsPerPage] = useState("10");

  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState(["Fantasi", "Adventure", "Retro", "RPG"]);
  const [license, setLicense] = useState("copyright");

  const [saving, setSaving] = useState(false);

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tagInput.trim();
    if (!clean) return;
    if (tags.includes(clean)) {
      setTagInput("");
      return;
    }
    setTags([...tags, clean]);
    setTagInput("");
  };

  const handleSavePref = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast("Preferensi manajemen sekuritas naskah disimpan.");
    }, 900);
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h3 className="text-lg font-black text-slate-900 uppercase">5. Doktrin Sastra & Manajemen Karya</h3>
        <p className="text-xs text-slate-500 font-light mt-0.5">Konfigurasikan standarisasi asisten AI, hak cipta naskah, serta metadata bawaan penulisan.</p>
      </div>

      <form onSubmit={handleSavePref} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Kolom Kiri */}
        <div className="bg-slate-50/20 p-5 rounded-2xl border border-slate-150/55 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1.5 mb-2">
            <SvgIcon type="book" size={14} /> Setelan Standar Penulisan
          </h4>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-2">Status Publikasi Bawaan</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450">
                <SvgIcon type="book" size={14} />
              </span>
              <select
                value={pubStatus}
                onChange={(e) => setPubStatus(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 outline-none cursor-pointer"
              >
                <option value="draf">Draf (Disimpan privat)</option>
                <option value="publik">Publik (Dapat dibaca gratis)</option>
                <option value="premium">Premium Only (Berbayar pakai Koin)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-2">Kategori Sastra Bawaan</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450">
                <SvgIcon type="grid" size={14} />
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 outline-none cursor-pointer"
              >
                <option value="fiksi">Fiksi Orisinal</option>
                <option value="nonfiksi">Sastra Non-Fiksi</option>
                <option value="puisi">Antologi Puisi / Sajak</option>
                <option value="fanfic">Sastra Penggemar (Fanfiction)</option>
              </select>
            </div>
          </div>

          {/* AI Helper Toggle */}
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-850 flex items-center gap-1">
                <SvgIcon type="sparkles" size={13} color="#4F46E5" /> Proofread AI Otomatis
              </p>
              <p className="text-[10px] text-slate-400 font-light mt-0.5">Asisten AI menyarankan perbaikan salah ketik (typo) saat draf disimpan.</p>
            </div>
            <button 
              type="button"
              onClick={() => setProofread(!proofread)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-150 cursor-pointer flex items-center shrink-0 ${
                proofread ? "bg-indigo-600 justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <span className="bg-white h-4 w-4 rounded-full shadow-md block" />
            </button>
          </div>

          {/* Plagiarsim Filter */}
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-850 flex items-center gap-1">
                <SvgIcon type="shield" size={13} color="#4F46E5" /> Sensor Plagiat Sastra Otomatis
              </p>
              <p className="text-[10px] text-slate-400 font-light mt-0.5">Mencegah naskah disalin paksa ke situs web agregator luar.</p>
            </div>
            <button 
              type="button"
              onClick={() => setAntiPlagiat(!antiPlagiat)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-150 cursor-pointer flex items-center shrink-0 ${
                antiPlagiat ? "bg-indigo-600 justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <span className="bg-white h-4 w-4 rounded-full shadow-md block" />
            </button>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-2">Jumlah Bab Maksimal Per Halaman</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450">
                <SvgIcon type="layers" size={14} />
              </span>
              <input 
                type="number"
                value={wordsPerPage}
                onChange={(e) => setWordsPerPage(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="bg-slate-50/20 p-5 rounded-2xl border border-slate-150/55 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#7C3AED] flex items-center gap-1.5 mb-2">
            <SvgIcon type="tag" size={14} /> Tag Sastra & Lisensi Karya
          </h4>

          {/* Custom Tags Multi Select Area */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-2">Tag & Sub-Genre Favorit</label>
            <div className="flex flex-wrap gap-1.5 p-2.5 bg-white border border-slate-200 rounded-2xl mb-2.5">
              {tags.map((t) => (
                <span key={t} className="bg-indigo-50 border border-indigo-150 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 select-none">
                  <span>#{t}</span>
                  <button 
                    type="button" 
                    onClick={() => setTags(tags.filter(tag => tag !== t))}
                    className="hover:bg-indigo-200 rounded text-indigo-900 leading-none shrink-0 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
              {tags.length === 0 && <span className="text-[11px] text-slate-400 font-light">Tidak ada tag tersemat.</span>}
            </div>

            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Tambahkan tag sastra baru..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); handleAddTag(e); }
                }}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button 
                type="button"
                onClick={handleAddTag}
                className="px-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Lisensi Karya */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider">Perjanjian Lisensi Konten Penulisan</label>
            
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3.5 bg-white border border-slate-150 rounded-xl cursor-pointer selection:bg-transparent">
                <input 
                  type="radio" 
                  name="license" 
                  value="copyright" 
                  checked={license === "copyright"}
                  onChange={() => setLicense("copyright")}
                  className="mt-0.5 text-indigo-600 h-4 w-4" 
                />
                <div className="text-left leading-normal">
                  <p className="text-xs font-black text-slate-900">Hak Cipta Dilindungi Undang-Undang (Copyright)</p>
                  <p className="text-[10px] text-slate-450 mt-0.5">Seluruh distribusi eksklusif karya dikunci oleh Novelpedia.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 bg-white border border-slate-150 rounded-xl cursor-pointer selection:bg-transparent">
                <input 
                  type="radio" 
                  name="license" 
                  value="cc" 
                  checked={license === "cc"}
                  onChange={() => setLicense("cc")}
                  className="mt-0.5 text-indigo-600 h-4 w-4" 
                />
                <div className="text-left leading-normal">
                  <p className="text-xs font-black text-slate-900">Creative Commons (Atribusi-BerbagiSerupa)</p>
                  <p className="text-[10px] text-slate-450 mt-0.5">Penikmat boleh menyalin karya dengan menyertakan kredit nama.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 bg-white border border-slate-150 rounded-xl cursor-pointer selection:bg-transparent">
                <input 
                  type="radio" 
                  name="license" 
                  value="public" 
                  checked={license === "public"}
                  onChange={() => setLicense("public")}
                  className="mt-0.5 text-indigo-600 h-4 w-4" 
                />
                <div className="text-left leading-normal">
                  <p className="text-xs font-black text-slate-900">Domain Publik (Sastra Terbuka)</p>
                  <p className="text-[10px] text-slate-450 mt-0.5">Sajak atau karya diserahkan sepenuhnya ke ranah kebudayaan.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-full shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
          >
            {saving ? <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span> : <SvgIcon type="save" size={13} />}
            <span>Simpan Pref Karya</span>
          </button>
        </div>
      </form>
    </div>
  );
}
// 6. Tab Notifikasi
function TabNotifikasi({ showToast }: { showToast: any }) {
  const [notifs, setNotifs] = useState({
    comments: true,
    likes: true,
    follower: true,
    withdrawal: true,
    promos: false,
    proofread: true,
    plagiat: true
  });
  const [digest, setDigest] = useState("harian");

  const toggleNotif = (key: keyof typeof notifs) => {
    setNotifs({ ...notifs, [key]: !notifs[key] });
    showToast(`Preferensi notifikasi ${key} dirubah.`);
  };

  const handleTestEmail = () => {
    showToast("Mengirim surel simulasi uji coba ke kotak masuk Anda...", "success");
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div>
        <h3 className="text-lg font-black text-slate-900 uppercase">6. Pusat Kelola Notifikasi</h3>
        <p className="text-xs text-slate-500 font-light mt-0.5">Atur lalu lintas pesan masuk, surel digest periodik, serta peringatan AI keamanan naskah.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Toggles List (Left) */}
        <div className="bg-slate-50/20 p-5 rounded-2xl border border-slate-150/55 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1.5 mb-2">
            <SvgIcon type="bell" size={14} /> Preferensi Notifikasi Langsung
          </h4>

          {/* Comments toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <SvgIcon type="messageCircle" size={14} color="#64748B" /> Komentar Karya
              </p>
              <p className="text-[10px] text-slate-400 font-light mt-0.5">Beri tahu ketika kawan pembaca mengomentari naskah Anda.</p>
            </div>
            <button 
              onClick={() => toggleNotif("comments")}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-155 cursor-pointer flex items-center ${
                notifs.comments ? "bg-indigo-600 justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <span className="bg-white h-4 w-4 rounded-full shadow-md block" />
            </button>
          </div>

          {/* Likes toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <SvgIcon type="heart" size={14} color="#64748B" /> Suka & Favorit (Vote)
              </p>
              <p className="text-[10px] text-slate-400 font-light mt-0.5">Notifikasi ketika bab karya Anda mendapat bintang koin.</p>
            </div>
            <button 
              onClick={() => toggleNotif("likes")}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-155 cursor-pointer flex items-center ${
                notifs.likes ? "bg-indigo-600 justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <span className="bg-white h-4 w-4 rounded-full shadow-md block" />
            </button>
          </div>

          {/* Followers toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <SvgIcon type="userPlus" size={14} color="#64748B" /> Pengikut Baru (Follower)
              </p>
              <p className="text-[10px] text-slate-400 font-light mt-0.5">Peringatan saat akun sastrawan Anda mendapat pengikut setia baru.</p>
            </div>
            <button 
              onClick={() => toggleNotif("follower")}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-155 cursor-pointer flex items-center ${
                notifs.follower ? "bg-indigo-600 justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <span className="bg-white h-4 w-4 rounded-full shadow-md block" />
            </button>
          </div>

          {/* Withdrawal toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <SvgIcon type="wallet" size={14} color="#64748B" /> Keuangan & Royalti
              </p>
              <p className="text-[10px] text-slate-400 font-light mt-0.5">Laporan otomatis pengiriman komisi withdraw sukses ke bank.</p>
            </div>
            <button 
              onClick={() => toggleNotif("withdrawal")}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-155 cursor-pointer flex items-center ${
                notifs.withdrawal ? "bg-indigo-600 justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <span className="bg-white h-4 w-4 rounded-full shadow-md block" />
            </button>
          </div>

          {/* Promos toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <SvgIcon type="megaphone" size={14} color="#64748B" /> Promosi & Festival Kreator
              </p>
              <p className="text-[10px] text-slate-400 font-light mt-0.5">Kabar kompetisi menulis berhadiah total puluhan juta rupiah dari kator.</p>
            </div>
            <button 
              onClick={() => toggleNotif("promos")}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-155 cursor-pointer flex items-center ${
                notifs.promos ? "bg-indigo-600 justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <span className="bg-white h-4 w-4 rounded-full shadow-md block" />
            </button>
          </div>

          {/* Proofread & Plagiat Alert */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <SvgIcon type="shieldAlert" size={14} color="#64748B" /> Laporan Analitik Keamanan AI
              </p>
              <p className="text-[10px] text-slate-400 font-light mt-0.5">Laporan mingguan jika naskah orisinal Anda terdeteksi di luar Novelpedia.</p>
            </div>
            <button 
              onClick={() => toggleNotif("plagiat")}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-155 cursor-pointer flex items-center ${
                notifs.plagiat ? "bg-indigo-600 justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <span className="bg-white h-4 w-4 rounded-full shadow-md block" />
            </button>
          </div>
        </div>

        {/* Digest Column (Right) */}
        <div className="bg-slate-50/20 p-5 rounded-2xl border border-slate-150/55 space-y-5">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#7C3AED] flex items-center gap-1.5">
            <SvgIcon type="mail" size={14} /> Berita Ringkasan Surat Elektronik (Surel)
          </h4>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-2">Frekuensi Pengiriman Surel Digest</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <SvgIcon type="mail" size={14} />
              </span>
              <select
                value={digest}
                onChange={(e) => {
                  setDigest(e.target.value);
                  showToast("Frekuesi digest diperbarui.");
                }}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 cursor-pointer outline-none"
              >
                <option value="harian">Setiap Hari (Rangkuman Harian)</option>
                <option value="mingguan">Setiap Akhir Pekan (Rangkuman Mingguan)</option>
                <option value="bulanan">Setiap Akhir Bulan (Rangkuman Bulanan)</option>
                <option value="tidak_pernah">Jangan Pernah Kirimkan Surel Digest</option>
              </select>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal mt-2">Surel digest menyatukan riwayat koin terkumpul, performa draf, serta novel populer baru.</p>
          </div>

          <div className="border border-indigo-100 bg-indigo-50/25 p-4 rounded-xl flex items-center justify-between gap-4">
            <div className="text-left">
              <h5 className="text-xs font-bold text-slate-800">Uji Coba Pengiriman</h5>
              <p className="text-[10px] text-slate-400 mt-0.5">Kirim notifikasi tiruan ke surel penulisan Anda.</p>
            </div>
            
            <button 
              onClick={handleTestEmail}
              className="py-2 px-3 border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <SvgIcon type="send" size={12} color="#4F46E5" />
              <span>Kirim Uji Coba</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 7. Tab Tema & Tampilan
function TabTampilan({ showToast }: { showToast: any }) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [fontSize, setFontSize] = useState("16");
  const [layoutStyle, setLayoutStyle] = useState("standard");
  
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem('novelpedia_prefs') || '{}');
      if (prefs.theme) setTheme(prefs.theme);
      if (prefs.fontSize) setFontSize(prefs.fontSize);
      if (prefs.layoutStyle) setLayoutStyle(prefs.layoutStyle);
      if (typeof prefs.highContrast === 'boolean') setHighContrast(prefs.highContrast);
      if (typeof prefs.reduceMotion === 'boolean') setReduceMotion(prefs.reduceMotion);
    } catch(e) {}
  }, []);

  useEffect(() => {
    try {
      const prefs = { theme, fontSize, layoutStyle, highContrast, reduceMotion };
      localStorage.setItem('novelpedia_prefs', JSON.stringify(prefs));

      const root = document.documentElement;
      // Theme
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      // Font size
      if (fontSize !== "16") {
        root.style.fontSize = fontSize + 'px';
      } else {
        root.style.fontSize = ''; // default
      }
      // High contrast
      if (highContrast) root.classList.add('high-contrast');
      else root.classList.remove('high-contrast');
      
      // Reduce motion
      if (reduceMotion) root.classList.add('reduce-motion');
      else root.classList.remove('reduce-motion');
      
    } catch(e) {}
  }, [theme, fontSize, layoutStyle, highContrast, reduceMotion]);

  const handleReset = () => {
    setTheme("light");
    setFontSize("16");
    setLayoutStyle("standard");
    setHighContrast(false);
    setReduceMotion(false);
    showToast("Semua preferensi tampilan diatur ulang ke default.");
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div>
        <h3 className="text-lg font-black text-slate-900 uppercase">7. Preferensi Tampilan & Estetika Antarmuka</h3>
        <p className="text-xs text-slate-500 font-light mt-0.5">Sesuaikan latar belakang bacaan, ukuran huruf artikel sastra, serta kemudahan akses mata.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Kolom Kiri - Theme Cards Option */}
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-3">Model Kegelapan (Theming)</label>
            <div className="grid grid-cols-3 gap-3">
              {/* Light Theme Card */}
              <button 
                onClick={() => { setTheme("light"); showToast("Tema beralih ke Mode Terang."); }}
                className={`p-3.5 rounded-xl border text-center flex flex-col items-center gap-2 cursor-pointer duration-150 ${
                  theme === "light" ? "border-indigo-600 bg-indigo-50/20 shadow-sm" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <SvgIcon type="sun" color={theme === "light" ? "#4F46E5" : "#64748B"} size={22} />
                <span className="text-[11px] font-bold text-slate-800">Mode Terang</span>
              </button>

              {/* Dark Theme Card */}
              <button 
                onClick={() => { setTheme("dark"); showToast("Tema beralih ke Mode Gelap Sastra."); }}
                className={`p-3.5 rounded-xl border text-center flex flex-col items-center gap-2 cursor-pointer duration-150 ${
                  theme === "dark" ? "border-indigo-600 bg-indigo-550/15 shadow-sm" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <SvgIcon type="moon" color={theme === "dark" ? "#4F46E5" : "#64748B"} size={22} />
                <span className="text-[11px] font-bold text-slate-800">Mode Kegelapan</span>
              </button>

              {/* System Theme Card */}
              <button 
                onClick={() => { setTheme("system"); showToast("Mengikuti setelan sistem gawai."); }}
                className={`p-3.5 rounded-xl border text-center flex flex-col items-center gap-2 cursor-pointer duration-150 ${
                  theme === "system" ? "border-indigo-600 bg-indigo-50/20 shadow-sm" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <SvgIcon type="desktop" color={theme === "system" ? "#4F46E5" : "#64748B"} size={20} />
                <span className="text-[11px] font-bold text-slate-800">Ikuti Gawai</span>
              </button>
            </div>
          </div>

          {/* Font Size slider controller */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider">Ukuran Huruf Sastrawan ({fontSize}px)</label>
              <span className="text-[11px] font-bold font-mono text-slate-800 uppercase bg-slate-100 px-2 py-0.5 rounded-md">
                {fontSize === "14" ? "Kecil" : fontSize === "16" ? "Sedang (Default)" : fontSize === "18" ? "Besar" : "Ekstra"}
              </span>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-4">
              <span className="text-xs text-slate-400 font-bold">Aa</span>
              <input 
                type="range"
                min="14"
                max="20"
                step="2"
                value={fontSize}
                onChange={(e) => {
                  setFontSize(e.target.value);
                }}
                onBlur={() => showToast(`Ukuran huruf diatur ke ${fontSize}px`)}
                className="flex-1 accent-indigo-600 cursor-pointer"
              />
              <span className="text-xl text-slate-800 font-bold">Aa</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">Ukuran ini digunakan pada bagian lembar deskripsi dan konten bab novel.</p>
          </div>
        </div>

        {/* Kolom Kanan - Spacing & Accessibilities */}
        <div className="space-y-6">
          {/* Spacing alignment */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-2.5">Preferensi Jarak Tata Letak</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer select-none">
                <input 
                  type="radio" 
                  name="layout" 
                  value="compact" 
                  checked={layoutStyle === "compact"}
                  onChange={() => setLayoutStyle("compact")}
                  className="text-indigo-600 h-4 w-4" 
                />
                <span className="text-xs font-bold text-slate-800">Kompak (Sempit dan informatif)</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer select-none">
                <input 
                  type="radio" 
                  name="layout" 
                  value="standard" 
                  checked={layoutStyle === "standard"}
                  onChange={() => setLayoutStyle("standard")}
                  className="text-indigo-600 h-4 w-4" 
                />
                <span className="text-xs font-bold text-slate-800">Standar Balance (Sangat nyaman di mata)</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer select-none">
                <input 
                  type="radio" 
                  name="layout" 
                  value="roomy" 
                  checked={layoutStyle === "roomy"}
                  onChange={() => setLayoutStyle("roomy")}
                  className="text-indigo-600 h-4 w-4" 
                />
                <span className="text-xs font-bold text-slate-800">Lapang / Lega (Fokus murni membaca)</span>
              </label>
            </div>
          </div>

          {/* Accessibilities checkboxes */}
          <div className="bg-slate-50 p-4 rounded-xl space-y-3">
            <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Aksesibilitas Sastra</h5>

            {/* High contrast checkbox */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox"
                checked={highContrast}
                onChange={(e) => {
                  setHighContrast(e.target.checked);
                  showToast(e.target.checked ? "Mode Kontras Tinggi diaktifkan." : "Kontras normal.");
                }}
                className="rounded border-slate-300 text-indigo-600 h-4 w-4" 
              />
              <span className="text-xs font-light text-slate-655">Tingkatkan kontras tebal huruf (Baku hitam putih)</span>
            </label>

            {/* Reduce motion */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox"
                checked={reduceMotion}
                onChange={(e) => {
                  setReduceMotion(e.target.checked);
                  showToast(e.target.checked ? "Efek transisi transparan dibatasi." : "Transisi normal aktif.");
                }}
                className="rounded border-slate-300 text-indigo-600 h-4 w-4" 
              />
              <span className="text-xs font-light text-slate-655">Matikan transisi/animasi transparan (Menghemat baterai)</span>
            </label>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button 
              type="button"
              onClick={handleReset}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <SvgIcon type="refreshCcw" size={12} color="#475569" />
              <span>Kembalikan ke Setelan Semula</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
// 8. Tab Kemitraan & Afiliasi
function TabKemitraan({ showToast }: { showToast: any }) {
  const [partnerStatus, setPartnerStatus] = useState("aktif");

  const handleCopyCode = () => {
    navigator.clipboard?.writeText("NOVEL123");
    showToast("Kode referral NOVEL123 disalin ke clipboard!");
  };

  const levels = [
    { name: "Bronze", comm: "2% Komisi", target: "1 - 5 Penjualan Novel" },
    { name: "Silver", comm: "5% Komisi", target: "6 - 20 Penjualan Novel" },
    { name: "Gold Exclusive", comm: "10% Komisi", target: "Lebih dari 20 Penjualan" }
  ];

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div>
        <h3 className="text-lg font-black text-slate-900 uppercase">8. Kemitraan Kreator & Afiliasi</h3>
        <p className="text-xs text-slate-500 font-light mt-0.5">Dapatkan keuntungan ganda dengan mengundang kawan penulis atau mendaftar kemitraan emas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Referral Box */}
        <div className="space-y-5">
          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-150/55 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-650 flex items-center gap-1.5">
              <SvgIcon type="gift" size={14} /> Bagikan Kode Referral Sastra
            </h4>

            <div className="flex bg-white border border-slate-205 rounded-xl overflow-hidden p-1.5">
              <input 
                type="text" 
                readOnly 
                value="NOVEL123" 
                className="flex-1 bg-transparent px-3 text-sm font-black font-mono text-slate-900 outline-none cursor-default" 
              />
              <button 
                type="button"
                onClick={handleCopyCode}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <SvgIcon type="copy" size={12} color="#FFF" />
                <span>Salin</span>
              </button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">UNDANGAN AKTIF</p>
                <h5 className="text-lg font-black text-slate-900 flex items-center gap-1.5 font-mono">
                  <SvgIcon type="users" size={14} color="#64748B" /> 0 Rekan
                </h5>
              </div>

              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">KOMISI TERKUMPUL</p>
                <h5 className="text-lg font-black text-emerald-600 flex items-center gap-1 px-1.5 rounded bg-emerald-50 w-max font-mono">
                  <SvgIcon type="coin" size={14} color="#10B981" /> Rp 0
                </h5>
              </div>
            </div>
          </div>

          {/* Program Partner Status */}
          <div className="bg-gradient-to-tr from-indigo-900 to-slate-800 p-5 rounded-2xl text-white space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider">Program Sastrawan Emas</h4>
              <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1">
                <SvgIcon type="checkCircle" size={9} color="#000" /> AKTIF
              </span>
            </div>
            
            <p className="text-xs text-indigo-150 leading-relaxed font-light">
              Akun Anda telah disetujui sebagai Sastrawan Premium. Dapatkan perlindungan naskah penuh, prioritas sirkulasi halaman utama, serta bagi hasil royalti s/d 85%.
            </p>

            <button 
              onClick={() => showToast("Membuka rujukan dashboard kemitraan partner detail.", "success")}
              className="py-2 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/10"
            >
              Lihat Detail Kontrak Partner
            </button>
          </div>
        </div>

        {/* Commissions Table */}
        <div className="bg-white p-5 rounded-2xl border border-slate-220 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <SvgIcon type="handshake" size={14} color="#4F46E5" /> Tangga Tingkatan Royalti (Fee)
          </h4>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {levels.map((lvl) => (
              <div key={lvl.name} className="p-3.5 text-xs flex items-center justify-between gap-4 bg-slate-50/20 last:pb-3.5 hover:bg-slate-50 transition-colors">
                <div className="text-left">
                  <p className="font-bold text-slate-850">{lvl.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-light">Syarat: {lvl.target}</p>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold px-3 py-1.5 rounded-lg text-center min-w-[100px]">
                  {lvl.comm}
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-400 font-light leading-normal">
            *Penaksiran volume penjualan novel dihitung secara berkala setiap awal bulan pada siklus pembayaran.
          </p>
        </div>

      </div>
    </div>
  );
}

// 9. Tab Bantuan & Dukungan
interface FAQItem {
  q: string;
  a: string;
}

function TabBantuan({ showToast }: { showToast: any }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [bugCat, setBugCat] = useState("teknis");
  const [bugDesc, setBugDesc] = useState("");
  const [sendingBug, setSendingBug] = useState(false);

  const faqs: FAQItem[] = [
    { q: "Bagaimana cara mencairkan royalti penjualan naskah?", a: "Saldoti dapat ditarik instan jika mencapai batas minimum Rp 50.000 via menu Penarikan Saldo, atau dikirim otomatis seturut tanggal sirkulasi yang disetujui." },
    { q: "Berapa lama proses verifikasi rekening bank baru?", a: "Verifikasi rekening komersil umumnya berlangsung real-time atau maksimal 1x24 jam kerja demi memvalidasi kecocokan nama dinas terdaftar." },
    { q: "Bagaimana sistem proteksi plagiasi melindungi karya saya?", a: "Sistem mengenkripsi naskah agar pembaca ilegal tidak bisa melakukan salin-tempel (copy-paste), serta memindai situs luar menggunakan kecerdasan buatan." }
  ];

  const handleSendBug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugDesc.trim()) {
      showToast("Isikan deskripsi kendala naskah/sistem Anda.", "error");
      return;
    }
    setSendingBug(true);
    setTimeout(() => {
      setSendingBug(false);
      setBugDesc("");
      showToast("Laporan kendala berhasil dilaporkan ke tim Support Novelpedia!");
    }, 1200);
  };

  return (
    <div className="space-y-8 text-left animate-fade-in">
      <div>
        <h3 className="text-lg font-black text-slate-900 uppercase">9. Bantuan, Dukungan, & FAQ</h3>
        <p className="text-xs text-slate-500 font-light mt-0.5">Temukan solusi cepat masalah sirkulasi dana, draf bab, atau laporkan bug teknis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Accordion FAQ + Contact Support */}
        <div className="space-y-6">
          <div className="bg-white space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 mb-3">
              <SvgIcon type="help" size={14} color="#4F46E5" /> Pertanyaan Sering Diajukan (FAQ)
            </h4>

            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-slate-250 transition-colors">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-xs font-bold text-slate-800 flex items-center justify-between gap-4 hover:bg-slate-50 cursor-pointer text-left select-none"
                  >
                    <span>{faq.q}</span>
                    <SvgIcon type="chevronRight" size={12} className={`transform duration-200 ${isOpen ? "rotate-90 text-indigo-600" : "text-slate-400"}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-600 font-light leading-relaxed animate-slide-down">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Contact details */}
          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
              <SvgIcon type="headset" size={14} color="#4F46E5" /> Hubungi Layanan Support Langsung
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-[10px]">
              <a href="mailto:supportnovelpediaindonesia@gmail.com" className="p-3 bg-white border border-slate-200 hover:border-indigo-400 rounded-xl flex flex-col items-center gap-1 cursor-pointer">
                <span className="text-[10px] text-slate-400 font-bold uppercase">SUREL RESMI</span>
                <span className="font-bold text-indigo-700 truncate max-w-full text-center">supportnovelpediaindonesia@gmail.com</span>
              </a>

              <a href="https://wa.me/6285189976660" target="_blank" rel="noreferrer" className="p-3 bg-white border border-slate-200 hover:border-emerald-400 rounded-xl flex flex-col items-center gap-1 cursor-pointer">
                <span className="text-[10px] text-slate-400 font-bold uppercase">WHATSAPP</span>
                <span className="font-bold text-emerald-600 font-mono text-center">+62 851-8997-6660</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bug / Issue reporter Form */}
        <form onSubmit={handleSendBug} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <SvgIcon type="alertTriangle" size={14} color="#EF4444" /> Laporkan Kendala atau Bug Aplikasi
          </h4>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Kategori Kendala</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <SvgIcon type="alertTriangle" size={14} />
              </span>
              <select
                value={bugCat}
                onChange={(e) => setBugCat(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 cursor-pointer outline-none"
              >
                <option value="teknis">Kesalahan Teknis (Layar macet, error naskah)</option>
                <option value="royalti">Masalah Royalti & Uang Koin</option>
                <option value="saran">Saran / Rekomendasi Fitur Sastra</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Deskripsi Masalah</label>
            <div className="relative">
              <span className="absolute top-3 left-3 text-slate-400">
                <SvgIcon type="edit3" size={14} />
              </span>
              <textarea
                placeholder="Rincikan kronologi atau masalah draf/pembayaran..."
                value={bugDesc}
                onChange={(e) => setBugDesc(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 h-24 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Drag & Drop simulated selector */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Lampiran Bukti Gambar (Opsional)</label>
            <label 
              className="border-2 border-dashed border-slate-250 bg-white hover:bg-slate-50 p-4 rounded-xl text-center cursor-pointer flex flex-col items-center gap-1"
            >
              <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={(e) => {
                 if (e.target.files && e.target.files[0]) {
                   showToast(`Berkas ${e.target.files[0].name} dipilih.`);
                 }
              }} />
              <SvgIcon type="uploadCloud" size={24} color="#64748B" />
              <span className="text-[10px] text-slate-600 font-bold">Tarik berkas atau ketuk untuk unggah bukti</span>
              <span className="text-[9px] text-slate-400">Hanya menerima JPG, PNG, GIF optimal maksimal 3MB</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={sendingBug}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 hover:text-white text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            {sendingBug ? (
              <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
            ) : (
              <SvgIcon type="send" size={14} color="#FFF" />
            )}
            <span>Kirim Laporan Bug Sastra</span>
          </button>
        </form>

      </div>

      {/* App Version Info footer inside Tab */}
      <div className="pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-bold">
        <div className="flex items-center gap-1.5">
          <SvgIcon type="info" size={12} color="#94A3B8" />
          <span>Versi Aplikasi: <span className="font-mono text-slate-600 font-medium">v2.0.1 (Premium Indie Stable)</span></span>
        </div>
        
        <button 
          onClick={() => {
            showToast("Aplikasi Novelpedia Anda terverifikasi versi paling mutakhir!");
          }}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-150 border border-slate-200 text-slate-600 font-bold rounded-lg cursor-pointer flex items-center gap-1"
        >
          <SvgIcon type="refreshCcw" size={11} color="#64748B" />
          <span>Cek Pembaharuan</span>
        </button>
      </div>
    </div>
  );
}

// 10. Tab Hapus Akun
function TabHapus({ onLogout, showToast }: { onLogout: any; showToast: any }) {
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const isEligible = check1 && check2 && check3 && confirmText.trim() === "HAPUS";

  const handleAbsoluteDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEligible) return;

    if (confirm("PERINGATAN AWAS! Ini adalah tindakan final dan tidak dapat dibatalkan. Anda yakin ingin menghapus akun Novelpedia Anda selama-lamanya?")) {
      showToast("Menginstruksikan penghapusan rujukan sirkulasi... Akun ditutup.", "error");
      setTimeout(() => {
        onLogout();
      }, 1500);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-xl mx-auto animate-fade-in">
      
      {/* Heavy Danger warning area */}
      <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center space-y-4">
        <div className="mx-auto h-14 w-14 rounded-full bg-red-100 flex items-center justify-center text-red-650">
          <SvgIcon type="alertTriangle" size={28} color="#EF4444" />
        </div>
        
        <div className="space-y-1">
          <h3 className="text-base font-black text-red-700 uppercase">Hapus Akun Novelpedia Secara Permanen</h3>
          <p className="text-xs text-slate-550 leading-relaxed font-light">
            Tindakan ini akan memotong sirkulasi royalti Anda secara penuh. Semua draf novel yang belum dirilis atau yang sedang berjalan akan dimusnahkan selamanya dari server awan kami.
          </p>
        </div>
      </div>

      <form onSubmit={handleAbsoluteDelete} className="space-y-5">
        
        {/* Safety checklist */}
        <div className="space-y-3">
          <p className="text-[10.5px] font-black uppercase text-slate-450 tracking-wider">Syarat & Persetujuan Keamanan</p>
          
          <label className="flex items-start gap-3 p-3 bg-white border border-slate-205 rounded-xl cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={check1}
              onChange={(e) => setCheck1(e.target.checked)}
              className="mt-0.5 rounded text-red-600 focus:ring-red-500 h-4 w-4" 
            />
            <span className="text-xs font-light text-slate-700">Saya mengonfirmasi sudah menarik seluruh sisa saldo komisi saku sastra Spay.</span>
          </label>

          <label className="flex items-start gap-3 p-3 bg-white border border-slate-205 rounded-xl cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={check2}
              onChange={(e) => setCheck2(e.target.checked)}
              className="mt-0.5 rounded text-red-600 focus:ring-red-500 h-4 w-4" 
            />
            <span className="text-xs font-light text-slate-700">Saya mengonfirmasi telah mengunduh (backup) seluruh berkas naskah format ZIP milik saya.</span>
          </label>

          <label className="flex items-start gap-3 p-3 bg-white border border-slate-205 rounded-xl cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={check3}
              onChange={(e) => setCheck3(e.target.checked)}
              className="mt-0.5 rounded text-red-600 focus:ring-red-500 h-4 w-4" 
            />
            <span className="text-xs font-light text-slate-700">Saya secara sadar memahami bahwa tindakan ini bersifat mutlak (irreversible).</span>
          </label>
        </div>

        {/* Confirmation code entry */}
        <div className="space-y-2">
          <label className="block text-[10.5px] font-black uppercase text-slate-450 tracking-wider">Tuliskan Verifikasi Hapus Akun</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <SvgIcon type="alertTriangle" size={14} color="#64748B" />
            </span>
            <input 
              type="text"
              placeholder="Contoh: Ketik kata 'HAPUS' di sini..."
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-205 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-red-500 font-bold"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!isEligible}
          className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-white ${
            isEligible 
              ? "bg-[#EF4444] hover:bg-red-600 hover:scale-px cursor-pointer shadow-lg shadow-red-500/20" 
              : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-250"
          }`}
        >
          <SvgIcon type="trash" size={14} color={isEligible ? "#FFF" : "#94A3B8"} />
          <span>Hancurkan Akun Saya Selamanya</span>
        </button>
      </form>
    </div>
  );
}
