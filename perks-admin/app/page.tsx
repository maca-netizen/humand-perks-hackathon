"use client"

// Safe number formatter — avoids hydration mismatch between server/client
function fmtNum(n: number): string { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }
function fmtCurrency(n: number): string { return fmtNum(n) }

import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  BarChart3, Users, Gift, CreditCard, Upload, UserPlus, Zap,
  Settings, TrendingUp, Search, Plus, Trash2, Edit3, Check,
  X, ChevronDown, ChevronRight, Calendar, Clock, Award,
  DollarSign, ArrowUpRight, ArrowDownRight, Filter, Download,
  Eye, MoreVertical, Bell, HelpCircle, Star, Repeat,
  FileText, AlertCircle, CheckCircle, ChevronLeft, Home,
  Layers, LayoutDashboard, Package, PieChart, UserCheck, Sparkles, PartyPopper, Globe,
  ShoppingCart, Wallet
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie,
  Cell, Area, AreaChart, Legend
} from "recharts";

/* ════════════════════════════════════════════
   DESIGN SYSTEM TOKENS (Humand Foundations)
   ════════════════════════════════════════════ */
const tokens = {
  colors: {
    humand: { 50:"#EDEDFC",100:"#D5D5F5",200:"#B8B8EB",300:"#8E8EE8",400:"#6B79D0",500:"#4B5EAA",600:"#3D4E94",700:"#2F3E7E",800:"#243168",900:"#1A2452",950:"#0F163A" },
    neutral: { 50:"#F2F3F7",100:"#E5E5EA",150:"#D8D8DE",200:"#CBCBD2",300:"#AEAEB4",400:"#9898A0",500:"#8E8E93",600:"#6E6E73",700:"#58585D",800:"#3A3A3F",900:"#2C2C31",950:"#1A1A2E" },
    green: { 50:"#E8FAE6",100:"#D1F5CE",200:"#A3EBA0",300:"#6FDB6A",400:"#4BC76F",500:"#34C759",600:"#2BA84A",700:"#1F893B",800:"#176D2F" },
    red: { 50:"#FEF2F2",100:"#FDE3E3",200:"#FCCCCC",300:"#F8A9A9",400:"#F27777",500:"#E53E3E",600:"#D42E2E",700:"#B22323" },
    yellow: { 50:"#FFF8E1",100:"#FFF0C2",200:"#FFE08A",300:"#FFD175",400:"#F4C340",500:"#E8B230",600:"#CC9A1D",700:"#A67D14" },
    info: { 50:"#EDF9FE",100:"#D5F1FC",200:"#B0E4F9",300:"#7DD4F5",400:"#5AC8FA",500:"#33A7FF",600:"#2B8FDB" },
    purple: { 50:"#F5F0FF",100:"#E8DFFE",200:"#D4C2FD",300:"#B99AFB",400:"#AF52DE",500:"#9633CC",600:"#7B28A8" },
    teal: { 50:"#F0FAF7",100:"#D5F2E9",400:"#4BB69F",500:"#35A48E",600:"#267B6C" },
  },
  semantic: {
    textDefault: "#1A1A2E",
    textLighter: "#8E8E93",
    textDisabled: "#AEAEB4",
    brand400: "#6B79D0",
    bgPage: "#F2F3F7",
    bgCard: "#FFFFFF",
    bgTableHeader: "#EDEDFC",
    textTableHeader: "#4B5EAA",
    border: "#E5E5EA",
    borderLight: "#F2F3F7",
  },
  shadow: {
    dp2: "0 1px 2px rgba(0,0,0,0.03)",
    dp4: "0 1px 4px rgba(0,0,0,0.04)",
    dp8: "0 4px 12px rgba(0,0,0,0.08)",
    dp12: "0 8px 24px rgba(0,0,0,0.12)",
    glow: "0 4px 14px rgba(75,94,170,0.25)",
  },
  radius: { s: 8, m: 12, l: 16, xl: 20 },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40 },
  transition: {
    fast: "all 0.2s ease",
    medium: "all 0.25s ease",
  },
};

/* ════════════════════════════════════════════
   DATA HOOK — Fetches from Supabase
   ════════════════════════════════════════════ */

const categoryColors: Record<string, string> = {
  bienestar: tokens.colors.humand[500],
  gastronomia: tokens.colors.teal[500],
  gastronomía: tokens.colors.teal[500],
  educacion: tokens.colors.purple[500],
  educación: tokens.colors.purple[500],
  entretenimiento: tokens.colors.yellow[500],
  salud: tokens.colors.red[400],
  shopping: tokens.colors.red[400],
};

const categoryEmojis: Record<string, string> = {
  salud: "🏋️", bienestar: "🧘", gastronomia: "🍕", gastronomía: "🍕",
  educacion: "📚", educación: "📚", entretenimiento: "🎬", shopping: "🛍️",
};

function normCat(s: string) { return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(date: string) {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

function useAdminData() {
  const [users, setUsers] = useState<any[]>([]);
  const [benefits, setBenefits] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [autoRulesData, setAutoRulesData] = useState<any[]>([]);
  const [bulkHistoryData, setBulkHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(k => k + 1);

  useEffect(() => {
    async function fetchAll() {
      const [uRes, bRes, tRes, wRes, arRes, bhRes] = await Promise.all([
        supabase.from("users").select("*"),
        supabase.from("benefits").select("*"),
        supabase.from("transactions").select("*, benefits(name, image_url)").order("created_at", { ascending: false }),
        supabase.from("wallets").select("*"),
        supabase.from("auto_rules").select("*").order("created_at", { ascending: false }),
        supabase.from("bulk_history").select("*").order("date", { ascending: false }),
      ]);
      setUsers(uRes.data || []);
      setBenefits(bRes.data || []);
      setTransactions(tRes.data || []);
      setWallets(wRes.data || []);
      setAutoRulesData(arRes.data || []);
      setBulkHistoryData(bhRes.data || []);
      setLoading(false);
    }
    fetchAll();
  }, [refreshKey]);

  // Derived data for dashboard
  const credits = transactions.filter(t => t.type === "credit");
  const debits = transactions.filter(t => t.type === "debit");
  const totalCredited = credits.reduce((s, t) => s + Number(t.amount), 0);
  const totalRedeemed = debits.reduce((s, t) => s + Number(t.amount), 0);
  const totalPending = Math.round((totalCredited - totalRedeemed) * 100) / 100;
  const employees = users.filter(u => u.role === "employee");

  // Users with wallet data merged
  const usersWithWallet = users.map(u => {
    const w = wallets.find(w => w.user_id === u.id);
    const userCredits = credits.filter(t => t.wallet_id === w?.id).reduce((s, t) => s + Number(t.amount), 0);
    const userSpent = debits.filter(t => t.wallet_id === w?.id).reduce((s, t) => s + Number(t.amount), 0);
    return {
      ...u,
      avatar: getInitials(u.name),
      credits: userCredits,
      spent: userSpent,
      balance: w?.balance || 0,
    };
  });

  // Benefits with redemption counts
  const benefitsWithStats = benefits.map(b => {
    const redemptionCount = debits.filter(t => t.benefit_id === b.id).length;
    return {
      ...b,
      credits: Number(b.cost),
      provider: b.merchant || "",
      status: b.active ? "active" : "paused",
      redemptions: redemptionCount,
      image: categoryEmojis[b.category?.toLowerCase()] || "🎁",
    };
  });

  // Category breakdown for pie chart
  const catCounts: Record<string, number> = {};
  debits.forEach(t => {
    const benefit = benefits.find(b => b.id === t.benefit_id);
    if (benefit) {
      const cat = benefit.category || "Otro";
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    }
  });
  const totalDebits = debits.length || 1;
  const categoryData = Object.entries(catCounts).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round((count / totalDebits) * 100),
    color: categoryColors[name.toLowerCase()] || tokens.colors.neutral[400],
  }));

  // Department usage
  const deptMap: Record<string, { total: number; spent: number }> = {};
  usersWithWallet.forEach(u => {
    if (!u.dept) return;
    if (!deptMap[u.dept]) deptMap[u.dept] = { total: 0, spent: 0 };
    deptMap[u.dept].total += u.credits || 1;
    deptMap[u.dept].spent += u.spent;
  });
  const deptUsage = Object.entries(deptMap).map(([dept, v]) => ({
    dept,
    usage: v.total > 0 ? Math.round((v.spent / v.total) * 100) : 0,
  }));

  // Recent activity from transactions
  const recentActivity = transactions.slice(0, 5).map(t => {
    const user = users.find(u => {
      const w = wallets.find(w => w.user_id === u.id);
      return w?.id === t.wallet_id;
    });
    return {
      user: user?.name || "Usuario",
      action: t.description,
      credits: t.type === "credit" ? Number(t.amount) : -Number(t.amount),
      time: timeAgo(t.created_at),
      type: t.type === "credit" ? "credit" : "redemption",
    };
  });

  // Monthly credits chart data (aggregate by month)
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const monthMap: Record<string, { cargados: number; canjeados: number }> = {};
  transactions.forEach(t => {
    const d = new Date(t.created_at);
    const key = monthNames[d.getMonth()];
    if (!monthMap[key]) monthMap[key] = { cargados: 0, canjeados: 0 };
    if (t.type === "credit") monthMap[key].cargados += Number(t.amount);
    else monthMap[key].canjeados += Number(t.amount);
  });
  const monthlyCredits = Object.entries(monthMap).map(([month, v]) => ({ month, ...v }));
  if (monthlyCredits.length === 0) monthlyCredits.push({ month: "Mar", cargados: 0, canjeados: 0 });

  // Auto rules formatted
  const autoRules = autoRulesData.map(r => ({
    ...r,
    amount: Number(r.amount),
    lastRun: r.last_run ? new Date(r.last_run).toLocaleDateString("es-AR") : "—",
  }));

  // Rule types (derived from auto_rules)
  const ruleTypes = [
    { id: 1, name: "Carga periódica", icon: "repeat", rulesCount: autoRules.filter(r => r.type === "periodic").length, usersCount: employees.length, description: "Cargas recurrentes en intervalos regulares" },
    { id: 2, name: "Cumpleaños", icon: "cake", rulesCount: autoRules.filter(r => r.trigger === "Cumpleaños").length, usersCount: employees.length, description: "Créditos automáticos en el cumpleaños" },
    { id: 3, name: "Aniversario laboral", icon: "award", rulesCount: autoRules.filter(r => r.trigger === "Aniversario").length, usersCount: employees.length, description: "Bonus por años en la empresa" },
    { id: 4, name: "Onboarding", icon: "userplus", rulesCount: autoRules.filter(r => r.trigger === "Alta de usuario").length, usersCount: employees.length, description: "Bienvenida a nuevos colaboradores" },
  ];

  // Bulk history formatted
  const bulkHistory = bulkHistoryData.map(b => ({
    ...b,
    date: new Date(b.date).toLocaleDateString("es-AR"),
    users: b.users_count,
    credits: Number(b.credits),
    total: Number(b.total),
    by: b.created_by || "—",
  }));

  return {
    loading, refresh, users: usersWithWallet, benefits: benefitsWithStats,
    transactions, totalCredited, totalRedeemed, totalPending,
    employees, categoryData, deptUsage, recentActivity,
    monthlyCredits, autoRules, ruleTypes, bulkHistory, wallets,
  };
}

/* ════════════════════════════════════════════
   SHARED COMPONENTS
   ════════════════════════════════════════════ */
const baseStyles = {
  fontFamily: "'Geist', 'Geist Fallback', system-ui, sans-serif",
  letterSpacing: "0px",
  color: tokens.semantic.textDefault,
};

function Avatar({ initials, size = 36, color = tokens.colors.humand[400] }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: tokens.colors.humand[100],
      color: tokens.colors.humand[700],
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 600, letterSpacing: "0.2px",
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function Badge({ children, variant = "default" }) {
  const variants = {
    default: { bg: tokens.colors.humand[100], color: tokens.colors.humand[700] },
    success: { bg: tokens.colors.green[100], color: tokens.colors.green[700] },
    warning: { bg: tokens.colors.yellow[100], color: tokens.colors.yellow[700] },
    error: { bg: tokens.colors.red[100], color: tokens.colors.red[700] },
    info: { bg: tokens.colors.info[100], color: tokens.colors.info[700] },
    neutral: { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[700] },
  };
  const v = variants[variant] || variants.default;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "4px 12px",
      borderRadius: 999, fontSize: 12, fontWeight: 600,
      background: v.bg, color: v.color, letterSpacing: "0px", lineHeight: 1.4,
    }}>
      {children}
    </span>
  );
}

function Button({ children, variant = "primary", size = "md", icon: Icon, onClick, style: extraStyle }) {
  const [hovered, setHovered] = useState(false);
  const sizes = {
    sm: { padding: "6px 16px", fontSize: 13 },
    md: { padding: "10px 20px", fontSize: 14 },
    lg: { padding: "14px 28px", fontSize: 15 },
  };
  const variants = {
    primary: { bg: `linear-gradient(135deg, ${tokens.colors.humand[500]}, ${tokens.colors.humand[600]})`, color: "#fff", border: "none" },
    secondary: { bg: "#fff", color: tokens.colors.humand[500], border: `1px solid ${tokens.colors.humand[300]}` },
    ghost: { bg: "transparent", color: tokens.semantic.textLighter, border: "none" },
    danger: { bg: `linear-gradient(135deg, ${tokens.colors.red[500]}, ${tokens.colors.red[600]})`, color: "#fff", border: "none" },
    gradient: { bg: `linear-gradient(135deg, ${tokens.colors.humand[500]}, ${tokens.colors.purple[500]})`, color: "#fff", border: "none" },
  };
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;
  const hoverStyle = hovered ? (
    variant === "primary" || variant === "danger" || variant === "gradient"
      ? { transform: "translateY(-1px)", boxShadow: tokens.shadow.glow }
      : variant === "secondary"
        ? { boxShadow: tokens.shadow.dp2, border: `1px solid ${tokens.colors.humand[400]}` }
        : { background: tokens.colors.neutral[100] }
  ) : {};
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        ...s, ...baseStyles, fontWeight: 600, borderRadius: tokens.radius.m,
        background: v.bg, color: v.color, border: v.border,
        cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8,
        transition: tokens.transition.fast, ...hoverStyle, ...extraStyle,
      }}>
      {Icon && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}

function Card({ children, style: extraStyle, noPadding, hoverable }: any) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={hoverable ? () => setHovered(true) : undefined}
      onMouseLeave={hoverable ? () => setHovered(false) : undefined}
      style={{
        background: tokens.semantic.bgCard,
        borderRadius: tokens.radius.l,
        boxShadow: hovered ? tokens.shadow.dp8 : tokens.shadow.dp4,
        outline: hovered ? `1px solid ${tokens.colors.humand[200]}` : "1px solid transparent",
        outlineOffset: -1,
        padding: noPadding ? 0 : 24,
        transition: tokens.transition.medium,
        ...extraStyle,
      }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, trendUp, color = tokens.colors.humand[500] }) {
  return (
    <Card hoverable style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
      <div style={{
        width: 56, height: 56, borderRadius: tokens.radius.l,
        background: `${color}18`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={26} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: tokens.semantic.textLighter, lineHeight: 1.4, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.5px" }}>{value}</div>
        {trend && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 12, color: trendUp ? tokens.colors.green[600] : tokens.colors.red[500], letterSpacing: "0.2px" }}>
            {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </div>
        )}
      </div>
    </Card>
  );
}

function SearchInput({ value, onChange, placeholder = "Buscar..." }) {
  return (
    <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
      <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: tokens.semantic.textDisabled }} />
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          ...baseStyles, width: "100%", padding: "10px 16px 10px 40px",
          border: `1px solid ${tokens.semantic.border}`, borderRadius: tokens.radius.m,
          fontSize: 14, lineHeight: 1.4, outline: "none", background: "#fff",
          boxSizing: "border-box" as const,
        }}
      />
    </div>
  );
}

function Table({ columns, data }) {
  const [hoveredRow, setHoveredRow] = useState(-1);
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", ...baseStyles, fontSize: 14, lineHeight: 1.4 }}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={{
                padding: "14px 20px", textAlign: "left", fontWeight: 600, fontSize: 12,
                letterSpacing: "0px",
                background: tokens.semantic.bgTableHeader, color: tokens.semantic.textTableHeader,
                borderBottom: `1px solid ${tokens.semantic.border}`,
                lineHeight: 1.4,
                ...(i === 0 ? { borderRadius: "12px 0 0 0" } : {}),
                ...(i === columns.length - 1 ? { borderRadius: "0 12px 0 0" } : {}),
              }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ padding: 40, textAlign: "center", color: tokens.semantic.textDisabled, fontSize: 13 }}>No hay datos disponibles</td></tr>
          ) : data.map((row, ri) => (
            <tr key={ri}
              onMouseEnter={() => setHoveredRow(ri)} onMouseLeave={() => setHoveredRow(-1)}
              style={{
                borderBottom: `1px solid ${tokens.semantic.borderLight}`,
                background: hoveredRow === ri ? tokens.colors.neutral[50] : "transparent",
                transition: tokens.transition.fast,
              }}>
              {columns.map((col, ci) => (
                <td key={ci} style={{ padding: "14px 20px", color: tokens.semantic.textDefault }}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${tokens.semantic.borderLight}`, marginBottom: 24 }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} style={{
          ...baseStyles, padding: "12px 20px", fontSize: 14, fontWeight: active === t.key ? 600 : 400,
          color: active === t.key ? tokens.colors.humand[500] : tokens.semantic.textLighter,
          background: "transparent", border: "none", cursor: "pointer",
          boxShadow: active === t.key ? `inset 0 -2px 0 ${tokens.colors.humand[500]}` : "none",
          marginBottom: -2, transition: "all 0.15s ease", letterSpacing: "0.2px",
        }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      animation: "fadeIn 0.2s ease-out",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 20, padding: 32,
        width: wide ? 640 : 480, maxHeight: "85vh", overflowY: "auto",
        boxShadow: tokens.shadow.dp12,
        animation: "fadeInUp 0.25s ease-out",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ ...baseStyles, fontSize: 20, fontWeight: 700, lineHeight: 1.3, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: tokens.semantic.textLighter, padding: 8, borderRadius: "50%" }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ ...baseStyles, display: "block", fontSize: 12, fontWeight: 600, color: tokens.semantic.textLighter, marginBottom: 6, letterSpacing: "0.2px", lineHeight: 1.4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input {...props} style={{
      ...baseStyles, width: "100%", padding: "12px 16px",
      border: `1px solid ${tokens.semantic.border}`, borderRadius: tokens.radius.m,
      fontSize: 14, lineHeight: 1.4, outline: "none", boxSizing: "border-box" as const,
      ...props.style,
    }} />
  );
}

function Select({ options, ...props }) {
  return (
    <select {...props} style={{
      ...baseStyles, width: "100%", padding: "12px 16px",
      border: `1px solid ${tokens.semantic.border}`, borderRadius: tokens.radius.m,
      fontSize: 14, lineHeight: 1.4, outline: "none", background: "#fff",
      boxSizing: "border-box" as const, ...props.style,
    }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function EmptyDrop({ label, sublabel }: { label: string, sublabel: string }) {
  return (
    <div style={{
      border: `2px dashed ${tokens.semantic.border}`, borderRadius: tokens.radius.m,
      padding: 40, textAlign: "center", color: tokens.semantic.textLighter,
    }}>
      <Upload size={32} style={{ marginBottom: 12, color: tokens.colors.humand[400] }} />
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, letterSpacing: "0.2px" }}>{label}</div>
      <div style={{ fontSize: 12, letterSpacing: "0.2px" }}>{sublabel}</div>
    </div>
  );
}

function ProgressBar({ value, max, color = tokens.colors.humand[500] }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ width: "100%", height: 8, background: tokens.colors.neutral[50], borderRadius: 4 }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.3s ease" }} />
    </div>
  );
}


/* ════════════════════════════════════════════
   PAGE: DASHBOARD
   ════════════════════════════════════════════ */
function FilteredPieChart({ data, dateFrom, dateTo }: { data: any; dateFrom?: string; dateTo?: string }) {
  const { benefits, transactions, users, wallets } = data;
  const debits = useMemo(() => {
    let d = transactions.filter((t: any) => t.type === "debit");
    if (dateFrom) d = d.filter((t: any) => new Date(t.created_at) >= new Date(dateFrom));
    if (dateTo) d = d.filter((t: any) => new Date(t.created_at) <= new Date(dateTo + "T23:59:59"));
    return d;
  }, [transactions, dateFrom, dateTo]);

  // Get unique categories and departments for filters
  const categories = [...new Set(benefits.map((b: any) => b.category).filter(Boolean))].sort() as string[];
  const departments = [...new Set(users.filter((u: any) => u.role === "employee").map((u: any) => u.dept).filter(Boolean))].sort() as string[];

  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");

  // Derive gender from user id (deterministic simulation)
  const userMeta = useMemo(() => {
    const meta: Record<string, { gender: string }> = {};
    users.forEach((u: any) => {
      const hash = (u.id || "").split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
      const gender = hash % 2 === 0 ? "Femenino" : "Masculino";
      meta[u.id] = { gender };
    });
    return meta;
  }, [users]);

  // Filter debits based on selected filters
  const filteredDebits = useMemo(() => {
    let filtered = debits;
    if (selectedDept !== "all") {
      const deptUserIds = users.filter((u: any) => u.dept === selectedDept).map((u: any) => u.id);
      const deptWalletIds = wallets.filter((w: any) => deptUserIds.includes(w.user_id)).map((w: any) => w.id);
      filtered = filtered.filter((t: any) => deptWalletIds.includes(t.wallet_id));
    }
    if (selectedGender !== "all") {
      const genderUserIds = users.filter((u: any) => userMeta[u.id]?.gender === selectedGender).map((u: any) => u.id);
      const genderWalletIds = wallets.filter((w: any) => genderUserIds.includes(w.user_id)).map((w: any) => w.id);
      filtered = filtered.filter((t: any) => genderWalletIds.includes(t.wallet_id));
    }
    return filtered;
  }, [debits, selectedDept, selectedGender, benefits, users, wallets, userMeta]);

  // Build pie data from filtered debits
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredDebits.forEach((t: any) => {
      const benefit = benefits.find((b: any) => b.id === t.benefit_id);
      if (benefit) {
        const cat = benefit.category || "Otro";
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });
    const total = filteredDebits.length || 1;
    return Object.entries(counts).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round((count / total) * 100),
      color: categoryColors[name.toLowerCase()] || tokens.colors.neutral[400],
    }));
  }, [filteredDebits, benefits]);

  const selectStyle = {
    ...baseStyles,
    padding: "6px 10px", borderRadius: tokens.radius.s, border: `1px solid ${tokens.semantic.border}`,
    fontSize: 13, background: "#fff", cursor: "pointer", minWidth: "auto", whiteSpace: "nowrap" as const,
  };

  const totalFiltered = filteredDebits.length;

  return (
    <Card style={{ marginBottom: 32 }}>
      <h3 style={{ ...baseStyles, fontSize: 16, fontWeight: 600, margin: "0 0 16px 0", lineHeight: 1.4 }}>Canjes por categoría</h3>
      {pieData.length > 0 ? (
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ flex: "0 0 280px" }}>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, fontFamily: "Roboto" }} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            {pieData.map((c, i) => {
              const count = filteredDebits.filter((t: any) => {
                const b = benefits.find((b: any) => b.id === t.benefit_id);
                return b && (b.category || "Otro").charAt(0).toUpperCase() + (b.category || "Otro").slice(1) === c.name;
              }).length;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, letterSpacing: "0.2px" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, color: tokens.semantic.textDefault }}>{c.name}</span>
                  <span style={{ color: tokens.semantic.textLighter, fontSize: 12 }}>{count} canjes</span>
                  <span style={{ fontWeight: 600, minWidth: 40, textAlign: "right" }}>{c.value}%</span>
                </div>
              );
            })}
            <div style={{ marginTop: 8, paddingTop: 12, borderTop: `1px solid ${tokens.semantic.borderLight}`, fontSize: 12, color: tokens.semantic.textLighter }}>
              Total: <span style={{ fontWeight: 600, color: tokens.semantic.textDefault }}>{totalFiltered} canjes</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: 40, color: tokens.semantic.textLighter, fontSize: 13 }}>
          Sin datos para los filtros seleccionados
        </div>
      )}
    </Card>
  );
}

function DashboardPage({ data }: { data: any }) {
  const { t } = useLanguage();
  const { employees, recentActivity } = data;

  // Monthly comparison: this month vs previous month
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  const txThisMonth = data.transactions.filter((t: any) => {
    const d = new Date(t.created_at);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const txPrevMonth = data.transactions.filter((t: any) => {
    const d = new Date(t.created_at);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  });

  const thisMonthCredited = txThisMonth.filter((t: any) => t.type === "credit").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const prevMonthCredited = txPrevMonth.filter((t: any) => t.type === "credit").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const thisMonthRedeemed = txThisMonth.filter((t: any) => t.type === "debit").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const prevMonthRedeemed = txPrevMonth.filter((t: any) => t.type === "debit").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const thisMonthAssigned = thisMonthCredited;
  const prevMonthAssigned = prevMonthCredited;
  const thisMonthRate = thisMonthCredited > 0 ? Math.round((thisMonthRedeemed / thisMonthCredited) * 100) : 0;
  const prevMonthRate = prevMonthCredited > 0 ? Math.round((prevMonthRedeemed / prevMonthCredited) * 100) : 0;

  function pctChange(curr: number, prev: number): string {
    if (prev === 0) return curr > 0 ? "+100% vs mes anterior" : "Sin cambios vs mes anterior";
    const pct = Math.round(((curr - prev) / prev) * 100);
    return `${pct >= 0 ? "+" : ""}${pct}% vs mes anterior`;
  }

  const creditedTrend = pctChange(thisMonthCredited, prevMonthCredited);
  const assignedTrend = pctChange(thisMonthAssigned, prevMonthAssigned);
  const redeemedTrend = pctChange(thisMonthRedeemed, prevMonthRedeemed);
  const rateDiff = thisMonthRate - prevMonthRate;
  const rateTrend = `${rateDiff >= 0 ? "+" : ""}${rateDiff}pp vs mes anterior`;

  // Date range filter state
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    let txs = data.transactions as any[];
    if (dateFrom) txs = txs.filter((t: any) => new Date(t.created_at) >= new Date(dateFrom));
    if (dateTo) txs = txs.filter((t: any) => new Date(t.created_at) <= new Date(dateTo + "T23:59:59"));
    return txs;
  }, [data.transactions, dateFrom, dateTo]);

  // Recalculate monthly chart data from filtered transactions
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const filteredMonthlyCredits = useMemo(() => {
    const monthMap: Record<string, { cargados: number; canjeados: number }> = {};
    filteredTransactions.forEach((t: any) => {
      const d = new Date(t.created_at);
      const key = monthNames[d.getMonth()];
      if (!monthMap[key]) monthMap[key] = { cargados: 0, canjeados: 0 };
      if (t.type === "credit") monthMap[key].cargados += Number(t.amount);
      else monthMap[key].canjeados += Number(t.amount);
    });
    const result = Object.entries(monthMap).map(([month, v]) => ({ month, ...v }));
    return result.length > 0 ? result : [{ month: "—", cargados: 0, canjeados: 0 }];
  }, [filteredTransactions]);

  // Activity filter by user
  const [activityUser, setActivityUser] = useState("all");
  const uniqueActivityUsers = [...new Set(recentActivity.map((a: any) => a.user))].sort() as string[];
  const filteredActivity = activityUser === "all"
    ? recentActivity
    : recentActivity.filter((a: any) => a.user === activityUser);

  const dateInputStyle = {
    ...baseStyles,
    padding: "6px 10px", borderRadius: tokens.radius.s, border: `1px solid ${tokens.semantic.border}`,
    fontSize: 13, background: "#fff", cursor: "pointer",
  };

  const selectStyle = {
    ...baseStyles,
    padding: "6px 10px", borderRadius: tokens.radius.s, border: `1px solid ${tokens.semantic.border}`,
    fontSize: 13, background: "#fff", cursor: "pointer", minWidth: "auto", whiteSpace: "nowrap" as const,
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ ...baseStyles, fontSize: 24, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>{t("creditsDashboard")}</h1>
        <p style={{ ...baseStyles, fontSize: 14, color: tokens.semantic.textLighter, marginTop: 4, lineHeight: 1.4 }}>
          {t("dashboardSubtitle")}
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        <StatCard label="Créditos acreditados" value={fmtNum(thisMonthCredited)} icon={DollarSign} trend={creditedTrend} trendUp={thisMonthCredited >= prevMonthCredited} color={tokens.colors.purple[500]} />
        <StatCard label="Créditos asignados a empleados" value={fmtNum(thisMonthAssigned)} icon={Users} trend={assignedTrend} trendUp={thisMonthAssigned >= prevMonthAssigned} color={tokens.colors.humand[500]} />
        <StatCard label="Créditos canjeados por empleados" value={fmtNum(thisMonthRedeemed)} icon={Gift} trend={redeemedTrend} trendUp={thisMonthRedeemed >= prevMonthRedeemed} color={tokens.colors.green[600]} />
        <StatCard label="Tasa de canje" value={`${thisMonthRate}%`} icon={TrendingUp} trend={rateTrend} trendUp={thisMonthRate >= prevMonthRate} color={tokens.colors.teal[500]} />
      </div>

      {/* Area Chart — Full Width with Date Range */}
      <Card style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <h3 style={{ ...baseStyles, fontSize: 16, fontWeight: 600, margin: 0, lineHeight: 1.4 }}>{t("creditsAssignedVsRedeemed")}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ ...baseStyles, fontSize: 12, color: tokens.semantic.textLighter }}>Desde</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={dateInputStyle} />
            <span style={{ ...baseStyles, fontSize: 12, color: tokens.semantic.textLighter }}>Hasta</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={dateInputStyle} />
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(""); setDateTo(""); }} style={{ ...baseStyles, fontSize: 11, color: tokens.colors.red[500], background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}>
                Limpiar
              </button>
            )}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={filteredMonthlyCredits}>
            <defs>
              <linearGradient id="gradLoaded" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={tokens.colors.humand[400]} stopOpacity={0.2} />
                <stop offset="95%" stopColor={tokens.colors.humand[400]} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradRedeemed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={tokens.colors.green[500]} stopOpacity={0.2} />
                <stop offset="95%" stopColor={tokens.colors.green[500]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={tokens.semantic.borderLight} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: tokens.semantic.textLighter }} />
            <YAxis tick={{ fontSize: 12, fill: tokens.semantic.textLighter }} />
            <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${tokens.semantic.border}`, fontSize: 13, fontFamily: "Roboto" }} />
            <Area type="monotone" dataKey="cargados" stroke={tokens.colors.humand[500]} fill="url(#gradLoaded)" strokeWidth={2} name={t("assigned")} />
            <Area type="monotone" dataKey="canjeados" stroke={tokens.colors.green[500]} fill="url(#gradRedeemed)" strokeWidth={2} name={t("redeemed")} />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: "Roboto" }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Pie Chart — Full Width with Filters + Date Range */}
      <FilteredPieChart data={data} dateFrom={dateFrom} dateTo={dateTo} />

      {/* Recent Activity — Full Width */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ ...baseStyles, fontSize: 16, fontWeight: 600, margin: 0, lineHeight: 1.4 }}>Actividad reciente</h3>
          <select value={activityUser} onChange={e => setActivityUser(e.target.value)} style={selectStyle}>
            <option value="all">Todos los usuarios</option>
            {uniqueActivityUsers.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, maxHeight: 320, overflowY: "auto", paddingRight: 4 }}>
          {filteredActivity.length > 0 ? filteredActivity.map((a: any, i: number) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
              borderBottom: i < filteredActivity.length - 1 ? `1px solid ${tokens.semantic.borderLight}` : "none",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: a.type === "credit" ? tokens.colors.green[100] : tokens.colors.humand[100],
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {a.type === "credit" ? <ArrowUpRight size={16} color={tokens.colors.green[600]} /> : <Gift size={16} color={tokens.colors.humand[500]} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.2px", lineHeight: 1.4 }}>{a.user}</div>
                <div style={{ fontSize: 12, color: tokens.semantic.textLighter, letterSpacing: "0.2px", lineHeight: 1.4 }}>{a.action}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: a.credits > 0 ? tokens.colors.green[600] : tokens.colors.red[500], letterSpacing: "0.2px" }}>
                  {a.credits > 0 ? "+" : ""}{a.credits.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </div>
                <div style={{ fontSize: 11, color: tokens.semantic.textDisabled, letterSpacing: "0.2px" }}>{a.time}</div>
              </div>
            </div>
          )) : (
            <div style={{ textAlign: "center", padding: 24, color: tokens.semantic.textLighter, fontSize: 13 }}>
              Sin actividad para este usuario
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}


/* ════════════════════════════════════════════
   PAGE: BULK CREDIT LOADING
   ════════════════════════════════════════════ */
function BulkLoadPage({ data }: { data: any }) {
  const { t } = useLanguage();
  const { bulkHistory } = data;
  const [showModal, setShowModal] = useState(false);
  const totalBulkCredits = bulkHistory.reduce((s: number, b: any) => s + (b.status === "completed" ? Number(b.total) : 0), 0);
  const totalBulkUsers = bulkHistory.reduce((s: number, b: any) => s + (b.status === "completed" ? Number(b.users) : 0), 0);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ ...baseStyles, fontSize: 24, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>{t("bulkCreditLoad")}</h1>
          <p style={{ ...baseStyles, fontSize: 14, color: tokens.semantic.textLighter, marginTop: 4, lineHeight: 1.4 }}>
            {t("bulkLoadSubtitle")}
          </p>
        </div>
        <Button icon={Upload} onClick={() => setShowModal(true)}>{t("newBulkLoad")}</Button>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 24 }}>
          <div style={{ textAlign: "center", padding: 16, background: tokens.colors.humand[50], borderRadius: tokens.radius.m }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: tokens.colors.humand[700], letterSpacing: "0.2px" }}>{bulkHistory.length}</div>
            <div style={{ fontSize: 12, color: tokens.semantic.textLighter, marginTop: 4, letterSpacing: "0.2px" }}>Cargas realizadas</div>
          </div>
          <div style={{ textAlign: "center", padding: 16, background: tokens.colors.green[50], borderRadius: tokens.radius.m }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: tokens.colors.green[700], letterSpacing: "0.2px" }}>{fmtNum(totalBulkCredits)}</div>
            <div style={{ fontSize: 12, color: tokens.semantic.textLighter, marginTop: 4, letterSpacing: "0.2px" }}>Créditos cargados total</div>
          </div>
          <div style={{ textAlign: "center", padding: 16, background: tokens.colors.yellow[50], borderRadius: tokens.radius.m }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: tokens.colors.yellow[700], letterSpacing: "0.2px" }}>{fmtNum(totalBulkUsers)}</div>
            <div style={{ fontSize: 12, color: tokens.semantic.textLighter, marginTop: 4, letterSpacing: "0.2px" }}>Usuarios alcanzados</div>
          </div>
        </div>
      </Card>

      <Card noPadding>
        <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ ...baseStyles, fontSize: 16, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>{t("loadHistory")}</h3>
          <Button variant="ghost" icon={Download} size="sm">{t("export")}</Button>
        </div>
        <div style={{ padding: "16px 24px 24px" }}>
          <Table
            columns={[
              { header: t("date"), key: "date" },
              { header: t("file"), key: "file", render: r => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FileText size={14} color={tokens.colors.humand[400]} />
                  <span>{r.file}</span>
                </div>
              )},
              { header: t("users"), key: "users" },
              { header: t("creditsPerUser"), key: "credits", render: r => r.credits.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") },
              { header: t("total"), key: "total", render: r => <span style={{ fontWeight: 600 }}>{r.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span> },
              { header: t("status"), key: "status", render: r => (
                <Badge variant={r.status === "completed" ? "success" : "error"}>
                  {r.status === "completed" ? t("completed") : t("failed")}
                </Badge>
              )},
              { header: t("createdBy"), key: "by" },
            ]}
            data={bulkHistory}
          />
        </div>
      </Card>

      {showModal && (
        <Modal title={t("newBulkLoad")} onClose={() => setShowModal(false)} wide>
          {/* Download CSV template */}
          <div style={{ marginBottom: 20 }}>
            <Button variant="secondary" icon={Download} size="sm" onClick={() => {
              const csv = "email,creditos\nmaria@novatech.com,20\njuan@novatech.com,20\nana@novatech.com,15\n";
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = "plantilla_carga_creditos.csv"; a.click();
              URL.revokeObjectURL(url);
              toast.success(t("csvTemplateDownloaded"));
            }}>{t("downloadTemplate")}</Button>
          </div>
          {/* Upload CSV */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center",
              padding: 32, borderRadius: tokens.radius.m, cursor: "pointer",
              borderTop: `2px dashed ${tokens.semantic.border}`, borderRight: `2px dashed ${tokens.semantic.border}`,
              borderBottom: `2px dashed ${tokens.semantic.border}`, borderLeft: `2px dashed ${tokens.semantic.border}`,
              background: tokens.colors.neutral[50], transition: tokens.transition.fast,
            }}>
              <Upload size={28} color={tokens.colors.humand[400]} style={{ marginBottom: 8 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: tokens.semantic.textDefault }}>{t("uploadCSV")}</span>
              <span style={{ fontSize: 12, color: tokens.semantic.textLighter, marginTop: 4 }}>{t("dragDropCSV")}</span>
              <input type="file" accept=".csv" style={{ display: "none" }} onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) toast.success(`${t("fileSelected")}: ${file.name}`);
              }} />
            </label>
          </div>
          <div style={{ padding: 12, background: tokens.colors.info[50], borderRadius: tokens.radius.s, fontSize: 12, color: tokens.colors.info[600], lineHeight: 1.5, marginBottom: 16 }}>
            <strong>{t("csvFormatLabel")}:</strong> {t("csvFormatDesc")}
          </div>
          <FormField label={t("creditsPerUserField")}>
            <Input type="number" placeholder="20" />
          </FormField>
          <FormField label={t("loadReason")}>
            <Input placeholder={t("loadReasonPlaceholder")} />
          </FormField>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>{t("cancel")}</Button>
            <Button icon={Upload} onClick={() => { toast.success(t("bulkLoadSuccess")); setShowModal(false); }}>{t("processLoad")}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}


/* ════════════════════════════════════════════
   PAGE: INDIVIDUAL CREDIT LOADING
   ════════════════════════════════════════════ */
function IndividualLoadPage({ data, onRefresh }: { data: any; onRefresh: () => void }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [loadAmount, setLoadAmount] = useState("");
  const [loadReason, setLoadReason] = useState("");
  const [loadNote, setLoadNote] = useState("");
  const [loadingCredits, setLoadingCredits] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleLoadCredits = async () => {
    if (!selected || !loadAmount || Number(loadAmount) <= 0) return;
    setLoadingCredits(true);
    try {
      const reasons: Record<string, string> = { bonus: "Bonus especial", adjustment: "Ajuste", compensation: "Compensación", other: "Otro" };
      const desc = (reasons[loadReason] || "Carga manual") + (loadNote ? ` - ${loadNote}` : "");
      const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", selected.id).single();
      if (!wallet) throw new Error("Wallet not found");
      const newBalance = Math.round((Number(wallet.balance) + Number(loadAmount)) * 100) / 100;
      await supabase.from("wallets").update({ balance: newBalance, updated_at: new Date().toISOString() }).eq("id", wallet.id);
      await supabase.from("transactions").insert({ user_id: selected.id, wallet_id: wallet.id, type: "credit", amount: Number(loadAmount), description: desc });
      toast.success(`Se cargaron ${loadAmount} créditos a ${selected.name}`);
      setShowModal(false); setSelected(null); setLoadAmount(""); setLoadReason(""); setLoadNote(""); onRefresh();
    } catch (e) { console.error(e); toast.error("Error al cargar créditos"); }
    setLoadingCredits(false);
  };

  const filtered = data.users.filter((u: any) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.dept || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ ...baseStyles, fontSize: 24, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>{t("employees")}</h1>
          <p style={{ ...baseStyles, fontSize: 14, color: tokens.semantic.textLighter, marginTop: 4, lineHeight: 1.4 }}>
            {t("employeesSubtitle")}
          </p>
        </div>
        <Button icon={Upload} onClick={() => setShowBulkModal(true)}>{t("bulkLoad")}</Button>
      </div>

      <Card noPadding>
        <div style={{ padding: "20px 24px", display: "flex", gap: 12, alignItems: "center" }}>
          <SearchInput value={search} onChange={setSearch} placeholder={t("searchByNameEmailDept")} />
          <Button variant="secondary" icon={Filter} size="md">{t("filters")}</Button>
        </div>
        <div style={{ padding: "0 24px 24px" }}>
          <Table
            columns={[
              { header: t("employee"), key: "name", render: r => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar initials={r.avatar} size={32} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: "0.2px" }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>{r.email}</div>
                  </div>
                </div>
              )},
              { header: t("department"), key: "dept", render: r => <Badge variant="neutral">{r.dept}</Badge> },
              { header: t("loadedCredits"), key: "credits", render: r => r.credits.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") },
              { header: t("usedCredits"), key: "spent", render: r => r.spent.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") },
              { header: t("available"), key: "available", render: r => {
                const avail = r.balance;
                return <span style={{ fontWeight: 600, color: avail > 0 ? tokens.colors.green[600] : tokens.colors.red[500] }}>{avail.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>;
              }},
              { header: t("status"), key: "status", render: r => (
                <Badge variant={r.status === "active" ? "success" : "error"}>
                  {r.status === "active" ? t("active") : t("inactive")}
                </Badge>
              )},
              { header: t("actions"), key: "actions", render: r => (
                <Button variant="secondary" size="sm" icon={Plus} onClick={() => { setSelected(r); setShowModal(true); }}>
                  {t("load")}
                </Button>
              )},
            ]}
            data={filtered}
          />
        </div>
      </Card>

      {showModal && selected && (
        <Modal title={`${t("loadCredits")} — ${selected.name}`} onClose={() => { setShowModal(false); setSelected(null); }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, background: tokens.colors.neutral[50], borderRadius: tokens.radius.m, marginBottom: 20 }}>
            <Avatar initials={selected.avatar} size={40} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: "0.2px" }}>{selected.name}</div>
              <div style={{ fontSize: 12, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>{selected.email} · {selected.dept}</div>
              <div style={{ fontSize: 12, color: tokens.colors.green[600], marginTop: 2, letterSpacing: "0.2px" }}>
                {t("available")}: {selected.balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {t("creditsLabel")}
              </div>
            </div>
          </div>
          {successMsg ? (
            <div style={{ padding: 20, textAlign: "center", color: tokens.colors.green[700], background: tokens.colors.green[50], borderRadius: tokens.radius.m }}>
              <CheckCircle size={32} style={{ marginBottom: 8 }} />
              <div style={{ fontWeight: 600, fontSize: 14 }}>{successMsg}</div>
            </div>
          ) : (
            <>
              <FormField label={t("creditAmount")}>
                <Input type="number" placeholder="Ej: 5" value={loadAmount} onChange={(e: any) => setLoadAmount(e.target.value)} />
              </FormField>
              <FormField label={t("reason")}>
                <Select value={loadReason} onChange={(e: any) => setLoadReason(e.target.value)} options={[
                  { value: "", label: t("selectReason") },
                  { value: "bonus", label: t("specialBonus") },
                  { value: "adjustment", label: t("adjustment") },
                  { value: "compensation", label: t("compensation") },
                  { value: "other", label: t("other") },
                ]} />
              </FormField>
              <FormField label={t("note")}>
                <Input placeholder={t("commentPlaceholder")} value={loadNote} onChange={(e: any) => setLoadNote(e.target.value)} />
              </FormField>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
                <Button variant="secondary" onClick={() => { setShowModal(false); setSelected(null); }}>{t("cancel")}</Button>
                <Button icon={CreditCard} onClick={handleLoadCredits}>{loadingCredits ? "Cargando..." : t("loadCredits")}</Button>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* Bulk load modal */}
      {showBulkModal && (
        <Modal title={t("bulkCreditLoad")} onClose={() => setShowBulkModal(false)} wide>
          <div style={{ marginBottom: 20 }}>
            <Button variant="secondary" icon={Download} size="sm" onClick={() => {
              const csv = "email,creditos\nmaria@novatech.com,20\njuan@novatech.com,20\nana@novatech.com,15\n";
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = "plantilla_carga_creditos.csv"; a.click();
              URL.revokeObjectURL(url);
              toast.success(t("csvTemplateDownloaded"));
            }}>{t("downloadTemplate")}</Button>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center",
              padding: 32, borderRadius: tokens.radius.m, cursor: "pointer",
              borderTop: `2px dashed ${tokens.semantic.border}`, borderRight: `2px dashed ${tokens.semantic.border}`,
              borderBottom: `2px dashed ${tokens.semantic.border}`, borderLeft: `2px dashed ${tokens.semantic.border}`,
              background: tokens.colors.neutral[50], transition: tokens.transition.fast,
            }}>
              <Upload size={28} color={tokens.colors.humand[400]} style={{ marginBottom: 8 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: tokens.semantic.textDefault }}>{t("uploadCSV")}</span>
              <span style={{ fontSize: 12, color: tokens.semantic.textLighter, marginTop: 4 }}>{t("dragDropCSV")}</span>
              <input type="file" accept=".csv" style={{ display: "none" }} onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) toast.success(`${t("fileSelected")}: ${file.name}`);
              }} />
            </label>
          </div>
          <div style={{ padding: 12, background: tokens.colors.info[50], borderRadius: tokens.radius.s, fontSize: 12, color: tokens.colors.info[600], lineHeight: 1.5, marginBottom: 16 }}>
            <strong>{t("csvFormatLabel")}:</strong> {t("csvFormatDesc")}
          </div>
          <FormField label={t("creditsPerUserField")}>
            <Input type="number" placeholder="20" />
          </FormField>
          <FormField label={t("loadReason")}>
            <Input placeholder={t("loadReasonPlaceholder")} />
          </FormField>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
            <Button variant="secondary" onClick={() => setShowBulkModal(false)}>{t("cancel")}</Button>
            <Button icon={Upload} onClick={() => { toast.success(t("bulkLoadSuccess")); setShowBulkModal(false); }}>{t("processLoad")}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}


/* ════════════════════════════════════════════
   PAGE: AUTOMATIC RULES (2 tabs: Asignación + Generación)
   ════════════════════════════════════════════ */

function AutoRulesPage({ data, onRefresh }: { data: any; onRefresh: () => void }) {
  const { t } = useLanguage();
  const { autoRules } = data;

  const [tab, setTab] = useState<"assignment" | "generation">("assignment");
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Assignment form
  const [formName, setFormName] = useState("");
  const [formTrigger, setFormTrigger] = useState("");
  const [formPeriodicity, setFormPeriodicity] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formTarget, setFormTarget] = useState("all");
  const [formExpiration, setFormExpiration] = useState("");

  // Generation form
  const [genFormName, setGenFormName] = useState("");
  const [genFormEvent, setGenFormEvent] = useState("");
  const [genFormAmount, setGenFormAmount] = useState("");
  const [genFormLimit, setGenFormLimit] = useState("");
  const [genFormMaxAccum, setGenFormMaxAccum] = useState("");

  // Courses for generation tab
  const [courses, setCourses] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("courses").select("*").eq("active", true).then(({ data: d }) => setCourses(d || []));
  }, []);

  // Derived
  const assignmentRules = autoRules.filter((r: any) => r.type === "periodic" || r.type === "assignment");
  const generationRules = autoRules.filter((r: any) => r.type === "generation");

  // Default generation examples (shown if no generation rules exist in DB)
  const defaultGenExamples = [
    { id: "_def1", name: "Completar curso de capacitación", trigger: "Curso completado", amount: 5, target: "Sin límite", status: "active", type: "generation", isDefault: true },
    { id: "_def2", name: "Completar lección de Learning", trigger: "Lección completada", amount: 2, target: "Sin límite", status: "active", type: "generation", isDefault: true },
    { id: "_def3", name: "Aprobar evaluación de desempeño", trigger: "Evaluación aprobada", amount: 10, target: "Límite: 1 vez/año", status: "active", type: "generation", isDefault: true },
    { id: "_def4", name: "Referir candidato contratado", trigger: "Referido contratado", amount: 20, target: "Límite: 5 por colaborador", status: "active", type: "generation", isDefault: true },
  ];
  const displayGenRules = generationRules.length > 0 ? generationRules : defaultGenExamples;

  const resetForm = () => {
    setFormName(""); setFormTrigger(""); setFormPeriodicity("");
    setFormAmount(""); setFormTarget("all"); setFormExpiration("");
    setGenFormName(""); setGenFormEvent(""); setGenFormAmount("");
    setGenFormLimit(""); setGenFormMaxAccum("");
    setEditingRule(null);
  };

  const triggerLabelMap: Record<string, string> = {
    periodic: "Periódico", birthday: "Cumpleaños", anniversary: "Aniversario", onboarding: "Alta de usuario",
  };
  const triggerReverseMap: Record<string, string> = {
    "Periódico": "periodic", "Cumpleaños": "birthday", "Aniversario": "anniversary", "Alta de usuario": "onboarding",
  };
  const targetLabelMap: Record<string, string> = {
    all: "Todos los colaboradores", dept: "Departamento", group: "Grupo específico",
  };
  const targetReverseMap: Record<string, string> = {
    "Todos los colaboradores": "all", "Departamento": "dept", "Grupo específico": "group",
  };
  const eventLabelMap: Record<string, string> = {
    course: "Curso completado", lesson: "Lección completada", evaluation: "Evaluación aprobada",
    referral: "Referido contratado", survey: "Encuesta completada", custom: "Personalizado",
  };
  const eventReverseMap: Record<string, string> = {
    "Curso completado": "course", "Lección completada": "lesson", "Evaluación aprobada": "evaluation",
    "Referido contratado": "referral", "Encuesta completada": "survey",
  };

  const openEditModal = (rule: any) => {
    setEditingRule(rule);
    if (rule.type === "periodic" || rule.type === "assignment") {
      setFormName(rule.name);
      setFormTrigger(triggerReverseMap[rule.trigger] || "periodic");
      setFormAmount(String(rule.amount));
      setFormTarget(targetReverseMap[rule.target] || "all");
      setFormPeriodicity(rule.periodicity || "");
    } else {
      setGenFormName(rule.name);
      setGenFormEvent(eventReverseMap[rule.trigger] || "custom");
      setGenFormAmount(String(rule.amount));
      // Parse limit from target string
      const limitMatch = rule.target?.match(/Límite:\s*(\d+)/);
      const maxMatch = rule.target?.match(/Max:\s*(\d+)/);
      setGenFormLimit(limitMatch ? limitMatch[1] : "");
      setGenFormMaxAccum(maxMatch ? maxMatch[1] : "");
    }
    setShowModal(true);
  };

  // ── CRUD Handlers ──
  const handleToggleStatus = async (rule: any) => {
    if (rule.isDefault) { toast.error("Guardá la regla primero para cambiar su estado"); return; }
    setTogglingId(rule.id);
    try {
      const newStatus = rule.status === "active" ? "paused" : "active";
      await supabase.from("auto_rules").update({ status: newStatus }).eq("id", rule.id);
      toast.success(`Regla ${newStatus === "active" ? "activada" : "pausada"}`);
      onRefresh();
    } catch (e) {
      console.error(e);
      toast.error("Error al cambiar estado");
    }
    setTogglingId(null);
  };

  const handleDelete = async (rule: any) => {
    if (rule.isDefault) { toast.error("Esta es una regla de ejemplo. Creala primero para poder eliminarla."); return; }
    try {
      await supabase.from("auto_rules").delete().eq("id", rule.id);
      toast.success("Regla eliminada");
      setConfirmDeleteId(null);
      onRefresh();
    } catch (e) {
      console.error(e);
      toast.error("Error al eliminar regla");
    }
  };

  const handleSaveAssignment = async () => {
    if (!formName || !formTrigger || !formAmount) { toast.error("Completá los campos obligatorios"); return; }
    setSaving(true);
    try {
      const ruleData = {
        name: formName,
        type: "periodic",
        trigger: triggerLabelMap[formTrigger] || formTrigger,
        amount: Number(formAmount),
        target: targetLabelMap[formTarget] || formTarget,
        periodicity: formPeriodicity || null,
        status: "active",
      };
      if (editingRule) {
        await supabase.from("auto_rules").update(ruleData).eq("id", editingRule.id);
        toast.success("Regla actualizada");
      } else {
        const id = `ar_${Math.random().toString(36).substring(2, 10)}`;
        await supabase.from("auto_rules").insert({ id, ...ruleData, created_at: new Date().toISOString() });
        toast.success("Regla de asignación creada");
      }
      resetForm(); setShowModal(false); onRefresh();
    } catch (e) { console.error(e); toast.error("Error al guardar regla"); }
    setSaving(false);
  };

  const handleSaveGeneration = async () => {
    if (!genFormName || !genFormEvent || !genFormAmount) { toast.error("Completá los campos obligatorios"); return; }
    setSaving(true);
    try {
      const limitStr = genFormLimit ? `Límite: ${genFormLimit}` : "Sin límite";
      const maxStr = genFormMaxAccum ? `, Max: ${genFormMaxAccum}` : "";
      const ruleData = {
        name: genFormName,
        type: "generation",
        trigger: eventLabelMap[genFormEvent] || genFormEvent,
        amount: Number(genFormAmount),
        target: `${limitStr}${maxStr}`,
        status: "active",
      };
      if (editingRule && !editingRule.isDefault) {
        await supabase.from("auto_rules").update(ruleData).eq("id", editingRule.id);
        toast.success("Regla actualizada");
      } else {
        const id = `ar_${Math.random().toString(36).substring(2, 10)}`;
        await supabase.from("auto_rules").insert({ id, ...ruleData, created_at: new Date().toISOString() });
        toast.success("Regla de generación creada");
      }
      resetForm(); setShowModal(false); onRefresh();
    } catch (e) { console.error(e); toast.error("Error al guardar regla"); }
    setSaving(false);
  };

  // ── Toggle button component ──
  const ToggleStatusBtn = ({ rule }: { rule: any }) => (
    <button onClick={() => handleToggleStatus(rule)} disabled={togglingId === rule.id}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px",
        borderRadius: 999, cursor: rule.isDefault ? "default" : "pointer", border: "none", fontSize: 12, fontWeight: 600,
        background: rule.status === "active" ? tokens.colors.green[100] : tokens.colors.yellow[100],
        color: rule.status === "active" ? tokens.colors.green[700] : tokens.colors.yellow[700],
        transition: tokens.transition.fast, opacity: togglingId === rule.id ? 0.5 : 1,
      }}>
      {rule.status === "active" ? <Check size={12} /> : <X size={12} />}
      {togglingId === rule.id ? "..." : (rule.status === "active" ? "Activa" : "Pausada")}
    </button>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ ...baseStyles, fontSize: 24, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>Reglas automáticas</h1>
        <p style={{ ...baseStyles, fontSize: 14, color: tokens.semantic.textLighter, marginTop: 4, lineHeight: 1.4 }}>
          Configurá la asignación y generación automática de créditos
        </p>
      </div>

      <Tabs
        tabs={[
          { key: "assignment", label: "Reglas de asignación" },
          { key: "generation", label: "Reglas de generación" },
        ]}
        active={tab}
        onChange={k => setTab(k as any)}
      />

      {/* ══ TAB 1: REGLAS DE ASIGNACIÓN ══ */}
      {tab === "assignment" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ ...baseStyles, fontSize: 18, fontWeight: 600, margin: 0 }}>Reglas de asignación</h2>
              <p style={{ ...baseStyles, fontSize: 13, color: tokens.semantic.textLighter, marginTop: 2 }}>
                Distribuir créditos a colaboradores de forma automática
              </p>
            </div>
            <Button icon={Plus} onClick={() => { resetForm(); setShowModal(true); }}>Nueva regla</Button>
          </div>

          <Card noPadding>
            <Table
              columns={[
                { header: "Regla", key: "name", render: (r: any) => (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: tokens.radius.m, flexShrink: 0,
                      background: tokens.colors.humand[50],
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Repeat size={18} color={tokens.colors.humand[600]} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: "0.2px" }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: tokens.semantic.textLighter }}>{r.trigger}</div>
                    </div>
                  </div>
                )},
                { header: "Créditos", key: "amount", render: (r: any) => <span style={{ fontWeight: 600 }}>{fmtNum(r.amount)}</span> },
                { header: "Aplica a", key: "target" },
                { header: "Periodicidad", key: "periodicity", render: (r: any) => r.periodicity || "—" },
                { header: "Última ejecución", key: "lastRun", render: (r: any) => r.lastRun || "—" },
                { header: "Estado", key: "status", render: (r: any) => <ToggleStatusBtn rule={r} /> },
                { header: "Acciones", key: "actions", render: (r: any) => (
                  <div style={{ display: "flex", gap: 4 }}>
                    <Button variant="ghost" size="sm" icon={Edit3} onClick={() => openEditModal(r)}>Editar</Button>
                    {confirmDeleteId === r.id ? (
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(r)}>Confirmar</Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)}>No</Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setConfirmDeleteId(r.id)} />
                    )}
                  </div>
                )},
              ]}
              data={assignmentRules}
            />
          </Card>

          {assignmentRules.length === 0 && (
            <div style={{ textAlign: "center", padding: 48, color: tokens.semantic.textLighter }}>
              <Zap size={32} style={{ marginBottom: 8, color: tokens.semantic.textDisabled }} />
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Sin reglas de asignación</div>
              <div style={{ fontSize: 13 }}>Creá una nueva regla para distribuir créditos automáticamente</div>
            </div>
          )}
        </div>
      )}

      {/* ══ TAB 2: REGLAS DE GENERACIÓN ══ */}
      {tab === "generation" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ ...baseStyles, fontSize: 18, fontWeight: 600, margin: 0 }}>Reglas de generación</h2>
              <p style={{ ...baseStyles, fontSize: 13, color: tokens.semantic.textLighter, marginTop: 2 }}>
                Otorgan créditos cuando se completan logros
              </p>
            </div>
            <Button icon={Plus} onClick={() => { resetForm(); setShowModal(true); }}>Nueva regla</Button>
          </div>

          {/* Info banner: Learning connection */}
          <div style={{
            padding: 16, background: tokens.colors.info[50], borderRadius: tokens.radius.m,
            marginBottom: 24, display: "flex", gap: 12, alignItems: "flex-start",
            border: `1px solid ${tokens.colors.info[200]}`,
          }}>
            <AlertCircle size={20} color={tokens.colors.info[600]} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: tokens.semantic.textDefault, marginBottom: 4 }}>
                Conectado con el módulo de Learning
              </div>
              <div style={{ fontSize: 13, color: tokens.semantic.textLighter, lineHeight: 1.5 }}>
                Cuando seleccionás <strong>Completar curso</strong> o <strong>Completar lección</strong>, los créditos se otorgan automáticamente
                cuando el colaborador finaliza el contenido en Learning. Las reglas de generación están diseñadas para incentivar
                la formación continua y el logro de objetivos.
              </div>
            </div>
          </div>

          {/* Generation rules table */}
          <Card noPadding>
            <Table
              columns={[
                { header: "Regla", key: "name", render: (r: any) => (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: tokens.radius.m, flexShrink: 0,
                      background: tokens.colors.purple[50],
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Sparkles size={18} color={tokens.colors.purple[600]} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: "0.2px" }}>{r.name}</div>
                      {r.isDefault && <div style={{ fontSize: 11, color: tokens.colors.purple[500] }}>Ejemplo pre-cargado</div>}
                    </div>
                  </div>
                )},
                { header: "Evento", key: "trigger" },
                { header: "Créditos/logro", key: "amount", render: (r: any) => <span style={{ fontWeight: 600 }}>{fmtNum(r.amount)}</span> },
                { header: "Límite", key: "target" },
                { header: "Estado", key: "status", render: (r: any) => <ToggleStatusBtn rule={r} /> },
                { header: "Acciones", key: "actions", render: (r: any) => (
                  <div style={{ display: "flex", gap: 4 }}>
                    <Button variant="ghost" size="sm" icon={Edit3} onClick={() => openEditModal(r)}>Editar</Button>
                    {!r.isDefault && (
                      confirmDeleteId === r.id ? (
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(r)}>Confirmar</Button>
                          <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)}>No</Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setConfirmDeleteId(r.id)} />
                      )
                    )}
                  </div>
                )},
              ]}
              data={displayGenRules}
            />
          </Card>

          {/* Active courses summary */}
          {courses.length > 0 && (
            <Card style={{ marginTop: 24 }}>
              <h3 style={{ ...baseStyles, fontSize: 16, fontWeight: 600, margin: "0 0 16px 0" }}>Cursos activos con créditos</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {courses.map((c: any) => (
                  <div key={c.id} style={{
                    padding: 14, border: `1px solid ${tokens.semantic.borderLight}`,
                    borderRadius: tokens.radius.m, background: "#fff",
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: tokens.semantic.textLighter }}>
                      <Award size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
                      {c.credits_reward} créditos al completar
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ══ MODAL: Create / Edit Rule ══ */}
      {showModal && (
        <Modal
          title={editingRule ? "Editar regla" : (tab === "assignment" ? "Nueva regla de asignación" : "Nueva regla de generación")}
          onClose={() => { setShowModal(false); resetForm(); }}
          wide
        >
          {tab === "assignment" ? (
            <>
              <FormField label="Nombre de la regla">
                <Input placeholder="Ej: Asignación mensual" value={formName} onChange={(e: any) => setFormName(e.target.value)} />
              </FormField>
              <FormField label="Tipo de trigger">
                <Select value={formTrigger} onChange={(e: any) => setFormTrigger(e.target.value)} options={[
                  { value: "", label: "Seleccionar tipo..." },
                  { value: "periodic", label: "Periódico (diario, semanal, mensual, etc.)" },
                  { value: "birthday", label: "Evento: Cumpleaños" },
                  { value: "anniversary", label: "Evento: Aniversario laboral" },
                  { value: "onboarding", label: "Evento: Alta de usuario" },
                ]} />
              </FormField>
              {formTrigger === "periodic" && (
                <FormField label="Periodicidad">
                  <Select value={formPeriodicity} onChange={(e: any) => setFormPeriodicity(e.target.value)} options={[
                    { value: "", label: "Seleccionar..." },
                    { value: "daily", label: "Diario" },
                    { value: "weekly", label: "Semanal" },
                    { value: "monthly", label: "Mensual" },
                    { value: "quarterly", label: "Trimestral" },
                    { value: "yearly", label: "Anual" },
                  ]} />
                </FormField>
              )}
              <FormField label="Créditos a asignar">
                <Input type="number" placeholder="1000" value={formAmount} onChange={(e: any) => setFormAmount(e.target.value)} />
              </FormField>
              <FormField label="Aplicar a">
                <Select value={formTarget} onChange={(e: any) => setFormTarget(e.target.value)} options={[
                  { value: "all", label: "Todos los colaboradores" },
                  { value: "dept", label: "Departamento" },
                  { value: "group", label: "Grupo específico" },
                ]} />
              </FormField>
              <FormField label="Fecha de expiración (opcional)">
                <Input type="date" value={formExpiration} onChange={(e: any) => setFormExpiration(e.target.value)} />
              </FormField>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
                <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancelar</Button>
                <Button icon={Zap} onClick={handleSaveAssignment}>
                  {saving ? "Guardando..." : (editingRule ? "Guardar cambios" : "Crear regla")}
                </Button>
              </div>
            </>
          ) : (
            <>
              <FormField label="Nombre de la regla">
                <Input placeholder="Ej: Completar curso de capacitación" value={genFormName} onChange={(e: any) => setGenFormName(e.target.value)} />
              </FormField>
              <FormField label="Evento que genera créditos">
                <Select value={genFormEvent} onChange={(e: any) => setGenFormEvent(e.target.value)} options={[
                  { value: "", label: "Seleccionar evento..." },
                  { value: "course", label: "Completar curso" },
                  { value: "lesson", label: "Completar lección" },
                  { value: "evaluation", label: "Aprobar evaluación de desempeño" },
                  { value: "referral", label: "Referir candidato contratado" },
                  { value: "survey", label: "Completar encuesta" },
                  { value: "custom", label: "Personalizado" },
                ]} />
              </FormField>
              {(genFormEvent === "course" || genFormEvent === "lesson") && (
                <div style={{
                  padding: 12, background: tokens.colors.info[50], borderRadius: tokens.radius.s,
                  fontSize: 12, color: tokens.semantic.textLighter, lineHeight: 1.5, marginBottom: 8,
                }}>
                  💡 Los créditos se otorgan automáticamente cuando el colaborador finaliza el contenido en el módulo de Learning.
                </div>
              )}
              <FormField label="Créditos por logro">
                <Input type="number" placeholder="5" value={genFormAmount} onChange={(e: any) => setGenFormAmount(e.target.value)} />
              </FormField>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <FormField label="Límite por colaborador (opcional)">
                  <Input type="number" placeholder="Ej: 3 veces" value={genFormLimit} onChange={(e: any) => setGenFormLimit(e.target.value)} />
                </FormField>
                <FormField label="Máximo acumulable (opcional)">
                  <Input type="number" placeholder="Ej: 50 créditos" value={genFormMaxAccum} onChange={(e: any) => setGenFormMaxAccum(e.target.value)} />
                </FormField>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
                <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancelar</Button>
                <Button icon={Sparkles} onClick={handleSaveGeneration}>
                  {saving ? "Guardando..." : (editingRule ? "Guardar cambios" : "Crear regla")}
                </Button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}


/* ════════════════════════════════════════════
   PAGE: BENEFITS MANAGEMENT
   ════════════════════════════════════════════ */
/* Predefined benefit catalog that admins can publish */
const BENEFIT_CATALOG = [
  { name: "Gimnasio SmartFit", category: "salud", provider: "SmartFit", cost: 8, description: "Acceso mensual a cualquier sede SmartFit", image: "🏋️", image_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=200&fit=crop" },
  { name: "Sesión de nutrición", category: "salud", provider: "NutriPlan", cost: 5, description: "Consulta personalizada con nutricionista", image: "🥗", image_url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=200&fit=crop" },
  { name: "Chequeo médico anual", category: "salud", provider: "MedCheck", cost: 12, description: "Chequeo médico preventivo completo", image: "🩺", image_url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=200&fit=crop" },
  { name: "Clase de yoga", category: "bienestar", provider: "ZenFlow", cost: 3, description: "Clase grupal de yoga y meditación", image: "🧘", image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=200&fit=crop" },
  { name: "Día de spa", category: "bienestar", provider: "RelaxSpa", cost: 10, description: "Jornada de relajación y masajes", image: "💆", image_url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=200&fit=crop" },
  { name: "Sesión de terapia", category: "bienestar", provider: "MindWell", cost: 6, description: "Sesión individual con psicólogo", image: "🧠", image_url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=200&fit=crop" },
  { name: "Almuerzo gourmet", category: "gastronomía", provider: "FoodBox", cost: 4, description: "Almuerzo saludable delivery en la oficina", image: "🍕", image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=200&fit=crop" },
  { name: "Coffee break premium", category: "gastronomía", provider: "CaféSelect", cost: 2, description: "Café de especialidad y snacks", image: "☕", image_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=200&fit=crop" },
  { name: "Cena para dos", category: "gastronomía", provider: "RestóClub", cost: 15, description: "Cena en restaurantes seleccionados", image: "🍽️", image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop" },
  { name: "Curso de inglés", category: "educación", provider: "LangPro", cost: 7, description: "Mes de clases de inglés online", image: "📚", image_url: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=200&fit=crop" },
  { name: "Curso Udemy", category: "educación", provider: "Udemy", cost: 5, description: "Acceso a un curso en Udemy Business", image: "🎓", image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop" },
  { name: "Certificación profesional", category: "educación", provider: "Coursera", cost: 20, description: "Certificación en Coursera o similar", image: "📜", image_url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop" },
  { name: "Entrada de cine", category: "entretenimiento", provider: "Cinemark", cost: 3, description: "Entrada para cualquier función", image: "🎬", image_url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=200&fit=crop" },
  { name: "Streaming mensual", category: "entretenimiento", provider: "Multi", cost: 4, description: "Netflix, Spotify o Disney+ por un mes", image: "📺", image_url: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&h=200&fit=crop" },
  { name: "Escape room", category: "entretenimiento", provider: "EscapeAR", cost: 6, description: "Experiencia de escape room para equipo", image: "🔐", image_url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&h=200&fit=crop" },
  { name: "Gift card shopping", category: "shopping", provider: "MercadoLibre", cost: 10, description: "Gift card canjeable en MercadoLibre", image: "🛍️", image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=200&fit=crop" },
  { name: "Día libre", category: "bienestar", provider: "Interno", cost: 15, description: "Un día libre adicional para uso personal", image: "🏖️", image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=200&fit=crop" },
  { name: "Home office kit", category: "bienestar", provider: "TechStore", cost: 12, description: "Kit de accesorios para home office", image: "💻", image_url: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=200&fit=crop" },
];

const BENEFIT_CATEGORIES = [
  { key: "todas", label: "Todas", icon: "🎁" },
  { key: "salud", label: "Salud", icon: "🏋️" },
  { key: "bienestar", label: "Bienestar", icon: "🧘" },
  { key: "gastronomía", label: "Gastronomía", icon: "🍕" },
  { key: "educación", label: "Educación", icon: "📚" },
  { key: "entretenimiento", label: "Entretenimiento", icon: "🎬" },
  { key: "shopping", label: "Shopping", icon: "🛍️" },
];

function BenefitsPage({ data }: { data: any }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [showCatalog, setShowCatalog] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [editBenefit, setEditBenefit] = useState<any>(null);
  const [viewBenefit, setViewBenefit] = useState<any>(null);
  const [catalogCategory, setCatalogCategory] = useState("todas");
  const [catalogSearch, setCatalogSearch] = useState("");
  // Edit form state
  const [editName, setEditName] = useState("");
  const [editCost, setEditCost] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSegments, setEditSegments] = useState<string[]>([]);
  const [editSegmentType, setEditSegmentType] = useState<"all" | "individual" | "group">("all");
  const [editActive, setEditActive] = useState(true);
  const [segDropdownOpen, setSegDropdownOpen] = useState(false);
  const [segIndividualSearch, setSegIndividualSearch] = useState("");

  const allDepts = [...new Set(data.users.map((u: any) => u.dept).filter(Boolean))] as string[];
  const employeeUsers = data.users.filter((u: any) => u.role === "employee" || !u.role);

  const activeBenefits = data.benefits.filter((b: any) => b.status === "active");
  const filtered = activeBenefits.filter((b: any) => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.category || "").toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === "todas" || normCat(b.category || "") === normCat(selectedCategory);
    return matchSearch && matchCategory;
  });

  const catalogFiltered = BENEFIT_CATALOG.filter(b => {
    const alreadyPublished = data.benefits.some((pub: any) => pub.name.toLowerCase() === b.name.toLowerCase());
    const matchSearch = b.name.toLowerCase().includes(catalogSearch.toLowerCase()) || b.provider.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchCat = catalogCategory === "todas" || normCat(b.category) === normCat(catalogCategory);
    return !alreadyPublished && matchSearch && matchCat;
  });

  const openEdit = (b: any) => {
    setEditBenefit(b);
    setEditName(b.name);
    setEditCost(String(b.credits || b.cost));
    setEditDescription(b.description || "");
    const segs = b.segments || [];
    setEditSegments(segs);
    setEditSegmentType(segs.length === 0 ? "all" : (allDepts.some(d => segs.includes(d)) ? "group" : "individual"));
    setEditActive(b.status === "active");
    setSegDropdownOpen(false);
    setSegIndividualSearch("");
  };

  const handleSaveEdit = async () => {
    if (!editBenefit) return;
    try {
      await supabase.from("benefits").update({
        name: editName,
        cost: Number(editCost),
        description: editDescription,
        active: editActive,
        segments: editSegments.length > 0 ? editSegments : null,
      }).eq("id", editBenefit.id);
      toast.success(`Beneficio "${editName}" actualizado`);
      setEditBenefit(null);
      data.refresh();
    } catch { toast.error("Error al guardar"); }
  };

  const handlePublishFromCatalog = async (item: any) => {
    try {
      const { error } = await supabase.from("benefits").insert({
        name: item.name,
        category: item.category,
        merchant: item.provider,
        cost: item.cost,
        description: item.description,
        image_url: item.image_url || null,
        active: true,
      });
      if (error) { console.error("Insert error:", error); toast.error("Error al publicar: " + error.message); return; }
      toast.success(`"${item.name}" publicado exitosamente`);
      data.refresh();
    } catch (e) { console.error(e); toast.error("Error al publicar beneficio"); }
  };

  const handleToggleStatus = async (b: any) => {
    const newActive = b.status !== "active";
    const { error } = await supabase.from("benefits").update({ active: newActive }).eq("id", b.id);
    if (error) { toast.error("Error: " + error.message); return; }
    toast.success(newActive ? `"${b.name}" activado` : `"${b.name}" pausado`);
    data.refresh();
  };

  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const handleDelete = (b: any) => {
    setEditBenefit(null);
    setDeleteConfirm(b);
  };
  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    // Try hard delete first; if FK constraint blocks it, soft-delete (deactivate)
    const { error } = await supabase.from("benefits").delete().eq("id", deleteConfirm.id);
    if (error && error.code === "23503") {
      // Has transactions — soft delete
      await supabase.from("benefits").update({ active: false }).eq("id", deleteConfirm.id);
      toast.success(`"${deleteConfirm.name}" desactivado del catálogo`);
    } else if (error) {
      toast.error("Error al eliminar: " + error.message);
      return;
    } else {
      toast.success(`"${deleteConfirm.name}" eliminado del catálogo`);
    }
    setDeleteConfirm(null);
    setEditBenefit(null);
    data.refresh();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ ...baseStyles, fontSize: 24, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>{t("benefitsManagement")}</h1>
          <p style={{ ...baseStyles, fontSize: 14, color: tokens.semantic.textLighter, marginTop: 4, lineHeight: 1.4 }}>
            {t("benefitsManagementSubtitle")}
          </p>
        </div>
        <Button icon={Plus} onClick={() => setShowCatalog(true)}>{t("newBenefit")}</Button>
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        {/* Category sidebar */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <div style={{ ...baseStyles, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.5px", color: tokens.semantic.textLighter, marginBottom: 12, padding: "0 12px" }}>
            Categorías
          </div>
          {BENEFIT_CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat.key;
            const count = cat.key === "todas"
              ? activeBenefits.length
              : activeBenefits.filter((b: any) => normCat(b.category || "") === normCat(cat.key)).length;
            return (
              <button key={cat.key} onClick={() => setSelectedCategory(cat.key)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", textAlign: "left",
                background: isActive ? tokens.colors.humand[50] : "transparent",
                color: isActive ? tokens.colors.humand[600] : tokens.semantic.textDefault,
                border: "none", cursor: "pointer", borderRadius: tokens.radius.m,
                fontSize: 14, fontWeight: isActive ? 600 : 400,
                fontFamily: "Roboto", letterSpacing: "0.2px",
                transition: "all 0.15s ease", marginBottom: 2,
              }}>
                <span style={{ fontSize: 18 }}>{cat.icon}</span>
                <span style={{ flex: 1 }}>{cat.label}</span>
                <span style={{ fontSize: 12, color: tokens.semantic.textDisabled, fontWeight: 400 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center" }}>
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar beneficios..." />
            <Button variant={viewMode === "grid" ? "primary" : "secondary"} size="sm" icon={Layers} onClick={() => setViewMode("grid")} />
            <Button variant={viewMode === "list" ? "primary" : "secondary"} size="sm" icon={FileText} onClick={() => setViewMode("list")} />
          </div>

          {viewMode === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {filtered.map(b => (
                <Card key={b.id} hoverable style={{ cursor: "pointer", padding: 0, overflow: "hidden" }}>
                  {/* Cover image */}
                  <div style={{ position: "relative" as const, height: 140, overflow: "hidden" }}>
                    {b.image_url ? (
                      <img src={b.image_url} alt={b.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${tokens.colors.humand[50]}, ${tokens.colors.purple[50]})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
                        {b.image}
                      </div>
                    )}
                    <div style={{ position: "absolute" as const, top: 10, right: 10 }}>
                      <Badge variant={b.status === "active" ? "success" : "warning"}>
                        {b.status === "active" ? t("benefitStatusActive") : t("benefitStatusPaused")}
                      </Badge>
                    </div>
                  </div>
                  <div style={{ padding: "16px 20px 20px" }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4, lineHeight: 1.4 }}>{b.name}</div>
                  <div style={{ fontSize: 12, color: tokens.semantic.textLighter, marginBottom: 12 }}>{b.category} · {b.provider}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <CreditCard size={14} color={tokens.colors.humand[500]} />
                      <span style={{ fontWeight: 600, fontSize: 14, color: tokens.colors.humand[600], letterSpacing: "0.2px" }}>{b.credits}</span>
                      <span style={{ fontSize: 12, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>{t("creditsLabel")}</span>
                    </div>
                    <div style={{ fontSize: 12, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>
                      {b.redemptions} {t("redemptionsLabel")}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                    <Button variant="secondary" size="sm" icon={Edit3} style={{ flex: 1 }} onClick={() => openEdit(b)}>{t("edit")}</Button>
                    <Button variant="ghost" size="sm" icon={Eye} onClick={() => setViewBenefit(b)}>{t("view")}</Button>
                  </div>
                  </div>{/* close padding wrapper */}
                </Card>
              ))}
            </div>
          ) : (
            <Card noPadding>
              <div style={{ padding: "16px 24px" }}>
                <Table
                  columns={[
                    { header: t("benefit"), key: "name", render: r => (
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 24 }}>{r.image}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: "0.2px" }}>{r.name}</div>
                          <div style={{ fontSize: 12, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>{r.provider}</div>
                        </div>
                      </div>
                    )},
                    { header: t("category"), key: "category", render: r => <Badge>{r.category}</Badge> },
                    { header: t("credits"), key: "credits", render: r => <span style={{ fontWeight: 600 }}>{r.credits}</span> },
                    { header: t("redemptionsCount"), key: "redemptions" },
                    { header: t("status"), key: "status", render: r => (
                      <Badge variant={r.status === "active" ? "success" : "warning"}>
                        {r.status === "active" ? t("benefitStatusActive") : t("benefitStatusPaused")}
                      </Badge>
                    )},
                    { header: t("actions"), key: "actions", render: r => (
                      <div style={{ display: "flex", gap: 4 }}>
                        <Button variant="ghost" size="sm" icon={Edit3} onClick={() => openEdit(r)} />
                        <Button variant="ghost" size="sm" icon={Eye} onClick={() => setViewBenefit(r)} />
                        <Button variant="ghost" size="sm" icon={Trash2} onClick={() => handleDelete(r)} />
                      </div>
                    )},
                  ]}
                  data={filtered}
                />
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* ── Catalog picker modal ── */}
      {showCatalog && (
        <Modal title="Publicar beneficio del catálogo" onClose={() => { setShowCatalog(false); setCatalogSearch(""); setCatalogCategory("todas"); }} wide>
          <p style={{ ...baseStyles, fontSize: 13, color: tokens.semantic.textLighter, marginBottom: 16, marginTop: -8, lineHeight: 1.4 }}>
            Seleccioná un beneficio predefinido para publicarlo en tu organización
          </p>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <SearchInput value={catalogSearch} onChange={setCatalogSearch} placeholder="Buscar en catálogo..." />
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" as const }}>
            {BENEFIT_CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setCatalogCategory(cat.key)} style={{
                ...baseStyles, padding: "6px 14px", fontSize: 12, fontWeight: catalogCategory === cat.key ? 600 : 400,
                background: catalogCategory === cat.key ? tokens.colors.humand[500] : "#fff",
                color: catalogCategory === cat.key ? "#fff" : tokens.semantic.textLighter,
                border: `1px solid ${catalogCategory === cat.key ? tokens.colors.humand[500] : tokens.semantic.border}`,
                borderRadius: 999, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4,
              }}>
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>
          <div style={{ maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {catalogFiltered.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: tokens.semantic.textDisabled, fontSize: 13 }}>
                No hay beneficios disponibles en esta categoría
              </div>
            ) : catalogFiltered.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                border: `1px solid ${tokens.semantic.border}`, borderRadius: tokens.radius.m,
                transition: tokens.transition.fast,
              }}>
                <span style={{ fontSize: 28 }}>{item.image}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: "0.2px" }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>
                    {item.provider} · {item.category} · {item.cost} créditos
                  </div>
                  <div style={{ fontSize: 12, color: tokens.semantic.textDisabled, marginTop: 2, letterSpacing: "0.2px" }}>{item.description}</div>
                </div>
                <Button variant="secondary" size="sm" icon={Plus} onClick={() => handlePublishFromCatalog(item)}>Publicar</Button>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* ── View benefit detail modal ── */}
      {viewBenefit && (
        <Modal title={viewBenefit.name} onClose={() => setViewBenefit(null)}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <span style={{ fontSize: 56 }}>{viewBenefit.image}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${tokens.semantic.borderLight}` }}>
              <span style={{ fontSize: 13, color: tokens.semantic.textLighter }}>Categoría</span>
              <Badge>{viewBenefit.category}</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${tokens.semantic.borderLight}` }}>
              <span style={{ fontSize: 13, color: tokens.semantic.textLighter }}>Proveedor</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{viewBenefit.provider || "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${tokens.semantic.borderLight}` }}>
              <span style={{ fontSize: 13, color: tokens.semantic.textLighter }}>Costo</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: tokens.colors.humand[600] }}>{viewBenefit.credits} créditos</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${tokens.semantic.borderLight}` }}>
              <span style={{ fontSize: 13, color: tokens.semantic.textLighter }}>Canjes realizados</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{viewBenefit.redemptions}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${tokens.semantic.borderLight}` }}>
              <span style={{ fontSize: 13, color: tokens.semantic.textLighter }}>Estado</span>
              <Badge variant={viewBenefit.status === "active" ? "success" : "warning"}>
                {viewBenefit.status === "active" ? "Activo" : "Pausado"}
              </Badge>
            </div>
            {viewBenefit.description && (
              <div style={{ padding: "8px 0" }}>
                <span style={{ fontSize: 13, color: tokens.semantic.textLighter, display: "block", marginBottom: 4 }}>Descripción</span>
                <span style={{ fontSize: 13 }}>{viewBenefit.description}</span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
            <Button variant="secondary" onClick={() => { setViewBenefit(null); openEdit(viewBenefit); }}>Editar</Button>
            <Button variant={viewBenefit.status === "active" ? "ghost" : "primary"} onClick={() => { handleToggleStatus(viewBenefit); setViewBenefit(null); }}>
              {viewBenefit.status === "active" ? "Pausar" : "Activar"}
            </Button>
          </div>
        </Modal>
      )}

      {/* ── Edit benefit modal with segmentation ── */}
      {editBenefit && (
        <Modal title={`Editar: ${editBenefit.name}`} onClose={() => setEditBenefit(null)} wide>
          <FormField label="Nombre del beneficio">
            <Input value={editName} onChange={(e: any) => setEditName(e.target.value)} />
          </FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
            <FormField label="Estado">
              <Select value={editActive ? "active" : "paused"} onChange={(e: any) => setEditActive(e.target.value === "active")} options={[
                { value: "active", label: "Activo" },
                { value: "paused", label: "Pausado" },
              ]} />
            </FormField>
          </div>
          <FormField label="Descripción">
            <textarea value={editDescription} onChange={(e: any) => setEditDescription(e.target.value)} style={{
              ...baseStyles, width: "100%", padding: "10px 12px", minHeight: 80,
              border: `1px solid ${tokens.semantic.border}`, borderRadius: tokens.radius.s,
              fontSize: 14, lineHeight: 1.4, outline: "none", resize: "vertical", boxSizing: "border-box",
            }} />
          </FormField>

          {/* Segmentation section — Colaboradores */}
          <div style={{ marginTop: 8, background: tokens.colors.neutral[50], borderRadius: tokens.radius.l, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <div>
                <h3 style={{ ...baseStyles, fontSize: 18, fontWeight: 700, margin: 0, lineHeight: 1.4 }}>Colaboradores</h3>
                <p style={{ ...baseStyles, fontSize: 13, color: tokens.semantic.textLighter, marginTop: 4, lineHeight: 1.4 }}>
                  Seleccioná colaboradores a los que se les asignará este beneficio.
                </p>
              </div>
              <span style={{
                padding: "6px 16px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                border: `1.5px solid ${tokens.colors.humand[300]}`, color: tokens.colors.humand[700],
                background: "#fff", whiteSpace: "nowrap" as const,
              }}>
                Alcance: {editSegmentType === "all"
                  ? `${employeeUsers.length} colaboradores`
                  : editSegmentType === "individual"
                    ? `${editSegments.length} colaborador${editSegments.length !== 1 ? "es" : ""}`
                    : `${editSegments.length} grupo${editSegments.length !== 1 ? "s" : ""}`
                }
              </span>
            </div>

            {/* Active criteria cards */}
            {editSegmentType !== "all" && (
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {editSegmentType === "individual" && editSegments.length > 0 && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
                    background: "#fff", borderRadius: tokens.radius.m,
                    border: `1px solid ${tokens.semantic.border}`,
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: tokens.radius.m,
                      background: tokens.colors.neutral[100],
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Users size={20} color={tokens.semantic.textLighter} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ ...baseStyles, fontWeight: 600, fontSize: 14 }}>Selección individual de colaboradores</div>
                      <div style={{ ...baseStyles, fontSize: 12, color: tokens.semantic.textLighter, marginTop: 2 }}>
                        {editSegments.length} colaborador{editSegments.length !== 1 ? "es" : ""} alcanzado{editSegments.length !== 1 ? "s" : ""} por este criterio.
                      </div>
                    </div>
                    <button onClick={() => { setEditSegments([]); setEditSegmentType("all"); }} style={{
                      background: "none", border: "none", cursor: "pointer", color: tokens.semantic.textLighter, padding: 4,
                    }}>
                      <MoreVertical size={18} />
                    </button>
                  </div>
                )}
                {editSegmentType === "group" && editSegments.length > 0 && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
                    background: "#fff", borderRadius: tokens.radius.m,
                    border: `1px solid ${tokens.semantic.border}`,
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: tokens.radius.m,
                      background: tokens.colors.neutral[100],
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Layers size={20} color={tokens.semantic.textLighter} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ ...baseStyles, fontWeight: 600, fontSize: 14 }}>Grupos de segmentación</div>
                      <div style={{ ...baseStyles, fontSize: 12, color: tokens.semantic.textLighter, marginTop: 2 }}>
                        {editSegments.join(", ")}
                      </div>
                    </div>
                    <button onClick={() => { setEditSegments([]); setEditSegmentType("all"); }} style={{
                      background: "none", border: "none", cursor: "pointer", color: tokens.semantic.textLighter, padding: 4,
                    }}>
                      <MoreVertical size={18} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Dropdown: Sumar criterio de selección */}
            <div style={{ marginTop: 16, position: "relative" }}>
              <button onClick={() => setSegDropdownOpen(!segDropdownOpen)} style={{
                ...baseStyles, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 20px", background: "#fff", border: `1.5px solid ${segDropdownOpen ? tokens.colors.humand[400] : tokens.semantic.border}`,
                borderRadius: tokens.radius.m, cursor: "pointer", fontSize: 14,
                color: tokens.semantic.textLighter, transition: tokens.transition.fast,
              }}>
                Sumar criterio de selección
                <ChevronDown size={18} style={{ transition: "transform 0.2s", transform: segDropdownOpen ? "rotate(180deg)" : "rotate(0)" }} />
              </button>

              {segDropdownOpen && (
                <div style={{
                  marginTop: 8, background: "#fff", borderRadius: tokens.radius.m,
                  border: `1px solid ${tokens.semantic.border}`, boxShadow: tokens.shadow.dp4,
                  overflow: "hidden",
                }}>
                  {/* Option: Individual selection */}
                  <button onClick={() => { setSegDropdownOpen(false); setEditSegmentType("individual"); }} style={{
                    ...baseStyles, width: "100%", display: "flex", alignItems: "center", gap: 14,
                    padding: "16px 20px", background: "transparent", border: "none",
                    borderBottom: `1px solid ${tokens.semantic.borderLight}`,
                    cursor: "pointer", textAlign: "left", transition: tokens.transition.fast,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = tokens.colors.neutral[50]; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: tokens.radius.m,
                      background: tokens.colors.neutral[100],
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Users size={20} color={tokens.semantic.textLighter} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Selección individual de colaboradores</div>
                      <div style={{ fontSize: 12, color: tokens.semantic.textLighter, lineHeight: 1.4 }}>
                        Elegí colaboradores específicos que podrán acceder a este beneficio.
                      </div>
                    </div>
                  </button>

                  {/* Option: Segmentation groups */}
                  <button onClick={() => { setSegDropdownOpen(false); setEditSegmentType("group"); }} style={{
                    ...baseStyles, width: "100%", display: "flex", alignItems: "center", gap: 14,
                    padding: "16px 20px", background: "transparent", border: "none",
                    borderBottom: `1px solid ${tokens.semantic.borderLight}`,
                    cursor: "pointer", textAlign: "left", transition: tokens.transition.fast,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = tokens.colors.neutral[50]; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: tokens.radius.m,
                      background: tokens.colors.neutral[100],
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Layers size={20} color={tokens.semantic.textLighter} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Grupos de segmentación</div>
                      <div style={{ fontSize: 12, color: tokens.semantic.textLighter, lineHeight: 1.4 }}>
                        Creá segmentos en base a distintos grupos que actualizarán su base de colaboradores automáticamente.
                      </div>
                    </div>
                    <Badge variant="info">Asignación automática</Badge>
                  </button>

                  {/* Option: All */}
                  <button onClick={() => { setSegDropdownOpen(false); setEditSegmentType("all"); setEditSegments([]); }} style={{
                    ...baseStyles, width: "100%", display: "flex", alignItems: "center", gap: 14,
                    padding: "16px 20px", background: "transparent", border: "none",
                    cursor: "pointer", textAlign: "left", transition: tokens.transition.fast,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = tokens.colors.neutral[50]; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: tokens.radius.m,
                      background: tokens.colors.neutral[100],
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Globe size={20} color={tokens.semantic.textLighter} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Todos los colaboradores de la comunidad</div>
                      <div style={{ fontSize: 12, color: tokens.semantic.textLighter, lineHeight: 1.4 }}>
                        Seleccioná a todos los colaboradores, este criterio se actualizará automáticamente e incluirá a los nuevos ingresos.
                      </div>
                    </div>
                    <Badge variant="info">Asignación automática</Badge>
                  </button>
                </div>
              )}
            </div>

            {/* Individual user picker (shown when type=individual) */}
            {editSegmentType === "individual" && (
              <div style={{ marginTop: 16 }}>
                <div style={{ position: "relative", marginBottom: 12 }}>
                  <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: tokens.semantic.textDisabled }} />
                  <input
                    type="text" value={segIndividualSearch} onChange={e => setSegIndividualSearch(e.target.value)}
                    placeholder="Buscar colaborador por nombre o email..."
                    style={{
                      ...baseStyles, width: "100%", padding: "10px 12px 10px 36px",
                      border: `1px solid ${tokens.semantic.border}`, borderRadius: tokens.radius.m,
                      fontSize: 13, outline: "none", background: "#fff", boxSizing: "border-box",
                    }}
                  />
                </div>
                <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                  {employeeUsers
                    .filter((u: any) =>
                      u.name.toLowerCase().includes(segIndividualSearch.toLowerCase()) ||
                      (u.email || "").toLowerCase().includes(segIndividualSearch.toLowerCase())
                    )
                    .map((u: any) => {
                      const isSelected = editSegments.includes(u.id);
                      return (
                        <button key={u.id} onClick={() => {
                          setEditSegments(prev => isSelected ? prev.filter(id => id !== u.id) : [...prev, u.id]);
                        }} style={{
                          ...baseStyles, width: "100%", display: "flex", alignItems: "center", gap: 10,
                          padding: "8px 12px", background: isSelected ? tokens.colors.humand[50] : "#fff",
                          border: `1px solid ${isSelected ? tokens.colors.humand[300] : tokens.semantic.borderLight}`,
                          borderRadius: tokens.radius.s, cursor: "pointer", textAlign: "left",
                          transition: tokens.transition.fast,
                        }}>
                          <div style={{
                            width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                            border: `2px solid ${isSelected ? tokens.colors.humand[500] : tokens.semantic.border}`,
                            background: isSelected ? tokens.colors.humand[500] : "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {isSelected && <Check size={12} color="#fff" />}
                          </div>
                          <Avatar initials={getInitials(u.name)} size={28} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: "0.2px" }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: tokens.semantic.textLighter }}>{u.email} · {u.dept}</div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Group/department picker (shown when type=group) */}
            {editSegmentType === "group" && (
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                {allDepts.map(dept => {
                  const isSelected = editSegments.includes(dept);
                  const deptCount = employeeUsers.filter((u: any) => u.dept === dept).length;
                  return (
                    <button key={dept} onClick={() => {
                      setEditSegments(prev => isSelected ? prev.filter(d => d !== dept) : [...prev, dept]);
                    }} style={{
                      ...baseStyles, width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 16px", background: isSelected ? tokens.colors.humand[50] : "#fff",
                      border: `1px solid ${isSelected ? tokens.colors.humand[300] : tokens.semantic.borderLight}`,
                      borderRadius: tokens.radius.s, cursor: "pointer", textAlign: "left",
                      transition: tokens.transition.fast,
                    }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                        border: `2px solid ${isSelected ? tokens.colors.humand[500] : tokens.semantic.border}`,
                        background: isSelected ? tokens.colors.humand[500] : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {isSelected && <Check size={12} color="#fff" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{dept}</div>
                      </div>
                      <span style={{ fontSize: 12, color: tokens.semantic.textDisabled }}>{deptCount} colaboradores</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "space-between", marginTop: 24, alignItems: "center" }}>
            <Button variant="danger" size="sm" icon={Trash2} onClick={() => handleDelete(editBenefit)}>Eliminar</Button>
            <div style={{ display: "flex", gap: 12 }}>
              <Button variant="secondary" onClick={() => setEditBenefit(null)}>Cancelar</Button>
              <Button icon={Check} onClick={handleSaveEdit}>Guardar cambios</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteConfirm && (
        <Modal title="Confirmar eliminación" onClose={() => setDeleteConfirm(null)}>
          <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", margin: "0 auto 16px",
              background: tokens.colors.red[100],
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Trash2 size={24} color={tokens.colors.red[500]} />
            </div>
            <p style={{ ...baseStyles, fontSize: 14, lineHeight: 1.5, margin: 0 }}>
              ¿Estás seguro de que querés eliminar <strong>{deleteConfirm.name}</strong> del catálogo?
            </p>
            <p style={{ ...baseStyles, fontSize: 13, color: tokens.semantic.textLighter, marginTop: 8, lineHeight: 1.4 }}>
              Esta acción no se puede deshacer. Los colaboradores ya no podrán canjear este beneficio.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="danger" icon={Trash2} onClick={confirmDelete}>Sí, eliminar</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}


/* AnalyticsPage removed — integrated into dashboard */

function AnalyticsPage({ data }: { data: any }) {
  const { t } = useLanguage();
  const [period, setPeriod] = useState("month");

  const topBenefits = [...data.benefits].sort((a: any, b: any) => b.redemptions - a.redemptions).slice(0, 5);
  const topUsers = [...data.users].sort((a: any, b: any) => b.spent - a.spent).slice(0, 5);

  const weeklyTrend = [
    { week: "Sem 1", canjes: 45 }, { week: "Sem 2", canjes: 62 },
    { week: "Sem 3", canjes: 58 }, { week: "Sem 4", canjes: 71 },
  ];

  const periodLabels: Record<string, string> = {
    week: t("week"), month: t("month"), quarter: t("quarter"), year: t("year"),
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ ...baseStyles, fontSize: 24, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>{t("analyticsTitle")}</h1>
          <p style={{ ...baseStyles, fontSize: 14, color: tokens.semantic.textLighter, marginTop: 4, lineHeight: 1.4 }}>
            {t("analyticsSubtitle")}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["week", "month", "quarter", "year"].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              ...baseStyles, padding: "6px 14px", fontSize: 12, fontWeight: period === p ? 600 : 400,
              background: period === p ? tokens.colors.humand[500] : "#fff",
              color: period === p ? "#fff" : tokens.semantic.textLighter,
              border: `1px solid ${period === p ? tokens.colors.humand[500] : tokens.semantic.border}`,
              borderRadius: tokens.radius.s, cursor: "pointer",
            }}>
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        <StatCard label={t("activeUsers")} value={String(data.users.filter((u:any) => u.status === 'active').length)} icon={Users} trend={`${data.employees.length} colaboradores`} trendUp color={tokens.colors.humand[500]} />
        <StatCard label={t("totalRedemptions")} value={String(data.transactions.filter((t:any) => t.type === 'debit').length)} icon={Gift} trend={`$${fmtNum(data.totalRedeemed)} en créditos`} trendUp color={tokens.colors.green[600]} />
        <StatCard label={t("avgRedemptionsPerUser")} value={data.employees.length > 0 ? (data.transactions.filter((t:any) => t.type === 'debit').length / data.employees.length).toFixed(1) : "0"} icon={BarChart3} trend="por colaborador" trendUp color={tokens.colors.purple[500]} />
        <StatCard label={t("satisfaction")} value={fmtNum(data.totalCredited)} icon={Star} trend={`${fmtNum(data.totalPending)} pendientes`} trendUp color={tokens.colors.yellow[500]} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <Card>
          <h3 style={{ ...baseStyles, fontSize: 16, fontWeight: 600, margin: "0 0 20px 0", lineHeight: 1.4 }}>{t("weeklyRedemptionTrend")}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={tokens.semantic.borderLight} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: tokens.semantic.textLighter }} />
              <YAxis tick={{ fontSize: 12, fill: tokens.semantic.textLighter }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, fontFamily: "Roboto" }} />
              <Bar dataKey="canjes" fill={tokens.colors.humand[400]} radius={[4, 4, 0, 0]} name={t("redemptions_col")} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 style={{ ...baseStyles, fontSize: 16, fontWeight: 600, margin: "0 0 20px 0", lineHeight: 1.4 }}>{t("usageByDept")}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.deptUsage} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={tokens.semantic.borderLight} />
              <XAxis type="number" tick={{ fontSize: 12, fill: tokens.semantic.textLighter }} domain={[0, 100]} />
              <YAxis type="category" dataKey="dept" tick={{ fontSize: 12, fill: tokens.semantic.textLighter }} width={80} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, fontFamily: "Roboto" }} formatter={v => `${v}%`} />
              <Bar dataKey="usage" radius={[0, 4, 4, 0]} name="Uso %">
                {data.deptUsage.map((d: any, i: number) => (
                  <Cell key={i} fill={d.usage > 75 ? tokens.colors.green[500] : d.usage > 50 ? tokens.colors.humand[400] : tokens.colors.yellow[500]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <h3 style={{ ...baseStyles, fontSize: 16, fontWeight: 600, margin: "0 0 20px 0", lineHeight: 1.4 }}>{t("topRedeemedBenefits")}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {topBenefits.map((b, i) => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < topBenefits.length - 1 ? `1px solid ${tokens.semantic.borderLight}` : "none" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: tokens.semantic.textDisabled, width: 20, letterSpacing: "0.2px" }}>#{i + 1}</span>
                <span style={{ fontSize: 20 }}>{b.image}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: "0.2px" }}>{b.name}</div>
                  <div style={{ fontSize: 12, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>{b.category}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: "0.2px" }}>{b.redemptions}</div>
                  <div style={{ fontSize: 11, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>{t("redemptions_col")}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 style={{ ...baseStyles, fontSize: 16, fontWeight: 600, margin: "0 0 20px 0", lineHeight: 1.4 }}>{t("topUsersByUsage")}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {topUsers.map((u, i) => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < topUsers.length - 1 ? `1px solid ${tokens.semantic.borderLight}` : "none" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: tokens.semantic.textDisabled, width: 20, letterSpacing: "0.2px" }}>#{i + 1}</span>
                <Avatar initials={u.avatar} size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: "0.2px" }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>{u.dept}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: "0.2px" }}>{u.spent.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                  <div style={{ fontSize: 11, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>{t("creditsUsed")}</div>
                </div>
                <ProgressBar value={u.spent} max={u.credits} color={tokens.colors.humand[400]} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}


/* ════════════════════════════════════════════
   PAGE: BUY CREDITS
   ════════════════════════════════════════════ */
function BuyCreditsPage({ data, onRefresh }: { data: any; onRefresh: () => void }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const pricePerCredit = 0.10;
  const total = amount ? Number(amount) * pricePerCredit : 0;
  const quickAmounts = [100, 500, 1000, 5000];

  const handlePurchase = async () => {
    if (!amount || Number(amount) <= 0) { toast.error("Ingresá una cantidad"); return; }
    setPurchasing(true);
    try {
      const { data: allWallets } = await supabase.from("wallets").select("*");
      if (!allWallets || allWallets.length === 0) throw new Error("No wallets found");

      const totalCredits = Number(amount);
      const perWallet = Math.round((totalCredits / allWallets.length) * 100) / 100;
      const desc = note ? `Compra de créditos — ${note}` : "Compra de créditos";

      for (const wallet of allWallets) {
        const newBalance = Math.round((Number(wallet.balance) + perWallet) * 100) / 100;
        await supabase.from("wallets").update({ balance: newBalance, updated_at: new Date().toISOString() }).eq("id", wallet.id);
        const txnId = `tx_${Math.random().toString(36).substring(2, 10)}`;
        await supabase.from("transactions").insert({
          id: txnId, wallet_id: wallet.id, type: "credit", amount: perWallet, description: desc,
        });
      }

      // Audit trail
      await supabase.from("bulk_history").insert({
        id: `bh_${Math.random().toString(36).substring(2, 10)}`,
        date: new Date().toISOString(),
        type: "purchase", users_count: allWallets.length,
        credits: perWallet, total: totalCredits,
        created_by: "Admin", status: "completed",
      });

      toast.success(`${fmtNum(totalCredits)} créditos sumados exitosamente`);
      setAmount(""); setNote("");
      onRefresh();
    } catch (e) {
      console.error(e);
      toast.error("Error al sumar créditos");
    }
    setPurchasing(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ ...baseStyles, fontSize: 24, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>Comprar créditos</h1>
        <p style={{ ...baseStyles, fontSize: 14, color: tokens.semantic.textLighter, marginTop: 4, lineHeight: 1.4 }}>
          Sumá créditos a tu cuenta para distribuir entre colaboradores
        </p>
      </div>

      {/* Current balance */}
      <Card style={{ marginBottom: 24, background: `linear-gradient(135deg, ${tokens.colors.humand[50]}, ${tokens.colors.purple[50]})` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, color: tokens.semantic.textLighter, marginBottom: 4 }}>{t("creditsAvailable")}</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: tokens.colors.humand[600] }}>{fmtCurrency(data.wallets.reduce((s: number, w: any) => s + Number(w.balance), 0))}</div>
          </div>
          <div style={{ textAlign: "right" as const }}>
            <div style={{ fontSize: 13, color: tokens.semantic.textLighter, marginBottom: 4 }}>{t("creditsAssigned")}</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{fmtCurrency(data.totalCredited)}</div>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        {/* Left: add credits form */}
        <Card>
          <h3 style={{ ...baseStyles, fontSize: 18, fontWeight: 600, margin: "0 0 24px 0" }}>Sumar créditos</h3>

          {/* Quick select */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: tokens.semantic.textLighter, marginBottom: 10 }}>Monto rápido</div>
            <div style={{ display: "flex", gap: 10 }}>
              {quickAmounts.map(q => (
                <button key={q} onClick={() => setAmount(String(q))}
                  style={{
                    flex: 1, padding: "14px 8px", textAlign: "center" as const,
                    borderRadius: tokens.radius.m, cursor: "pointer",
                    background: amount === String(q) ? tokens.colors.humand[500] : "#fff",
                    color: amount === String(q) ? "#fff" : tokens.semantic.textDefault,
                    borderTop: `2px solid ${amount === String(q) ? tokens.colors.humand[500] : tokens.semantic.border}`,
                    borderRight: `2px solid ${amount === String(q) ? tokens.colors.humand[500] : tokens.semantic.border}`,
                    borderBottom: `2px solid ${amount === String(q) ? tokens.colors.humand[500] : tokens.semantic.border}`,
                    borderLeft: `2px solid ${amount === String(q) ? tokens.colors.humand[500] : tokens.semantic.border}`,
                    fontFamily: "Roboto", fontWeight: 700, fontSize: 16,
                    transition: tokens.transition.fast,
                  }}>
                  {fmtNum(q)}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <FormField label="Cantidad personalizada de créditos">
            <Input type="number" placeholder="Ej: 3000" value={amount} onChange={(e: any) => setAmount(e.target.value)} />
          </FormField>
          <FormField label="Nota (opcional)">
            <Input placeholder="Ej: Compra Q2 2026" value={note} onChange={(e: any) => setNote(e.target.value)} />
          </FormField>

          {/* Price breakdown */}
          {amount && Number(amount) > 0 && (
            <div style={{ padding: 16, background: tokens.colors.neutral[50], borderRadius: tokens.radius.m, marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: tokens.semantic.textLighter }}>
                <span>{fmtNum(Number(amount))} créditos × {fmtCurrency(pricePerCredit)}</span>
                <span>{fmtCurrency(total)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${tokens.semantic.borderLight}`, fontSize: 16, fontWeight: 700 }}>
                <span>Total</span>
                <span style={{ color: tokens.colors.humand[600] }}>{fmtCurrency(total)}</span>
              </div>
            </div>
          )}

          <Button variant="gradient" icon={ShoppingCart} size="lg"
            style={{ width: "100%", justifyContent: "center", marginTop: 20 }}
            onClick={handlePurchase}>
            {purchasing ? "Procesando..." : "Sumar créditos"}
          </Button>
        </Card>

        {/* Right: summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ background: tokens.colors.humand[50] }}>
            <h4 style={{ ...baseStyles, fontSize: 14, fontWeight: 600, margin: "0 0 12px 0" }}>Resumen de compra</h4>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: tokens.semantic.textLighter }}>Créditos</span>
              <span style={{ fontSize: 28, fontWeight: 700, color: tokens.colors.humand[600] }}>{amount ? fmtNum(Number(amount)) : "0"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: `1px solid ${tokens.colors.humand[200]}` }}>
              <span style={{ fontSize: 13, color: tokens.semantic.textLighter }}>Costo</span>
              <span style={{ fontSize: 22, fontWeight: 700 }}>{fmtCurrency(total)}</span>
            </div>
          </Card>

          <Card>
            <h4 style={{ ...baseStyles, fontSize: 14, fontWeight: 600, margin: "0 0 12px 0" }}>Precios de referencia</h4>
            {[{ qty: 100, price: 10 }, { qty: 500, price: 50 }, { qty: 1000, price: 100 }, { qty: 5000, price: 500 }].map(({ qty, price }) => (
              <div key={qty} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${tokens.semantic.borderLight}`, fontSize: 13 }}>
                <span style={{ color: tokens.semantic.textLighter }}>{fmtNum(qty)} créditos</span>
                <span style={{ fontWeight: 600 }}>{fmtCurrency(price)}</span>
              </div>
            ))}
            <div style={{ fontSize: 11, color: tokens.semantic.textDisabled, marginTop: 8 }}>{fmtCurrency(pricePerCredit)} por crédito</div>
          </Card>
        </div>
      </div>
    </div>
  );
}


/* ════════════════════════════════════════════
   SIDEBAR & APP SHELL
   ════════════════════════════════════════════ */
export default function App() {
  const { language, t } = useLanguage();

  const benefitsSubNav = useMemo(() => [
    { key: "dashboard", label: t("dashboard") },
    { key: "individual", label: t("employees") },
    { key: "benefits", label: t("benefits") },
    { key: "auto", label: t("autoLoads") },
    { key: "buy", label: "Comprar créditos" },
  ], [language]);

  const otherNav = useMemo(() => [
    { key: "statistics", label: t("statistics"), icon: BarChart3 },
    { key: "users", label: t("users"), icon: Users },
    { key: "groups", label: t("groups"), icon: Layers },
    { key: "segments", label: t("segmentation"), icon: Filter },
    { key: "regions", label: t("regionsOffices"), icon: Globe },
    { key: "schedule", label: t("workSchedules"), icon: Calendar },
    { key: "news", label: t("news"), icon: FileText },
    { key: "knowledge", label: t("knowledgeLibraries"), icon: Layers },
    { key: "forms", label: t("formsAndProcedures"), icon: FileText },
    { key: "settings", label: t("settings"), icon: Settings },
  ], [language]);
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [benefitsOpen, setBenefitsOpen] = useState(true);
  const data = useAdminData();

  const isBenefitsPage = benefitsSubNav.some(s => s.key === activePage);

  if (data.loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: tokens.semantic.bgPage, ...baseStyles }}>
        <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease-out" }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `linear-gradient(135deg, ${tokens.colors.humand[500]}, ${tokens.colors.purple[500]})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 16, margin: "0 auto 20px",
            letterSpacing: "0.2px", animation: "pulse 1.5s ease-in-out infinite",
            boxShadow: tokens.shadow.glow,
          }}>hu</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: tokens.semantic.textDefault, marginBottom: 6 }}>Cargando datos...</div>
          <div style={{ fontSize: 13, color: tokens.semantic.textLighter }}>Conectando con la base de datos</div>
          <div style={{ width: 120, height: 3, borderRadius: 2, margin: "16px auto 0", background: tokens.colors.neutral[150], overflow: "hidden" }}>
            <div style={{ width: "40%", height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${tokens.colors.humand[400]}, ${tokens.colors.purple[400]})`, animation: "shimmer 1.5s ease-in-out infinite", backgroundSize: "200% 100%" }} />
          </div>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <DashboardPage data={data} />;
      case "bulk": return <BulkLoadPage data={data} />;
      case "individual": return <IndividualLoadPage data={data} onRefresh={data.refresh} />;
      case "auto": return <AutoRulesPage data={data} onRefresh={data.refresh} />;
      case "benefits": return <BenefitsPage data={data} />;
      case "buy": return <BuyCreditsPage data={data} onRefresh={data.refresh} />;
      default: return <DashboardPage data={data} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: tokens.semantic.bgPage, ...baseStyles }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarCollapsed ? 72 : 260,
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderRight: `1px solid ${tokens.semantic.borderLight}`,
        display: "flex", flexDirection: "column", transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)", flexShrink: 0,
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        {/* Logo — NovaTech style matching Humand web app */}
        <div style={{
          padding: sidebarCollapsed ? "16px" : "16px 20px",
          display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${tokens.semantic.borderLight}`,
          height: 56,
        }}>
          {/* Diamond logo icon */}
          <div style={{ width: 32, height: 32, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="4" y="4" width="20" height="20" rx="4" transform="rotate(0 14 14)" fill={tokens.colors.humand[500]} />
              <path d="M10 14L14 10L18 14L14 18Z" fill="white" />
            </svg>
          </div>
          {!sidebarCollapsed && (
            <span style={{ fontWeight: 700, fontSize: 18, color: tokens.semantic.textDefault, letterSpacing: "-0.2px" }}>NovaTech</span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
          {/* Other nav items above the benefits group */}
          {otherNav.slice(0, 6).map(item => {
            const Icon = item.icon;
            return (
              <button key={item.key} onClick={() => {}} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: sidebarCollapsed ? "10px 0" : "10px 12px",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
                background: "transparent", color: tokens.semantic.textLighter,
                border: "none", borderRadius: tokens.radius.s, cursor: "pointer",
                fontSize: 14, fontWeight: 400, marginBottom: 2,
                fontFamily: "Roboto", letterSpacing: "0.2px",
                transition: "all 0.15s ease",
              }}>
                <Icon size={20} />
                {!sidebarCollapsed && item.label}
              </button>
            );
          })}

          {/* ── Beneficios collapsible group ── */}
          <div style={{
            margin: "4px 0",
            background: benefitsOpen ? tokens.colors.neutral[50] : "transparent",
            borderRadius: tokens.radius.m,
            transition: "background 0.2s ease",
          }}>
            {/* Group header */}
            <button onClick={() => { setBenefitsOpen(!benefitsOpen); if (!benefitsOpen && !isBenefitsPage) setActivePage("dashboard"); }} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: sidebarCollapsed ? "10px 0" : "10px 12px",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              background: "transparent",
              color: isBenefitsPage ? tokens.colors.humand[600] : tokens.semantic.textLighter,
              border: "none", borderRadius: tokens.radius.s, cursor: "pointer",
              fontSize: 14, fontWeight: isBenefitsPage ? 600 : 400,
              fontFamily: "Roboto", letterSpacing: "0.2px",
              transition: "all 0.15s ease",
            }}>
              <Gift size={20} />
              {!sidebarCollapsed && (
                <>
                  <span style={{ flex: 1, textAlign: "left" }}>{t("benefitsGroup")}</span>
                  <ChevronDown size={16} style={{
                    transition: "transform 0.2s ease",
                    transform: benefitsOpen ? "rotate(0deg)" : "rotate(-90deg)",
                  }} />
                </>
              )}
            </button>

            {/* Sub-items */}
            {benefitsOpen && !sidebarCollapsed && (
              <div style={{ padding: "0 0 8px 0" }}>
                {benefitsSubNav.map(sub => {
                  const isActive = activePage === sub.key;
                  return (
                    <button key={sub.key} onClick={() => setActivePage(sub.key)} style={{
                      width: "100%", display: "flex", alignItems: "center",
                      padding: "8px 12px 8px 44px", textAlign: "left",
                      background: "transparent",
                      color: isActive ? tokens.colors.humand[600] : tokens.semantic.textLighter,
                      border: "none", cursor: "pointer",
                      fontSize: 14, fontWeight: isActive ? 600 : 400,
                      fontFamily: "Roboto", letterSpacing: "0.2px",
                      borderRadius: tokens.radius.s,
                      transition: "all 0.15s ease",
                    }}>
                      {sub.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Remaining nav items */}
          {otherNav.slice(6).map(item => {
            const Icon = item.icon;
            return (
              <button key={item.key} onClick={() => {}} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: sidebarCollapsed ? "10px 0" : "10px 12px",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
                background: "transparent", color: tokens.semantic.textLighter,
                border: "none", borderRadius: tokens.radius.s, cursor: "pointer",
                fontSize: 14, fontWeight: 400, marginBottom: 2,
                fontFamily: "Roboto", letterSpacing: "0.2px",
                transition: "all 0.15s ease",
              }}>
                <Icon size={20} />
                {!sidebarCollapsed && item.label}
              </button>
            );
          })}
        </nav>

      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: tokens.semantic.bgPage }}>
        {/* Top bar — Humand web app style */}
        <header style={{
          height: 56,
          background: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", position: "sticky", top: 0, zIndex: 10, flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Hamburger menu button */}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: "none", border: "none", cursor: "pointer", color: tokens.semantic.textDefault, padding: 4, display: "flex", alignItems: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            {/* Admin badge */}
            <span style={{
              display: "inline-flex", alignItems: "center", padding: "5px 16px",
              borderRadius: 20, fontSize: 13, fontWeight: 600,
              borderTop: `1.5px solid ${tokens.colors.humand[500]}`,
              borderRight: `1.5px solid ${tokens.colors.humand[500]}`,
              borderBottom: `1.5px solid ${tokens.colors.humand[500]}`,
              borderLeft: `1.5px solid ${tokens.colors.humand[500]}`,
              color: tokens.colors.humand[600], background: "transparent",
            }}>
              Admin
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: tokens.semantic.textLighter, padding: 8, borderRadius: "50%", display: "flex", alignItems: "center", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = tokens.colors.neutral[100])}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <HelpCircle size={20} />
            </button>
            <LanguageSelector />
            <button style={{ background: "none", border: "none", cursor: "pointer", color: tokens.semantic.textLighter, padding: 8, borderRadius: "50%", display: "flex", alignItems: "center", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = tokens.colors.neutral[100])}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <Bell size={20} />
            </button>
            <Avatar initials="MG" size={34} />
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: 32, minHeight: "calc(100vh - 56px)" }}>
          <div key={activePage} style={{ maxWidth: 1280, animation: "fadeInUp 0.25s ease-out" }}>
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
